import type { Address } from "viem";
import type { OnchainSDK } from "../../../index.js";
import type { CreditAccountSlice } from "../types.js";
import { eq } from "./common.js";
import { convertAmount } from "./convert-amount.js";

/** Prefix marking every phantom-token contract type in the registry. */
const PHANTOM_TOKEN_PREFIX = "PHANTOM_TOKEN::";

/**
 * Whether `token` is a phantom (a non-transferable position marker such as a
 * pending delayed withdrawal).
 *
 * Reads `contractType` directly instead of going through
 * `TokensMeta.isPhantomToken`, which throws when extended token data has not
 * been loaded. Here an unknown token is simply treated as non-phantom.
 */
export function isPhantomToken(sdk: OnchainSDK, token: Address): boolean {
  const meta = sdk.tokensMeta.get(token);
  return !!meta?.contractType?.startsWith(PHANTOM_TOKEN_PREFIX);
}

export interface CandidateToken {
  token: Address;
  balance: bigint;
  /** Balance priced in the market underlying, used for the ranking. */
  valueInUnderlying: bigint;
}

/**
 * Account balances that can actually back an operation, richest first.
 *
 * Phantoms are dropped because a pending delayed withdrawal cannot be spent:
 * it has to be claimed first, which is what the `resume` flows are for.
 */
export function rankAccountTokens(args: {
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
  /** Tokens to skip, e.g. the operation's own target. */
  exclude?: Address[];
}): CandidateToken[] {
  const { creditAccount, sdk, exclude = [] } = args;
  const convert = convertAmount(sdk, creditAccount.creditManager);

  const candidates: CandidateToken[] = [];
  for (const t of creditAccount.tokens) {
    if (t.balance <= 0n) {
      continue;
    }
    if (exclude.some(e => eq(e, t.token))) {
      continue;
    }
    if (isPhantomToken(sdk, t.token)) {
      continue;
    }
    candidates.push({
      token: t.token,
      balance: t.balance,
      valueInUnderlying: convert(t.token, creditAccount.underlying, t.balance),
    });
  }

  // Address is the tie-breaker so the pick is stable across identical values.
  candidates.sort((a, b) => {
    if (a.valueInUnderlying !== b.valueInUnderlying) {
      return a.valueInUnderlying > b.valueInUnderlying ? -1 : 1;
    }
    return a.token < b.token ? -1 : a.token > b.token ? 1 : 0;
  });

  return candidates;
}

/**
 * Default working token for flows that do not get one from the caller: the
 * most valuable non-phantom balance on the account.
 *
 * Used for the source of a partial withdraw and the position leg of a leverage
 * adjustment, both of which the caller may override explicitly.
 */
export function pickFattestNonPhantomToken(args: {
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
  exclude?: Address[];
}): CandidateToken | undefined {
  return rankAccountTokens(args)[0];
}
