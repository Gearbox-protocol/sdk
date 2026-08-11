import type { Address } from "viem";
import type { Asset } from "../../../index.js";
import { BigIntMath } from "../../../utils/bigint-math.js";
import type { AccountCalculatorOperation } from "../operations/types.js";

export type ConvertFn = (token: Address, to: Address, amount: bigint) => bigint;

interface SimulateOperationAssetsProps {
  initialAssets: readonly Asset[] | Asset[];
  operations: AccountCalculatorOperation[];
  underlyingToken: Address;
  debt: bigint;
  convert: ConvertFn;
}

/** Apply an op chain to CA token balances. Address keys are lowercased. */
export function simulateOperationAssets({
  initialAssets,
  operations,
  underlyingToken,
  debt,
  convert,
}: SimulateOperationAssetsProps) {
  let debtAfter = debt;
  const balances = new Map<Address, bigint>();

  for (const asset of initialAssets) {
    const token = asset.token.toLowerCase() as Address;
    balances.set(token, (balances.get(token) ?? 0n) + asset.balance);
  }

  const get = (token: Address) =>
    balances.get(token.toLowerCase() as Address) ?? 0n;

  const set = (token: Address, balance: bigint) => {
    const key = token.toLowerCase() as Address;
    if (balance <= 0n) {
      balances.delete(key);
    } else {
      balances.set(key, balance);
    }
  };

  for (const op of operations) {
    switch (op.type) {
      case "changeQuota":
      case "closeCreditAccount":
      case "repayCreditAccount":
        break;
      case "increaseDebt":
        debtAfter = debtAfter + op.amount;
        set(underlyingToken, get(underlyingToken) + op.amount);
        break;
      case "decreaseDebt":
        debtAfter = BigIntMath.max(0n, debtAfter - op.amount);
        set(underlyingToken, get(underlyingToken) - op.amount);
        break;
      case "addCollateral":
        set(op.token, get(op.token) + op.amount);
        break;
      case "withdrawCollateral":
        set(op.token, get(op.token) - op.amount);
        break;
      case "swap":
        for (const swapInput of op.from) {
          set(swapInput.token, get(swapInput.token) - swapInput.balance);
        }
        set(op.tokenOut, get(op.tokenOut) + op.amountOut);
        break;
      case "wrapRwaCollateral":
        set(op.tokenIn, get(op.tokenIn) - op.amount);
        set(op.tokenOut, get(op.tokenOut) + op.amountOut);
        break;
      case "unwrapRwaCollateral":
        set(op.tokenIn, get(op.tokenIn) - op.amount);
        set(op.tokenOut, get(op.tokenOut) + op.amountOut);
        break;
      case "startDelayedWithdrawal":
        set(op.token, get(op.token) - op.amountIn);
        for (const out of op.outputs) {
          set(out.token, get(out.token) + out.amount);
        }
        break;
      case "claimDelayedWithdrawal":
        set(
          op.withdrawalPhantomToken,
          get(op.withdrawalPhantomToken) - op.withdrawalTokenSpent,
        );
        for (const out of op.outputs) {
          set(out.token, get(out.token) + out.amount);
        }
        break;
      default: {
        const _exhaustive: never = op;
        void _exhaustive;
        break;
      }
    }
  }

  const assets = [...balances.entries()].map(
    ([token, balance]): Asset => ({
      token: token.toLowerCase() as Address,
      balance,
    }),
  );

  const totalValue = assets.reduce((acc, a) => {
    return acc + convert(a.token, underlyingToken, a.balance);
  }, 0n);

  return {
    assets,
    totalValue,
    debt: debtAfter,
  };
}
