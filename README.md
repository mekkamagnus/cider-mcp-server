# Cider MCP Server

An MCP (Model Context Protocol) server that enables AI coding agents like Claude Code and Gemini CLI to connect to and interact with running Cider REPL instances via the nREPL protocol.

## Features

- **Connect to nREPL**: Connect to any running Cider/nREPL instance
- **Code Evaluation**: Evaluate Clojure code in the REPL context
- **File Loading**: Load and evaluate entire Clojure files
- **Namespace Management**: Switch namespaces and inspect namespace contents
- **Variable Inspection**: Get detailed information about variables and functions
- **REPL Control**: Interrupt evaluations and manage REPL state

## 🚀 Quick Start (NPX - Recommended)

The easiest way to use the Cider MCP Server is with NPX (no installation required):

```bash
# Initialize any directory with MCP configuration
npx cider-mcp-server init

# Start your Clojure REPL
clj -M:nrepl

# Claude Code automatically detects and uses the MCP server!
```

## 📦 Installation Methods

### Method 1: NPX (Zero Installation)

**Best for**: Trying it out, project-specific usage, no global pollution

```bash
# One-command setup in any directory
npx cider-mcp-server init

# Run server directly  
npx cider-mcp-server

# Custom port
CIDER_DEFAULT_PORT=60977 npx cider-mcp-server

# Help
npx cider-mcp-server --help
```

**Configuration**:
```json
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
```

### Method 2: Standalone Executable (Global)

**Best for**: Regular users, no Node.js dependency, fastest startup

```bash
# Install via script (macOS/Linux)
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/cider-mcp-server/main/scripts/install.sh | bash

# Or download from releases
# https://github.com/YOUR_USERNAME/cider-mcp-server/releases
```

**Configuration**:
```json
{
  "mcpServers": {
    "cider": {
      "command": "/usr/local/bin/cider-mcp-server",
      "args": []
    }
  }
}
```

### Method 3: Homebrew (macOS/Linux)

**Best for**: macOS/Linux users who prefer package managers

```bash
# From tap (when available)
brew install your-username/tap/cider-mcp

# Or directly
brew install https://raw.githubusercontent.com/YOUR_USERNAME/homebrew-tap/main/Formula/cider-mcp.rb
```

### Method 4: From Source (Development)

**Best for**: Contributors, latest features, customization

```bash
git clone https://github.com/YOUR_USERNAME/cider-mcp-server.git
cd cider-mcp-server

# Run directly
deno run --allow-net --allow-read src/index.ts

# Or build
deno task compile
./cider-mcp-server
```

**Configuration**:
```json
{
  "mcpServers": {
    "cider": {
      "command": "deno",
      "args": [
        "run", "--allow-net", "--allow-read",
        "https://raw.githubusercontent.com/YOUR_USERNAME/cider-mcp-server/main/src/index.ts"
      ]
    }
  }
}
```

### Method 5: Docker

**Best for**: Containerized environments, isolation

```bash
# Run with Docker
docker run -p 3000:3000 your-username/cider-mcp-server

# Or via docker-compose
```

**Configuration**:
```json
{
  "mcpServers": {
    "cider": {
      "command": "docker",
      "args": ["run", "--rm", "--network=host", "your-username/cider-mcp-server"]
    }
  }
}
```

## Prerequisites

- **For NPX method**: Node.js (includes NPX), Deno runtime
- **For standalone**: None (self-contained executable)
- **For source/Docker**: Deno v1.40+ or Docker
- **For all methods**: A running Cider REPL instance

## Usage

### Starting a Cider REPL

First, you need to start a Cider REPL in your Clojure project:

#### Using CIDER (Emacs)
1. Open your Clojure project in Emacs
2. Run `M-x cider-jack-in`
3. Note the nREPL port (usually shown in the REPL buffer, e.g., "nREPL server started on port 7888")

#### Using Calva (VS Code)
1. Open your Clojure project in VS Code
2. Run "Calva: Start a Project REPL"
3. Choose your project type
4. Note the nREPL port in the output panel

#### Manual nREPL Server

**Using Clojure CLI:**
```bash
clj -Sdeps '{:deps {nrepl/nrepl {:mvn/version "1.0.0"} cider/cider-nrepl {:mvn/version "0.42.1"}}}' -M -e "(require '[nrepl.server :as server] '[cider.nrepl :as cider]) (server/start-server :port 7888 :handler (server/default-handler #'cider/cider-middleware))"
```

