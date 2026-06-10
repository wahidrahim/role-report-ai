import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerAnalyzeFitTool } from '@/mcp/analyze-fit.tool';

export const mcpServerInfo = {
  name: 'role-report-ai',
  version: '0.1.0',
} as const;

export const registerMcpTools = (server: McpServer) => {
  registerAnalyzeFitTool(server);
};
