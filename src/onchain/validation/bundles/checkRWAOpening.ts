import type { Address } from "viem";
import type {
  AccountNotMidasGreenlistedError,
  OpenStrategyPositionPreview,
  RWAOpenRequirementsError,
  UnexpectedFailureError,
} from "../../../model/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { AddressSet } from "../../utils/AddressSet.js";
import { checkMidasAccountGreenlist } from "./checkMidasAccountGreenlist.js";
import { checkRWAOpenRequirements } from "./checkRWAOpenRequirements.js";

export interface CheckRWAOpeningInput {
  sdk: OnchainSDK;
  preview: OpenStrategyPositionPreview;
  sender: Address;
}

export type RWAOpeningError =
  | RWAOpenRequirementsError
  | AccountNotMidasGreenlistedError
  | UnexpectedFailureError;

/**
 * Per KYC-gated token among `collateralAdded ∪ quotas`, whether the
 * borrower still has to register or sign before this opening can land,
 * and whether a Midas credit account may hold the mToken.
 */
export async function checkRWAOpening(
  input: CheckRWAOpeningInput,
): Promise<RWAOpeningError[]> {
  const { sdk, preview, sender } = input;
  const nft = await sdk.marketRegister
    .findCreditManager(preview.creditManager)
    .degenNFT();
  if (!nft) {
    return [];
  }

  const nftTokens = new AddressSet(await nft.getTokens());
  let candidates = new AddressSet([
    ...preview.collateralAdded.map(a => a.token.address),
    ...preview.quotas.map(q => q.token.address),
  ]).asArray();
  candidates = candidates.filter(token => nftTokens.has(token));

  // Reachable only from the Midas empty-account flow: opening empty credit account
  // still checks midas greenlist via degen NFT. A reopen runs
  // through `multicall`, which burns nothing, so it is left out.
  let tokensToCheck = candidates;
  if (
    tokensToCheck.length === 0 &&
    !preview.creditAccount &&
    nft.protocol === "midas"
  ) {
    tokensToCheck = nftTokens.asArray();
  }

  const results = await Promise.all([
    ...tokensToCheck.map(token =>
      // check requirements on borrower's wallet address
      checkRWAOpenRequirements({
        sdk,
        wallet: sender,
        creditManager: preview.creditManager,
        token,
        providedArgs: preview.rwaArgs,
      }),
    ),
    // check requirements on credit account address (midas only)
    checkMidasAccountGreenlist({
      sdk,
      preview,
      nft,
      tokens: candidates,
    }),
  ]);
  return results.flat();
}
