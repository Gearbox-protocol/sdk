import type { Address, ContractFunctionParameters } from "viem";

import {
  hexEq,
  type RWAOpenAccountRequirements,
  type RWAOperationParams,
} from "../../sdk/index.js";
import { Prerequisite } from "./Prerequisite.js";
import type { PrerequisiteDetail, PrerequisiteResult } from "./types.js";

export interface RWAOpenRequirementsPrerequisiteProps {
  /** Requirements already resolved via `sdk.accounts.getOpenAccountRequirements`. */
  requirements: RWAOpenAccountRequirements;
  /** RWA token (e.g. Securitize DSToken) the requirements were computed for. */
  token: Address;
  /** RWA factory that produced the requirements. */
  factory: Address;
  /**
   * Registration params (`tokensToRegister`/`signaturesToCache`) already
   * carried by the transaction calldata. Signatures provided here count
   * towards the `requiredSignatures` requirement: the transaction itself
   * caches them on-chain, so the borrower has nothing left to sign.
   */
  provided?: RWAOperationParams;
  title?: string;
  id?: string;
}

/**
 * Checks that the borrower has fulfilled the RWA factory's open-account
 * requirements (issuer-side token registration, EIP-712 signatures).
 *
 * Unlike `allowance`/`balance`, the requirements cannot be derived from plain
 * ERC-20 multicall reads: they come from an async compressor read performed by
 * `sdk.accounts.getOpenAccountRequirements`. The prerequisite is therefore
 * *pre-resolved*: it is constructed with the requirements already computed,
 * contributes no calls to the verification multicall, and `resolve` only
 * interprets the stored payload.
 */
export class RWAOpenRequirementsPrerequisite extends Prerequisite<"rwaOpenRequirements"> {
  readonly #id: string;
  readonly #title: string;
  readonly #detail: PrerequisiteDetail<"rwaOpenRequirements">;
  readonly #provided?: RWAOperationParams;

  constructor(props: RWAOpenRequirementsPrerequisiteProps) {
    super();
    this.#id =
      props.id ?? `rwaOpenRequirements:${props.factory}:${props.token}`;
    this.#title = props.title ?? "RWA account requirements fulfilled";
    this.#detail = props.requirements;
    this.#provided = props.provided;
  }

  public get id(): string {
    return this.#id;
  }

  public get kind(): "rwaOpenRequirements" {
    return "rwaOpenRequirements";
  }

  public get title(): string {
    return this.#title;
  }

  public get detail(): PrerequisiteDetail<"rwaOpenRequirements"> {
    return this.#detail;
  }

  /** Pre-resolved: no on-chain reads to contribute. */
  public calls(): ContractFunctionParameters[] {
    return [];
  }

  public resolve(): PrerequisiteResult<"rwaOpenRequirements"> {
    return this.satisfiedResult(this.#satisfied(), this.#detail);
  }

  /**
   * Satisfied when the borrower has nothing left to do: no tokens pending
   * issuer-side registration and no messages left to sign.
   *
   * Issuer-side registration (`securitizeTokensToRegister`) can only happen on
   * the Securitize website, so calldata cannot fulfil it. A required signature,
   * however, is fulfilled when the transaction's own `signaturesToCache`
   * carries a non-expired signature for the same token: the transaction caches
   * it on-chain as part of the operation.
   */
  #satisfied(): boolean {
    const { securitizeTokensToRegister, requiredSignatures } = this.#detail;
    if (securitizeTokensToRegister.length > 0) {
      return false;
    }
    return requiredSignatures.every(m =>
      this.#hasProvidedSignature(m.message.token),
    );
  }

  /**
   * Whether the transaction calldata carries a non-expired registration
   * signature for the given token.
   */
  #hasProvidedSignature(token: Address): boolean {
    const provided = this.#provided?.signaturesToCache ?? [];
    const now = BigInt(Math.floor(Date.now() / 1000));
    return provided.some(
      s => hexEq(s.token, token) && s.signature.deadline > now,
    );
  }
}
