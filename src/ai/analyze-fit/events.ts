import type { LangGraphRunnableConfig } from '@langchain/langgraph';
import type { UIMessage } from 'ai';

import type { SkillAssessment } from '@/ai/analyze-fit/nodes/assessSkills';
import type { SuitabilityAssessment } from '@/ai/analyze-fit/nodes/assessSuitability';
import type { LearningPlan } from '@/ai/analyze-fit/nodes/learningPrioritiesPlan';
import type { RadarChart } from '@/ai/analyze-fit/nodes/plotRadarChart';
import type { ActionPlan } from '@/ai/analyze-fit/nodes/resumeOptimizationPlans';

export type AnalysisData = {
  radarChart: RadarChart;
  skillAssessment: SkillAssessment;
  suitabilityAssessment: SuitabilityAssessment;
  resumeOptimizations: ActionPlan;
  learningPriorities: LearningPlan;
};

export type AnalysisSlice = keyof AnalysisData;

/** The wire format shared by the API route and the client hook: one data part per slice. */
export type AnalysisUIMessage = UIMessage<never, AnalysisData>;

/**
 * Emits one slice as an AI SDK data part. Reusing the slice name as the part id makes the client
 * replace the part in place instead of appending a new one per frame.
 */
export const writeSlice = (
  config: LangGraphRunnableConfig,
  slice: AnalysisSlice,
  data: unknown,
) => {
  config.writer?.({ type: `data-${slice}`, id: slice, data });
};

/**
 * Streams a node's structured output to the client frame by frame, then returns the finished
 * object so the node can hand it back to the graph.
 */
export const streamSlice = async <T>(
  config: LangGraphRunnableConfig,
  slice: AnalysisSlice,
  result: { partialObjectStream: AsyncIterable<unknown>; object: Promise<T> },
): Promise<T> => {
  for await (const partial of result.partialObjectStream) writeSlice(config, slice, partial);

  const value = await result.object;

  writeSlice(config, slice, value);

  return value;
};
