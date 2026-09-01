import type { LangGraphRunnableConfig } from '@langchain/langgraph';

export type AnalysisSlice =
  | 'radarChart'
  | 'skillAssessment'
  | 'suitabilityAssessment'
  | 'resumeOptimizations'
  | 'learningPriorities';

/**
 * Streams a node's structured output to the client as state patches keyed by slice name, then
 * returns the finished object so the node can hand it back to the graph. The slice key is the
 * only discriminator the client needs, so frames carry no event name.
 */
export const streamSlice = async <T>(
  config: LangGraphRunnableConfig,
  slice: AnalysisSlice,
  result: { partialObjectStream: AsyncIterable<unknown>; object: Promise<T> },
): Promise<T> => {
  for await (const partial of result.partialObjectStream) {
    config.writer?.({ [slice]: partial });
  }

  const value = await result.object;

  config.writer?.({ [slice]: value });

  return value;
};
