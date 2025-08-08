// nREPL client for connecting to Cider REPL instances
import { Bencode } from "./bencode.ts";
import type { 
  NREPLMessage, 
  NREPLResponse, 
  CiderConnection, 
  EvalRequest, 
  EvalResponse,
  ReplInfo,
  NamespaceInfo,
  VarInfo
} from "./types.ts";

export class NREPLClient {
  private connection: CiderConnection;
  private messageQueue: Map<string, (response: NREPLResponse) => void> = new Map();
  private currentSession?: string;
  private tcpConnection?: Deno.TcpConn;
  private responseBuffer = new Uint8Array(0);

  constructor(host = "localhost", port = 60977) {
    this.connection = {
      host,
      port,
      sessions: new Map(),
      isConnected: false,
    };
  }

  async connect(): Promise<void> {
    try {
      // Connect via TCP socket (nREPL standard)
      this.tcpConnection = await Deno.connect({
        hostname: this.connection.host,
        port: this.connection.port,
      });
      
      this.connection.isConnected = true;
      console.error(`Connected to nREPL at ${this.connection.host}:${this.connection.port}`);
      
      // Start reading messages in background
      this.startMessageReader();
      
      // Create a new session
      await this.createSession();
      
    } catch (error) {
      throw new Error(`Failed to connect to nREPL: ${error}`);
    }
  }

  private async startMessageReader(): Promise<void> {
    if (!this.tcpConnection) return;
    
    try {
      const buffer = new Uint8Array(4096);
      
      while (this.connection.isConnected && this.tcpConnection) {
        const bytesRead = await this.tcpConnection.read(buffer);
        
        if (bytesRead === null) {
          // Connection closed
          this.connection.isConnected = false;
          console.error("nREPL connection closed");
          break;
        }
        
        // Append new data to response buffer
        const newData = buffer.slice(0, bytesRead);
        const combinedBuffer = new Uint8Array(this.responseBuffer.length + newData.length);
        combinedBuffer.set(this.responseBuffer);
        combinedBuffer.set(newData, this.responseBuffer.length);
        this.responseBuffer = combinedBuffer;
        
        // Try to parse complete messages from buffer
        await this.processResponseBuffer();
      }
    } catch (error) {
      console.error("Error reading from nREPL:", error);
      this.connection.isConnected = false;
    }
  }

  private async processResponseBuffer(): Promise<void> {
    while (this.responseBuffer.length > 0) {
      try {
        // Try to decode a complete bencode message
        const response = Bencode.decode(this.responseBuffer) as NREPLResponse;
        
        // If we get here, we have a complete message
        if (response.id && this.messageQueue.has(response.id)) {
          const callback = this.messageQueue.get(response.id);
          callback?.(response);
          
          // Remove callback if status indicates completion
          if (response.status?.includes("done")) {
            this.messageQueue.delete(response.id);
          }
        }
        
        // Calculate how much data we consumed and remove it from buffer
        const encodedResponse = Bencode.encode(response);
        this.responseBuffer = this.responseBuffer.slice(encodedResponse.length);
        
      } catch (error) {
        // If we can't parse a complete message, wait for more data
        break;
      }
    }
  }

  private async sendMessage(message: NREPLMessage): Promise<NREPLResponse> {
    if (!this.connection.isConnected || !this.tcpConnection) {
      throw new Error("Not connected to nREPL");
    }

    const id = message.id || crypto.randomUUID();
    const messageWithId = { ...message, id };
    
    if (this.currentSession) {
      messageWithId.session = this.currentSession;
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.messageQueue.delete(id);
        reject(new Error("nREPL request timeout"));
      }, 10000);

      this.messageQueue.set(id, (response) => {
        clearTimeout(timeout);
        resolve(response);
      });

