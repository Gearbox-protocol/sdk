import type { TransactionRequest } from "@ethersproject/abstract-provider";
import { BytesLike } from "ethers";

import { RawTransaction } from ".";

export interface BaseWcOperationProps {
  raw: RawTransaction;
}

export abstract class BaseWcOperation {
  public readonly id: number;
  public raw: RawTransaction;
  abstract readonly kind: string;

  constructor({ raw }: BaseWcOperationProps) {
    this.id = raw.id;
    this.raw = raw;
  }
}

export interface SupportedWcOperationProps extends BaseWcOperationProps {
  tx: TransactionRequest;
  operation: string;
  calldata: BytesLike;
}

export abstract class SupportedWcOperation extends BaseWcOperation {
  tx: TransactionRequest;
  operation: string;
  protected calldata: BytesLike;

  constructor(props: SupportedWcOperationProps) {
    super(props);

    this.operation = props.operation;
    this.tx = props.tx;
    this.calldata = props.calldata;
  }
}
