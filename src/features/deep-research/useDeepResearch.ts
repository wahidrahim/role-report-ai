import { createParser } from 'eventsource-parser';
import { useState } from 'react';

import type { SkillAssessment } from '@/ai/analyze-fit/nodes/assessSkills';
import type { SuitabilityAssessment } from '@/ai/analyze-fit/nodes/assessSuitability';
import type { ResearchReport } from '@/ai/deep-research/nodes/createResearchReport';

export type StreamEvent = {
  id: string;
  event: 'NODE_START' | 'NODE_END' | 'RESEARCH_REPORT_CREATED' | 'RESEARCH_REPORT_STREAM_PARTIAL';
  data?: Partial<{
    node?: string;
    message?: string;
    data?: Record<string, unknown>;
    researchReport?: Partial<ResearchReport>;
  }>;
};

export function useDeepResearch(
  jobDescriptionText: string,
  resumeText: string,
  skillAssessment: SkillAssessment | null,
  suitabilityAssessment: SuitabilityAssessment | null,
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamEvents, setStreamEvents] = useState<StreamEvent[]>([]);
  const [researchReport, setResearchReport] = useState<Partial<ResearchReport> | null>(null);

  const startDeepResearch = async () => {
    if (!resumeText || !jobDescriptionText) return;

    setIsLoading(true);
    setError(null);
    setStreamEvents([]);
    setResearchReport(null);

    try {
      const response = await fetch('/api/deep-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescriptionText,
          skillAssessment,
          suitabilityAssessment,
        }),
      });

      if (!response.ok) {
        // Prefer a server-provided error message when available (e.g. feature flag disabled).
        let message = 'Deep research failed';

        try {
          const data = (await response.json()) as { error?: string };

          if (typeof data?.error === 'string' && data.error.trim()) {
            message = data.error;
          }
        } catch {
          // ignore JSON parse errors
        }

        throw new Error(message);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const parser = createParser({
        onEvent: (event) => {
          const parsedData = JSON.parse(event.data);
          const newStreamEvent = {
            id: event.id as string,
            event: event.event as StreamEvent['event'],
            data: parsedData,
          };

          setStreamEvents((prev) => [...prev, newStreamEvent]);

          if (parsedData.researchReport) {
            setResearchReport(parsedData.researchReport);
          }
        },
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        parser.feed(decoder.decode(value, { stream: true }));
      }
    } catch (error) {
      console.error('Deep research error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    streamEvents,
    researchReport,
    startDeepResearch,
    canResearch: !!(resumeText && jobDescriptionText),
  };
}
