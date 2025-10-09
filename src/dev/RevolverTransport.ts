import {
  BaseError,
  type ClientConfig,
  type EIP1193RequestFn,
  HttpRequestError,
  type HttpTransport,
  http,
  InternalRpcError,
  InvalidInputRpcError,
  InvalidParamsRpcError,
  InvalidRequestRpcError,
  LimitExceededRpcError,
  ResourceUnavailableRpcError,
  RpcError,
  type Transport,
  type TransportConfig,
  withRetry,
} from "viem";
import type { HttpRpcClientOptions } from "viem/utils";
import { ResourceNotFoundRpcError } from "../../node_modules/viem/errors/rpc";
import type { ILogger, NetworkType } from "../sdk/index.js";
import {
  getProviderUrl,
  type ProviderConfig,
  type RpcProvider,
} from "./providers.js";

interface TransportEntry {
  provider: RpcProvider;
  transport: HttpTransport;
  /**
   * Cannot make requests to this transport until this timestamp
   */
  cooldown: number;
}

export interface ProviderStatus {
  id: string;
  status: "active" | "cooldown" | "standby";
}

type OnRequestFn = (
  providerName: string,
  ...args: Parameters<Required<HttpRpcClientOptions>["onRequest"]>
) => ReturnType<Required<HttpRpcClientOptions>["onRequest"]>;

type OnResponseFn = (
  providerName: string,
  ...args: Parameters<Required<HttpRpcClientOptions>["onResponse"]>
) => ReturnType<Required<HttpRpcClientOptions>["onResponse"]>;

export interface RevolverTransportConfig {
  network: NetworkType;
  providers: ProviderConfig[];
  logger?: ILogger;
  key?: TransportConfig["key"] | undefined;
  name?: TransportConfig["name"] | undefined;
  pollingInterval?: ClientConfig["pollingInterval"] | undefined;
  retryCount?: TransportConfig["retryCount"] | undefined;
  retryDelay?: TransportConfig["retryDelay"] | undefined;
  timeout?: TransportConfig["timeout"] | undefined;
  /**
   * When single http transport should retry?
   * Defaults to some less strict criteria, so it'll retry "blockNumber from the future" errors
   *
   * By viem's default, simple http transport retries LimitExceededRpcError.code, InternalRpcError.code and HTTP errors
   * so for things like ResourceNotFoundRpcError (eth_call with block number from other rps, which is yet in the future for current rpc)
   * it'll fail and not retry
   * https://github.com/wevm/viem/blob/3bc5e6f3c4a317441063342dd9ec2aaa7eb56b01/src/utils/buildRequest.ts#L269
   */
  shouldRetry?:
    | ((iter: { count: number; error: Error }) => Promise<boolean> | boolean)
    | undefined;
  /**
   * Allow batching of json-rpc requests
   */
  batch?: boolean | undefined;
  /**
   * Spying function that also returns provider name in additional to the request
   */
  onRequest?: OnRequestFn;
  /**
   * Spying function that also returns provider name in additional to the response
   */
  onResponse?: OnResponseFn;
  /**
   * Callback that is called when the transport is rotated
   */
  onRotateSuccess?: (
    oldTransportName: string,
    newTransportName: string,
    reason?: BaseError,
  ) => void | Promise<void>;
  /**
   * Callback that is called when the transport cannot be rotated
   */
  onRotateFailed?: (
    oldTransportName: string,
    reason?: BaseError,
  ) => void | Promise<void>;
  /**
   * How long, in milliseconds, to wait before try this transport again
   */
  cooldown?: number | undefined;
}

export class NoAvailableTransportsError extends BaseError {
  constructor(cause?: Error) {
    super("no available transports", { cause });
  }
}

export interface RevolverTransportValue {
  /**
   * Manually rotate the transport
   * @param reason
   * @returns true if rotation was successful
   */
  rotate: (reason?: BaseError) => Promise<boolean>;
  /**
   * Returns the name of the current transport
   */
  currentTransportName: () => string;
  /**
   * Returns statuses of all providers
   */
  statuses: () => ProviderStatus[];
}

