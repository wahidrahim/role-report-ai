'use client';

import { EventSourceParserStream } from 'eventsource-parser/stream';
import { useCallback, useState } from 'react';

import type { SkillAssessment } from '@/ai/analyze-fit/nodes/assessSkills';
import type { SuitabilityAssessment } from '@/ai/analyze-fit/nodes/assessSuitability';
import type { LearningPlan } from '@/ai/analyze-fit/nodes/learningPrioritiesPlan';
import type { RadarChart } from '@/ai/analyze-fit/nodes/plotRadarChart';
import type { ActionPlan } from '@/ai/analyze-fit/nodes/resumeOptimizationPlans';

type AnalysisSlices = {
  radarChart: RadarChart | null;
  skillAssessment: SkillAssessment | null;
  suitabilityAssessment: SuitabilityAssessment | null;
  resumeOptimizations: ActionPlan | null;
  learningPriorities: LearningPlan | null;
};

const EMPTY_SLICES: AnalysisSlices = {
  radarChart: null,
  skillAssessment: null,
  suitabilityAssessment: null,
  resumeOptimizations: null,
  learningPriorities: null,
};

export function useAnalysis() {
  const [slices, setSlices] = useState<AnalysisSlices>(EMPTY_SLICES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const analyze = useCallback(async (resumeText: string, jobDescriptionText: string) => {
    setIsLoading(true);
    setError(null);
    setSlices(EMPTY_SLICES);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescriptionText }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      if (!response.body) throw new Error('No response body');

      const reader = response.body
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(new EventSourceParserStream())
        .getReader();

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        // The SSE transform closes every stream with a sentinel frame that is not JSON.
        if (value.data === '[DONE]') continue;

        // Each frame carries the whole accumulated slice, so merging it into state is all we do.
        const patch = JSON.parse(value.data) as Partial<AnalysisSlices> & { error?: string };

        if (patch.error) setError(new Error(patch.error));
        else setSlices((prev) => ({ ...prev, ...patch }));
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { ...slices, isLoading, error, analyze };
}
