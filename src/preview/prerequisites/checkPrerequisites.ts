import type { PluginsMap } from "../../sdk/index.js";
import { type Operation, parseOperationCalldata } from "../parse/index.js";
import type {
  PreviewOperationInput,
  PreviewOperationOptions,
} from "../types.js";

import { buildCollateralPrerequisites } from "./buildCollateralPrerequisites.js";
import { buildPartialLiquidationPrerequisites } from "./buildPartialLiquidationPrerequisites.js";
import { buildPoolPrerequisites } from "./buildPoolPrerequisites.js";
import { buildRWAPrerequisites } from "./buildRWAPrerequisites.js";
import type { Prerequisite } from "./Prerequisite.js";
import type { PrerequisiteContext, PrerequisiteResult } from "./types.js";

/**
 * Derives and verifies the on-chain prerequisites for an operation given its
 * raw calldata: the conditions that must hold for the call not to revert and
 * that we can verify with the SDK (token approvals, wallet balances, RWA
 * open-account requirements).
 *
 * Each prerequisite performs its own reads and resolves into a
 * {@link PrerequisiteResult} (`satisfied` or `error`).
 *
 * Only *sender-actionable* prerequisites belong here: conditions the LP
 * provider or borrower can fix themselves before retrying (e.g. approve a
 * token, sign the RWA factory's messages). Non-actionable protocol/admin state
 * (e.g. pool is paused) is intentionally out of scope, since the user cannot
 * resolve it.
 */
export async function checkPrerequisites<P extends PluginsMap>(
  input: PreviewOperationInput<P>,
  options?: PreviewOperationOptions,
): Promise<PrerequisiteResult[]> {
  const { sdk, sender: wallet } = input;
  const tx = parseOperationCalldata(input);
  const ctx: PrerequisiteContext = {
    sdk,
    wallet,
    blockNumber: options?.blockNumber,
    value: input.value ?? 0n,
  };
  const prereqs = await buildPrerequisites(tx, ctx);
  return Promise.all(prereqs.map(p => p.verify(ctx)));
}

/**
 * Dispatches a parsed operation to the per-operation-family prerequisite
 * builders.
 */
async function buildPrerequisites(
  tx: Operation,
  ctx: PrerequisiteContext,
): Promise<Prerequisite[]> {
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
