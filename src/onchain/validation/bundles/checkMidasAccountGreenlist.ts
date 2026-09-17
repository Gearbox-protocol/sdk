import type { Address } from "viem";
import {
  type AccountNotMidasGreenlistedError,
  accountNotMidasGreenlisted,
  type OpenStrategyPositionPreview,
  type UnexpectedFailureError,
  unexpectedFailure,
} from "../../../model/index.js";
import type { IDegenNFT } from "../../market/rwa/types.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { toToken } from "../helpers/index.js";

export interface CheckMidasAccountGreenlistInput {
  sdk: OnchainSDK;
  preview: OpenStrategyPositionPreview;
  nft: IDegenNFT;
  /** Tokens that the degen NFT lists and that are in operation. */
  tokens: readonly Address[];
}

/**
 * Whether the credit account already holds the Midas greenlisted role
 * this permissioned mToken requires of its holder.
 */
export async function checkMidasAccountGreenlist(
  input: CheckMidasAccountGreenlistInput,
): Promise<(AccountNotMidasGreenlistedError | UnexpectedFailureError)[]> {
  const { sdk, preview, nft, tokens } = input;
  if (nft.protocol !== "midas") {
    return [];
  }
  // `midasGreenlistsAccount` means the multicall includes receiveGreenlist(),
  // not that the role is actually granted. mGLOBAL's gateway cannot grant it.
  // if (preview.midasGreenlistsAccount) {
  //   return [];
  // }
  if (tokens.length === 0) {
    return [];
  }
  const account = preview.creditAccount;
  // A freshly created account starts without the Midas greenlisted role.
  if (!account) {
    return tokens.map(token =>
      accountNotMidasGreenlisted({
        token: toToken(sdk, token),
        creditManager: preview.creditManager,
      }),
    );
  }
  // existing account needs to be greenlisted for the tokens in operation
  const results = await Promise.all(
    tokens.map(token =>
      checkAccountRole({ sdk, nft, account, token, preview }),
    ),
  );
  return results.flat();
}

interface CheckAccountRoleInput {
  sdk: OnchainSDK;
  nft: IDegenNFT;
  account: Address;
  token: Address;
  preview: OpenStrategyPositionPreview;
}

async function checkAccountRole(
  input: CheckAccountRoleInput,
): Promise<(AccountNotMidasGreenlistedError | UnexpectedFailureError)[]> {
  const { sdk, nft, account, token, preview } = input;
  try {
    // Passing an account to a parameter the interface names `wallet` is
    // legal only under the Midas guard above: MidasDegenNFT reads
    // hasRole(role, addr) for whatever address it is handed, and the role
    // is checked on the mToken holder, which is the credit account.
    const requirements = await nft.getOpenAccountRequirements(account, {
      tokenOutAddress: token,
    });
    if (nft.isRegistered(requirements)) {
      return [];
    }
    return [
      accountNotMidasGreenlisted({
        token: toToken(sdk, token),
        creditManager: preview.creditManager,
        creditAccount: account,
      }),
    ];
  } catch (cause) {
    return [unexpectedFailure(cause, "read the Midas account greenlist")];
  }
}
