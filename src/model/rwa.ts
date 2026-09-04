import type { Address, Hex, TypedDataDefinition } from "viem";

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
 * Factory-specific args for a Securitize RWA factory `multicall` /
 * `openCreditAccount`.
 **/
export interface SecuritizeOperationArgs {
  type: typeof RWA_FACTORY_SECURITIZE;
  /** DSToken addresses to register for this operation. */
  tokensToRegister: Address[];
  /** Cached EIP-712 registration signatures to store on-chain. */
  signaturesToCache: SecuritizeRegisterMessage[];
}

/**
 * Subset of {@link SecuritizeOpenAccountRequirements} still unfulfilled given
 * the params already carried by the transaction calldata. Returned by
 * `SecuritizeRWAFactory.getMissingRequirements`; `undefined` there means the
 * requirements are satisfied.
 **/
export interface SecuritizeMissingOpenAccountRequirements {
  type: typeof RWA_FACTORY_SECURITIZE;
  /**
   * EIP-712 messages the investor still has to sign (not covered by
   * calldata-provided signatures). Once signed, they become the
   * `signaturesToCache` arg of the factory's `openCreditAccount`/`multicall`
   * calls (see {@link SecuritizeOperationArgs}).
   */
  requiredSignatures: SecuritizeRegisterVaultMessage[];
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

/**
 * Open-account requirements for a RWA factory, defaults to union of all factory types.
 * Can be discriminated by type.
 **/
export type RWAOpenAccountRequirements<
  T extends RWAFactoryType = RWAFactoryType,
> = Extract<SecuritizeOpenAccountRequirements, { type: T }>;

/**
 * Subset of {@link RWAOpenAccountRequirements} that is still unfulfilled,
 * defaults to union of all factory types.
 * Can be discriminated by type.
 **/
export type RWAMissingOpenAccountRequirements<
  T extends RWAFactoryType = RWAFactoryType,
> = Extract<SecuritizeMissingOpenAccountRequirements, { type: T }>;

/**
 * Open credit account/Multicall extra params type for a RWA factory, defaults to union of all factory types.
 * Can be discriminated by type.
 **/
export type RWAOperationArgs<T extends RWAFactoryType = RWAFactoryType> =
  Extract<SecuritizeOperationArgs, { type: T }>;
