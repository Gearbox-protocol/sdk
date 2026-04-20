import type { Address, Hex } from "viem";
import type { BaseContractStateHuman } from "../../../types/index.js";
import type { KYC_FACTORY_SECURITIZE } from "./constants.js";

/**
 * On-chain data about Securitize DSTokens
 **/
export interface DStokenData {
  /** DSToken address. */
  address: Address;
  /** Securitize VaultRegistrar for this token. */
  registrar: Address;
  /** Addresses authorised to register vaults for this token. */
  operators: Address[];
}

/**
 * Cached registration signature for a single DSToken, stored in the
 * @see SecuritizeDegenNFT in https://github.com/Gearbox-protocol/periphery-v3
 *
 **/
export interface SecuritizeRegisterMessage {
  /** DSToken address the signature authorises. */
  token: Address;
  /** EIP-712 deadline + raw signature bytes. */
  signature: SecuritizeSignature;
}

/**
 * Deadline-bound EIP-712 signature produced by the investor.
 *
 **/
export interface SecuritizeSignature {
  /** Unix timestamp after which the signature is no longer valid. */
  deadline: bigint;
  /** Raw EIP-712 signature bytes. */
  signature: Hex;
}

/**
 * EIP-712 typed-data message that must be signed by the investor to allow the
 * KYC factory to register a credit account as a vault in Securitize's VaultRegistrar
 * @see VaultRegistrar in https://github.com/Gearbox-protocol/periphery-v3
 *
 **/
export interface SecuritizeRegisterVaultMessage {
  /** EIP-712 domain from the VaultRegistrar contract. */
  domain: {
    name: string;
    version: string;
    chainId: bigint;
    verifyingContract: Address;
  };
  /** Investor EOA that will sign the message. */
  investor: Address;
  /** Operator address (the DegenNFT contract). */
  operator: Address;
  /** DSToken address to register for. */
  token: Address;
  /** Monotonic nonce from VaultRegistrar (investor, operator). */
  nonce: bigint;
  /** Unix timestamp after which the message is no longer valid. */
  deadline: bigint;
}

/**
 * Per-credit-account data decoded from the KYC compressor's
 * `getCreditAccountData` extra details for a Securitize factory.
 **/
export interface SecuritizeCreditAccountData {
  /** Credit account address. */
  creditAccount: Address;
  /** SecuritizeWallet proxy that owns the credit account. */
  wallet: Address;
  /** Whether the Securitize admin has frozen this account. */
  frozen: boolean;
  /** DSToken addresses where this credit account is registered as a vault. */
  registeredTokens: Address[];
}

/**
 * Investor-level data decoded from the KYC compressor's `getKYCInvestorData`
 * extra details for a Securitize factory.
 **/
export interface SecuritizeInvestorData {
  /** Securitize KYC factory address that produced this data. */
  factory: Address;
  /** Credit accounts owned by the investor through this factory. */
  creditAccounts: SecuritizeCreditAccountData[];
  /** DSToken addresses where the investor is already registered. */
  registeredTokens: Address[];
  /** Cached signatures still valid and reusable for registration. */
  cachedSignatures: SecuritizeRegisterMessage[];
  /** EIP-712 messages the investor must sign to register new vaults. */
  registerVaultMessages: SecuritizeRegisterVaultMessage[];
}

/**
 * Human-readable serialisation of {@link SecuritizeKYCFactory} state.
 **/
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

/**
 * Factory-specific parameters for {@link SecuritizeKYCFactory.multicall}
 * and {@link SecuritizeKYCFactory.openCreditAccount}.
 **/
export interface SecuritizeOperationParams {
  type: typeof KYC_FACTORY_SECURITIZE;
  /** DSToken addresses to register for this operation. */
  tokensToRegister: Address[];
  /** Cached EIP-712 registration signatures to store on-chain. */
  signaturesToCache: SecuritizeRegisterMessage[];
}

export interface SecuritizeOpenAccountRequirements {
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