Or create a `deps.edn` file in your project:
```clojure
{:deps {org.clojure/clojure {:mvn/version "1.11.1"}}
 :aliases
 {:nrepl
  {:extra-deps {nrepl/nrepl {:mvn/version "1.0.0"}
                cider/cider-nrepl {:mvn/version "0.42.1"}}
   :main-opts ["-m" "nrepl.cmdline" "--port" "7888" "--middleware" "[cider.nrepl/cider-middleware]"]}}}
```

Then run:
```bash
clj -M:nrepl
```

**Using Leiningen:**
```bash
lein repl :headless :host localhost :port 7888
```

## ⚙️ Configuration Guide

### Project-Specific Configuration (Recommended)

The NPX method automatically creates `.claude/mcp_servers.json` in your project:

```bash
# Setup project
npx cider-mcp-server init

# Creates .claude/mcp_servers.json:
{
  "mcpServers": {
    "cider": {
      "command": "npx",
      "args": ["cider-mcp-server"],
      "env": {
        "CIDER_DEFAULT_HOST": "localhost", 
        "CIDER_DEFAULT_PORT": "7888"
      }
    }
  }
}
```

### Global Configuration

#### Claude Desktop (~/.claude_desktop_config.json)

**NPX (recommended)**:
```json
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

**Standalone executable**:
```json
{
  "mcpServers": {
    "cider": {
      "command": "/usr/local/bin/cider-mcp-server",
      "args": []
    }
  }
}
```

**From source**:
```json
{
  "mcpServers": {
    "cider": {
      "command": "deno",
      "args": [
        "run", "--allow-net", "--allow-read",
        "https://raw.githubusercontent.com/YOUR_USERNAME/cider-mcp-server/main/src/index.ts"
      ]
    }
  }
}
```

### Advanced Configuration

#### Multiple REPL Connections
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

#### Environment Variables
- `CIDER_DEFAULT_HOST`: nREPL server host (default: localhost)
- `CIDER_DEFAULT_PORT`: nREPL server port (default: 7888)

## Available Tools

### Connection Management

#### `cider_connect`
Connect to a running nREPL instance.

**Parameters:**
- `host` (optional): nREPL server host (default: "localhost")
- `port` (optional): nREPL server port (default: 7888)

**Example:**
```
Connect to nREPL at localhost:7888
```

#### `cider_disconnect`
Disconnect from the current nREPL instance.

### Code Evaluation

#### `cider_eval`
Evaluate Clojure code in the REPL.

**Parameters:**
- `code` (required): Clojure code to evaluate
- `ns` (optional): Namespace to evaluate in
- `file` (optional): File path context
- `line` (optional): Line number context
- `column` (optional): Column number context

**Examples:**
```clojure
;; Simple evaluation
(+ 1 2 3)

;; Define a function
(defn greet [name] (str "Hello, " name "!"))

;; Call the function
(greet "World")
```

#### `cider_load_file`
Load and evaluate a Clojure file.

**Parameters:**
- `path` (required): Path to the Clojure file

**Example:**
```
Load file: /path/to/your/project/src/core.clj
```

### REPL Information

#### `cider_get_info`
Get information about the current REPL connection and state.

#### `cider_list_namespaces`
List all available namespaces in the REPL.

#### `cider_get_namespace_info`
Get detailed information about a specific namespace.

**Parameters:**
- `namespace` (required): Name of the namespace to inspect

#### `cider_get_var_info`
Get information about a specific variable or function.

**Parameters:**
- `var_name` (required): Name of the variable or function
- `namespace` (optional): Namespace containing the variable

### REPL Control

#### `cider_interrupt`
Interrupt the current evaluation.

#### `cider_switch_namespace`
Switch to a different namespace.

**Parameters:**
- `namespace` (required): Name of the namespace to switch to

## Example Workflow

1. **Start your Cider REPL** in your Clojure project
2. **Connect to the REPL** using the MCP server:
   ```
   Use cider_connect with host="localhost" and port=7888
   ```

3. **Evaluate some code**:
   ```clojure
   (def my-data [1 2 3 4 5])
   (map inc my-data)
   ```

4. **Load a file**:
   ```
   Use cider_load_file with path="src/my_namespace.clj"
   ```

5. **Inspect the namespace**:
   ```
   Use cider_get_namespace_info with namespace="my-namespace"
   ```

6. **Get function information**:
   ```
   Use cider_get_var_info with var_name="my-function" and namespace="my-namespace"
   ```

## 🔄 Comparison of Methods

| Method | Setup Time | Dependencies | Startup Speed | Auto-Updates | Best For |
|--------|------------|--------------|---------------|--------------|----------|
| **NPX** | Instant | Node.js, Deno | Medium | Manual | New users, trying out |
| **Standalone** | Medium | None | Fastest | Manual | Regular users |
| **Homebrew** | Easy | None | Fast | Automatic | macOS/Linux power users |
| **Source** | Medium | Deno | Medium | Git pull | Contributors, latest features |
| **Docker** | Easy | Docker | Slow | Automatic | Containerized environments |

## 🛠️ Development

### Local Development
```bash
git clone https://github.com/YOUR_USERNAME/cider-mcp-server.git
cd cider-mcp-server

