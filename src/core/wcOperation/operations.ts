import type { TransactionRequest } from "@ethersproject/abstract-provider";
import { BigNumber } from "ethers";

import { ICreditFacade__factory, ICreditManager__factory } from "../../types";
import { CreditManagerData } from "../creditManager";
import {
  BaseWcOperation,
  BaseWcOperationProps,
  SupportedWcOperation,
  SupportedWcOperationProps,
} from "./abstractOperations";
import { RawTransaction } from "./types";

export type FailedWCOperationType =
  | "unsupported"
  | "bad_request"
  | "unsupported_tokens";

interface FailedWCOperationProps extends BaseWcOperationProps {
  message: string;
  kind: FailedWCOperationType;
}

export class FailedWCOperation extends BaseWcOperation {
  kind: FailedWCOperationType;
  message: string;

  constructor({ raw, kind, message }: FailedWCOperationProps) {
    super({ raw });
    this.kind = kind;
    this.message = message;
  }

  static create(props: FailedWCOperationProps) {
    return new FailedWCOperation(props);
  }
}

type ApproveWCOperationType = "approve";

interface ApproveWcOperationProps extends SupportedWcOperationProps {
  kind: ApproveWCOperationType;
  to: string;
  from: string;
}

interface CreateApproveWCOperation {
  to: string;
  args: [string, BigNumber];
  raw: RawTransaction;
  creditManager: CreditManagerData;
}

export class ApproveWCOperation extends SupportedWcOperation {
  kind: ApproveWCOperationType;
  to: string;
  from: string;

  constructor(props: ApproveWcOperationProps) {
    super(props);

    this.kind = props.kind;
    this.from = props.from;
    this.to = props.to;
  }

  static create({
    to: token,
    args,
    raw,
    creditManager,
  }: CreateApproveWCOperation) {
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

      return new ApproveWCOperation({
        raw,
        operation: "approveToken",
        kind: "approve",

        tx: tx,
        calldata: calldata,

        to: target,
        from: spender,
      });
    } catch (e) {
      console.error(e);
      return FailedWCOperation.create({
        raw,
        kind: "bad_request",
        message: "Bad approve inputs",
      });
    }
  }
}

type SwapWCOperationType = "swap";

interface SwapWCOperationProps extends SupportedWcOperationProps {
  kind: SwapWCOperationType;
  from: string;
  to: string;
  amountFrom: BigNumber;
  amountTo: BigNumber;
}

interface CreateSwapWCOperationProps {
  adapter: string;
  operation: string;
  from: string;
  to: string;
  amountFrom: BigNumber;
  amountTo: BigNumber;
  raw: RawTransaction;
}

export class SwapWCOperation extends SupportedWcOperation {
  kind: SwapWCOperationType;
  from: string;
  to: string;
  amountFrom: BigNumber;
  amountTo: BigNumber;

  constructor(props: SwapWCOperationProps) {
    super(props);

    this.kind = props.kind;
    this.to = props.to;
    this.from = props.from;
    this.amountFrom = props.amountFrom;
    this.amountTo = props.amountTo;
  }

  static create(params: CreateSwapWCOperationProps) {
    const calldata = params.raw?.params[0]?.data as string;

    return new SwapWCOperation({
      kind: "swap",
      operation: params.operation,

      raw: params.raw,
      calldata,
      tx: {
        to: params.adapter,
        data: calldata,
      },

      from: params.from,
      to: params.to,
      amountFrom: params.amountFrom,
      amountTo: params.amountTo,
    });
  }
}

type LpWCOperationType = "lp";
type LpType = "withdraw" | "deposit";

interface LpWCOperationProps extends SupportedWcOperationProps {
  kind: LpWCOperationType;
  from: string;
  amountFrom: BigNumber;
  farm: string;
  lpOperationType: LpType;
}

interface CreateLpWCOperation {
  adapter: string;
  operation: string;
  from: string;
  amountFrom: BigNumber;
  farm: string;
  type: LpType;
  raw: RawTransaction;
}

export class LpWCOperation extends SupportedWcOperation {
  kind: LpWCOperationType;
  from: string;
  amountFrom: BigNumber;
  farm: string;
  lpOperationType: LpType;

  constructor(props: LpWCOperationProps) {
    super(props);

    this.kind = props.kind;
    this.from = props.from;
    this.amountFrom = props.amountFrom;
    this.farm = props.farm;
    this.lpOperationType = props.lpOperationType;
  }

  static create(params: CreateLpWCOperation) {
    const calldata = params.raw?.params[0]?.data as string;

    return new LpWCOperation({
      kind: "lp",
      operation: params.operation,

      raw: params.raw,
      calldata,
      tx: {
        to: params.adapter,
        data: calldata,
      },

      from: params.from,
      amountFrom: params.amountFrom,
      farm: params.farm,
      lpOperationType: params.type,
    });
  }
}
