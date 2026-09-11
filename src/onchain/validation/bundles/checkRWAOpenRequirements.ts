import type { Address } from "viem";
import {
  type RWAOpenRequirementsError,
  type RWAOperationArgs,
  rwaOpenRequirementsNotMet,
  type UnexpectedFailureError,
  unexpectedFailure,
} from "../../../model/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { toToken } from "../helpers/index.js";

export interface CheckRWAOpenRequirementsInput {
  sdk: OnchainSDK;
  wallet: Address;
  creditManager: Address;
  token: Address;
  providedArgs?: RWAOperationArgs;
}

/**
 * The degen NFT is satisfied that `wallet` may open on `token` with the
 * registration args already on the transaction.
 */
export async function checkRWAOpenRequirements(
  input: CheckRWAOpenRequirementsInput,
): Promise<(RWAOpenRequirementsError | UnexpectedFailureError)[]> {
  const { sdk, wallet, creditManager, token, providedArgs } = input;
  try {
    const suite = sdk.marketRegister.findCreditManager(creditManager);
    const nft = await suite.degenNFT();
    if (!nft) {
      return [];
    }
    const requirements = await nft.getOpenAccountRequirements(wallet, {
      tokenOutAddress: token,
    });
    const missing = nft.getMissingRequirements(requirements, providedArgs);
    if (!missing && nft.isRegistered(requirements)) {
      return [];
    }
    return [
      rwaOpenRequirementsNotMet({
        token: toToken(sdk, token),
        creditManager,
        protocol: nft.protocol,
        registrationLink: nft.registrationLink,
        requirements,
        missing,
      }),
    ];
  } catch (cause) {
    return [unexpectedFailure(cause, "read the RWA opening requirements")];
  }
}
