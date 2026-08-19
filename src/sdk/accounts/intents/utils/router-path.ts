import type { Address } from "viem";
import type { Asset, MultiCall, OnchainSDK } from "../../../index.js";
import type { CreditAccountSlice } from "../types.js";
import { toRouterCaSlice } from "./common.js";

/** One routed conversion leg. */
export interface SwapLeg {
  /** Expected output amount. */
  amount: bigint;
  /** Conservative output — the pathfinder floor after slippage. */
  minAmount: bigint;
  calls: MultiCall[];
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

  return {
    async swap({ tokenIn, tokenOut, amount, keep = 0n }) {
      if (amount <= 0n) {
        return { amount: 0n, minAmount: 0n, calls: [] };
      }
      if (keep < 0n) {
        throw new Error(
          `swap: spending ${amount} of ${tokenIn} exceeds its balance`,
        );
      }

      if (keep > 0n) {
        const expectedBalances = [{ token: tokenIn, balance: amount + keep }];
        return router.findManyToOnePath({
          creditAccount: toRouterCaSlice(creditAccount, expectedBalances),
          creditManager: cmSlice,
          expectedBalances,
          leftoverBalances: [{ token: tokenIn, balance: keep }],
          target: tokenOut,
          slippage,
        });
      }

      return router.findOneTokenPath({
        creditAccount: toRouterCaSlice(creditAccount, [
          { token: tokenIn, balance: amount },
        ]),
        creditManager: cmSlice,
        tokenIn,
        tokenOut,
        amount,
        slippage,
      });
    },

    async closeAll({ balances }) {
      const { amount, minAmount, calls } = await router.findBestClosePath({
        creditAccount: toRouterCaSlice(creditAccount, balances),
        creditManager: cmSlice,
        balances: {
          expectedBalances: balances,
          leftoverBalances: [],
          tokensToClaim: [],
        },
        slippage,
      });
      return { amount, minAmount, calls: [...calls] };
    },

    async openStrategy({ expectedBalances, leftoverBalances, target }) {
      return router.findOpenStrategyPath({
        creditManager: cmSlice,
        expectedBalances,
        leftoverBalances,
        target,
        slippage,
      });
    },
  };
}
