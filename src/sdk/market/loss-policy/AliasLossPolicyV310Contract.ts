import {
  type Address,
  decodeAbiParameters,
  encodeAbiParameters,
  type Hex,
} from "viem";
import { iAliasedLossPolicyV310Abi } from "../../../abi/310/generated.js";
import { BaseContract, type BaseParams } from "../../base/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import type { AliasLossPolicyStateHuman } from "../../types/state-human.js";
import { formatDuration } from "../../utils/index.js";
import { LOSS_POLICY_ACCESS_MODES, LOSS_POLICY_ALIASED } from "./constants.js";
import type { ILossPolicyContract } from "./types.js";

const abi = iAliasedLossPolicyV310Abi;
type abi = typeof abi;

export interface AliasedPriceFeedParams {
  priceFeed: Address;
  stalenessPeriod: number;
  skipCheck: boolean;
  tokenDecimals: number;
}

export class AliasLossPolicyV310Contract
  extends BaseContract<abi>
  implements ILossPolicyContract
{
  public readonly accessMode: number;
  public readonly checksEnabled: boolean;
  public readonly tokens: readonly Address[];
  public readonly priceFeedParams: readonly AliasedPriceFeedParams[];

  constructor(sdk: GearboxSDK, params: BaseParams) {
    super(sdk, {
      abi,
      addr: params.addr,
      contractType: params.contractType,
      version: params.version,
    });
    [this.accessMode, this.checksEnabled, this.tokens, this.priceFeedParams] =
      decodeAbiParameters(
        [
          { name: "accessMode", type: "uint8" },
          { name: "checksEnabled", type: "bool" },
          { name: "tokens", type: "address[]" },
          {
            name: "priceFeedParams",
            type: "tuple[]",
            components: [
              { name: "priceFeed", type: "address" },
              { name: "stalenessPeriod", type: "uint32" },
              { name: "skipCheck", type: "bool" },
              { name: "tokenDecimals", type: "uint8" },
            ],
          },
        ],
        params.serializedParams,
      );
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
    this.logger?.debug({ feeds: pfs }, "required alias price feeds");
    if (pfs.length === 0) {
      return "0x";
    }
    const updates = await this.sdk.priceFeeds.generateExternalPriceFeedsUpdates(
      [...pfs],
      blockNumber ? { blockNumber } : undefined,
    );
    this.logger?.debug(
      { updates: updates.map(u => this.sdk.labelAddress(u.priceFeed)) },
      "encoding alias price feeds updates",
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

  public override stateHuman(raw?: boolean): AliasLossPolicyStateHuman {
    return {
      ...super.stateHuman(raw),
      contractType: LOSS_POLICY_ALIASED,
      checksEnabled: this.checksEnabled,
      accessMode:
        LOSS_POLICY_ACCESS_MODES[this.accessMode] ?? this.accessMode.toString(),
      tokens: this.tokens.map(t => this.labelAddress(t)),
      priceFeedParams: this.priceFeedParams.map(p => ({
        priceFeed: this.labelAddress(p.priceFeed),
        stalenessPeriod: formatDuration(p.stalenessPeriod, raw),
        skipCheck: p.skipCheck,
        tokenDecimals: p.tokenDecimals,
      })),
    };
  }
}
