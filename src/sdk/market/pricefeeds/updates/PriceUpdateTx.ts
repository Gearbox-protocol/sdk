import type { IPriceUpdateTx, RawTx } from "../../../types/index.js";
import type { IPriceUpdateTask } from "./types.js";

const MAX_DATA_TIMESTAMP_DELAY_SECONDS = 10n * 60n;
const MAX_DATA_TIMESTAMP_AHEAD_SECONDS = 60n;

export abstract class PriceUpdateTx<
  T extends IPriceUpdateTask = IPriceUpdateTask,
> implements IPriceUpdateTx<T>
{
  public readonly raw: RawTx;
  public readonly data: T;
  public abstract readonly name: string;

  constructor(raw: RawTx, data: T) {
    this.raw = raw;
    this.data = data;
  }

  public get pretty(): string {
    const cached = this.data.cached ? " (cached)" : "";
    return `${this.name} feed ${this.data.dataFeedId} at ${this.data.priceFeed} with timestamp ${this.data.timestamp}${cached}`;
  }

  public validateTimestamp(
    blockTimestamp: bigint,
  ): "valid" | "too old" | "in future" {
    const { timestamp: expectedPayloadTimestamp } = this.data;

    if (blockTimestamp < expectedPayloadTimestamp) {
      if (
        BigInt(expectedPayloadTimestamp) - blockTimestamp >
        MAX_DATA_TIMESTAMP_AHEAD_SECONDS
      ) {
        return "in future";
      }
    } else if (
      blockTimestamp - BigInt(expectedPayloadTimestamp) >
      MAX_DATA_TIMESTAMP_DELAY_SECONDS
    ) {
      return "too old";
    }

    return "valid";
  }
}
