import type { Address, Hex } from "viem";

export interface OpeningSignature {
  creditManager: Address;
  accountOwner: Address;
  deadline: number;
  nonce: number;
  signature: Hex;
}

export interface OpeningApproval {
  chainId: number;
  degenNFT: Address;
  signatures: readonly OpeningSignature[];
}

export interface RequiredOpeningApproval {
  status: "signaturesRequired";
  chainId: number;
  creditManager: Address;
  accountOwner: Address;
  degenNFT: Address;
  marketConfigurator: Address;
  nonce: number;
  minSignaturesRequired: number;
  authorizedSigners: readonly Address[];
}

export type OpeningApprovalRequirement =
  | { status: "notRequired" }
  | RequiredOpeningApproval;

/** JSON response from a SignatureDegenNFT signing endpoint. */
export interface OpeningSignerResponse extends OpeningSignature {
  signer: Address;
  degenNFT: Address;
  digest: Hex;
}
