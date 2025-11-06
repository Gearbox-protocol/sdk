import type { BaseState } from "../../base/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import { bytes32ToString } from "../../index.js";
import { AliasLossPolicyV310Contract } from "./AliasLossPolicyV310Contract.js";
import { LossPolicyContract } from "./LossPolicyContract.js";
import type { ILossPolicyContract } from "./types.js";

/**
 * Used get or create oracle contract instances
 * In 3.0 we can have same oracle for different pools
 * But also due to how compressor works for v3.0, each maketpriceOracle data will have different tokens (for the same oracle)
 *
 * So this method bridges multiple compressor data pieces and single oracle contract isntance
 *
 * @param sdk
 * @param data
 * @param underlying
 * @returns
 */
export function createLossPolicy(
  sdk: GearboxSDK,
  { baseParams }: BaseState,
): ILossPolicyContract {
  const existing = sdk.contracts.get(baseParams.addr);
  if (existing) {
    return existing as unknown as ILossPolicyContract;
  }
  const contractType = bytes32ToString(baseParams.contractType);

  switch (contractType) {
    case "LOSS_POLICY::ALIASED":
      return new AliasLossPolicyV310Contract(sdk, baseParams);
    case "LOSS_POLICY::DEFAULT":
      return new LossPolicyContract(sdk, baseParams);
    default:
      if (sdk.strictContractTypes) {
        throw new Error(`unsupported loss policy type ${contractType}`);
      }
      return new LossPolicyContract(sdk, baseParams);
  }
}
