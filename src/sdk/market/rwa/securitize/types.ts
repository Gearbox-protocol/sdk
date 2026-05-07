import type { Address, Hex, TypedDataDefinition } from "viem";
import type { BaseContractStateHuman } from "../../../types/index.js";
import type { RWA_FACTORY_SECURITIZE } from "./constants.js";

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
 * EIP-712 type schema for the `RegisterVault` message expected by Securitize's
 * VaultRegistrar. Matches the contract's `RegisterVault` typehash field order.
 **/
export const SECURITIZE_REGISTER_VAULT_TYPES = {
  RegisterVault: [
    { name: "investor", type: "address" },
    { name: "operator", type: "address" },
    { name: "token", type: "address" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
} as const;

/**
 * EIP-712 typed-data message that must be signed by the investor to allow the
 * RWA factory to register a credit account as a vault in Securitize's VaultRegistrar.
 *
 * Shaped as a viem {@link TypedDataDefinition} so it can be spread directly into
 * `walletClient.signTypedData({ account, ...message })`. The caller only has to
 * supply the signing `account`.
 *
 * - `domain` — EIP-712 domain from the VaultRegistrar contract.
 * - `message.investor` — investor EOA that will sign the message.
 * - `message.operator` — operator address (the DegenNFT contract).
 * - `message.token` — DSToken address to register for.
 * - `message.nonce` — monotonic nonce from VaultRegistrar `(investor, operator)`.
 * - `message.deadline` — unix timestamp after which the message is no longer valid.
 *
 * @see VaultRegistrar in https://github.com/Gearbox-protocol/periphery-v3
 **/
export type SecuritizeRegisterVaultMessage = TypedDataDefinition<
  typeof SECURITIZE_REGISTER_VAULT_TYPES,
  "RegisterVault"
>;

/**
 * Per-credit-account data decoded from the RWA compressor's
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
 * Investor-level data decoded from the RWA compressor's `getRWAInvestorData`
 * extra details for a Securitize factory.
 **/
export interface SecuritizeInvestorData {
  type: typeof RWA_FACTORY_SECURITIZE;
  /** Securitize RWA factory address that produced this data. */
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
 * Human-readable serialisation of {@link SecuritizeRWAFactory} state.
 **/
export interface SecuritizeRWAFactoryStateHuman extends BaseContractStateHuman {
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
 * Factory-specific parameters for {@link SecuritizeRWAFactory.multicall}
 * and {@link SecuritizeRWAFactory.openCreditAccount}.
 **/
export interface SecuritizeOperationParams {
  type: typeof RWA_FACTORY_SECURITIZE;
  /** DSToken addresses to register for this operation. */
  tokensToRegister: Address[];
  /** Cached EIP-712 registration signatures to store on-chain. */
  signaturesToCache: SecuritizeRegisterMessage[];
}

export interface SecuritizeOpenAccountRequirements {
  type: typeof RWA_FACTORY_SECURITIZE;
  /**
   * User must visit securitize website to register these tokens
   * May be empty if user already registered all required tokens
   */
  securitizeTokensToRegister: Address[];
  /**
   * Desired tokens to register for this operation, must be always present on open credit account
   * Come from strategy configuration
   * Passed to openCreditAccount contract call on securitize factory
   */
  tokensToRegister: Address[];
  /**
   * User must sign these messages to gearbox and provide EIP-712 signatures
   * as {@link SecuritizeRegisterMessage} to gearbox
   */
  requiredSignatures: SecuritizeRegisterVaultMessage[];
}
