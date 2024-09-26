import type { NetworkType } from "@gearbox-protocol/sdk-gov";
import type { Chain, PublicClient } from "viem";
import { createPublicClient, defineChain, http } from "viem";

import { AddressLabeller } from "../base/AddressLabeller";
import type { IAddressLabeller } from "../base/IAddressLabeller";
import { Logged } from "../utils";
import { chains } from "./chains";

export class Provider extends Logged {
  chainId: number;
  chain: Chain;
  networkType: NetworkType;

  publicClient: PublicClient;

  /**
   * Note: use interface here to hide implementation that uses sdk-gov
   */
  readonly addressLabels: IAddressLabeller;

  constructor(args: {
    rpc: string;
    chainId: number;
    networkType: NetworkType;
  }) {
    super();
    this.enableLogs();

    this.chainId = args.chainId;
    this.networkType = args.networkType;

    // need to explicitly set chain id on testnets (e.g. 7878 = mainnet)
    this.chain = defineChain({
      ...chains[this.networkType],
      id: this.chainId,
    });

    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(args.rpc, { timeout: 100_000 }), // for SDK they could be multiple RPCs
    });

    this.addressLabels = new AddressLabeller();
  }
}
