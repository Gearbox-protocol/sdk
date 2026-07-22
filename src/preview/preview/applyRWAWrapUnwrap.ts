import { type Address, decodeFunctionData, type Hex } from "viem";
import { ierc4626AdapterAbi } from "../../abi/ierc4626Adapter.js";
import type { ERC4626AdapterContract } from "../../plugins/adapters/index.js";
import type { AssetsMap } from "../../sdk/index.js";

/** Resolved conversion: `amountIn` of `tokenIn` into `tokenOut`. */
interface WrapUnwrap {
  tokenIn: Address;
  tokenOut: Address;
  amountIn: bigint;
}

/**
 * Maps the decoded adapter call to the conversion it performs. Diff variants
 * spend the running balance down to the calldata leftover, so their input
 * amount comes from `balances`. Returns `undefined` for functions we do not
 * handle (`mint`/`withdraw` are never emitted by the RWA flows).
 */
function resolveWrapUnwrap(
  adapter: ERC4626AdapterContract,
  calldata: Hex,
  balances: AssetsMap,
): WrapUnwrap | undefined {
  const decoded = decodeFunctionData({
    abi: ierc4626AdapterAbi,
    data: calldata,
  });
  const { asset, share } = adapter;

  switch (decoded.functionName) {
    case "deposit":
      return { tokenIn: asset, tokenOut: share, amountIn: decoded.args[0] };
    case "depositDiff": {
      const [leftoverAmount] = decoded.args;
      const running = balances.getOrZero(asset);
      return {
        tokenIn: asset,
        tokenOut: share,
        amountIn: running > leftoverAmount ? running - leftoverAmount : 0n,
      };
    }
    case "redeem":
      return { tokenIn: share, tokenOut: asset, amountIn: decoded.args[0] };
    case "redeemDiff": {
      const [leftoverAmount] = decoded.args;
      const running = balances.getOrZero(share);
      return {
        tokenIn: share,
        tokenOut: asset,
        amountIn: running > leftoverAmount ? running - leftoverAmount : 0n,
      };
    }
    default:
      return undefined;
  }
}

/**
 * Applies an RWA wrap/unwrap adapter call (ERC4626 `deposit`/`redeem` and
 * their diff variants, as emitted by `CreditAccountsServiceV310`) to the
 * running credit-account balances.
 *
 * RWA underlyings always convert 1-to-1 with their vault asset, so the
 * counterpart amount equals the input amount and no on-chain preview read is
 * needed.
 */
export function applyRWAWrapUnwrap(
  adapter: ERC4626AdapterContract,
  calldata: Hex,
  balances: AssetsMap,
): void {
  const resolved = resolveWrapUnwrap(adapter, calldata, balances);
  if (!resolved) {
    return;
  }
  const { tokenIn, tokenOut, amountIn } = resolved;
  if (amountIn === 0n) {
    // Diff call with nothing to spend: the adapter skips the vault call.
    return;
  }
  balances.dec(tokenIn, amountIn);
  balances.inc(tokenOut, amountIn);
}
