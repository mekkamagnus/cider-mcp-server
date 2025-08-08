// Type definitions for nREPL protocol and Cider MCP server

export interface NREPLMessage {
  id?: string;
  op: string;
  session?: string;
  ns?: string;
  code?: string;
  file?: string;
  line?: number;
  column?: number;
  [key: string]: unknown;
}

export interface NREPLResponse {
  id?: string;
  session?: string;
  ns?: string;
  value?: string;
  out?: string;
  err?: string;
  status?: string[];
  [key: string]: unknown;
}

export interface CiderConnection {
  host: string;
  port: number;
  sessions: Map<string, string>;
  isConnected: boolean;
}

export interface EvalRequest {
  code: string;
  ns?: string;
  file?: string;
  line?: number;
  column?: number;
}

export interface EvalResponse {
  value?: string;
  output?: string;
  error?: string;
  ns?: string;
  type?: "success" | "error" | "output";
}

export interface ReplInfo {
  host: string;
  port: number;
  connected: boolean;
  sessions: string[];
  currentNs?: string;
}

export interface NamespaceInfo {
  name: string;
  vars: string[];
  aliases: Record<string, string>;
  imports: string[];
}

export interface VarInfo {
  name: string;
  ns: string;
  doc?: string;
  arglists?: string[];
  file?: string;
  line?: number;
  type?: "function" | "var" | "macro";
}