import { createMcpHandler } from 'mcp-handler';

import { mcpServerInfo, registerMcpTools } from '@/mcp/server';

const handler = createMcpHandler(
  (server) => registerMcpTools(server),
  { serverInfo: mcpServerInfo },
  { basePath: '/api', maxDuration: 300, disableSse: true },
);

export { handler as GET, handler as POST, handler as DELETE };

// Vercel/Next segment config — the analyze-fit workflow takes 30-60s of LLM calls.
export const maxDuration = 300;
