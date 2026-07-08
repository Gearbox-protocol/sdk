import type { PluginsMap } from "../../sdk/index.js";
import type { Operation } from "../parse/index.js";
import {
  type ParseOperationCalldataInput,
  parseOperationCalldata,
} from "../parse/parseOperationCalldata.js";

import { buildCollateralPrerequisites } from "./buildCollateralPrerequisites.js";
import { buildPartialLiquidationPrerequisites } from "./buildPartialLiquidationPrerequisites.js";
import { buildPoolPrerequisites } from "./buildPoolPrerequisites.js";
import { buildRWAPrerequisites } from "./buildRWAPrerequisites.js";
import type { AnyPrerequisite } from "./Prerequisite.js";
import type { AnyPrerequisiteResult, PrerequisiteContext } from "./types.js";

/**
 * Input of {@link checkPrerequisites}: the same raw-calldata input as the
 * internal calldata parser, plus an optional block to read at.
 */
export type CheckPrerequisitesInput<P extends PluginsMap = PluginsMap> =
  ParseOperationCalldataInput<P> & {
    /** Block to read at; defaults to latest. Only set for testnet forks. */
    blockNumber?: bigint;
  };

/**
 * Derives and verifies the on-chain prerequisites for an operation given its
 * raw calldata: the conditions that must hold for the call not to revert and
 * that we can verify with the SDK (token approvals, wallet balances, RWA
 * open-account requirements).
 *
 * Each prerequisite performs its own reads and resolves into an
 * {@link AnyPrerequisiteResult} (`satisfied` or `error`).
 *
 * Only *sender-actionable* prerequisites belong here: conditions the LP
 * provider or borrower can fix themselves before retrying (e.g. approve a
 * token, top up a balance, sign the RWA factory's messages). Non-actionable
 * protocol/admin state (e.g. pool is paused) is intentionally out of scope,
 * since the user cannot resolve it.
 */
export async function checkPrerequisites<P extends PluginsMap>(
  input: CheckPrerequisitesInput<P>,
): Promise<AnyPrerequisiteResult[]> {
  const { sdk, sender: wallet, blockNumber } = input;
  const tx = parseOperationCalldata(input);
  const ctx: PrerequisiteContext = { sdk, wallet, blockNumber };
  const prereqs = await buildPrerequisites(tx, ctx);
  return Promise.all(
    // Each prereq pairs its own kind with its detail, so the widened
    // `verify` return is safe to narrow back to the discriminated union.
    prereqs.map(p => p.verify(ctx) as Promise<AnyPrerequisiteResult>),
  );
}

/**
 * Dispatches a parsed operation to the per-operation-family prerequisite
 * builders.
 */
async function buildPrerequisites(
  tx: Operation,
  ctx: PrerequisiteContext,
): Promise<AnyPrerequisite[]> {
  const { wallet } = ctx;
  switch (tx.operation) {
    case "Deposit":
    case "Mint":
    case "Redeem":
    case "Withdraw":
      return buildPoolPrerequisites(tx, wallet);

    case "MultiCall":
    case "BotMulticall":
    case "OpenCreditAccount":
    case "CloseCreditAccount":
    case "LiquidateCreditAccount":
      return buildCollateralPrerequisites(
        tx.operation === "OpenCreditAccount"
          ? { creditManager: tx.creditManager, borrower: wallet }
          : {
              creditManager: tx.creditManager,
              creditAccount: tx.creditAccount,
            },
        tx.multicall,
        ctx,
      );

    case "RWAOpenCreditAccount":
      return [
        ...(await buildCollateralPrerequisites(
          { creditManager: tx.creditManager, borrower: wallet },
          tx.multicall,
          ctx,
        )),
        ...buildRWAPrerequisites(tx.multicall, tx.creditManager, tx.args, ctx),
      ];

    case "RWAMulticall":
      return buildCollateralPrerequisites(
        { creditManager: tx.creditManager, creditAccount: tx.creditAccount },
        tx.multicall,
        ctx,
      );

    case "PartiallyLiquidateCreditAccount":
      return buildPartialLiquidationPrerequisites(tx, ctx);

    default:
      return [];
  }
}
