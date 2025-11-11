import { type Address, encodeAbiParameters, type Hex } from "viem";
import { iAliasedLossPolicyV310Abi } from "../../../abi/310/generated.js";
import { BaseContract, type BaseParams } from "../../base/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import type { ILossPolicyContract } from "./types.js";

const abi = iAliasedLossPolicyV310Abi;
type abi = typeof abi;

export class AliasLossPolicyV310Contract
  extends BaseContract<abi>
  implements ILossPolicyContract
{
  constructor(sdk: GearboxSDK, params: BaseParams) {
    super(sdk, {
      abi,
      addr: params.addr,
      contractType: params.contractType,
      version: params.version,
    });
  }

  async getLiquidationData(
    creditAccount: Address,
    blockNumber?: bigint,
  ): Promise<Hex | undefined> {
    const pfs = await this.sdk.client.readContract({
      address: this.address,
      abi: this.abi,
      functionName: "getRequiredAliasPriceFeeds",
      args: [creditAccount],
      blockNumber,
    });
    this.logger?.debug({ feeds: pfs }, "got required alias price feeds");
    const updates = await this.sdk.priceFeeds.generateExternalPriceFeedsUpdates(
      [...pfs],
      blockNumber ? { blockNumber } : undefined,
    );
    return encodeAbiParameters(
      [
        {
          type: "tuple[]",
          components: [
            { type: "address", name: "priceFeed" },
            { type: "bytes", name: "data" },
          ],
        },
      ],
      [updates],
    );
  }
}
