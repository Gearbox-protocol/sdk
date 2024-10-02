import type { Address, Chain, PublicClient } from "viem";
import { createPublicClient, defineChain, fallback, http } from "viem";

import { AddressLabeller } from "../base/AddressLabeller";
import type { IAddressLabeller } from "../base/IAddressLabeller";
import type { NetworkType } from "./chains";
import { chains } from "./chains";

export interface ProviderOptions {
  /**
   * Account address for contract write simulations
   */
  account?: Address;
  /**
   * RPC URL (and fallbacks) to use.
   */
  rpcURLs: string[];
  /**
   * RPC client timeout in milliseconds
   */
  timeout?: number;
  /**
   * Retry count for RPC
   */
  retryCount?: number;
  /**
   * Chain Id needs to be set, because we sometimemes use forked testnets with different chain ids
   */
  chainId: number;
  /**
   * NetworkType needs to be set, because we sometimemes use forked testnets with different chain ids
   */
  networkType: NetworkType;
}

export class Provider {
  public readonly account?: Address;
  public readonly chainId: number;
  public readonly chain: Chain;
  public readonly networkType: NetworkType;
  public readonly publicClient: PublicClient;
  public readonly addressLabels: IAddressLabeller;

  constructor(opts: ProviderOptions) {
    const {
      account,
      chainId,
      networkType,
      rpcURLs,
      timeout = 120_000,
      retryCount,
    } = opts;
    this.account = account;
    this.chainId = chainId;
    this.networkType = networkType;

    // need to explicitly set chain id on testnets (e.g. 7878 = mainnet)
    this.chain = defineChain({
      ...chains[networkType],
      id: chainId,
    });

    const rpcs = rpcURLs.map(url => http(url, { timeout, retryCount }));
    const transport = rpcs.length ? fallback(rpcs) : rpcs[0];

    this.publicClient = createPublicClient({
      chain: this.chain,
      transport,
    });

    this.addressLabels = new AddressLabeller();
  }
}
