'use client';

import { createParser } from 'eventsource-parser';
import { useCallback, useState } from 'react';

import type { SkillAssessment } from '@/ai/analyze-fit/nodes/assessSkills';
import type { SuitabilityAssessment } from '@/ai/analyze-fit/nodes/assessSuitability';
import type { RadarChart } from '@/ai/analyze-fit/nodes/plotRadarChart';
import type { ActionPlan } from '@/ai/analyze-fit/nodes/resumeOptimizationPlans';

type StreamEventName =
  | 'RADAR_CHART_STREAM_PARTIAL'
  | 'RADAR_CHART_CREATED'
  | 'SKILL_ASSESSMENT_STREAM_PARTIAL'
  | 'SKILL_ASSESSMENT_CREATED'
  | 'SUITABILITY_ASSESSMENT_STREAM_PARTIAL'
  | 'SUITABILITY_ASSESSMENT_CREATED'
  | 'RESUME_OPTIMIZATIONS_STREAM_PARTIAL'
  | 'RESUME_OPTIMIZATIONS_CREATED'
  | 'LEARNING_PRIORITIES_STREAM_PARTIAL'
  | 'LEARNING_PRIORITIES_CREATED'
  | 'ERROR';

export function useAnalysis() {
  const [radarChart, setRadarChart] = useState<RadarChart | null>(null);
  const [skillAssessment, setSkillAssessment] = useState<SkillAssessment | null>(null);
  const [suitabilityAssessment, setSuitabilityAssessment] = useState<SuitabilityAssessment | null>(
    null,
  );
  const [resumeOptimizations, setResumeOptimizations] = useState<ActionPlan | null>(null);
  const [learningPriorities, setLearningPriorities] = useState<ActionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const analyze = useCallback(
    async (resumeText: string, jobDescriptionText: string) => {
      setIsLoading(true);
      setError(null);
      setRadarChart(null);
      setSkillAssessment(null);
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

        if (!response.body) {
          throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const parser = createParser({
          onEvent: (event) => {
            try {
              const parsedData = JSON.parse(event.data) as unknown;
              const eventName = event.event as StreamEventName;
              const payload =
                parsedData && typeof parsedData === 'object'
                  ? (parsedData as Record<string, unknown>)
                  : null;

              switch (eventName) {
                case 'RADAR_CHART_STREAM_PARTIAL':
                case 'RADAR_CHART_CREATED':
                  setRadarChart(payload?.radarChart as RadarChart);
                  break;
                case 'SKILL_ASSESSMENT_STREAM_PARTIAL':
                case 'SKILL_ASSESSMENT_CREATED':
                  setSkillAssessment(payload?.skillAssessment as SkillAssessment);
                  break;
                case 'SUITABILITY_ASSESSMENT_STREAM_PARTIAL':
                case 'SUITABILITY_ASSESSMENT_CREATED':
                  setSuitabilityAssessment(payload?.suitabilityAssessment as SuitabilityAssessment);
                  break;
                case 'RESUME_OPTIMIZATIONS_STREAM_PARTIAL':
                case 'RESUME_OPTIMIZATIONS_CREATED':
                  setResumeOptimizations(payload?.resumeOptimizations as ActionPlan);
                  break;
                case 'LEARNING_PRIORITIES_STREAM_PARTIAL':
                case 'LEARNING_PRIORITIES_CREATED':
                  setLearningPriorities(payload?.learningPriorities as ActionPlan);
                  break;
                case 'ERROR':
                  setError(new Error((payload?.message as string) ?? 'Analysis failed'));
                  break;
              }
            } catch (e) {
              if (e instanceof SyntaxError) {
                // Skip malformed JSON chunks
                return;
              }
              console.error('Error processing analysis event:', e);
              setError(e instanceof Error ? e : new Error('Failed to process analysis event'));
            }
          },
        });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          parser.feed(decoder.decode(value, { stream: true }));
        }
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

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
