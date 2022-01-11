import { TokenData } from "./token";
import { TxSerialized } from "./transactions";

export interface Display {
  toString(tokenData: Record<string, TokenData>): string;
}

export type TxStatus = "pending" | "success" | "reverted";

export abstract class EventOrTx implements Display {
  public block: number;
  public readonly txHash: string;
  protected _txStatus: TxStatus;

  constructor(opts: { block: number; txHash: string; txStatus: TxStatus }) {
    this.block = opts.block;
    this.txHash = opts.txHash;
    this._txStatus = opts.txStatus;
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

    return this.block > item.block ? -1 : 1;
  }

  public abstract toString(tokenData: Record<string, TokenData>): string;
}

export abstract class EVMEvent extends EventOrTx {
  constructor(opts: { block: number; txHash: string }) {
    super({ ...opts, txStatus: "success" });
  }
}

export abstract class EVMTx extends EventOrTx {
  constructor(opts: { block?: number; txHash: string; txStatus?: TxStatus }) {
    super({
      ...opts,
      block: opts.block || 0,
      txStatus: opts.txStatus || "pending",
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
