import type { Address } from "viem";

import type { TokenData } from "../tokens/tokenData.js";
import type { TxSerialized } from "./transactions.js";

interface Display {
  toString: (tokenData: Record<string, TokenData>) => string;
}

export type TxStatus = "pending" | "success" | "reverted";

interface EventOrTxProps {
  block: number;
  txHash: Address;
  txStatus: TxStatus;
  timestamp: number;
  eventString?: string;
}

abstract class EventOrTx implements Display {
  public block: number;
  public readonly txHash: Address;
  public readonly timestamp: number;
  protected _txStatus: TxStatus;
  protected _customEventString: string | undefined;

  constructor(props: EventOrTxProps) {
    this.block = props.block;
    this.txHash = props.txHash;
    this._txStatus = props.txStatus;
    this.timestamp = props.timestamp ?? 0;
    this._customEventString = props.eventString;
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

  public toString(): string {
    return this._customEventString ? this._customEventString : this._toString();
  }
  protected abstract _toString(): string;
}

export type EVMTxProps = Omit<EventOrTxProps, "block" | "txStatus"> &
  Partial<Pick<EventOrTxProps, "block" | "txStatus">>;
export abstract class EVMTx extends EventOrTx {
  constructor({
    txHash,
    block = 0,
    txStatus = "pending",
    timestamp = 0,
    ...rest
  }: EVMTxProps) {
    super({
      block,
      txStatus,
      txHash,
      timestamp,
      ...rest,
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
