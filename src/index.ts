#!/usr/bin/env deno run --allow-net --allow-read
// MCP Server for Cider REPL integration

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { NREPLClient } from "./nrepl-client.ts";
import type { EvalRequest } from "./types.ts";

class CiderMCPServer {
  private server: Server;
  private nreplClient: NREPLClient;
  private isConnected = false;

  constructor() {
    this.server = new Server(
      {
        name: "cider-mcp-server",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.nreplClient = new NREPLClient();
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "cider_connect":
            return await this.handleConnect(args);
          case "cider_disconnect":
            return await this.handleDisconnect();
          case "cider_eval":
            return await this.handleEval(args);
          case "cider_load_file":
            return await this.handleLoadFile(args);
          case "cider_get_info":
            return await this.handleGetInfo();
          case "cider_list_namespaces":
            return await this.handleListNamespaces();
          case "cider_get_namespace_info":
            return await this.handleGetNamespaceInfo(args);
          case "cider_get_var_info":
            return await this.handleGetVarInfo(args);
          case "cider_interrupt":
            return await this.handleInterrupt();
          case "cider_switch_namespace":
            return await this.handleSwitchNamespace(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          }],
          isError: true,
        };
      }
    });
  }

  private getTools(): Tool[] {
    return [
      {
        name: "cider_connect",
        description: "Connect to a running Cider REPL instance via nREPL",
        inputSchema: {
          type: "object",
          properties: {
            host: {
              type: "string",
              description: "nREPL server host (default: localhost)",
              default: "localhost"
            },
            port: {
              type: "number",
              description: "nREPL server port (default: 60977)",
              default: 60977
            }
          },
        },
      },
      {
        name: "cider_disconnect",
        description: "Disconnect from the Cider REPL instance",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "cider_eval",
        description: "Evaluate Clojure code in the REPL",
        inputSchema: {
          type: "object",
          properties: {
            code: {
              type: "string",
              description: "Clojure code to evaluate"
            },
            ns: {
              type: "string",
              description: "Namespace to evaluate in (optional)"
            },
            file: {
              type: "string",
              description: "File path context (optional)"
            },
            line: {
              type: "number",
              description: "Line number context (optional)"
            },
            column: {
              type: "number",
              description: "Column number context (optional)"
            }
          },
          required: ["code"],
        },
      },
      {
        name: "cider_load_file",
        description: "Load and evaluate a Clojure file in the REPL",
        inputSchema: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description: "Path to the Clojure file to load"
            }
          },
          required: ["path"],
        },
      },
      {
        name: "cider_get_info",
        description: "Get information about the REPL connection and current state",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "cider_list_namespaces",
        description: "List all available namespaces in the REPL",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "cider_get_namespace_info",
        description: "Get detailed information about a specific namespace",
        inputSchema: {
          type: "object",
          properties: {
            namespace: {
              type: "string",
              description: "Name of the namespace to inspect"
            }
          },
          required: ["namespace"],
        },
      },
      {
        name: "cider_get_var_info",
        description: "Get information about a specific variable or function",
        inputSchema: {
          type: "object",
          properties: {
            var_name: {
              type: "string",
              description: "Name of the variable or function"
            },
            namespace: {
              type: "string",
              description: "Namespace containing the variable (optional)"
            }
          },
          required: ["var_name"],
        },
      },
      {
        name: "cider_interrupt",
        description: "Interrupt the current evaluation in the REPL",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "cider_switch_namespace",
        description: "Switch to a different namespace in the REPL",
        inputSchema: {
          type: "object",
          properties: {
            namespace: {
              type: "string",
              description: "Name of the namespace to switch to"
            }
          },
          required: ["namespace"],
        },
      },
    ];
  }

  private async handleConnect(args: any) {
    const host = args?.host || "localhost";
    const port = args?.port || 60977;

    this.nreplClient = new NREPLClient(host, port);
    
    try {
      await this.nreplClient.connect();
      this.isConnected = true;
      
      const info = await this.nreplClient.getInfo();
      
      return {
        content: [{
          type: "text",
          text: `Successfully connected to Cider REPL at ${host}:${port}\n` +
                `Current namespace: ${info.currentNs}\n` +
                `Active sessions: ${info.sessions.length}`,
        }],
      };
    } catch (error) {
      throw new Error(`Failed to connect: ${error}`);
    }
  }

  private async handleDisconnect() {
    if (this.isConnected) {
      await this.nreplClient.disconnect();
      this.isConnected = false;
    }
    
    return {
      content: [{
        type: "text",
        text: "Disconnected from Cider REPL",
      }],
    };
  }

  private async handleEval(args: any) {
    this.ensureConnected();
    
    const request: EvalRequest = {
      code: args.code,
      ns: args.ns,
      file: args.file,
      line: args.line,
      column: args.column,
    };

    const result = await this.nreplClient.eval(request);
    
    let text = "";
    if (result.output) {
      text += `Output: ${result.output}\n`;
    }
    if (result.value) {
      text += `Result: ${result.value}\n`;
    }
    if (result.error) {
      text += `Error: ${result.error}\n`;
    }
    if (result.ns) {
      text += `Namespace: ${result.ns}\n`;
    }

    return {
      content: [{
        type: "text",
        text: text || "No output",
      }],
      isError: result.type === "error",
    };
  }

  private async handleLoadFile(args: any) {
    this.ensureConnected();
    
    const result = await this.nreplClient.loadFile(args.path);
    
    return {
      content: [{
        type: "text",
        text: result.error 
          ? `Error loading file: ${result.error}`
          : `Successfully loaded file: ${args.path}${result.value ? `\nResult: ${result.value}` : ''}`,
      }],
      isError: result.type === "error",
    };
  }

  private async handleGetInfo() {
    this.ensureConnected();
    
    const info = await this.nreplClient.getInfo();
    
    return {
      content: [{
        type: "text",
        text: `REPL Info:\n` +
              `Host: ${info.host}:${info.port}\n` +
              `Connected: ${info.connected}\n` +
              `Current namespace: ${info.currentNs}\n` +
              `Active sessions: ${info.sessions.length}`,
      }],
    };
  }

  private async handleListNamespaces() {
    this.ensureConnected();
    
    const namespaces = await this.nreplClient.listNamespaces();
    
    return {
      content: [{
        type: "text",
        text: `Available namespaces:\n${namespaces.map(ns => `  - ${ns}`).join('\n')}`,
      }],
    };
  }

  private async handleGetNamespaceInfo(args: any) {
    this.ensureConnected();
    
    const info = await this.nreplClient.getNamespaceInfo(args.namespace);
    
    return {
      content: [{
        type: "text",
        text: `Namespace: ${info.name}\n` +
              `Variables: ${info.vars.length}\n` +
              `  ${info.vars.slice(0, 20).join(', ')}${info.vars.length > 20 ? '...' : ''}\n` +
              `Aliases: ${Object.keys(info.aliases).length}\n` +
              `Imports: ${info.imports.length}`,
      }],
    };
  }

  private async handleGetVarInfo(args: any) {
    this.ensureConnected();
    
    const info = await this.nreplClient.getVarInfo(args.var_name, args.namespace);
    
    if (!info) {
      return {
        content: [{
          type: "text",
          text: `Variable '${args.var_name}' not found`,
        }],
      };
    }
    
    return {
      content: [{
        type: "text",
        text: `Variable: ${info.name}\n` +
              `Namespace: ${info.ns}\n` +
              `Type: ${info.type}\n` +
              `Documentation: ${info.doc || 'No documentation available'}\n` +
              `Arguments: ${info.arglists?.join(', ') || 'N/A'}\n` +
              `File: ${info.file || 'Unknown'}\n` +
              `Line: ${info.line || 'Unknown'}`,
      }],
    };
  }

  private async handleInterrupt() {
    this.ensureConnected();
    
    await this.nreplClient.interrupt();
    
    return {
      content: [{
        type: "text",
        text: "Interrupted current evaluation",
      }],
    };
  }

  private async handleSwitchNamespace(args: any) {
    this.ensureConnected();
    
    const result = await this.nreplClient.eval({
      code: `(in-ns '${args.namespace})`,
    });
    
    return {
      content: [{
        type: "text",
        text: result.error 
          ? `Error switching namespace: ${result.error}`
          : `Switched to namespace: ${args.namespace}`,
      }],
      isError: result.type === "error",
    };
  }

  private ensureConnected(): void {
    if (!this.isConnected) {
      throw new Error("Not connected to Cider REPL. Use cider_connect first.");
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Cider MCP Server running on stdio");
  }
}

// Handle cleanup on exit
Deno.addSignalListener("SIGINT", () => {
  console.error("Shutting down Cider MCP Server...");
  Deno.exit(0);
});

Deno.addSignalListener("SIGTERM", () => {
  console.error("Shutting down Cider MCP Server...");
  Deno.exit(0);
});

// Start the server
if (import.meta.main) {
  const server = new CiderMCPServer();
  await server.run();
}