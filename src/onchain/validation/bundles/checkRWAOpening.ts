import type { Address } from "viem";
import type {
  OpenRWAStrategyPositionPreview,
  RWAOpenRequirementsError,
  UnexpectedFailureError,
} from "../../../model/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { AddressSet } from "../../utils/AddressSet.js";
import { checkRWAOpenRequirements } from "./checkRWAOpenRequirements.js";

export interface CheckRWAOpeningInput {
  sdk: OnchainSDK;
  preview: OpenRWAStrategyPositionPreview;
  sender: Address;
}

/**
 * Per factory-gated token among `collateralAdded ∪ quotas`, whether the
 * borrower still has to register or sign before this opening can land.
 */
export async function checkRWAOpening(
  input: CheckRWAOpeningInput,
): Promise<(RWAOpenRequirementsError | UnexpectedFailureError)[]> {
  const { sdk, preview, sender } = input;
  const { rwaFactory } = sdk.marketRegister.findByCreditManager(
    preview.creditManager,
  );
  if (!rwaFactory) {
    return [];
  }

  const gated = new AddressSet(rwaFactory.getTokens());
  const candidates = new AddressSet([
    ...preview.collateralAdded.map(a => a.token.address),
    ...preview.quotas.map(q => q.token.address),
  ]);

  const results = await Promise.all(
    [...candidates]
      .filter(token => gated.has(token))
      .map(token =>
        checkRWAOpenRequirements({
          sdk,
          wallet: sender,
          creditManager: preview.creditManager,
          token,
          providedArgs: preview.rwaArgs,
        }),
      ),
  );
  return results.flat();
}
