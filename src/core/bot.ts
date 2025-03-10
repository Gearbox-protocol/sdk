import { toBigInt } from "@gearbox-protocol/sdk-gov";
import type { Address } from "viem";

import type {
  BotBaseType,
  BotDataPayload,
  BotDetailedType,
} from "../payload/bot";

export class BotData {
  readonly address: Address;
  readonly baseType: BotBaseType;
  readonly detailedType: BotDetailedType;

  readonly minHealthFactor: bigint;
  readonly maxHealthFactor: bigint;
  readonly premiumScaleFactor: bigint;
  readonly feeScaleFactor: bigint;

  constructor(payload: BotDataPayload) {
    this.address = payload.address.toLowerCase() as Address;
    this.baseType = payload.baseType;
    this.detailedType = payload.detailedType;

    this.minHealthFactor = toBigInt(payload.minHealthFactor);
    this.maxHealthFactor = toBigInt(payload.maxHealthFactor);
    this.premiumScaleFactor = toBigInt(payload.premiumScaleFactor);
    this.feeScaleFactor = toBigInt(payload.feeScaleFactor);
  }
}
