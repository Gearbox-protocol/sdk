import type { Address } from "viem";
import type { Asset, MultiCall, OnchainSDK } from "../../../index.js";
import type { ConvertFn } from "../../../market/oracle/types.js";
import type { CreditAccountSlice } from "../types.js";
import { toRouterCaSlice } from "./common.js";
import { type LegProbe, startProbe } from "./price-impact.js";

/** One routed conversion leg. */
export interface SwapLeg {
  /** Expected output amount. */
  amount: bigint;
  /** Conservative output — the pathfinder floor after slippage. */
  minAmount: bigint;
  calls: MultiCall[];
  /**
   * The marginal-price quote this leg is measured against, already in flight.
   *
   * Produced here, not by the caller, so the basket cannot drift from the trade
   * it prices and the quote is always fired before the leg is awaited.
   * `undefined` where there is nothing to measure.
   */
  probe: LegProbe | undefined;
}

/** A routed leg that also projects the balances it leaves behind. */
export interface OpenStrategyLeg extends SwapLeg {
  /** Expected balances after the swap, per token. */
  balances: Record<Address, bigint>;
  /** Floor balances after slippage. */
  minBalances: Record<Address, bigint>;
}

export interface RouterPaths {
  /**
   * Spends exactly `amount` of `tokenIn`.
   *
   * `keep` is the `tokenIn` balance that must survive the swap: when some of it
   * is not swap input, the leftover-aware many-to-one path is used so the router
   * does not sweep the whole balance.
   */
  swap(input: {
    tokenIn: Address;
    tokenOut: Address;
    amount: bigint;
    keep?: bigint;
  }): Promise<SwapLeg>;
  /**
   * Sells every balance in `balances` into the underlying in one route — the
   * path the router builds for a closure, dust included. `amount` is what the
   * swap produces, so the underlying already on the account is not counted
   * twice; a set of balances with nothing to sell comes back with no calls.
   */
  closeAll(input: { balances: Asset[] }): Promise<SwapLeg>;
  /**
   * Spends `expectedBalances` minus `leftoverBalances` into `target` and also
   * projects the balances left on the account. Used when opening, where there
   * is no live account state to diff the result against.
   */
  openStrategy(input: {
    expectedBalances: Asset[];
    leftoverBalances: Asset[];
    target: Address;
  }): Promise<OpenStrategyLeg>;
}

/**
 * The engine's only door to the pathfinder.
 *
 * Deliberately not a quoter abstraction with an oracle-priced twin: paths are
 * always resolved on-chain, because a preview whose swap amounts came from
 * oracle prices could not produce the calldata that realises them.
 */
