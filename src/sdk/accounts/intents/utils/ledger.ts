import type { Address } from "viem";
import type { Asset } from "../../../index.js";
import { BigIntMath } from "../../../utils/bigint-math.js";
import type { AccountCalculatorOperation } from "../operations/types.js";

export type ConvertFn = (token: Address, to: Address, amount: bigint) => bigint;

/** Account state at one point in an operation chain. */
export interface LedgerSnapshot {
  /** Non-zero balances only, lowercased, in insertion order. */
  assets: Asset[];
  /** Sum of `assets` priced in the underlying. */
  totalValue: bigint;
  debt: bigint;
}

/**
 * Running account state, advanced one operation at a time.
 *
 * Exists because the amounts an operation is built from depend on the balances
 * the previous ones left behind: a swap has to know how much of its input token
 * is genuinely swap input, so the router does not sweep collateral that must
 * stay put. Applying each op as it is built keeps that a single forward pass —
 * a builder that re-simulated the chain from the start for every leg would be
 * quadratic in the number of legs and easy to desynchronise.
 */
export class OperationLedger {
  readonly #balances = new Map<Address, bigint>();
  readonly #underlying: Address;
  readonly #convert: ConvertFn;
  #debt: bigint;

  constructor(args: {
    initialAssets: readonly Asset[] | Asset[];
    underlying: Address;
    debt: bigint;
    convert: ConvertFn;
  }) {
    this.#underlying = args.underlying;
    this.#convert = args.convert;
    this.#debt = args.debt;

    for (const asset of args.initialAssets) {
      const token = asset.token.toLowerCase() as Address;
      this.#balances.set(
        token,
        (this.#balances.get(token) ?? 0n) + asset.balance,
      );
    }
  }

  public get debt(): bigint {
    return this.#debt;
  }

  public balanceOf(token: Address): bigint {
    return this.#balances.get(token.toLowerCase() as Address) ?? 0n;
  }

  public applyAll(operations: readonly AccountCalculatorOperation[]): this {
    for (const op of operations) {
      this.apply(op);
    }
    return this;
  }

  public snapshot(): LedgerSnapshot {
    const assets = [...this.#balances.entries()].map(
      ([token, balance]): Asset => ({ token, balance }),
    );

    return {
      assets,
      totalValue: assets.reduce(
        (acc, a) => acc + this.#convert(a.token, this.#underlying, a.balance),
        0n,
      ),
      debt: this.#debt,
    };
  }

  /**
   * Advances the state by one operation.
   *
   * Close and repay are terminal composites that settle debt and sweep the
   * account inside their own assemblers, so there is no partial state worth
   * projecting for them; quota changes move no balance at all.
   */
  public apply(op: AccountCalculatorOperation): this {
    switch (op.type) {
      case "changeQuota":
      case "closeCreditAccount":
      case "repayCreditAccount":
        break;
      case "increaseDebt":
        this.#debt += op.amount;
        this.#add(this.#underlying, op.amount);
        break;
      case "decreaseDebt":
        this.#debt = BigIntMath.max(0n, this.#debt - op.amount);
        this.#add(this.#underlying, -op.amount);
        break;
      case "addCollateral":
        this.#add(op.token, op.amount);
        break;
      case "withdrawCollateral":
        this.#add(op.token, -op.amount);
        break;
      case "swap":
        for (const input of op.from) {
          this.#add(input.token, -input.balance);
        }
        this.#add(op.tokenOut, op.amountOut);
        break;
      case "wrapRwaCollateral":
      case "unwrapRwaCollateral":
        this.#add(op.tokenIn, -op.amount);
        this.#add(op.tokenOut, op.amountOut);
        break;
      case "startDelayedWithdrawal":
        this.#add(op.token, -op.amountIn);
        for (const out of op.outputs) {
          this.#add(out.token, out.amount);
        }
        break;
      case "claimDelayedWithdrawal":
        this.#add(op.withdrawalPhantomToken, -op.withdrawalTokenSpent);
        for (const out of op.outputs) {
          this.#add(out.token, out.amount);
        }
        break;
      default: {
        const _exhaustive: never = op;
        void _exhaustive;
        break;
      }
    }
    return this;
  }

  #add(token: Address, delta: bigint): void {
    const key = token.toLowerCase() as Address;
    const balance = (this.#balances.get(key) ?? 0n) + delta;
    if (balance <= 0n) {
      this.#balances.delete(key);
    } else {
      this.#balances.set(key, balance);
    }
  }
}

interface SimulateOperationAssetsProps {
  initialAssets: readonly Asset[] | Asset[];
  operations: AccountCalculatorOperation[];
  underlyingToken: Address;
  debt: bigint;
  convert: ConvertFn;
}

/** Post-chain state of an operation list, for callers that hold no ledger. */
export function simulateOperationAssets(
  props: SimulateOperationAssetsProps,
): LedgerSnapshot {
  return new OperationLedger({
    initialAssets: props.initialAssets,
    underlying: props.underlyingToken,
    debt: props.debt,
    convert: props.convert,
  })
    .applyAll(props.operations)
    .snapshot();
}
