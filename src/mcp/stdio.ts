import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { mcpServerInfo, registerMcpTools } from '@/mcp/server';

/**
 * Standalone stdio entry point so MCP clients (e.g. Claude Code) can spawn the server as a
 * child process without the Next.js app running. Run via: pnpm mcp:stdio
 */

// Stdout carries the MCP protocol frames; route stray logging to stderr so it can't corrupt them.
console.log = console.error;

const main = async () => {
  const server = new McpServer(mcpServerInfo);

  registerMcpTools(server);

  await server.connect(new StdioServerTransport());
};

main().catch((error) => {
  console.error('Failed to start MCP stdio server:', error);
  process.exit(1);
});
