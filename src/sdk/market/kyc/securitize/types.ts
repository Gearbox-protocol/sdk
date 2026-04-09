import type { Address, Hex } from "viem";
import type { BaseContractStateHuman } from "../../../types/index.js";
import type { OpenAccountRequirements } from "../types.js";
import type { KYC_FACTORY_SECURITIZE } from "./constants.js";

export interface SecuritizeRegisterMessage {
  token: Address;
  signature: SecuritizeSignature;
}

export interface SecuritizeSignature {
  deadline: bigint;
  signature: Hex;
}

export interface SecuritizeRegisterVaultMessage {
  domain: {
    name: string;
    version: string;
    chainId: bigint;
    verifyingContract: Address;
  };
  investor: Address;
  operator: Address;
  token: Address;
  nonce: bigint;
  deadline: bigint;
}

export interface SecuritizeCreditAccountData {
  creditAccount: Address;
  wallet: Address;
  frozen: boolean;
  registeredTokens: Address[];
}

export interface SecuritizeInvestorData {
  factory: Address;
  creditAccounts: SecuritizeCreditAccountData[];
  registeredTokens: Address[];
  cachedSignatures: SecuritizeRegisterMessage[];
  registerVaultMessages: SecuritizeRegisterVaultMessage[];
}

export interface SecuritizeKYCFactoryStateHuman extends BaseContractStateHuman {
  owner: string;
  degenNFT: string;
  dsTokens: {
    addr: string;
    symbol: string;
    name: string;
    decimals: number;
    registrar: string;
    operators: string[];
  }[];
}

export interface SecuritizeOpenAccountRequirements
  extends OpenAccountRequirements {
  type: typeof KYC_FACTORY_SECURITIZE;
  /**
   * User must visit securitize website to register these tokens
   */
  tokensToRegister: Address[];
  /**
   * User must sign these messages to gearbox and provide EIP-712 signatures
   * as {@link SecuritizeRegisterMessage} to gearbox
   */
  requiredSignatures: SecuritizeRegisterVaultMessage[];
}
