import {
  type Address,
  decodeAbiParameters,
  isAddressEqual,
  toFunctionSelector,
} from "viem";
import type { CallTrace } from "./internal-types.js";
import { resolveProtocolCall } from "./trace-utils.js";

/**
 * Selector of `IPhantomTokenWithdrawer.withdrawPhantomToken(address,uint256)`.
 *
 * The facade synthesizes a call with this selector to an adapter while
 * processing `withdrawCollateral` on a phantom token (see
 * {@link isSynthesizedPhantomWithdrawal}).
 */
const WITHDRAW_PHANTOM_TOKEN_SELECTOR = toFunctionSelector(
  "withdrawPhantomToken(address,uint256)",
);

/**
 * Selector of `IPhantomToken.getPhantomTokenInfo()`.
 *
 * The facade probes a token with this STATICCALL before synthesizing a
 * `withdrawPhantomToken` adapter call (see {@link isSynthesizedPhantomWithdrawal}).
 */
const GET_PHANTOM_TOKEN_INFO_SELECTOR = toFunctionSelector(
  "getPhantomTokenInfo()",
);

/**
 * Tells whether the `index`-th direct child of a facade call frame is a
 * facade-synthesized phantom-token withdrawal rather than a user multicall
 * adapter call.
 *
 * When a multicall `withdrawCollateral` targets a phantom token, the facade's
 * `_tryWithdrawPhantomToken` first probes the token with a
 * `getPhantomTokenInfo()` STATICCALL and, only on success, synthesizes a
 * `withdrawPhantomToken(token, amount)` adapter call. Both appear as sibling
 * direct children of the facade frame, in that order. A genuine user multicall
 * call to `withdrawPhantomToken` is routed straight through `_externalCall`
 * with no such facade-issued probe, so an earlier sibling `getPhantomTokenInfo()`
 * STATICCALL to the same token uniquely identifies the synthesized conversion.
 *
 * @param siblings - Direct children of the facade call frame, in trace order.
 * @param index - Index of the candidate call within `siblings`.
 */
function isSynthesizedPhantomWithdrawal(
  siblings: CallTrace[],
  index: number,
): boolean {
  const node = siblings[index];
  if (
    node.type !== "CALL" ||
    node.input.slice(0, 10).toLowerCase() !== WITHDRAW_PHANTOM_TOKEN_SELECTOR
  ) {
    return false;
  }
  const [token] = decodeAbiParameters(
    [{ type: "address" }, { type: "uint256" }],
    `0x${node.input.slice(10)}`,
  );
  for (let i = 0; i < index; i++) {
    const sib = siblings[i];
    if (
      sib.type === "STATICCALL" &&
      sib.input.slice(0, 10).toLowerCase() ===
        GET_PHANTOM_TOKEN_INFO_SELECTOR &&
      isAddressEqual(sib.to, token as Address)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Extracts the user multicall's adapter-level call traces from a single facade
 * call trace.
 *
 * Returns the direct children of the facade trace that perform an external
 * protocol call (their subtree resolves to a `CreditManager.execute(bytes)`
 * that reaches a leaf CALL to a target contract), in trace order.
 *
 * Scoping to direct children of the facade trace (rather than flattening the
 * whole subtree) avoids over-counting in nested credit-manager scenarios such
 * as account migration, where a single migrate-adapter subtree nests another
 * account's `execute(bytes)` calls.
 *
 * Facade-synthesized phantom-token withdrawals are excluded: while processing
 * `withdrawCollateral` on a phantom token the facade issues its own
 * `withdrawPhantomToken` adapter call, which also reaches an external target
 * but does not correspond to a user multicall inner call. These are detected
 * via the preceding `getPhantomTokenInfo()` probe (see
 * {@link isSynthesizedPhantomWithdrawal}), so the returned traces line up 1:1,
 * in order, with the multicall's adapter inner calls.
 */
export function extractAdapterCallTraces(facadeTrace: CallTrace): CallTrace[] {
  const subtraces = facadeTrace.calls ?? [];
  return subtraces.filter(
    (sub, index) =>
      resolveProtocolCall(sub) !== undefined &&
      !isSynthesizedPhantomWithdrawal(subtraces, index),
  );
}
