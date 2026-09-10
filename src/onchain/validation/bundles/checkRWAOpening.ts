import type { Address } from "viem";
import type {
  OpenStrategyPositionPreview,
  RWAOpenRequirementsError,
  UnexpectedFailureError,
} from "../../../model/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { AddressSet } from "../../utils/AddressSet.js";
import { checkRWAOpenRequirements } from "./checkRWAOpenRequirements.js";

export interface CheckRWAOpeningInput {
  sdk: OnchainSDK;
  preview: OpenStrategyPositionPreview;
  sender: Address;
}

/**
 * Per KYC-gated token among `collateralAdded ∪ quotas`, whether the
 * borrower still has to register or sign before this opening can land.
 */
export async function checkRWAOpening(
  input: CheckRWAOpeningInput,
): Promise<(RWAOpenRequirementsError | UnexpectedFailureError)[]> {
  const { sdk, preview, sender } = input;
  const nft = await sdk.marketRegister
    .findCreditManager(preview.creditManager)
    .degenNFT();
  if (!nft) {
    return [];
  }

  const gated = new AddressSet(await nft.getTokens());
  const candidates = new AddressSet([
    ...preview.collateralAdded.map(a => a.token.address),
    ...preview.quotas.map(q => q.token.address),
  ]);
  const providedArgs =
    preview.operation === "RWAOpenCreditAccount" ? preview.rwaArgs : undefined;

  const results = await Promise.all(
    [...candidates]
      .filter(token => gated.has(token))
      .map(token =>
        checkRWAOpenRequirements({
          sdk,
          wallet: sender,
          creditManager: preview.creditManager,
          token,
          providedArgs,
        }),
      ),
  );
  return results.flat();
}
