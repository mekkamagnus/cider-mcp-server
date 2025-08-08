#!/usr/bin/env node
/**
 * NPX wrapper for Cider MCP Server
 * This allows running via: npx cider-mcp-server
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to find the Deno executable
function findDeno() {
  const possiblePaths = [
    '/usr/local/bin/deno',
    '/opt/homebrew/bin/deno',
    '/home/linuxbrew/.linuxbrew/bin/deno',
    'deno' // fallback to PATH
  ];
  
  // Check if deno is available in PATH
  return 'deno';
}

function runMCPServer() {
  const denoPath = findDeno();
  const serverPath = join(__dirname, '../src/index.ts');
  
  console.error('🚀 Starting Cider MCP Server via npx...');
  console.error(`📁 Server path: ${serverPath}`);
  
  // Check if this is a local project with .claude/mcp_servers.json
  const fs = await import('fs');
  const localConfigPath = join(process.cwd(), '.claude/mcp_servers.json');
  
  if (fs.existsSync(localConfigPath)) {
    console.error('📋 Found local .claude/mcp_servers.json configuration');
  } else {
    console.error('💡 Tip: Create .claude/mcp_servers.json for local project configuration');
  }
  
  const args = [
    'run',
    '--allow-net',
    '--allow-read',
    serverPath
  ];
  
  const child = spawn(denoPath, args, {
    stdio: 'inherit',
    env: {
      ...process.env,
      CIDER_DEFAULT_HOST: process.env.CIDER_DEFAULT_HOST || 'localhost',
      CIDER_DEFAULT_PORT: process.env.CIDER_DEFAULT_PORT || '7888'
    }
  });
  
  child.on('error', (error) => {
    if (error.code === 'ENOENT') {
      console.error('❌ Error: Deno not found!');
      console.error('📥 Please install Deno: https://deno.land/#installation');
      console.error('   Or use the standalone binary instead.');
      process.exit(1);
    } else {
      console.error('❌ Error starting MCP server:', error.message);
      process.exit(1);
    }
  });
  
  child.on('close', (code) => {
    process.exit(code || 0);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.error('\n🛑 Shutting down Cider MCP Server...');
    child.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.error('\n🛑 Shutting down Cider MCP Server...');
    child.kill('SIGTERM');
  });
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🔧 Cider MCP Server

Usage:
  npx cider-mcp-server              Start the MCP server
  npx cider-mcp-server --help       Show this help message

Environment Variables:
  CIDER_DEFAULT_HOST               nREPL host (default: localhost)
  CIDER_DEFAULT_PORT               nREPL port (default: 7888)

Examples:
  # Start server with default settings
  npx cider-mcp-server

  # Start server with custom port
  CIDER_DEFAULT_PORT=60977 npx cider-mcp-server

  # Use in Claude Desktop config:
  {
    "mcpServers": {
      "cider": {
        "command": "npx",
        "args": ["cider-mcp-server"],
        "env": {
          "CIDER_DEFAULT_PORT": "60977"
        }
      }
    }
  }

For more information, visit: https://github.com/YOUR_USERNAME/cider-mcp-server
`);
  process.exit(0);
}

runMCPServer();