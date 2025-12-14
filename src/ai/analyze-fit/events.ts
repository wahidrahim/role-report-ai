import type { LangGraphRunnableConfig } from '@langchain/langgraph';

type WriterPayload = {
  event: string;
  data: unknown;
};

const write = (config: LangGraphRunnableConfig, payload: WriterPayload) => {
  config.writer?.(payload);
};

export const emitAnalysisPartial = (
  config: LangGraphRunnableConfig,
  args: {
    type:
      | 'radarChart'
      | 'skillAssessment'
      | 'suitabilityAssessment'
      | 'resumeOptimizations'
      | 'learningPriorities';
    data: unknown;
  },
) => {
  write(config, { event: args.type, data: args.data });
};
