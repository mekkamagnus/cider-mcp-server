# Using Cider MCP Server with NPX

The Cider MCP Server can be used locally in any folder via `npx` without global installation.

## 🚀 Quick Start

### 1. Initialize a Project
```bash
# In any directory (Clojure project or not)
npx cider-mcp-server init
```

This creates:
- `.claude/mcp_servers.json` - MCP configuration for Claude Code
- `deps.edn` - Clojure project with nREPL setup (if missing)

### 2. Start Your Clojure REPL
```bash
# Uses the nREPL alias created by init
clj -M:nrepl
```

### 3. Use with Claude Code
Claude Code automatically detects the `.claude/mcp_servers.json` file and enables the Cider MCP server.

## 📋 NPX Usage Examples

### Basic Usage
```bash
# Run the MCP server
npx cider-mcp-server

# Show help
npx cider-mcp-server --help

# Initialize current directory
npx cider-mcp-server init
```

### Environment Variables
```bash
# Custom REPL port
CIDER_DEFAULT_PORT=60977 npx cider-mcp-server

# Custom host
CIDER_DEFAULT_HOST=192.168.1.100 npx cider-mcp-server
```

## ⚙️ Configuration Options

### Option 1: Local Project Configuration (Recommended)
```json
// .claude/mcp_servers.json
{
  "mcpServers": {
    "cider": {
      "command": "npx",
      "args": ["cider-mcp-server"],
      "env": {
        "CIDER_DEFAULT_HOST": "localhost",
        "CIDER_DEFAULT_PORT": "60977"
      }
    }
  }
}
```

### Option 2: Global Claude Desktop Configuration
```json
// ~/.claude_desktop_config.json
{
  "mcpServers": {
    "cider": {
      "command": "npx",
      "args": ["cider-mcp-server"],
      "env": {
        "CIDER_DEFAULT_PORT": "7888"
      }
    }
  }
}
```

### Option 3: Inline Environment Variables
```json
{
  "mcpServers": {
    "cider": {
      "command": "sh",
      "args": ["-c", "CIDER_DEFAULT_PORT=60977 npx cider-mcp-server"]
    }
  }
}
```

## 🔧 Project Setup Workflows

### New Clojure Project
```bash
mkdir my-clojure-project
cd my-clojure-project
npx cider-mcp-server init
# Creates deps.edn and .claude/mcp_servers.json
clj -M:nrepl
# Start coding with Claude Code!
```

### Existing Clojure Project  
```bash
cd existing-project
npx cider-mcp-server init
# Adds .claude/mcp_servers.json (preserves existing deps.edn)
# Edit .claude/mcp_servers.json to match your REPL port
clj -M:your-existing-nrepl-alias
```

### Non-Clojure Project (Connect to External REPL)
```bash
cd my-other-project
npx cider-mcp-server init
# Edit .claude/mcp_servers.json with correct host/port
# Connect to external Clojure REPL running elsewhere
```

## 🎯 Benefits of NPX Approach

### ✅ Pros
- **No Global Installation**: Works anywhere without polluting global environment
- **Version Pinning**: Each project can specify exact version needed
- **Easy Updates**: `npx cider-mcp-server@latest` always gets latest version
- **Project Isolation**: Each project has its own configuration
- **Zero Setup**: One command initializes everything

### ⚠️ Requirements
- **Node.js**: NPX comes with Node.js (most developers have this)
- **Deno**: Required at runtime (auto-detected, clear error if missing)

## 🚀 Advanced Usage

### Custom Configuration
```bash
# Initialize with custom settings
npx cider-mcp-server init
# Then edit .claude/mcp_servers.json manually
```

### Multiple REPL Connections
```json
{
  "mcpServers": {
    "cider-dev": {
      "command": "npx",
      "args": ["cider-mcp-server"],
      "env": { "CIDER_DEFAULT_PORT": "7888" }
    },
    "cider-test": {
      "command": "npx", 
      "args": ["cider-mcp-server"],
      "env": { "CIDER_DEFAULT_PORT": "7889" }
    }
  }
}
```

### Version Pinning
```json
{
  "mcpServers": {
    "cider": {
      "command": "npx",
      "args": ["cider-mcp-server@0.1.0"]
    }
  }
}
```

## 🔍 Troubleshooting

### "Deno not found" Error
```bash
# Install Deno
curl -fsSL https://deno.land/install.sh | sh
# Or use Homebrew
brew install deno
```

### Port Already in Use
```bash
# Check what's using the port
lsof -i :7888
# Kill the process or use different port
CIDER_DEFAULT_PORT=7889 npx cider-mcp-server
```

### NPM Package Not Found
```bash
# Clear npm cache
npm cache clean --force
# Or use latest
npx cider-mcp-server@latest
```

## 📦 Publishing to NPM

For maintainers to publish:
```bash
# Build and test
npm run build
npm test

# Publish to NPM
npm publish

# Users can then use
npx cider-mcp-server@latest
```

This NPX approach provides the easiest way for developers to use the Cider MCP Server in any project without installation overhead!