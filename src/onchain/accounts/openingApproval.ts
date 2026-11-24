import type { Address, Hex } from "viem";
import {
  BaseError,
  ContractFunctionRevertedError,
  ContractFunctionZeroDataError,
  isAddressEqual,
  parseAbi,
  stringToHex,
  zeroAddress,
} from "viem";
import { iVersionAbi } from "../../abi/iVersion.js";
import { signatureDegenNFTAbi } from "../../abi/signatureDegenNFT.js";
import type { OpeningApprovalRequirement } from "../../model/openingApproval.js";
import { UnsupportedOpeningApprovalError } from "../market/credit/errors.js";
import type { OnchainSDK } from "../OnchainSDK.js";

export async function openingApprovalRequirement(
  sdk: OnchainSDK,
  creditManager: Address,
  accountOwner: Address,
): Promise<OpeningApprovalRequirement> {
  const suite = sdk.marketRegister.findCreditManager(creditManager);
  const { degenNFT, version } = suite.creditFacade;
  if (isAddressEqual(degenNFT, zeroAddress)) return { status: "notRequired" };
  const blockNumber = await sdk.client.getBlockNumber({ cacheTime: 0 });
  let contractType: Hex;
  try {
    contractType = await sdk.client.readContract({
      blockNumber,
      address: degenNFT,
      abi: iVersionAbi,
      functionName: "contractType",
    });
  } catch (cause) {
    // Older NFTs may omit contractType(). An RPC failure must reach the caller.
    if (
      cause instanceof BaseError &&
      cause.walk(
        error =>
          error instanceof ContractFunctionRevertedError ||
          error instanceof ContractFunctionZeroDataError,
      )
    ) {
      return { status: "notRequired" };
    }
    throw cause;
  }
  if (contractType !== stringToHex("DEGEN_NFT::SIGNATURE", { size: 32 }))
    return { status: "notRequired" };
  if (version < 311 || suite.rwaFactory)
    throw new UnsupportedOpeningApprovalError(suite.creditFacade.address);
  const base = { address: degenNFT, abi: signatureDegenNFTAbi } as const;
  const [[, nonce], marketConfigurator, acl, minSignaturesRequired] =
    await sdk.client.multicall({
      blockNumber,
      allowFailure: false,
      contracts: [
        {
          ...base,
          functionName: "openingDeadlines",
          args: [accountOwner, creditManager],
        },
        { ...base, functionName: "marketConfigurator" },
        { ...base, functionName: "acl" },
        { ...base, functionName: "minSignaturesRequired" },
      ],
    });
  const authorizedSigners = await sdk.client.readContract({
    blockNumber,
    address: acl,
    abi: parseAbi([
      "function getRoleHolders(bytes32 role) view returns (address[])",
    ]),
    functionName: "getRoleHolders",
    args: [stringToHex("OPENING_SIGNER", { size: 32 })],
  });
  return {
    status: "signaturesRequired",
    chainId: sdk.chainId,
    creditManager,
    accountOwner,
    degenNFT,
    marketConfigurator,
    nonce: nonce + 1,
    minSignaturesRequired,
    authorizedSigners,
  };
}
