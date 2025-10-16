import type { Address, DecodeFunctionDataReturnType, PublicClient } from "viem";
import { ITreasurySplitterAbi } from "../../abi/310/iTreasurySplitter.js";
import type { RawTx } from "../../sdk/types/index.js";
import type { ParsedCall } from "../core/index.js";
import { BaseContract } from "./base-contract.js";

const abi = ITreasurySplitterAbi;

export class TreasurySplitterContract extends BaseContract<typeof abi> {
  constructor(address: Address, client: PublicClient) {
    super(abi, address, client, "TreasurySplitter");
  }

  distribute(token: Address): RawTx {
    return this.createRawTx({
      functionName: "distribute",
      args: [token],
    });
  }

  public parseFunctionParams(
    params: DecodeFunctionDataReturnType<typeof abi>,
  ): ParsedCall | undefined {
    const { functionName, args } = params;

    switch (functionName) {
      case "distribute": {
        const [token] = args as [Address];
        return {
          chainId: 0,
          target: this.address,
          label: this.name,
          functionName,
          args: {
            token,
          },
        };
      }

      default:
        return undefined;
    }
  }
}
