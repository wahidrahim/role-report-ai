import { createParser } from 'eventsource-parser';
import { useEffect, useRef, useState } from 'react';

import type { ResearchReport } from '@/ai/deep-research/nodes/createResearchReport';
import { useResumeStore } from '@/stores/resumeStore';

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

export function useDeepResearch(jobDescriptionText: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [streamEvents, setStreamEvents] = useState<StreamEvent[]>([]);
  const [researchReport, setResearchReport] = useState<Partial<ResearchReport> | null>(null);

  const {
    resumeText,
    skillAssessment,
    suitabilityAssessment,
    setSkillAssessment,
    setSuitabilityAssessment,
  } = useResumeStore();

  const prevJobDescriptionRef = useRef<string>(jobDescriptionText);

  // Clear skill data when job description changes
  useEffect(() => {
    if (
      prevJobDescriptionRef.current !== jobDescriptionText &&
      prevJobDescriptionRef.current !== ''
    ) {
      setSkillAssessment(null);
      setSuitabilityAssessment(null);
    }
    prevJobDescriptionRef.current = jobDescriptionText;
  }, [jobDescriptionText, setSkillAssessment, setSuitabilityAssessment]);

  const startDeepResearch = async () => {
    if (!resumeText || !jobDescriptionText) return;

    setIsLoading(true);
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
        throw new Error('Deep research failed');
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
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    streamEvents,
    researchReport,
    startDeepResearch,
    canResearch: !!(resumeText && jobDescriptionText),
  };
}