# Development with hot reload
deno task dev

# Run tests
deno task test

# Linting and formatting
deno task lint
deno task fmt

# Build standalone executable
deno task compile

# Build for all platforms
deno task compile-all
```

### Publishing & Distribution

```bash
# Package for distribution
./scripts/package.sh

# Publish to NPM
npm publish

# Create GitHub release (triggers automatic builds)
git tag v0.1.0
git push origin v0.1.0
```

## Protocol Details

This server implements the nREPL (network REPL) protocol using:
- **Transport**: TCP sockets
- **Encoding**: Bencode (BitTorrent encoding)
- **Message Format**: Dictionary with operation-specific keys

### Supported nREPL Operations
- `clone`: Create new evaluation session
- `eval`: Evaluate code
- `describe`: Get server information
- `interrupt`: Stop current evaluation

## 🔧 Troubleshooting

### Installation Issues

**"Deno not found" (NPX method)**:
```bash
# Install Deno
curl -fsSL https://deno.land/install.sh | sh
# Or via Homebrew
brew install deno
# Add to PATH
echo 'export PATH="$HOME/.deno/bin:$PATH"' >> ~/.bashrc
```

**"Command not found" (Standalone)**:
```bash
# Check if binary is in PATH
which cider-mcp-server
# Add to PATH if needed
export PATH="/usr/local/bin:$PATH"
```

**NPM package not found**:
```bash
# Clear npm cache and try latest
npm cache clean --force
npx cider-mcp-server@latest
```

### Connection Issues

**Cannot connect to nREPL**:
- ✅ Ensure REPL is running: `lsof -i :7888`
- ✅ Check host/port in configuration
- ✅ Verify firewall settings
- ✅ Try `telnet localhost 7888` to test connectivity

**Connection timeout**:
- ✅ Check network connectivity
- ✅ Increase timeout in client config  
- ✅ Ensure nREPL server is responsive
- ✅ Try different port: `CIDER_DEFAULT_PORT=7889 npx cider-mcp-server`

**"Port already in use"**:
```bash
# Find what's using the port
lsof -i :7888
# Kill the process or use different port
kill -9 <PID>
# Or use different port
CIDER_DEFAULT_PORT=7889 npx cider-mcp-server
```

### Evaluation Issues

**Code evaluation hangs**:
- ✅ Use `cider_interrupt` tool to stop evaluation
- ✅ Check for infinite loops or blocking operations
- ✅ Restart REPL if necessary
- ✅ Check REPL logs for errors

**"Namespace not found"**:
- ✅ Use `cider_list_namespaces` to see available namespaces
- ✅ Ensure namespace is loaded: `(require 'your.namespace)`
- ✅ Use fully qualified names: `your.namespace/function-name`
- ✅ Check current namespace: `*ns*`

**"Function not found"**:
- ✅ Use `cider_get_namespace_info` to see available functions
- ✅ Check if function is public (not private with `defn-`)
- ✅ Ensure function is defined in current session

### Claude Code Integration

**MCP server not detected**:
- ✅ Ensure `.claude/mcp_servers.json` exists in project root
- ✅ Restart Claude Code after configuration changes
- ✅ Check JSON syntax in configuration file
- ✅ Verify file permissions are readable

**Tools not available**:
- ✅ Check Claude Code logs for MCP connection errors
- ✅ Verify command path is correct in configuration
- ✅ Test server manually: `npx cider-mcp-server`
- ✅ Check environment variables are set correctly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and formatting
6. Submit a pull request

## License

MIT License - see LICENSE file for details.