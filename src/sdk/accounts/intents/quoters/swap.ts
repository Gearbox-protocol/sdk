import type { Address } from "viem";
import type { Asset, MultiCall, OnchainSDK } from "../../../index.js";
import type { CreditAccountSlice } from "../types.js";
import { convertAmount, toRouterCaSlice } from "../utils/index.js";

/** Swap quote for a conversion leg of a resume flow. */
export type SwapQuote = {
  /** Average (or oracle) output amount. */
  amount: bigint;
  /** Conservative output (router floor); equals `amountOut` for oracle quotes. */
  minAmount: bigint;
  /** Router swap calls; empty for oracle quotes. */
  calls: MultiCall[];
};

export type SwapQuoter = (request: {
  from: [Asset];
  tokenOut: Address;
  /** Full token-in balance after operations preceding this swap leg. */
  tokenInBalance: bigint;
}) => Promise<SwapQuote>;

/**
 * Offchain quoter: oracle prices via {@link convertAmount} (with an RWA
 * bridge through the wrapped underlying when `rwa.asset` has no direct pool
 * price).
 */
export function createOracleSwapQuoter(args: {
  sdk: OnchainSDK;
  creditAccount: CreditAccountSlice;
}): SwapQuoter {
  const { sdk, creditAccount } = args;
  const { creditManager } = creditAccount;

  const convert = convertAmount(sdk, creditManager);

  return async ({ from, tokenOut }) => {
    const input = from[0];
    if (!input) {
      return { amount: 0n, minAmount: 0n, calls: [] };
    }

    let amount = 0n;
    for (const entry of from) {
      amount += convert(entry.token, tokenOut, entry.balance);
    }
    return { amount, minAmount: amount, calls: [] };
  };
}

/**
 * Onchain quoter: a full token-in spend uses `findOneTokenPath`; a partial
 * spend uses `findManyToOnePath` with the exact post-operations balance and
 * leftover. RWA wrap/unwrap calls are resolved by the router.
 */
export function createRouterSwapQuoter(args: {
  sdk: OnchainSDK;
  creditAccount: CreditAccountSlice;
  slippage: number;
}): SwapQuoter {
  const { sdk, creditAccount, slippage } = args;
  const creditManager = sdk.marketRegister.findCreditManager(
    creditAccount.creditManager,
  );
  const cmSlice = {
    address: creditManager.creditManager.address.toLowerCase() as Address,
    creditFacade: creditManager.creditFacade.address.toLowerCase() as Address,
    collateralTokens: creditManager.creditManager.collateralTokens.map(
      t => t.toLowerCase() as Address,
    ),
  };
  const router = sdk.routerFor({
    creditFacade: creditManager.creditFacade.address,
  });

  return async request => {
    const input = request.from[0];
    if (!input) {
      return { amount: 0n, minAmount: 0n, calls: [] };
    }

    const leftover = request.tokenInBalance - input.balance;
    if (leftover < 0n) {
      throw new Error(
        "createRouterSwapQuoter: swap amount exceeds token-in balance",
      );
    }
    if (leftover > 0n) {
      const result = await router.findManyToOnePath({
        creditAccount: toRouterCaSlice(creditAccount),
        creditManager: cmSlice,
        expectedBalances: [
          { token: input.token, balance: request.tokenInBalance },
        ],
        leftoverBalances: [{ token: input.token, balance: leftover }],
        target: request.tokenOut,
        slippage,
      });
      return result;
    }

    const result = await router.findOneTokenPath({
      creditAccount: toRouterCaSlice(creditAccount),
      creditManager: cmSlice,
      tokenIn: input.token,
      tokenOut: request.tokenOut,
      amount: input.balance,
      slippage,
    });
    return result;
  };
}
