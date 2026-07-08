import {
  AssetsMap,
  type GetApprovalAddressProps,
  type OnchainSDK,
} from "../../sdk/index.js";
import type { InnerOperation } from "../parse/index.js";
import { allowanceAndBalance } from "./helpers.js";
import type { AnyPrerequisite } from "./Prerequisite.js";
import type { PrerequisiteContext } from "./types.js";

/**
 * For every `addCollateral` inside a multicall, requires the wallet to approve
 * and hold the collateral token for the collateral spender.
 *
 * The approval spender is resolved via {@link OnchainSDK.accounts.getApprovalAddress}:
 * the credit manager for classic markets, but a per-investor "special wallet"
 * for RWA markets. The resolution happens at build time because the spender is
 * part of the prerequisite's identity and UI detail.
 */
export async function buildCollateralPrerequisites(
  spenderOptions: GetApprovalAddressProps,
  multicall: InnerOperation[],
  ctx: PrerequisiteContext,
): Promise<AnyPrerequisite[]> {
  const { sdk, wallet } = ctx;
  const required = new AssetsMap();
  for (const op of multicall) {
    if (op.operation !== "AddCollateral" || op.amount === 0n) {
      continue;
    }
    required.inc(op.token, op.amount);
  }

  if (required.size === 0) {
    return [];
  }

  const spender = await sdk.accounts.getApprovalAddress(spenderOptions);

  const prereqs: AnyPrerequisite[] = [];
  for (const [token, amount] of required.entries()) {
    prereqs.push(
      ...allowanceAndBalance({
        token,
        owner: wallet,
        spender,
        required: amount,
        allowanceTitle: "Collateral approved",
        balanceTitle: "Sufficient collateral balance",
      }),
    );
  }
  return prereqs;
}
