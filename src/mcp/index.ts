#!/usr/bin/env node

import { TabNabMCPServer } from './server.js';

const DEFAULT_DEBUG_PORT = 9222;

async function main() {
  const debugPort = process.env.CHROME_DEBUG_PORT
    ? Number.parseInt(process.env.CHROME_DEBUG_PORT, 10)
    : DEFAULT_DEBUG_PORT;

  console.error(`Starting TabNab MCP Server (Chrome debug port: ${debugPort})`);

  const server = new TabNabMCPServer(debugPort);

  try {
    await server.start();
    console.error('TabNab MCP Server is running');
  } catch (error) {
    console.error('Failed to start TabNab MCP Server:', error);
    process.exit(1);
  }
}

main();