      try {
        const encoded = Bencode.encode(messageWithId);
        this.tcpConnection!.write(encoded);
      } catch (error) {
        this.messageQueue.delete(id);
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  private async createSession(): Promise<void> {
    const response = await this.sendMessage({ op: "clone" });
    if (response.status?.includes("done") && response["new-session"]) {
      this.currentSession = response["new-session"] as string;
      this.connection.sessions.set("main", this.currentSession);
    } else {
      throw new Error("Failed to create nREPL session");
    }
  }

  async eval(request: EvalRequest): Promise<EvalResponse> {
    const message: NREPLMessage = {
      op: "eval",
      code: request.code,
      ns: request.ns,
      file: request.file,
      line: request.line,
      column: request.column,
    };

    try {
      const response = await this.sendMessage(message);
      
      return {
        value: response.value as string,
        output: response.out as string,
        error: response.err as string,
        ns: response.ns as string,
        type: response.status?.includes("error") ? "error" : "success",
      };
    } catch (error) {
      return {
        error: `Evaluation failed: ${error}`,
        type: "error",
      };
    }
  }

  async loadFile(filePath: string): Promise<EvalResponse> {
    try {
      const fileContent = await Deno.readTextFile(filePath);
      return await this.eval({
        code: fileContent,
        file: filePath,
      });
    } catch (error) {
      return {
        error: `Failed to load file: ${error}`,
        type: "error",
      };
    }
  }

  async getInfo(): Promise<ReplInfo> {
    const response = await this.sendMessage({ op: "describe" });
    
    return {
      host: this.connection.host,
      port: this.connection.port,
      connected: this.connection.isConnected,
      sessions: Array.from(this.connection.sessions.values()),
      currentNs: await this.getCurrentNamespace(),
    };
  }

  async getCurrentNamespace(): Promise<string> {
    try {
      const response = await this.eval({ code: "*ns*" });
      return response.value?.replace(/^#namespace\[(.+)\]$/, "$1") || "user";
    } catch {
      return "user";
    }
  }

  async listNamespaces(): Promise<string[]> {
    try {
      const response = await this.eval({ 
        code: "(map str (all-ns))" 
      });
      
      if (response.value) {
        // Parse the Clojure list format
        const nsString = response.value.replace(/^\(|\)$/g, "");
        return nsString.split(" ").map(ns => ns.trim()).filter(ns => ns);
      }
      
      return [];
    } catch {
      return [];
    }
  }

  async getNamespaceInfo(ns: string): Promise<NamespaceInfo> {
    try {
      const varsResponse = await this.eval({
        code: `(map str (keys (ns-publics '${ns})))`
      });
      
      const aliasesResponse = await this.eval({
        code: `(ns-aliases '${ns})`
      });

      let vars: string[] = [];
      if (varsResponse.value) {
        const varsString = varsResponse.value.replace(/^\(|\)$/g, "");
        vars = varsString.split(" ").map(v => v.trim()).filter(v => v);
      }

      return {
        name: ns,
        vars,
        aliases: {},
        imports: [],
      };
    } catch {
      return {
        name: ns,
        vars: [],
        aliases: {},
        imports: [],
      };
    }
  }

  async getVarInfo(varName: string, ns?: string): Promise<VarInfo | null> {
    try {
      const fullName = ns ? `${ns}/${varName}` : varName;
      const response = await this.eval({
        code: `(meta #'${fullName})`
      });
      
      if (response.value && response.value !== "nil") {
        // Parse the metadata map (simplified parsing)
        return {
          name: varName,
          ns: ns || "user",
          doc: undefined,
          arglists: [],
          type: "var",
        };
      }
      
      return null;
    } catch {
      return null;
    }
  }

  async interrupt(): Promise<void> {
    if (this.currentSession) {
      await this.sendMessage({
        op: "interrupt",
        session: this.currentSession,
      });
    }
  }

  async disconnect(): Promise<void> {
    if (this.tcpConnection) {
      try {
        this.tcpConnection.close();
      } catch (error) {
        console.error("Error closing TCP connection:", error);
      }
      this.connection.isConnected = false;
      this.messageQueue.clear();
      this.tcpConnection = undefined;
    }
  }
}