import { type Address, decodeAbiParameters, type Hex, stringToHex } from "viem";
import { BaseContract, type OnchainSDK, percentFmt } from "../../sdk/index.js";
import { iPartialLiquidationBotV310Abi } from "./abi/index.js";
import { BOT_PARAMS_ABI, type BotStateV310Human } from "./types.js";

const abi = iPartialLiquidationBotV310Abi;
type abi = typeof abi;

export interface PartialLiquidationBotV310Params {
  addr: Address;
  version: bigint;
  contractType: string;
  serializedParams: Hex;
}

export class PartialLiquidationBotV310Contract extends BaseContract<abi> {
  public readonly treasury: Address;
  public readonly minHealthFactor: number;
  public readonly maxHealthFactor: number;
  public readonly premiumScaleFactor: number;
  public readonly feeScaleFactor: number;
  readonly #serializedParams: Hex;

  constructor(sdk: OnchainSDK, args: PartialLiquidationBotV310Params) {
    super(sdk, {
      ...args,
      abi,
      name: "PartialLiquidationBotV310",
    });
    [
      this.treasury,
      this.minHealthFactor,
      this.maxHealthFactor,
      this.premiumScaleFactor,
      this.feeScaleFactor,
    ] = decodeAbiParameters(BOT_PARAMS_ABI, args.serializedParams);
    this.#serializedParams = args.serializedParams;
  }

  public stateHuman(raw?: boolean): BotStateV310Human {
    return {
      ...super.stateHuman(raw),
      treasury: this.treasury,
      minHealthFactor: percentFmt(this.minHealthFactor, raw),
      maxHealthFactor: percentFmt(this.maxHealthFactor, raw),
      premiumScaleFactor: percentFmt(this.premiumScaleFactor, raw),
      feeScaleFactor: percentFmt(this.feeScaleFactor, raw),
    };
  }

  public get state(): PartialLiquidationBotV310Params {
    return {
      addr: this.address,
      version: BigInt(this.version),
      contractType: stringToHex(this.contractType, { size: 32 }),
      serializedParams: this.#serializedParams,
    };
  }
}
