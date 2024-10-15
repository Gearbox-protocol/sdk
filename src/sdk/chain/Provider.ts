import type { Chain, PublicClient, Transport } from "viem";
import { createPublicClient, defineChain, fallback, http } from "viem";

import { AddressLabeller } from "../base/AddressLabeller";
import type { IAddressLabeller } from "../base/IAddressLabeller";
import type { NetworkType } from "./chains";
import { chains } from "./chains";

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
       * Alternatively, can pass entire viem transport
       */
      transport: Transport;
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

export function createTransport(
  opts: TransportOptions & ConnectionOptions,
): Transport {
  const { timeout = 120_000, retryCount } = opts;
  if ("transport" in opts) {
    return opts.transport;
  }
  const rpcs = opts.rpcURLs.map(url => http(url, { timeout, retryCount }));
  return rpcs.length ? fallback(rpcs) : rpcs[0];
}

export class Provider {
  public readonly chainId: number;
  public readonly chain: Chain;
  public readonly networkType: NetworkType;
  public readonly publicClient: PublicClient;
  public readonly addressLabels: IAddressLabeller;
  public readonly transport: Transport;

  constructor(opts: NetworkOptions & TransportOptions & ConnectionOptions) {
    const { chainId, networkType } = opts;
    this.chainId = chainId;
    this.networkType = networkType;

    // need to explicitly set chain id on testnets (e.g. 7878 = mainnet)
    this.chain = defineChain({
      ...chains[networkType],
      id: chainId,
    });
    this.transport = createTransport(opts);
    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: this.transport,
    });

    this.addressLabels = new AddressLabeller();
  }
}
