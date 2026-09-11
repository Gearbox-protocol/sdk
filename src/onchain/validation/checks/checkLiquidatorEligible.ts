import type {
  LiquidatorNotEligibleError,
  Token,
} from "../../../model/index.js";
import { liquidatorNotEligible } from "../../../model/index.js";

export interface LiquidatorEligibleArgs {
  eligible: boolean;
  kycProtocol?: string;
  kycToken?: Token;
}

/** The compressor's KYC check of this wallet against the liquidated assets. */
export function checkLiquidatorEligible(
  args: LiquidatorEligibleArgs,
): LiquidatorNotEligibleError[] {
  return args.eligible
    ? []
    : [liquidatorNotEligible(args.kycProtocol, args.kycToken)];
}
