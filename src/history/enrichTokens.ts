import type { Address } from "viem";
import type { TokenInfo } from "../plugins/adapters/types.js";
import type {
  InnerOperation,
  WithdrawCollateralOp,
} from "./inner-operations.js";
import type { CreditAccountOperation } from "./types.js";

export type TokenResolver = (addr: Address) => TokenInfo;

export function enrichOperations(
  ops: CreditAccountOperation[],
  resolve: TokenResolver,
): CreditAccountOperation<TokenInfo>[] {
  return ops.map(op => enrichOperation(op, resolve));
}

function enrichOperation(
  op: CreditAccountOperation,
  resolve: TokenResolver,
): CreditAccountOperation<TokenInfo> {
  switch (op.operation) {
    case "DirectTokenTransfer":
      return { ...op, token: resolve(op.token) };
    case "PartiallyLiquidateCreditAccount":
      return { ...op, token: resolve(op.token) };
    case "LiquidateCreditAccount":
      return {
        ...op,
        token: resolve(op.token),
        multicall: enrichMulticall(op.multicall, resolve),
      };
    case "OpenCreditAccount":
    case "CloseCreditAccount":
    case "MultiCall":
    case "BotMulticall":
      return { ...op, multicall: enrichMulticall(op.multicall, resolve) };
  }
}

function enrichMulticall(
  ops: InnerOperation[],
  resolve: TokenResolver,
): InnerOperation<TokenInfo>[] {
  return ops.map(op => enrichInnerOp(op, resolve));
}

function enrichInnerOp(
  op: InnerOperation,
  resolve: TokenResolver,
): InnerOperation<TokenInfo> {
  switch (op.operation) {
    case "Execute":
      return {
        ...op,
        transfers: op.transfers.map(t => ({ ...t, token: resolve(t.token) })),
      };
    case "IncreaseBorrowedAmount":
    case "DecreaseBorrowedAmount":
      return { ...op, token: resolve(op.token) };
    case "AddCollateral":
      return { ...op, token: resolve(op.token) };
    case "WithdrawCollateral": {
      const enriched: WithdrawCollateralOp<TokenInfo> = {
        operation: op.operation,
        token: resolve(op.token),
        amount: op.amount,
        to: op.to,
      };
      if (op.phantomToken) {
        enriched.phantomToken = resolve(op.phantomToken);
      }
      return enriched;
    }
    case "UpdateQuota":
      return { ...op, token: resolve(op.token) };
  }
}
