'use client';

import { useCallback, useState } from 'react';

import type { SkillAssessment } from '@/ai/analyze-fit/nodes/assessSkills';
import type { SuitabilityAssessment } from '@/ai/analyze-fit/nodes/assessSuitability';
import type { RadarChart } from '@/ai/analyze-fit/nodes/plotRadarChart';
import type { ActionPlan } from '@/ai/analyze-fit/nodes/resumeOptimizationPlans';
import { useResumeStore } from '@/stores/resumeStore';

type StreamDataType =
  | 'radarChart'
  | 'skillAssessment'
  | 'suitabilityAssessment'
  | 'resumeOptimizations'
  | 'learningPriorities'
  | 'done'
  | 'error';

type StreamMessage = {
  type: StreamDataType;
  data: unknown;
};

export function useAnalysis() {
  const {
    setSkillAssessment: setStoreSkillAssessment,
    setSuitabilityAssessment: setStoreSuitabilityAssessment,
  } = useResumeStore();
  const [radarChart, setRadarChart] = useState<RadarChart | null>(null);
  const [skillAssessment, setSkillAssessment] = useState<SkillAssessment | null>(null);
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
    setSkillAssessment(null);
    setSuitabilityAssessment(null);
    setStoreSkillAssessment(null);
    setStoreSuitabilityAssessment(null);
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
                setRadarChart(data as RadarChart);
                break;
              case 'skillAssessment':
                const skillAssessmentData = data as SkillAssessment;
                setSkillAssessment(skillAssessmentData);
                setStoreSkillAssessment(skillAssessmentData);
                break;
              case 'suitabilityAssessment':
                const suitabilityAssessmentData = data as SuitabilityAssessment;
                setSuitabilityAssessment(suitabilityAssessmentData);
                setStoreSuitabilityAssessment(suitabilityAssessmentData);
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
    skillAssessment,
    suitabilityAssessment,
    resumeOptimizations,
    learningPriorities,
    isLoading,
    error,
    analyze,
  };
}
