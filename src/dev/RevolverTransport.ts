import {
  type Chain,
  type ClientConfig,
  type EIP1193RequestFn,
  type HttpTransport,
  http,
  type Transport,
  type TransportConfig,
} from "viem";
import type { ILogger, NetworkType } from "../sdk/index.js";
import {
  getProviderUrl,
  type ProviderConfig,
  type RpcProvider,
} from "./createTransport.js";

interface TransportEntry {
  provider: RpcProvider;
  transport: HttpTransport;
  /**
   * Cannot make requests to this transport until this timestamp
   */
  cooldown: number;
}

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
}

class RevolverTransport implements ReturnType<Transport<"revolver">> {
  #transports: TransportEntry[];
  #index = 0;
  #config: RevolverTransportConfig;

  constructor(config: RevolverTransportConfig) {
    this.#config = config;

    const rpcUrls = new Map<string, RpcProvider>();
    for (const { provider, keys } of config.providers) {
      for (const key of keys) {
        const url = getProviderUrl(provider, config.network, key, "http");
        if (url) {
          rpcUrls.set(url, provider);
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
        }),
        cooldown: 0,
      }),
    );

    if (this.#transports.length === 0) {
      throw new Error("no fitting rpc urls found");
    }
  }

  value?: Record<string, any> | undefined;

  public request: EIP1193RequestFn = async ({ method, params }) => {
    // send with current transport
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

  get #transport(): HttpTransport {
    return this.#transports[this.#index].transport;
  }

  #rotate() {
    this.#transports[this.#index].cooldown = Date.now() + 60_000;
    this.#index = (this.#index + 1) % this.#transports.length;
  }

  public async selectProvider(): Promise<RpcProvider> {
    this.#transport;
  }

  async #testProvider(index: number): Promise<number> {
    try {
      const from = Date.now();
      // we want to use client and handle
      await this.#transports[index]
        .transport({})
        .request({ method: "eth_chainId", params: [] });
      const to = Date.now();
      return to - from;
    } catch {
      return Number.POSITIVE_INFINITY;
    }
  }
}

export async function createRevolverTransport(config: RevolverTransportConfig) {
  const transport = new RevolverTransport({
    ...config,
  });

  return (..._args: Parameters<Transport<"revolver">>) => {
    return transport;
  };
}
