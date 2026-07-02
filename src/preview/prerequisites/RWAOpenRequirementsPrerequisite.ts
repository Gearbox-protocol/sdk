import type { Address, ContractFunctionParameters } from "viem";

import type { RWAOpenAccountRequirements } from "../../sdk/index.js";
import { Prerequisite } from "./Prerequisite.js";
import type { PrerequisiteDetail, PrerequisiteResult } from "./types.js";

export interface RWAOpenRequirementsPrerequisiteProps {
  /** Requirements already resolved via `sdk.accounts.getOpenAccountRequirements`. */
  requirements: RWAOpenAccountRequirements;
  /** RWA token (e.g. Securitize DSToken) the requirements were computed for. */
  token: Address;
  /** RWA factory that produced the requirements. */
  factory: Address;
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

  constructor(props: RWAOpenRequirementsPrerequisiteProps) {
    super();
    this.#id =
      props.id ?? `rwaOpenRequirements:${props.factory}:${props.token}`;
    this.#title = props.title ?? "RWA account requirements fulfilled";
    this.#detail = props.requirements;
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
   */
  #satisfied(): boolean {
    const { securitizeTokensToRegister, requiredSignatures } = this.#detail;
    return (
      securitizeTokensToRegister.length === 0 && requiredSignatures.length === 0
    );
  }
}
