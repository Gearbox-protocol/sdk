import type { Address } from "viem";
import type { Asset, OnchainSDK, RouterCASlice } from "../../../index.js";
import { AddressMap } from "../../../utils/AddressMap.js";
import type { CreditAccountSlice } from "../types.js";

/** Case-insensitive address equality. */
export const eq = (a: Address, b: Address) =>
  a.toLowerCase() === b.toLowerCase();

export function toTargetDecimals(
  fromAmount: bigint,
  fromToken: Address,
  toToken: Address,
  sdk: OnchainSDK,
) {
  const fromDecimals = sdk.tokensMeta.get(fromToken)?.decimals ?? 18;
  const toDecimals = sdk.tokensMeta.get(toToken)?.decimals ?? 18;

  return (fromAmount * 10n ** BigInt(toDecimals)) / 10n ** BigInt(fromDecimals);
}

/**
 * Router CA slice from the account slice. RouterV310 reads `ca.tokens` for
 * underlyingBalance, so balances are overlaid with the post-claim projection
 * (legacy `overlayExpectedBalancesOntoCaTokens`): existing tokens keep quota
 * with balance from the projection (0n when absent), new tokens get quota 0n.
 */
export function toRouterCaSlice(
  creditAccount: CreditAccountSlice,
  expectedBalances: Asset[] = [],
): RouterCASlice {
  const {
    accountDebt,
    underlying,
    creditFacade,
    creditManager,
    creditAccount: creditAccountAddress,
    tokens: _,
    ...restCA
  } = creditAccount;

  const expected = new AddressMap<bigint>([]);
  // If expected balances are set, prefill list with desired balances
  for (const asset of expectedBalances ?? []) {
    expected.upsert(
      asset.token,
      (expected.get(asset.token) ?? 0n) + asset.balance,
    );
  }

  const tokens = creditAccount.tokens.map(t => {
    const token = t.token.toLowerCase() as Address;
    const balance = expected.get(token) ?? t.balance;
    return { ...t, token, balance };
  });

  return {
    ...restCA,
    underlying: underlying.toLowerCase() as Address,
    creditAccount: creditAccountAddress.toLowerCase() as Address,
    creditFacade: creditFacade.toLowerCase() as Address,
    creditManager: creditManager.toLowerCase() as Address,
    debt: creditAccount.accountDebt,
    tokens,
  } satisfies RouterCASlice;
}
