import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";

export const InternalErrorResponse = {
  jsonrpc: "2.0",
  id: 1,
  error: {
    code: -32603,
    message: "Internal error",
  },
};

export class RpcServerMock {
  // shared between all mock servers
  private static blockNumber = 0n;

  #server: Server;
  #port: number;
  #jsonRpcError?: Record<string, unknown>;
  #brokenUntil = 0;

  constructor(port: number) {
    this.#port = port;
    this.#server = createServer(this.#handleRequest.bind(this));
  }

  #handleRequest(_req: IncomingMessage, res: ServerResponse) {
    if (this.jsonRpcError) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(this.jsonRpcError));
      return;
    }

    // Normal response with growing block number
    RpcServerMock.blockNumber++;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        result: `0x${RpcServerMock.blockNumber.toString(16)}`,
      }),
    );
  }

  private get jsonRpcError(): Record<string, unknown> | undefined {
    if (Date.now() > this.#brokenUntil || !this.#jsonRpcError) {
      return undefined;
    }
    return this.#jsonRpcError;
  }

  public start(): Promise<void> {
    return new Promise(resolve => {
      this.#server.listen(this.#port, () => {
        resolve();
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise(resolve => {
      this.#server.close(() => {
        resolve();
      });
    });
  }

  public get url(): string {
    return `http://127.0.0.1:${this.#port}`;
  }

  // Break the server for a certain duration (0 = permanent)
  public break(
    duration: number,
    error: Record<string, unknown> = InternalErrorResponse,
  ): bigint {
    this.#jsonRpcError = error;
    this.#brokenUntil = Date.now() + duration;
    return RpcServerMock.blockNumber;
  }

  // Reset server state
  public async reset(andStop = false): Promise<void> {
    this.#jsonRpcError = undefined;
    this.#brokenUntil = 0;
    if (andStop) {
      await this.stop();
    }
  }
}
