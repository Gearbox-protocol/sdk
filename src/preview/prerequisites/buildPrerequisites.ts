import { type Address, isAddressEqual, zeroAddress } from "viem";

import type { OnchainSDK } from "../../sdk/index.js";
import type {
  InnerOperation,
  Operation,
  OuterFacadeOperation,
} from "../parse/index.js";

import { AllowancePrerequisite } from "./AllowancePrerequisite.js";
import { BalancePrerequisite } from "./BalancePrerequisite.js";
import type { AnyPrerequisite } from "./Prerequisite.js";
import type { PrerequisiteContext } from "./types.js";

/**
 * Derives the on-chain prerequisites for a parsed operation: the conditions
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
export async function buildPrerequisites(
  tx: Operation,
  ctx: PrerequisiteContext,
): Promise<AnyPrerequisite[]> {
  const { wallet } = ctx;

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
      if (tx.zapper) {
        return [
          new AllowancePrerequisite({
            token: tx.tokenIn,
            owner: wallet,
            spender: tx.zapper,
            required: tx.assets,
            title: "Token approved to zapper",
          }),
          new BalancePrerequisite({
            token: tx.tokenIn,
            owner: wallet,
            required: tx.assets,
            title: "Sufficient token balance",
          }),
        ];
      }
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

    case "Mint":
      return [
        new AllowancePrerequisite({
          token: tx.underlying,
          owner: wallet,
          spender: tx.pool,
          required: tx.shares,
          title: "Token approved to pool",
        }),
        new BalancePrerequisite({
          token: tx.underlying,
          owner: wallet,
          required: tx.shares,
          title: "Sufficient token balance",
        }),
      ];

    // Redeem and Withdraw both burn LP shares from `owner`; they only differ in
    // which side (shares vs assets) the caller specifies.
    case "Redeem": {
      // Zapper-routed redeems burn LP shares pulled from the caller, so the LP
      // token must be approved to the zapper (no third-party `owner`).
      if (tx.zapper) {
        return [
          new BalancePrerequisite({
            token: tx.pool,
            owner: wallet,
            required: tx.shares,
            title: "Sufficient LP token balance",
          }),
          new AllowancePrerequisite({
            token: tx.pool,
            owner: wallet,
            spender: tx.zapper,
            required: tx.shares,
            title: "LP token approved to zapper",
          }),
        ];
      }
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

    case "Withdraw": {
      const prereqs: AnyPrerequisite[] = [
        new BalancePrerequisite({
          token: tx.pool,
          owner: tx.owner,
          required: tx.assets,
          title: "Sufficient LP token balance",
        }),
      ];
      // A third party withdrawing on behalf of `owner` needs an LP allowance.
      if (!isAddressEqual(tx.owner, wallet)) {
        prereqs.push(
          new AllowancePrerequisite({
            token: tx.pool,
            owner: tx.owner,
            spender: wallet,
            required: tx.assets,
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
      return collateralPrerequisites(
        tx.operation,
        tx.multicall,
        tx.creditManager,
        tx.creditAccount,
        ctx,
      );

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
 * and hold the collateral token for the collateral spender.
 *
 * The approval spender is resolved via {@link OnchainSDK.accounts.getApprovalAddress}:
 * the credit manager for classic markets, but a per-investor "special wallet"
 * for RWA markets.
 */
async function collateralPrerequisites(
  op: OuterFacadeOperation["operation"],
  multicall: InnerOperation[],
  creditManager: Address,
  creditAccount: Address,
  ctx: PrerequisiteContext,
): Promise<AnyPrerequisite[]> {
  const { sdk, wallet } = ctx;
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

  if (required.size === 0) {
    return [];
  }

  const spender = await sdk.accounts.getApprovalAddress(
    op === "OpenCreditAccount"
      ? { creditManager, borrower: wallet }
      : { creditManager, creditAccount },
  );

  const prereqs: AnyPrerequisite[] = [];
  for (const { token, amount } of required.values()) {
    prereqs.push(
      new AllowancePrerequisite({
        token,
        owner: wallet,
        spender,
        required: amount,
        title: "Collateral approved",
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
