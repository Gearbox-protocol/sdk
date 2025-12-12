import { iKodiakIslandGatewayAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { ConstructOptions } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";
import type { KodiakIslandStatus } from "./types.js";

const abi = iKodiakIslandGatewayAdapterAbi;
type abi = typeof abi;

export class KodiakIslandGatewayAdapterContract extends AbstractAdapterContract<abi> {
  public readonly allowedIslands: {
    island: Address;
    status: KodiakIslandStatus;
  }[];

  constructor(
    options: ConstructOptions,
    args: Omit<AbstractAdapterContractOptions<abi>, "abi">,
  ) {
    super(options, { ...args, abi });

    // Decode parameters directly using ABI decoding
    const decoded = decodeAbiParameters(
      [
        { type: "address", name: "creditManager" },
        { type: "address", name: "targetContract" },
        {
          type: "tuple[]",
          name: "allowedIslands",
          components: [
            { type: "address", name: "island" },
            { type: "uint8", name: "status" },
          ],
        },
      ],
      args.baseParams.serializedParams,
    );

    this.allowedIslands = decoded[2].map(({ island, status }) => ({
      island,
      status: status as KodiakIslandStatus,
    }));
  }
}