export function createRouterPaths(args: {
  sdk: OnchainSDK;
  creditAccount: CreditAccountSlice;
  slippage: number;
}): RouterPaths {
  const { sdk, creditAccount, slippage } = args;

  const suite = sdk.marketRegister.findCreditManager(
    creditAccount.creditManager,
  );
  const cmSlice = {
    address: suite.creditManager.address.toLowerCase() as Address,
    creditFacade: suite.creditFacade.address.toLowerCase() as Address,
    collateralTokens: suite.creditManager.collateralTokens.map(
      t => t.toLowerCase() as Address,
    ),
  };
  const router = sdk.routerFor({
    creditFacade: suite.creditFacade.address,
  });
  const { priceOracle } = sdk.marketRegister.findByCreditManager(
    creditAccount.creditManager,
  );

  // Asking the router, without probing. The probe below reuses these, so a
  // quote and the quote it is measured against can never drift apart — and a
  // probe is then literally the same call, smaller and keeping nothing back.
  const quoteSwap = (input: {
    tokenIn: Address;
    tokenOut: Address;
    amount: bigint;
    keep: bigint;
  }) => {
    // What the router sees of `tokenIn`: the whole balance when part of it has
    // to survive, and just the spend when none does.
    const spending = [
      { token: input.tokenIn, balance: input.amount + input.keep },
    ];
    return input.keep > 0n
      ? router.findManyToOnePath({
          creditAccount: toRouterCaSlice(creditAccount, spending),
          creditManager: cmSlice,
          expectedBalances: spending,
          leftoverBalances: [{ token: input.tokenIn, balance: input.keep }],
          target: input.tokenOut,
          slippage,
        })
      : router.findOneTokenPath({
          creditAccount: toRouterCaSlice(creditAccount, spending),
          creditManager: cmSlice,
          tokenIn: input.tokenIn,
          tokenOut: input.tokenOut,
          amount: input.amount,
          slippage,
        });
  };

  const quoteClose = (balances: Asset[]) =>
    router.findBestClosePath({
      creditAccount: toRouterCaSlice(creditAccount, balances),
      creditManager: cmSlice,
      balances: {
        expectedBalances: balances,
        leftoverBalances: [],
        tokensToClaim: [],
      },
      slippage,
    });

  const quoteOpen = (
    expectedBalances: Asset[],
    leftoverBalances: Asset[],
    target: Address,
  ) =>
    router.findOpenStrategyPath({
      creditManager: cmSlice,
      expectedBalances,
      leftoverBalances,
      target,
      slippage,
    });

  return {
    async swap({ tokenIn, tokenOut, amount, keep = 0n }) {
      if (amount <= 0n) {
        return { amount: 0n, minAmount: 0n, calls: [], probe: undefined };
      }
      if (keep < 0n) {
        throw new Error(
          `swap: spending ${amount} of ${tokenIn} exceeds its balance`,
        );
      }

      // The same swap at a size that cannot move a pool, keeping nothing back.
      // That size also drops it to a single split, which is what a marginal
      // price is — do not "fix" that to match the real leg.
      const probe = startProbe({
        basket: [{ token: tokenIn, balance: amount }],
        tokenOut,
        oracle: priceOracle,
        route: async ([only]) => {
          if (!only) {
            return 0n;
          }
          const quote = await quoteSwap({
            tokenIn: only.token,
            tokenOut,
            amount: only.balance,
            keep: 0n,
          });
          return quote.amount;
        },
      });

      const leg = await quoteSwap({ tokenIn, tokenOut, amount, keep });

      return { ...leg, probe: probe && { ...probe, realAmount: leg.amount } };
    },

    async closeAll({ balances }) {
      const probe = startProbe({
        basket: balances,
        tokenOut: creditAccount.underlying,
        oracle: priceOracle,
        route: async quoted => (await quoteClose(quoted)).amount,
      });

      const { amount, minAmount, calls } = await quoteClose(balances);
      const leg = { amount, minAmount, calls: [...calls] };
      return { ...leg, probe: probe && { ...probe, realAmount: leg.amount } };
    },

    async openStrategy({ expectedBalances, leftoverBalances, target }) {
      // Nothing kept back: a probe spends its whole basket.
      const probe = startProbe({
        basket: expectedBalances,
        tokenOut: target,
        oracle: priceOracle,
        route: async balances => (await quoteOpen(balances, [], target)).amount,
      });

      const leg = await quoteOpen(expectedBalances, leftoverBalances, target);

      return { ...leg, probe: probe && { ...probe, realAmount: leg.amount } };
    },
  };
}

/**
 * The same door, priced by the oracle and opening onto no calldata.
 *
 * For a leg that cannot be quoted yet: the tail of a redemption trades funds
 * that do not exist, along a route the pathfinder will only be able to build
 * once they do. Asking it now would price a swap of nothing, so the amounts
 * come from the oracle instead — an estimate with no slippage floor, which is
 * all a projection days out can honestly be — and the walk yields a state
 * rather than a transaction.
 */
export function createOraclePaths(args: {
  sdk: OnchainSDK;
  creditAccount: CreditAccountSlice;
}): RouterPaths {
  const { sdk, creditAccount } = args;
  const oracle = sdk.marketRegister.findByCreditManager(
    creditAccount.creditManager,
  ).priceOracle;
  const price: ConvertFn = (from, to, amount) =>
    oracle.safeConvert(from, to, amount).value;
  // Linear by construction, so probing it would compare a number against
  // itself. No probe says "not measured", which is the honest answer.
  const estimate = (amount: bigint): SwapLeg => ({
    amount,
    minAmount: amount,
    calls: [],
    probe: undefined,
  });

  return {
    async swap({ tokenIn, tokenOut, amount }) {
      return estimate(amount > 0n ? price(tokenIn, tokenOut, amount) : 0n);
    },

    async closeAll({ balances }) {
      return estimate(
        balances.reduce(
          (sum, b) => sum + price(b.token, creditAccount.underlying, b.balance),
          0n,
        ),
      );
    },

    async openStrategy() {
      throw new Error("oracle paths: opening a position is never projected");
    },
  };
}
