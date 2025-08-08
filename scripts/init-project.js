#!/usr/bin/env node
/**
 * Initialize a project with Cider MCP Server configuration
 * Usage: npx cider-mcp-server init
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

function initProject() {
  const cwd = process.cwd();
  const claudeDir = join(cwd, '.claude');
  const configPath = join(claudeDir, 'mcp_servers.json');
  
  console.log('🚀 Initializing Cider MCP Server in current directory...');
  console.log(`📁 Project directory: ${cwd}`);
  
  // Create .claude directory if it doesn't exist
  if (!existsSync(claudeDir)) {
    mkdirSync(claudeDir, { recursive: true });
    console.log('📂 Created .claude/ directory');
  }
  
  // Check if config already exists
  if (existsSync(configPath)) {
    console.log('⚠️  .claude/mcp_servers.json already exists');
    console.log('   Remove it first if you want to recreate it');
    return;
  }
  
  // Create configuration
  const config = {
    mcpServers: {
      cider: {
        command: "npx",
        args: ["cider-mcp-server"],
        env: {
          CIDER_DEFAULT_HOST: "localhost",
          CIDER_DEFAULT_PORT: "7888"
        }
      }
    }
  };
  
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('✅ Created .claude/mcp_servers.json');
  
  // Create a sample deps.edn if it doesn't exist (for Clojure projects)
  const depsPath = join(cwd, 'deps.edn');
  if (!existsSync(depsPath)) {
    const deps = {
      deps: {
        "org.clojure/clojure": { "mvn/version": "1.11.1" }
      },
      aliases: {
        nrepl: {
          "extra-deps": {
            "nrepl/nrepl": { "mvn/version": "1.0.0" },
            "cider/cider-nrepl": { "mvn/version": "0.42.1" }
          },
          "main-opts": ["-m", "nrepl.cmdline", "--port", "7888", "--middleware", "[cider.nrepl/cider-middleware]"]
        }
      }
    };
    
    writeFileSync(depsPath, JSON.stringify(deps, null, 2));
    console.log('✅ Created deps.edn with nREPL configuration');
  }
  
  console.log(`
🎉 Setup complete! 

Next steps:
1. Start your Clojure REPL:
   clj -M:nrepl

2. The MCP server is ready to use with Claude Code!
   It will automatically connect to localhost:7888

3. To use a different port, edit .claude/mcp_servers.json:
   "CIDER_DEFAULT_PORT": "your-port-here"

4. Test the connection:
   Ask Claude to "Connect to the Clojure REPL"
`);
}

// Check if this is the init command
if (process.argv[2] === 'init') {
  initProject();
} else {
  // Import and run the main server
  import('./npm-wrapper.js');
}