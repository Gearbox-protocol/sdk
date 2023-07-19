import { TokenData } from "../tokens/tokenData";
import type { TxSerialized } from "./transactions";

export interface Display {
  toString: (tokenData: Record<string, TokenData>) => string;
}

export type TxStatus = "pending" | "success" | "reverted";

export interface EventOrTxProps {
  block: number;
  txHash: string;
  txStatus: TxStatus;
  timestamp: number;
}

export abstract class EventOrTx implements Display {
  public block: number;

  public readonly txHash: string;

  public readonly timestamp: number;

  protected _txStatus: TxStatus;

  constructor({ block, txHash, txStatus, timestamp = 0 }: EventOrTxProps) {
    this.block = block;
    this.txHash = txHash;
    this._txStatus = txStatus;
    this.timestamp = timestamp;
  }

  public get isPending(): boolean {
    return this._txStatus === "pending";
  }

  public get txStatus() {
    return this._txStatus;
  }

  public compare(item: EventOrTx): number {
    if (this.isPending && !item.isPending) {
      return -1;
    }

    if (!this.isPending && item.isPending) {
      return 1;
    }

    return item.block - this.block;
  }

  public abstract toString(): string;
}

export type EVMEventProps = Omit<EventOrTxProps, "txStatus"> & {
  logId?: number;
};

export abstract class EVMEvent extends EventOrTx {
  logId?: number;
  constructor(opts: EVMEventProps) {
    super({ ...opts, txStatus: "success" });
    this.logId = opts.logId;
  }
}

type OptionalFields = "block" | "txStatus";
export type EVMTxProps = Omit<EventOrTxProps, OptionalFields> &
  Partial<Pick<EventOrTxProps, OptionalFields>>;

export abstract class EVMTx extends EventOrTx {
  constructor({
    txHash,
    block = 0,
    txStatus = "pending",
    timestamp = 0,
  }: EVMTxProps) {
    super({
      block,
      txStatus,
      txHash,
      timestamp,
    });
    if (this.txStatus !== "pending" && this.block === 0) {
      throw new Error("Block not specified for non-pending tx");
    }
  }

  abstract serialize(): TxSerialized;

  public revert(block: number) {
    this._txStatus = "reverted";
    this.block = block;
  }

  public success(block: number) {
    this._txStatus = "success";
    this.block = block;
  }
}
