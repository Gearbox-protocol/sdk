import type { Address } from "viem";
import {
  type Asset,
  BigIntMath,
  type MultiCall,
  type OnchainSDK,
} from "../../../index.js";
import type { CreditAccountSlice } from "../types.js";
import { convertAmount, eq, toRouterCaSlice } from "../utils/index.js";

/** Close path quote: how much underlying the wallet receives after close. */
export type CloseQuote = {
  /** Router avg amount received. */
  amount: bigint;
  /**Router min amount received. */
  minAmount: bigint;
  /** Total amount to receive on wallet */
  underlyingBalance: bigint;
  /** Router close path calls; empty for oracle quotes. */
  calls: MultiCall[];
};

export type CloseQuoter = (input: {
  assets: Asset[];
  debt: bigint;
}) => Promise<CloseQuote>;

/**
 * Offchain quoter: debt is repaid from NON-underlying value
 * (`amount = Σ convert(non-underlying → underlying) − debt`, clamped at 0),
 * underlying already on the account goes straight to the wallet
 * (`underlyingBalance = underlying + amount`). No router involved.
 */
export function createCloseOracleQuoter(args: {
  sdk: OnchainSDK;
  creditAccount: CreditAccountSlice;
}): CloseQuoter {
  const { sdk, creditAccount } = args;
  const underlyingLc = creditAccount.underlying.toLowerCase() as Address;

  return async ({ assets, debt }) => {
    const convert = convertAmount(sdk, creditAccount.creditManager);

    const underlyingBalance =
      assets.find(a => eq(a.token, underlyingLc))?.balance ?? 0n;
    const assetsSum = assets.reduce(
      (acc, a) => acc + convert(a.token, creditAccount.underlying, a.balance),
      0n,
    );
    const totalToRepay = BigIntMath.max(assetsSum - underlyingBalance, 0n);
    const amount = BigIntMath.max(totalToRepay - debt, 0n);

    return {
      amount,
      minAmount: amount,
      underlyingBalance: underlyingBalance + amount,
      calls: [],
    };
  };
}

/**
 * Onchain quoter: router close path over post-claim balances
 * (phantom already spent). `amount` mirrors legacy
 * `patchCloseOperationReceiveAmount` (debt 0n — closed preview is zeroed).
 */
export function createRouterCloseQuoter(args: {
  sdk: OnchainSDK;
  creditAccount: CreditAccountSlice;
  slippage: number;
}): CloseQuoter {
  const { sdk, creditAccount, slippage } = args;
  const creditManager = sdk.marketRegister.findCreditManager(
    creditAccount.creditManager,
  );

  const router = sdk.routerFor({
    creditFacade: creditAccount.creditFacade,
  });

  return async ({ assets }) => {
    const path = await router.findBestClosePath({
      creditAccount: toRouterCaSlice(creditAccount, assets),
      creditManager: {
        address: creditManager.creditManager.address.toLowerCase() as Address,
        creditFacade:
          creditManager.creditFacade.address.toLowerCase() as Address,
        collateralTokens: creditManager.creditManager.collateralTokens.map(
          t => t.toLowerCase() as Address,
        ),
      },
      slippage,
      balances: {
        expectedBalances: assets,
        leftoverBalances: [],
        tokensToClaim: [],
      },
    });

    return path;
  };
}
