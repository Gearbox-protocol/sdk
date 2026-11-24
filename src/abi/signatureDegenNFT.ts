import { parseAbi, parseAbiParameters } from "viem";

export const openingSignatureParams = parseAbiParameters(
  "(address creditManager,address accountOwner,uint32 deadline,uint32 nonce,bytes signature)[]",
);
export const signatureDegenNFTAbi = parseAbi([
  "function marketConfigurator() view returns (address)",
  "function acl() view returns (address)",
  "function minSignaturesRequired() view returns (uint16)",
  "function openingDeadlines(address accountOwner,address creditManager) view returns (uint32 deadline,uint32 nonce)",
]);
export const openWithDataAbi = parseAbi([
  "function openCreditAccount(address onBehalfOf,(address target,bytes callData)[] calls,uint256 referralCode,bytes degenNFTData) payable returns (address creditAccount)",
]);
