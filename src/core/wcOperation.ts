import type { TransactionRequest } from "@ethersproject/abstract-provider";
import { BigNumber, BytesLike } from "ethers";
import { FunctionFragment } from "ethers/lib/utils";

import { ICreditFacade__factory, ICreditManager__factory } from "../types";
import { CreditManagerData } from "./creditManager";

export type TxType = "unsupported" | "swap" | "approve" | "lp";
export type LpOperationType = "withdraw" | "deposit";

interface ApproveOperationProps {
  to: string;
  args: [string, BigNumber];
  raw: RawTransaction;
  creditManager: CreditManagerData;
}

export interface RawTransaction {
  id: number;
  method: "eth_sendTransaction";
  params: [TransactionRequest];
}

export interface TxInfo {
  from?: string;
  to?: string;
  amountFrom?: BigNumber;
  amountTo?: BigNumber;
  functionFragment: FunctionFragment;
}

export class WcOperation {
  public readonly id: number;
  public kind: TxType;
  public raw: RawTransaction;
  public operation?: string;

  public from?: string;
  public to?: string;

  public amountFrom?: BigNumber;
  public amountTo?: BigNumber;

  public tx?: TransactionRequest;
  protected calldata?: BytesLike;

  public farm?: string;
  public lpOperationType?: LpOperationType;

  constructor(raw: RawTransaction, kind: TxType) {
    this.id = raw.id;
    this.raw = raw;
    this.kind = kind;
  }

  static NewSwapOperation(params: {
    adapter: string;
    operation: string;
    from: string;
    to: string;
    amountFrom: BigNumber;
    amountTo: BigNumber;
    raw: RawTransaction;
  }): WcOperation {
    const newOperation = new WcOperation(params.raw, "swap");
    newOperation.operation = params.operation;
    newOperation.from = params.from;
    newOperation.to = params.to;
    newOperation.amountFrom = params.amountFrom;
    newOperation.amountTo = params.amountTo;
    newOperation.raw = params.raw;
    newOperation.calldata = params.raw?.params[0]?.data;

    newOperation.tx = {
      to: params.adapter,
      data: newOperation.calldata,
    };

    return newOperation;
  }

  static NewLPOperation(params: {
    adapter: string;
    operation: string;
    from: string;
    amountFrom: BigNumber;
    farm: string;
    type: LpOperationType;
    raw: RawTransaction;
  }): WcOperation {
    const newOperation = new WcOperation(params.raw, "lp");
    newOperation.operation = params.operation;
    newOperation.from = params.from;
    newOperation.amountFrom = params.amountFrom;
    newOperation.raw = params.raw;
    newOperation.calldata = params.raw?.params[0]?.data;
    newOperation.farm = params.farm;
    newOperation.tx = {
      to: params.adapter,
      data: newOperation.calldata,
    };
    newOperation.lpOperationType = params.type;

    return newOperation;
  }

  static NewUnsupportedOperation(raw: RawTransaction): WcOperation {
    return new WcOperation(raw, "unsupported");
  }

  static NewApproveOperation({
    to: token,
    args,
    raw,
    creditManager,
  }: ApproveOperationProps): WcOperation {
    try {
      const [spender, amount] = args;

      const cmi = ICreditManager__factory.createInterface();
      const cfi = ICreditFacade__factory.createInterface();

      const target =
        creditManager.version === 1
          ? creditManager.address
          : creditManager.creditFacade;

      const calldata =
        creditManager.version === 1
          ? cmi.encodeFunctionData("approve", [spender, token])
          : cfi.encodeFunctionData("approve", [spender, token, amount]);

      const tx: TransactionRequest = {
        to: target,
        data: calldata,
      };

      const operation = new WcOperation(raw, "approve");
      operation.to = target;
      operation.calldata = calldata;
      operation.from = spender;
      operation.tx = tx;

      return operation;
    } catch (e) {
      console.error(e);
      return WcOperation.NewUnsupportedOperation(raw);
    }
  }
}
