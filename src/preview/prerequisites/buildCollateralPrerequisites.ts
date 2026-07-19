import { isAddressEqual } from "viem";
import {
  AP_WETH_TOKEN,
  AssetsMap,
  type GetApprovalAddressProps,
  NATIVE_ADDRESS,
  NO_VERSION,
  type OnchainSDK,
} from "../../sdk/index.js";
import type { InnerOperation } from "../parse/index.js";
import { AllowancePrerequisite } from "./AllowancePrerequisite.js";
import { BalancePrerequisite } from "./BalancePrerequisite.js";
import { allowanceAndBalance } from "./helpers.js";
import type { Prerequisite } from "./Prerequisite.js";
import type { PrerequisiteContext } from "./types.js";

/**
 * For every `addCollateral` inside a multicall, requires the wallet to approve
 * and hold the collateral token for the collateral spender.
 *
 * The approval spender is resolved via {@link OnchainSDK.accounts.getApprovalAddress}:
 * the credit manager for classic markets, but a per-investor "special wallet"
 * for RWA markets. The resolution happens at build time because the spender is
 * part of the prerequisite's identity and UI detail.
 *
 */
export async function buildCollateralPrerequisites(
  spenderOptions: GetApprovalAddressProps,
  multicall: InnerOperation[],
  ctx: PrerequisiteContext,
): Promise<Prerequisite[]> {
  const { sdk, wallet, value = 0n } = ctx;
  const required = new AssetsMap();
  for (const op of multicall) {
    if (op.operation !== "AddCollateral" || op.amount === 0n) {
      continue;
    }
    required.inc(op.token, op.amount);
  }

  if (required.size === 0 && value === 0n) {
    return [];
  }

  const prereqs: Prerequisite[] = [];
  if (value > 0n) {
    // The attached value must be held as native ETH regardless of how much of
    // it ends up as WETH collateral.
    prereqs.push(
      new BalancePrerequisite({
        token: NATIVE_ADDRESS,
        owner: wallet,
        required: value,
      }),
    );
  }

  if (required.size === 0) {
    return prereqs;
  }

  const spender = await sdk.accounts.getApprovalAddress(spenderOptions);
  const weth = sdk.addressProvider.getAddress(AP_WETH_TOKEN, NO_VERSION);

  for (const [token, amount] of required.entries()) {
    if (value > 0n && isAddressEqual(token, weth)) {
      prereqs.push(
        new AllowancePrerequisite({
          token,
          owner: wallet,
          spender,
          required: amount,
        }),
      );
      // `msg.value` is wrapped into WETH for the caller before `addCollateral`
      // pulls it, so only the remainder must already be held as WETH.
      if (amount > value) {
        prereqs.push(
          new BalancePrerequisite({
            token,
            owner: wallet,
            required: amount - value,
          }),
        );
      }
      continue;
    }
    prereqs.push(
      ...allowanceAndBalance({
        token,
        owner: wallet,
        spender,
        required: amount,
      }),
    );
  }
  return prereqs;
}
