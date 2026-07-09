import { type Address, isAddressEqual } from "viem";

import { NATIVE_ADDRESS } from "../../sdk/index.js";
import type { PoolOperation } from "../parse/index.js";
import { AllowancePrerequisite } from "./AllowancePrerequisite.js";
import { BalancePrerequisite } from "./BalancePrerequisite.js";
import { allowanceAndBalance } from "./helpers.js";
import type { Prerequisite } from "./Prerequisite.js";

/**
 * Prerequisites for ERC4626 pool operations (deposit, mint, withdraw, redeem),
 * either direct or zapper-routed.
 */
export function buildPoolPrerequisites(
  tx: PoolOperation,
  wallet: Address,
): Prerequisite[] {
  switch (tx.operation) {
    // Deposit and Mint both pull the underlying from the caller into the pool;
    // they only differ in which side (assets vs shares) the caller specifies.
    // The exact underlying amount for Mint is resolved by the pool, so we can
    // only require an allowance/balance against the known specified amount —
    // here we approximate Mint by its shares amount (a lower bound on assets is
    // not knowable from calldata alone).
    case "Deposit":
      // Zapper-routed deposits pull the zapper's `tokenIn` (which may differ
      // from the pool underlying) and the allowance must go to the zapper.
      // Native-token zappers (e.g. WETH_DEPOSIT) take the deposit as
      // `msg.value`, so no allowance is needed there.
      if (tx.zapper) {
        if (isAddressEqual(tx.tokenIn, NATIVE_ADDRESS)) {
          return [
            new BalancePrerequisite({
              token: tx.tokenIn,
              owner: wallet,
              required: tx.assets,
            }),
          ];
        }
        return allowanceAndBalance({
          token: tx.tokenIn,
          owner: wallet,
          spender: tx.zapper,
          required: tx.assets,
        });
      }
      return allowanceAndBalance({
        token: tx.underlying,
        owner: wallet,
        spender: tx.pool,
        required: tx.assets,
      });

    case "Mint":
      return allowanceAndBalance({
        token: tx.underlying,
        owner: wallet,
        spender: tx.pool,
        required: tx.shares,
      });

    // Redeem and Withdraw both burn LP shares from `owner`; they only differ in
    // which side (shares vs assets) the caller specifies.
    case "Redeem":
      // Zapper-routed redeems pull the operation's `tokenIn` (the zapper's
      // share-side token, which is the pool diesel token only for plain
      // zappers — farmed/staked wrappers differ) from the caller, so that
      // token must be approved to the zapper (no third-party `owner`).
      if (tx.zapper) {
        return [
          new BalancePrerequisite({
            token: tx.tokenIn,
            owner: wallet,
            required: tx.shares,
          }),
          new AllowancePrerequisite({
            token: tx.tokenIn,
            owner: wallet,
            spender: tx.zapper,
            required: tx.shares,
          }),
        ];
      }
      return lpSharePrerequisites(tx.pool, tx.owner, tx.shares, wallet);

    case "Withdraw":
      return lpSharePrerequisites(tx.pool, tx.owner, tx.assets, wallet);
  }
}

/**
 * Direct redeem/withdraw prerequisites: `owner` must hold enough LP (diesel)
 * tokens, and a third-party caller burning on behalf of `owner` needs an LP
 * allowance from them.
 */
function lpSharePrerequisites(
  pool: Address,
  owner: Address,
  required: bigint,
  wallet: Address,
): Prerequisite[] {
  const prereqs: Prerequisite[] = [
    new BalancePrerequisite({
      token: pool,
      owner,
      required,
    }),
  ];
  if (!isAddressEqual(owner, wallet)) {
    // LP token allowance from `owner` to the third-party caller.
    prereqs.push(
      new AllowancePrerequisite({
        token: pool,
        owner,
        spender: wallet,
        required,
      }),
    );
  }
  return prereqs;
}
