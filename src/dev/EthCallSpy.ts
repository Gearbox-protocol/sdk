import type {
  EIP1193Parameters,
  Hex,
  HttpTransportConfig,
  PublicRpcSchema,
  RequiredBy,
} from "viem";
import type { RpcResponse } from "viem/_types/types/rpc.js";
import type { ILogger } from "../sdk/index.js";

export type EthCallMethod = Extract<
  PublicRpcSchema[number],
  { Method: "eth_call" }
>;

export type EthCallRequest = EIP1193Parameters<[EthCallMethod]>;

export interface DetectedCall {
  request: EthCallRequest;
  response?: RpcResponse<Hex>;
  responseHeaders?: Record<string, string>;
}

export type CheckMulticallFn = (data: EthCallRequest) => boolean;

/**
 * Helper to spy on eth_call requests and responses in viem transport
 */
export class EthCallSpy<TCall extends DetectedCall = DetectedCall> {
  #logger?: ILogger;

  #detectedCalls: TCall[] = [];
  #detectedBlock = 0n;
  #check: CheckMulticallFn;
  public enabled: boolean;

  constructor(check: CheckMulticallFn, logger?: ILogger, enabled?: boolean) {
    this.#check = check;
    this.#logger = logger;
    this.enabled = !!enabled;
  }

  public onFetchRequest: Required<HttpTransportConfig>["onFetchRequest"] =
    async request => {
      if (!this.enabled) {
        return;
      }
      const data = (await request.json()) as EIP1193Parameters<PublicRpcSchema>;
      const blockNumber = this.#shouldStore(data);
      if (blockNumber) {
        this.storeRequest(blockNumber, data as unknown as EthCallRequest);
        this.#logger?.debug(
          `spy stored eth_call at block ${blockNumber}, total calls: ${this.#detectedCalls.length}`,
        );
      }
    };

  public onFetchResponse: Required<HttpTransportConfig>["onFetchResponse"] =
    async response => {
      if (!this.enabled) {
        return;
      }
      const copy = response.clone();
      const resp = await copy.json();
      const id = (resp as any).id as number;
      const call = this.#detectedCalls.find(
        ({ request }) => "id" in request && request.id === id,
      );
      if (call) {
        call.response = resp as unknown as RpcResponse<Hex>;
        call.responseHeaders = Object.fromEntries(response.headers.entries());
        await this.storeResponse(
          call as RequiredBy<TCall, "response" | "responseHeaders">,
        );
      }
    };

  public get detectedCalls(): TCall[] {
    return this.#detectedCalls;
  }

  public get detectedBlock(): bigint {
    return this.#detectedBlock;
  }

  protected storeRequest(blockNumber: bigint, data: EthCallRequest): void {
    if (blockNumber !== this.#detectedBlock) {
      this.#detectedBlock = blockNumber;
      this.#detectedCalls = [];
    }
    this.#detectedCalls.push({ request: data } as TCall);
  }

  protected storeResponse(
    call: RequiredBy<TCall, "response" | "responseHeaders">,
  ): void | Promise<void> {
    return;
  }

  #shouldStore(data: EIP1193Parameters<PublicRpcSchema>): bigint | undefined {
    if (
      data.method === "eth_call" &&
      typeof data.params[1] === "string" && // block number is present
      data.params[1]?.startsWith("0x") && // and it's a block number
      this.#check(data)
    ) {
      return BigInt(data.params[1]); // return block number
    }
    return undefined;
  }
}