export class RevolverTransport
  implements ReturnType<Transport<"revolver", RevolverTransportValue>>
{
  #transports: TransportEntry[];
  #index = 0;
  #config: RevolverTransportConfig;
  #rotating = false;
  #requests = new WeakMap();

  private overrides?: Parameters<
    Transport<"revolver", RevolverTransportValue>
  >[0];

  /**
   * Create a new RevolverTransport
   * RevolverTransport usues several RPC providers and rotates between them when requests fail
   * Failed transport goes into temporary cooldown, after which it can be tried again
   * When all transports are on cooldown, the transport will throw a NoAvailableTransportsError
   * @param config
   * @returns
   */
  public static create(
    config: RevolverTransportConfig,
  ): Transport<"revolver", RevolverTransportValue> {
    const transport = new RevolverTransport({
      ...config,
    });

    return (
      ...args: Parameters<Transport<"revolver", RevolverTransportValue>>
    ) => {
      transport.overrides = args[0];
      return transport;
    };
  }

  constructor(config: RevolverTransportConfig) {
    this.#config = {
      ...config,
      shouldRetry: config.shouldRetry ?? defaultShouldRetry,
    };

    const rpcUrls = new Map<string, RpcProvider>();
    const cooldowns = new Map<string, number>();
    for (const { provider, keys, cooldown } of config.providers) {
      for (const key of keys) {
        const url = getProviderUrl(provider, config.network, key, "http");
        if (url) {
          rpcUrls.set(url, provider);
          if (cooldown) {
            cooldowns.set(url, cooldown);
          }
        }
      }
    }

    this.#transports = Array.from(rpcUrls.entries()).map(
      ([url, provider], i): TransportEntry => ({
        provider,
        transport: http(url, {
          retryCount: config.retryCount,
          retryDelay: config.retryDelay,
          timeout: config.timeout,
          batch: !!config.batch,
          key: `${provider}-${i}`,
          name: `${provider}-${i}`,
          onFetchRequest: this.#config.onRequest
            ? (...args) => this.#config.onRequest?.(`${provider}-${i}`, ...args)
            : undefined,
          onFetchResponse: this.#config.onResponse
            ? (...args) =>
                this.#config.onResponse?.(`${provider}-${i}`, ...args)
            : undefined,
        }),
        cooldown: cooldowns.get(url) ?? 0,
      }),
    );

    if (this.#transports.length === 0) {
      throw new NoAvailableTransportsError();
    }
  }

  public get value(): RevolverTransportValue {
    return {
      rotate: (reason?: BaseError) => this.rotate(reason),
      currentTransportName: () => this.currentTransportName(),
      statuses: () => this.statuses(),
    };
  }

  public request: EIP1193RequestFn = async r => {
    if (this.#transports.length === 1) {
      return this.#transport({ ...this.overrides }).request(r);
    }
    let error: Error | undefined;
    do {
      try {
        this.#requests.set(r, this.currentTransportName());

        // for explanation, see shouldRetry comment
        const resp = await withRetry(
          () => this.#transport({ ...this.overrides }).request(r),
          {
            delay: this.#config.retryDelay,
            retryCount: this.#config.retryCount,
            shouldRetry: this.#config.shouldRetry,
          },
        );
        this.#requests.delete(r);
        return resp as any;
      } catch (e) {
        error = error ?? (e as Error);
        if (e instanceof RpcError || e instanceof HttpRequestError) {
          const reqTransport = this.#requests.get(r);
          if (reqTransport === this.currentTransportName()) {
            await this.rotate(e);
          } else {
            this.#logger?.debug(
              `request made with old transport ${reqTransport}, trying again`,
            );
          }
        } else {
          this.#requests.delete(r);
          throw e;
        }
      }
    } while (this.#hasAvailableTransports);

    this.#requests.delete(r);
    throw new NoAvailableTransportsError(error);
  };

  public get config(): TransportConfig<"revolver"> {
    return {
      key: "revolver",
      name: "revolver",
      type: "revolver",
      request: this.request,
      retryCount: this.#config.retryCount,
      methods: undefined,
      retryDelay: this.#config.retryDelay,
      timeout: this.#config.timeout,
    };
  }

  /**
   * Manually rotate the transport
   * @param reason
   * @returns true if rotation was successful
   */
  public async rotate(reason?: BaseError): Promise<boolean> {
    // nothing to rotate, always consider it successful
    if (this.#transports.length === 1) {
      return true;
    }

    if (this.#rotating) {
      this.#logger?.debug("already rotating, skipping");
      return false;
    }
    this.#rotating = true;

    this.#logger?.debug(
      {
        reason,
        current: this.currentTransportName,
        total: this.#transports.length,
      },
      "rotating transport",
    );
    const oldTransportName = this.currentTransportName();

    const now = Date.now();
    this.#transports[this.#index].cooldown =
      now + (this.#config.cooldown ?? 60_000);

    for (let i = 0; i < this.#transports.length - 1; i++) {
      this.#index = (this.#index + 1) % this.#transports.length;
      if (this.#transports[this.#index].cooldown < now) {
        this.#logger?.info(
          {
            current: this.currentTransportName,
            total: this.#transports.length,
          },
          "switched to next transport",
        );
        try {
          await this.#config.onRotateSuccess?.(
            oldTransportName,
            this.currentTransportName(),
            reason,
          );
        } catch {}
        this.#rotating = false;
        return true;
      } else {
        this.#logger?.warn(
          {
            current: this.currentTransportName,
            total: this.#transports.length,
          },
          "transport is still on cooldown",
        );
      }
    }
    try {
      await this.#config.onRotateFailed?.(oldTransportName, reason);
    } catch {}
    this.#rotating = false;
    return false;
  }

  public currentTransportName(): string {
    return this.#transport({}).config.name;
  }

  public statuses(): ProviderStatus[] {
    const now = Date.now();
    return this.#transports.map((t, i) => ({
      id: t.transport({}).config.name,
      status:
        t.cooldown < now
          ? this.#index === i
            ? "active"
            : "standby"
          : "cooldown",
    }));
  }

  get #logger(): ILogger | undefined {
    return this.#config.logger;
  }

  get #transport(): HttpTransport {
    return this.#transports[this.#index].transport;
  }

  get #hasAvailableTransports(): boolean {
    const now = Date.now();
    return this.#transports.some(t => t.cooldown < now);
  }
}

const retryCodes = new Set<number>([
  InvalidRequestRpcError.code,
  InvalidParamsRpcError.code,
  InvalidInputRpcError.code,
  ResourceNotFoundRpcError.code,
  ResourceUnavailableRpcError.code,
]);

const defaultShouldRetry: RevolverTransportConfig["shouldRetry"] = ({
  error,
}) => {
  if ("code" in error && typeof error.code === "number") {
    return retryCodes.has(error.code);
  }
  return false;
};
