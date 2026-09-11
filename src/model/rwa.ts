import type { Address, Hex, TypedDataDefinition } from "viem";
import type { Token } from "./primitives.js";

/**
 * Discriminant of the Securitize RWA factory contract type.
 **/
export const RWA_FACTORY_SECURITIZE = "RWA_FACTORY::SECURITIZE";

/**
 * Discriminated union of all known RWA factory contract type strings.
 **/
export const RWA_FACTORY_TYPES = [RWA_FACTORY_SECURITIZE] as const;

/**
 * String literal union of known RWA factory types.
 **/
export type RWAFactoryType = (typeof RWA_FACTORY_TYPES)[number];

/**
 * Cached registration signature for a single DSToken, stored in the
 * @see SecuritizeDegenNFT in https://github.com/Gearbox-protocol/periphery-v3
 **/
export interface SecuritizeRegisterMessage {
  /** DSToken address the signature authorises. */
  token: Address;
  /** EIP-712 deadline + raw signature bytes. */
  signature: SecuritizeSignature;
}

/**
 * Deadline-bound EIP-712 signature produced by the investor.
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
 * RWA protocols that require dedicated flows
 **/
export const RWA_PROTOCOLS = ["securitize", "midas"] as const;

/** String literal union of {@link RWA_PROTOCOLS}. */
export type RWAProtocol = (typeof RWA_PROTOCOLS)[number];

/**
 * KYC is only ever an RWA concern today, so the two names coincide.
 **/
export type KycProtocol = RWAProtocol;

/**
 * Factory-specific args for a Securitize RWA factory `multicall` /
 * `openCreditAccount`.
 **/
export interface SecuritizeOperationArgs {
  protocol: "securitize";
  /** DSToken addresses to register for this operation. */
  tokensToRegister: Address[];
  /** Cached EIP-712 registration signatures to store on-chain. */
  signaturesToCache: SecuritizeRegisterMessage[];
}

/**
 * Subset of {@link SecuritizeOpenAccountRequirements} still unfulfilled given
 * the params already carried by the transaction calldata. `undefined` there means the
 * requirements are satisfied.
 **/
export interface SecuritizeMissingOpenAccountRequirements {
  protocol: "securitize";
  /**
   * EIP-712 messages the investor still has to sign (not covered by
   * calldata-provided signatures). Once signed, they become the
   * `signaturesToCache` arg of the factory's `openCreditAccount`/`multicall`
   * calls (see {@link SecuritizeOperationArgs}).
   */
  requiredSignatures: SecuritizeRegisterVaultMessage[];
}

export interface SecuritizeOpenAccountRequirements {
  protocol: "securitize";
  /**
   * RWA Factory contract address whose `openCreditAccount`/`multicall`
   * consume `tokensToRegister` and the signatures.
   */
  factory: Address;
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

/**
 * What a wallet still has to do before a Permissioned Midas market lets it
 * open. There are no tx args: Midas grants a role off-chain.
 **/
export interface MidasOpenAccountRequirements {
  protocol: "midas";
  /** mToken the gateway greenlists wallets for. */
  token: Address;
  /** `false` until Midas grants the greenlisted role; there is nothing else to do and no tx args. */
  greenlisted: boolean;
}

/**
 * Open-account requirements for an RWA protocol, defaults to the union of all
 * protocols. Discriminated by {@link RWAProtocol}.
 **/
export type RWAOpenAccountRequirements<P extends RWAProtocol = RWAProtocol> =
  Extract<
    SecuritizeOpenAccountRequirements | MidasOpenAccountRequirements,
    { protocol: P }
  >;

/**
 * Subset of {@link RWAOpenAccountRequirements} that is still unfulfilled given
 * the params already on the transaction. Midas has none (`never`).
 **/
export type RWAMissingOpenAccountRequirements<
  P extends RWAProtocol = RWAProtocol,
> = Extract<SecuritizeMissingOpenAccountRequirements, { protocol: P }>;

/**
 * Open credit account/Multicall extra params for an RWA protocol. Midas has
 * none (`never`): accounts open through the plain facade.
 **/
export type RWAOperationArgs<P extends RWAProtocol = RWAProtocol> = Extract<
  SecuritizeOperationArgs,
  { protocol: P }
>;

/**
 * What a wallet still has to do before it may open a KYC-gated strategy —
 * the gate itself, independent of any particular wallet. `null` on a
 * strategy that is not gated.
 **/
export interface KycRequirement {
  protocol: KycProtocol;
  /**
   * Token the wallet must be registered for; `undefined` when unknown to the
   * token registry.
   **/
  token?: Token;
  /** Where the wallet completes registration with {@link protocol}. */
  registrationLink: string;
}

/**
 * Hardcoded registration URLs for each {@link RWAProtocol}.
 **/
export const KYC_REGISTRATION_LINKS: Record<RWAProtocol, string> = {
  securitize: "https://securitize.io/",
  midas: "https://form.typeform.com/to/DqZaw6kr",
};
