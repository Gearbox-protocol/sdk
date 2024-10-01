import type { Chain, PublicClient } from "viem";
import { createPublicClient, defineChain, http } from "viem";

import { AddressLabeller } from "../base/AddressLabeller";
import type { IAddressLabeller } from "../base/IAddressLabeller";
import type { NetworkType } from "./chains";
import { chains } from "./chains";

export interface ProviderOptions {
  rpcURL: string;
  timeout?: number;
  chainId: number;
  networkType: NetworkType;
}

export class Provider {
  public readonly chainId: number;
  public readonly chain: Chain;
  public readonly networkType: NetworkType;
  public readonly publicClient: PublicClient;
  public readonly addressLabels: IAddressLabeller;

  constructor(opts: ProviderOptions) {
    const { chainId, networkType, rpcURL, timeout = 120_000 } = opts;
    this.chainId = chainId;
    this.networkType = networkType;

    // need to explicitly set chain id on testnets (e.g. 7878 = mainnet)
    this.chain = defineChain({
      ...chains[networkType],
      id: chainId,
    });

    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(rpcURL, { timeout }), // for SDK they could be multiple RPCs
    });

    this.addressLabels = new AddressLabeller();
  }
}
