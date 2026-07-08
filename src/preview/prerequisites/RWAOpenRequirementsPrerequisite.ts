import type { Address } from "viem";

import type { RWAOperationArgs } from "../../sdk/index.js";
import { Prerequisite } from "./Prerequisite.js";
import type {
  PrerequisiteContext,
  PrerequisiteDetail,
  PrerequisiteResult,
} from "./types.js";

export interface RWAOpenRequirementsPrerequisiteProps {
  /** RWA token (e.g. Securitize DSToken) to check the requirements for. */
  token: Address;
  /** Credit manager of the RWA market. */
  creditManager: Address;
  /** RWA factory that gates the token. */
  factory: Address;
  /**
   * Factory-specific registration params already carried by the transaction
   * calldata. Passed through to the factory's `getMissingRequirements`: e.g.
   * signatures provided here need not be signed again, since the transaction
   * itself caches them on-chain.
   */
  providedArgs?: RWAOperationArgs;
  title?: string;
  id?: string;
}

/**
 * Checks that the borrower has fulfilled the RWA factory's open-account
 * requirements (issuer-side token registration, EIP-712 signatures).
 *
 * The requirements are fetched at verify time via
 * `sdk.accounts.getOpenAccountRequirements`, so re-running verification picks
 * up off-chain progress (the borrower registering on the issuer's website or
 * signing the factory's message) without rebuilding the prerequisites. The
 * unfulfilled subset is computed by the factory itself
 * (`IRWAFactory.getMissingRequirements`) and exposed on the result's
 * `detail.missing`; the full requirements are kept on `detail.requirements`.
 */
export class RWAOpenRequirementsPrerequisite extends Prerequisite<"rwaOpenRequirements"> {
  readonly #id: string;
  readonly #title: string;
  readonly #detail: PrerequisiteDetail<"rwaOpenRequirements">;
  readonly #providedArgs?: RWAOperationArgs;

  constructor(props: RWAOpenRequirementsPrerequisiteProps) {
    super();
    this.#id =
      props.id ?? `rwaOpenRequirements:${props.factory}:${props.token}`;
    this.#title = props.title ?? "RWA account requirements fulfilled";
    this.#detail = {
      token: props.token,
      creditManager: props.creditManager,
      factory: props.factory,
    };
    this.#providedArgs = props.providedArgs;
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

  protected async check(
    ctx: PrerequisiteContext,
  ): Promise<PrerequisiteResult<"rwaOpenRequirements">> {
    const requirements = await ctx.sdk.accounts.getOpenAccountRequirements(
      ctx.wallet,
      this.#detail.creditManager,
      { tokenOutAddress: this.#detail.token },
    );
    // No requirements means the factory does not gate this token: satisfied.
    if (!requirements) {
      return this.satisfiedResult(true, this.#detail);
    }
    const { rwaFactory } = ctx.sdk.marketRegister.findByCreditManager(
      this.#detail.creditManager,
    );
    if (!rwaFactory) {
      throw new Error(
        `no RWA factory found for credit manager ${this.#detail.creditManager}`,
      );
    }
    const missing = rwaFactory.getMissingRequirements(
      requirements,
      this.#providedArgs,
    );
    return this.satisfiedResult(
      !missing && requirements.securitizeTokensToRegister.length === 0,
      {
        ...this.#detail,
        requirements,
        missing,
      },
    );
  }
}
