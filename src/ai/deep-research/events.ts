import type { LangGraphRunnableConfig } from '@langchain/langgraph';

type WriterPayload = {
  event: string;
  data: Record<string, unknown>;
};

const write = (config: LangGraphRunnableConfig, payload: WriterPayload) => {
  config.writer?.(payload);
};

export const emitNodeStart = (
  config: LangGraphRunnableConfig,
  args: {
    node: string;
    message: string;
    data?: Record<string, unknown>;
  },
) => {
  write(config, {
    event: 'NODE_START',
    data: {
      node: args.node,
      message: args.message,
      ...(args.data ? { data: args.data } : {}),
    },
  });
};

export const emitNodeEnd = (
  config: LangGraphRunnableConfig,
  args: {
    node: string;
    message: string;
    data?: Record<string, unknown>;
  },
) => {
  write(config, {
    event: 'NODE_END',
    data: {
      node: args.node,
      message: args.message,
      ...(args.data ? { ...args.data } : {}),
    },
  });
};

export const emitToolCall = (
  config: LangGraphRunnableConfig,
  args: {
    node: string;
    message: string;
    data?: Record<string, unknown>;
  },
) => {
  write(config, {
    event: 'TOOL_CALL',
    data: {
      node: args.node,
      message: args.message,
      ...(args.data ? { ...args.data } : {}),
    },
  });
};

export const emitResearchReportPartial = (
  config: LangGraphRunnableConfig,
  args: {
    node: string;
    researchReport: unknown;
  },
) => {
  write(config, {
    event: 'RESEARCH_REPORT_STREAM_PARTIAL',
    data: {
      node: args.node,
      researchReport: args.researchReport,
    },
  });
};

export const emitResearchReportCreated = (
  config: LangGraphRunnableConfig,
  args: {
    node: string;
    message: string;
    researchReport: unknown;
  },
) => {
  write(config, {
    event: 'RESEARCH_REPORT_CREATED',
    data: {
      node: args.node,
      message: args.message,
      researchReport: args.researchReport,
    },
  });
};
