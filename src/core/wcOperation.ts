import type { TransactionRequest } from "@ethersproject/abstract-provider";
import { BigNumber, BytesLike } from "ethers";
import { FunctionFragment } from "ethers/lib/utils";

import { ICreditManager__factory, IERC20__factory } from "../types";

export type TxType = "unsupported" | "swap" | "approve" | "lp";
export type LpOperationType = "withdraw" | "deposit";

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

export class SwapOperation {
  public readonly id: number;

  public operation?: string;

  public from?: string;

  public to?: string;

  public amountFrom?: BigNumber;

  public amountTo?: BigNumber;

  public tx?: TransactionRequest;

  public raw: RawTransaction;

  public kind: TxType;

  protected calldata?: BytesLike;

  public isPending: boolean;

  public farm?: string;

  public lpOperationType?: LpOperationType;

  static tokens: Record<string, boolean> = {};

  constructor(raw: RawTransaction, kind: TxType) {
    this.id = raw.id;
    this.raw = raw;
    this.kind = kind;
    this.isPending = false;
  }

  static NewSwapOperation(params: {
    adapter: string;
    operation: string;
    from: string;
    to: string;
    amountFrom: BigNumber;
    amountTo: BigNumber;
    raw: RawTransaction;
  }): SwapOperation {
    const newOperation = new SwapOperation(params.raw, "swap");
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
  }): SwapOperation {
    const newOperation = new SwapOperation(params.raw, "lp");
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

  static NewUnsupportedOperation(raw: RawTransaction): SwapOperation {
    return new SwapOperation(raw, "unsupported");
  }

  static NewApproveOperation(
    creditManager: string,
    raw: RawTransaction,
    token: string,
  ): SwapOperation {
    const operation = new SwapOperation(raw, "approve");
    operation.to = token;
    operation.calldata = raw?.params[0]?.data;
    const tokenI = IERC20__factory.createInterface();

    try {
      const [spender] = tokenI.decodeFunctionData(
        "approve",
        raw?.params[0]?.data || "",
      );

      const cmi = ICreditManager__factory.createInterface();

      operation.from = spender;
      // @ts-ignore
      operation.calldata = cmi.encodeFunctionData("approve", [
        spender,
        operation.to,
      ]);

      operation.tx = {
        to: creditManager,
        data: operation.calldata,
      };

      return operation;
    } catch (e) {
      console.error(e);
      return SwapOperation.NewUnsupportedOperation(raw);
    }
  }
}
