import { toBigInt } from "@gearbox-protocol/sdk-gov";

import { BotDataPayload, BotType } from "../payload/bot";

export class BotData {
  readonly address: string;
  readonly type: BotType;

  readonly minHealthFactor: bigint;
  readonly maxHealthFactor: bigint;
  readonly premiumScaleFactor: bigint;
  readonly feeScaleFactor: bigint;

  constructor(payload: BotDataPayload) {
    this.address = payload.address.toLowerCase();
    this.type = payload.type;

    this.minHealthFactor = toBigInt(payload.minHealthFactor);
    this.maxHealthFactor = toBigInt(payload.maxHealthFactor);
    this.premiumScaleFactor = toBigInt(payload.premiumScaleFactor);
    this.feeScaleFactor = toBigInt(payload.feeScaleFactor);
  }
}
