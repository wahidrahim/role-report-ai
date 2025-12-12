'use client';

import { useCallback, useState } from 'react';

import {
  ActionPlan,
  CategorizedSkills,
  RadarChartData,
  SuitabilityAssessment,
} from '@/app/api/analyze/schemas';

type StreamDataType =
  | 'radarChart'
  | 'categorizedSkills'
  | 'suitabilityAssessment'
  | 'resumeOptimizations'
  | 'learningPriorities'
  | 'done'
  | 'error';

interface StreamMessage {
  type: StreamDataType;
  data: unknown;
}

export function useAnalysis() {
  const [radarChart, setRadarChart] = useState<RadarChartData | null>(null);
  const [categorizedSkills, setCategorizedSkills] = useState<CategorizedSkills | null>(null);
  const [suitabilityAssessment, setSuitabilityAssessment] = useState<SuitabilityAssessment | null>(
    null,
  );
  const [resumeOptimizations, setResumeOptimizations] = useState<ActionPlan | null>(null);
  const [learningPriorities, setLearningPriorities] = useState<ActionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const analyze = useCallback(async (resumeText: string, jobDescriptionText: string) => {
    setIsLoading(true);
    setError(null);
    setRadarChart(null);
    setCategorizedSkills(null);
    setSuitabilityAssessment(null);
    setResumeOptimizations(null);
    setLearningPriorities(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescriptionText }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE format: "data: {...}\n\n"
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) {
            continue;
          }

          // Extract JSON from "data: {...}" format
          const match = line.match(/^data:\s*(.+)$/);
          if (!match) {
            continue;
          }

          try {
            const message = JSON.parse(match[1]) as StreamMessage;
            const { type, data } = message;

            switch (type) {
              case 'radarChart':
                setRadarChart(data as RadarChartData);
                break;
              case 'categorizedSkills':
                setCategorizedSkills(data as CategorizedSkills);
                break;
              case 'suitabilityAssessment':
                setSuitabilityAssessment(data as SuitabilityAssessment);
                break;
              case 'resumeOptimizations':
                setResumeOptimizations(data as ActionPlan);
                break;
              case 'learningPriorities':
                setLearningPriorities(data as ActionPlan);
                break;
              case 'error':
                setError(new Error(data as string));
                break;
              case 'done':
                // Stream completed successfully
                break;
            }
          } catch {
            // Skip malformed JSON chunks
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    radarChart,
    categorizedSkills,
    suitabilityAssessment,
    resumeOptimizations,
    learningPriorities,
    isLoading,
    error,
    analyze,
  };
}
