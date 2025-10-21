import type { Chain, PublicClient, Transport } from "viem";
import { createPublicClient, defineChain, fallback, http } from "viem";

import { AddressLabeller } from "../base/AddressLabeller.js";
import type { IAddressLabeller } from "../base/IAddressLabeller.js";
import type { GearboxChain, NetworkType } from "./chains.js";
import { chains } from "./chains.js";

export interface NetworkOptions {
  /**
   * Chain Id needs to be set, because we sometimemes use forked testnets with different chain ids
   */
  chainId: number;
  /**
   * NetworkType needs to be set, because we sometimemes use forked testnets with different chain ids
   */
  networkType: NetworkType;
}

export type TransportOptions =
  | {
      /**
       * RPC URL (and fallbacks) to use.
       */
      rpcURLs: string[];
    }
  | {
      /**
       * Alternatively, can pass viem transport
       */
      transport: Transport;
    }
  | {
      /**
       * Alternatively, can pass entire viem client
       */
      client: PublicClient;
    };

export interface ConnectionOptions {
  /**
   * RPC client timeout in milliseconds
   */
  timeout?: number;
  /**
   * Retry count for RPC
   */
  retryCount?: number;
}

export function createTransportClient(
  opts: TransportOptions & ConnectionOptions,
  chain?: Chain,
): [Transport, PublicClient] {
  const { timeout = 120_000, retryCount } = opts;
  let transport: Transport;
  if ("client" in opts) {
    transport = () => ({
      config: opts.client.transport.config,
      request: opts.client.transport.request,
      value: opts.client.transport.value,
    });
    return [transport, opts.client];
  }
  if ("transport" in opts) {
    transport = opts.transport;
  } else {
    const rpcs = opts.rpcURLs.map(url => http(url, { timeout, retryCount }));
    transport = rpcs.length > 1 ? fallback(rpcs) : rpcs[0];
  }
  return [transport, createPublicClient({ transport, chain })];
}

export class Provider {
  public readonly chainId: number;
  public readonly chain: GearboxChain;
  public readonly networkType: NetworkType;
  public readonly addressLabels: IAddressLabeller;

  #transport: Transport;
  #publicClient: PublicClient;

  constructor(opts: NetworkOptions & TransportOptions & ConnectionOptions) {
    const { chainId, networkType } = opts;
    this.chainId = chainId;
    this.networkType = networkType;

    // need to explicitly set chain id on testnets (e.g. 7878 = mainnet)
    this.chain = defineChain({
      ...chains[networkType],
      id: chainId,
    }) as GearboxChain;
    [this.#transport, this.#publicClient] = createTransportClient(
      opts,
      this.chain,
    );

    this.addressLabels = new AddressLabeller();
  }

  public get transport(): Transport {
    return this.#transport;
  }

  public set transport(transport: Transport) {
    this.#transport = transport;
    this.#publicClient = createPublicClient({
      chain: this.chain,
      transport: this.#transport,
    });
  }

  public get publicClient(): PublicClient {
    return this.#publicClient;
  }
}
