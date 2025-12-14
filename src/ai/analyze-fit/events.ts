import type { LangGraphRunnableConfig } from '@langchain/langgraph';

type WriterPayload = {
  event: string;
  data: Record<string, unknown>;
};

type AnalysisType =
  | 'radarChart'
  | 'skillAssessment'
  | 'suitabilityAssessment'
  | 'resumeOptimizations'
  | 'learningPriorities';

const analysisEventBase = (type: AnalysisType) => {
  switch (type) {
    case 'radarChart':
      return 'RADAR_CHART';
    case 'skillAssessment':
      return 'SKILL_ASSESSMENT';
    case 'suitabilityAssessment':
      return 'SUITABILITY_ASSESSMENT';
    case 'resumeOptimizations':
      return 'RESUME_OPTIMIZATIONS';
    case 'learningPriorities':
      return 'LEARNING_PRIORITIES';
  }
};

const write = (config: LangGraphRunnableConfig, payload: WriterPayload) => {
  config.writer?.(payload);
};

export const emitAnalysisPartial = (
  config: LangGraphRunnableConfig,
  args: {
    node: string;
    type: AnalysisType;
    data: unknown;
  },
) => {
  const base = analysisEventBase(args.type);
  write(config, {
    event: `${base}_STREAM_PARTIAL`,
    data: {
      node: args.node,
      [args.type]: args.data,
    },
  });
};

export const emitAnalysisCreated = (
  config: LangGraphRunnableConfig,
  args: {
    node: string;
    type: AnalysisType;
    message: string;
    data: unknown;
  },
) => {
  const base = analysisEventBase(args.type);
  write(config, {
    event: `${base}_CREATED`,
    data: {
      node: args.node,
      message: args.message,
      [args.type]: args.data,
    },
  });
};
