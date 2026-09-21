import type { Address } from "viem";
import type { ConvertFn } from "../../../market/oracle/types.js";
import type { OnchainSDK } from "../../../OnchainSDK.js";
import { eq, toTargetDecimals } from "./common.js";

/**
 * Amount conversion for a market whose RWA backing asset may have no oracle
 * feed. Its registered compliance wrapper converts 1:1, with decimal rescaling;
 * conversions to other tokens use the wrapper's oracle price. This does not
 * change oracle feeds, liquidation thresholds, or collateral eligibility.
 */
export function withRwaConversion(
  convert: ConvertFn,
  underlying: Address,
  sdk: OnchainSDK,
): ConvertFn {
  const asset = sdk.tokensMeta.rwaUnderlyings.get(underlying)?.asset;
  if (!asset) return convert;

  return (from, to, amount) => {
    if (eq(from, to)) return amount;
    const fromAsset = eq(from, asset);
    const toAsset = eq(to, asset);
    const source = fromAsset ? underlying : from;
    const target = toAsset ? underlying : to;
    const input = fromAsset
      ? toTargetDecimals(amount, from, underlying, sdk)
      : amount;
    const output = eq(source, target) ? input : convert(source, target, input);
    return toAsset ? toTargetDecimals(output, underlying, to, sdk) : output;
  };
}
