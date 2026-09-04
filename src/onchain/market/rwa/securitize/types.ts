import type { Address } from "viem";
import type {
  RWA_FACTORY_SECURITIZE,
  SecuritizeRegisterMessage,
  SecuritizeRegisterVaultMessage,
} from "../../../../model/index.js";
import type { BaseContractStateHuman } from "../../../types/index.js";

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
