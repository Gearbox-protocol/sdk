import {
  BaseError,
  type ClientConfig,
  type EIP1193RequestFn,
  HttpRequestError,
  type HttpTransport,
  http,
  RpcError,
  type Transport,
  type TransportConfig,
} from "viem";
import type { HttpRpcClientOptions } from "viem/utils";
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
  onRotateFailed?: (reason?: BaseError) => void | Promise<void>;
  /**
   * How long, in milliseconds, to wait before try this transport again
   */
  cooldown?: number | undefined;
}

export class NoAvailableTransportsError extends BaseError {
  constructor() {
    super("no available transports");
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
   * The name of the current transport
   */
  currentTransportName: string;
}

export class RevolverTransport
  implements ReturnType<Transport<"revolver", RevolverTransportValue>>
{
  #transports: TransportEntry[];
  #index = 0;
  #config: RevolverTransportConfig;

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
    this.#config = { ...config };

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
          batch: false,
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
      currentTransportName: this.currentTransportName,
    };
  }

  public request: EIP1193RequestFn = async r => {
    if (this.#transports.length === 1) {
      return this.#transport({ ...this.overrides }).request(r);
    }
    // send with current transport
    do {
      try {
        const resp = await this.#transport({ ...this.overrides }).request(r);
        return resp as any;
      } catch (e) {
        if (e instanceof RpcError || e instanceof HttpRequestError) {
          await this.rotate(e);
        } else {
          throw e;
        }
      }
    } while (this.#hasAvailableTransports);

    throw new NoAvailableTransportsError();
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

    this.#logger?.debug(
      {
        reason,
        current: this.currentTransportName,
        index: this.#index,
        total: this.#transports.length,
      },
      "rotating transport",
    );
    const oldTransportName = this.currentTransportName;

    const now = Date.now();
    this.#transports[this.#index].cooldown =
      now + (this.#config.cooldown ?? 60_000);

    for (let i = 0; i < this.#transports.length - 1; i++) {
      this.#index = (this.#index + 1) % this.#transports.length;
      if (this.#transports[this.#index].cooldown < now) {
        this.#logger?.info(
          {
            current: this.currentTransportName,
            index: this.#index,
            total: this.#transports.length,
          },
          "switched to next transport",
        );
        await this.#config.onRotateSuccess?.(
          oldTransportName,
          this.currentTransportName,
          reason,
        );
        return true;
      } else {
        this.#logger?.warn(
          {
            current: this.currentTransportName,
            index: this.#index,
            total: this.#transports.length,
          },
          "transport is still on cooldown",
        );
      }
    }
    await this.#config.onRotateFailed?.(reason);
    return false;
  }

  public get currentTransportName(): string {
    return this.#transport({}).config.name;
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
