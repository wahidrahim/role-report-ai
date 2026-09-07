'use client';

import type { InferUIMessageChunk } from 'ai';
import { EventSourceParserStream } from 'eventsource-parser/stream';
import { useCallback, useState } from 'react';

import type { AnalysisData, AnalysisUIMessage } from '@/ai/analyze-fit/events';

type AnalysisSlices = { [K in keyof AnalysisData]: AnalysisData[K] | null };

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

        // Each data part carries the whole accumulated slice, so merging it into state is all
        // we do. The part type is the slice name prefixed with "data-".
        const chunk = JSON.parse(value.data) as InferUIMessageChunk<AnalysisUIMessage>;

        if (chunk.type === 'error') setError(new Error(chunk.errorText));
        else if ('data' in chunk) {
          setSlices((prev) => ({ ...prev, [chunk.type.slice(5)]: chunk.data }));
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { ...slices, isLoading, error, analyze };
}
