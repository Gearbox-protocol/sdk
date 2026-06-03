import { type Address, isAddressEqual } from "viem";
import type { InnerOperation } from "../../history/index.js";

import type { OnchainSDK } from "../../sdk/index.js";
import type { ParsedTransaction } from "../parse/index.js";

import { AllowancePrerequisite } from "./AllowancePrerequisite.js";
import { BalancePrerequisite } from "./BalancePrerequisite.js";
import type { AnyPrerequisite } from "./Prerequisite.js";
import type { PrerequisiteContext } from "./types.js";

/**
 * Derives the on-chain prerequisites for a parsed transaction: the conditions
 * that must hold for the call not to revert and that we can verify with the
 * SDK (token approvals, wallet balances).
 *
 * Only *sender-actionable* prerequisites belong here: conditions the LP
 * provider or borrower can fix themselves before retrying (e.g. approve a
 * token, top up a balance). Non-actionable protocol/admin state (pool pause,
 * available pool liquidity, health factor, liquidatability, degen NFT gating,
 * bot permissions) is intentionally out of scope, since the user cannot
 * resolve it. New {@link AnyPrerequisite} subclasses must follow the same rule.
 */
export function buildPrerequisites(
  tx: ParsedTransaction,
  ctx: PrerequisiteContext,
): AnyPrerequisite[] {
  const { wallet } = ctx;

  switch (tx.operation) {
    case "Deposit":
      return [
        new AllowancePrerequisite({
          token: tx.underlying,
          owner: wallet,
          spender: tx.pool,
          required: tx.assets,
          title: "Token approved to pool",
        }),
        new BalancePrerequisite({
          token: tx.underlying,
          owner: wallet,
          required: tx.assets,
          title: "Sufficient token balance",
        }),
      ];

    case "Redeem": {
      const prereqs: AnyPrerequisite[] = [
        new BalancePrerequisite({
          token: tx.pool,
          owner: tx.owner,
          required: tx.shares,
          title: "Sufficient LP token balance",
        }),
      ];
      // A third party redeeming on behalf of `owner` needs an LP allowance.
      if (!isAddressEqual(tx.owner, wallet)) {
        prereqs.push(
          new AllowancePrerequisite({
            token: tx.pool,
            owner: tx.owner,
            spender: wallet,
            required: tx.shares,
            title: "LP token approved to caller",
          }),
        );
      }
      return prereqs;
    }

    case "MultiCall":
    case "BotMulticall":
    case "OpenCreditAccount":
    case "CloseCreditAccount":
    case "LiquidateCreditAccount":
      return collateralPrerequisites(tx.multicall, tx.creditManager, wallet);

    case "PartiallyLiquidateCreditAccount": {
      const underlying = underlyingOf(ctx.sdk, tx.creditManager);
      if (!underlying || tx.repaidAmount === 0n) {
        return [];
      }
      return [
        new AllowancePrerequisite({
          token: underlying,
          owner: wallet,
          spender: tx.creditManager,
          required: tx.repaidAmount,
          title: "Underlying approved to credit manager",
        }),
        new BalancePrerequisite({
          token: underlying,
          owner: wallet,
          required: tx.repaidAmount,
          title: "Sufficient underlying balance",
        }),
      ];
    }

    default:
      return [];
  }
}

/**
 * For every `addCollateral` inside a multicall, requires the wallet to approve
 * and hold the collateral token for the credit manager. Amounts for the same
 * token are summed; zero-amount collateral is skipped.
 */
function collateralPrerequisites(
  multicall: InnerOperation[],
  creditManager: Address,
  wallet: Address,
): AnyPrerequisite[] {
  const required = new Map<string, { token: Address; amount: bigint }>();
  for (const op of multicall) {
    if (op.operation !== "AddCollateral" || op.amount === 0n) {
      continue;
    }
    const key = op.token.toLowerCase();
    const existing = required.get(key);
    required.set(key, {
      token: op.token,
      amount: (existing?.amount ?? 0n) + op.amount,
    });
  }

  const prereqs: AnyPrerequisite[] = [];
  for (const { token, amount } of required.values()) {
    prereqs.push(
      new AllowancePrerequisite({
        token,
        owner: wallet,
        spender: creditManager,
        required: amount,
        title: "Collateral approved to credit manager",
      }),
      new BalancePrerequisite({
        token,
        owner: wallet,
        required: amount,
        title: "Sufficient collateral balance",
      }),
    );
  }
  return prereqs;
}

/** Resolves the underlying token of a credit manager via the market register. */
function underlyingOf(
  sdk: OnchainSDK,
  creditManager: Address,
): Address | undefined {
  const suite = sdk.marketRegister.creditManagers.find(cm =>
    isAddressEqual(cm.creditManager.address, creditManager),
  );
  return suite?.underlying;
}
