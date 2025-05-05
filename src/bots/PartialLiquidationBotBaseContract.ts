import type { Address } from "abitype";
import type { Abi, Hex } from "viem";
import { decodeAbiParameters } from "viem";

import type { GearboxSDK } from "../sdk/index.js";
import { BaseContract, formatPercentage } from "../sdk/index.js";
import type { BotParameters, BotState, BotStateBaseHuman } from "./types.js";

export interface PartialLiquidationBotBaseArgs<
  abi extends Abi | readonly unknown[],
> {
  abi: abi;
  addr: Address;
  name?: string;
  version?: number | bigint;
  contractType?: string;
  serializedParams: Hex;
  requiredPermissions: bigint;
  marketConfigurator: Address;
}

// Augmenting contract class with interface of compressor data object
export interface PartialLiquidationBotBaseContract<
  abi extends Abi | readonly unknown[],
> extends BotParameters,
    BaseContract<abi> {}

export abstract class PartialLiquidationBotBaseContract<
  abi extends Abi | readonly unknown[],
> extends BaseContract<abi> {
  public readonly requiredPermissions: bigint;
  public readonly marketConfigurator: Address;
  #serializedParams: Hex;

  constructor(sdk: GearboxSDK, args: PartialLiquidationBotBaseArgs<abi>) {
    super(sdk, args);
    this.#serializedParams = args.serializedParams;
    // same for v300 and v310 bots
    const [
      treasury,
      minHealthFactor,
      maxHealthFactor,
      premiumScaleFactor,
      feeScaleFactor,
    ] = decodeAbiParameters(
      [
        { name: "treasury", type: "address" },
        { name: "minHealthFactor", type: "uint16" },
        { name: "maxHealthFactor", type: "uint16" },
        { name: "premiumScaleFactor", type: "uint16" },
        { name: "feeScaleFactor", type: "uint16" },
      ],
      args.serializedParams,
    );
    this.treasury = treasury;
    this.minHealthFactor = minHealthFactor;
    this.maxHealthFactor = maxHealthFactor;
    this.premiumScaleFactor = premiumScaleFactor;
    this.feeScaleFactor = feeScaleFactor;

    this.marketConfigurator = args.marketConfigurator;
    this.requiredPermissions = args.requiredPermissions;
  }

  public stateHuman(raw?: boolean): BotStateBaseHuman {
    return {
      ...super.stateHuman(raw),
      treasury: this.treasury,
      minHealthFactor: formatPercentage(this.minHealthFactor),
      maxHealthFactor: formatPercentage(this.maxHealthFactor),
      premiumScaleFactor: formatPercentage(this.premiumScaleFactor),
      feeScaleFactor: formatPercentage(this.feeScaleFactor),
      requiredPermissions: this.requiredPermissions.toString(10),
    };
  }

  public get state(): BotState {
    return {
      baseParams: {
        addr: this.address,
        version: BigInt(this.version),
        contractType: this.contractType as `0x${string}`,
        serializedParams: this.#serializedParams,
      },
      requiredPermissions: this.requiredPermissions,
    };
  }
}
