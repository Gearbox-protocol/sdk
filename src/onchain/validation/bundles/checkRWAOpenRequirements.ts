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
  providedArgs: RWAOperationArgs;
}

/**
 * The RWA factory is satisfied that `wallet` may open on `token` with the
 * registration args already on the transaction.
 */
export async function checkRWAOpenRequirements(
  input: CheckRWAOpenRequirementsInput,
): Promise<(RWAOpenRequirementsError | UnexpectedFailureError)[]> {
  const { sdk, wallet, creditManager, token, providedArgs } = input;
  try {
    const requirements = await sdk.accounts.getOpenAccountRequirements(
      wallet,
      creditManager,
      { tokenOutAddress: token },
    );
    if (!requirements) {
      return [];
    }
    const { rwaFactory } =
      sdk.marketRegister.findByCreditManager(creditManager);
    if (!rwaFactory) {
      throw new Error(`no RWA factory for credit manager ${creditManager}`);
    }
    const missing = rwaFactory.getMissingRequirements(
      requirements,
      providedArgs,
    );
    if (!missing && requirements.securitizeTokensToRegister.length === 0) {
      return [];
    }
    return [
      rwaOpenRequirementsNotMet({
        token: toToken(sdk, token),
        creditManager,
        factory: rwaFactory.address,
        requirements,
        ...(missing === undefined ? {} : { missing }),
      }),
    ];
  } catch (cause) {
    return [unexpectedFailure(cause, "read the RWA opening requirements")];
  }
}
