import type { Address } from "viem";

import type {
  RWAMissingOpenAccountRequirements,
  RWAOpenAccountRequirements,
  RWAOperationArgs,
} from "../../sdk/index.js";
import { Prerequisite } from "./Prerequisite.js";
import type {
  PrerequisiteContext,
  PrerequisiteError,
  PrerequisiteOutcome,
} from "./types.js";

/**
 * RWA (e.g. Securitize) open-account requirements: off-chain token
 * registration and/or EIP-712 signatures the borrower must provide before
 * opening a credit account in an RWA market.
 */
export interface RWAOpenRequirementsDetail {
  /** RWA token (e.g. Securitize DSToken) the requirements are checked for. */
  token: Address;
  /** Credit manager of the RWA market. */
  creditManager: Address;
  /** RWA factory that gates the token. */
  factory: Address;
  /**
   * Full requirements fetched at verify time via
   * `sdk.accounts.getOpenAccountRequirements`; only present when the read
   * succeeded and the factory gates the token.
   */
  requirements?: RWAOpenAccountRequirements;
  /**
   * Subset of `requirements` still unfulfilled, computed by the RWA
   * factory at verify time (`IRWAFactory.getMissingRequirements`);
   * `undefined` when everything is satisfied.
   */
  missing?: RWAMissingOpenAccountRequirements;
}

export type RWAOpenRequirementsResult = PrerequisiteOutcome & {
  kind: "rwaOpenRequirements";
  detail: RWAOpenRequirementsDetail;
};

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
export class RWAOpenRequirementsPrerequisite extends Prerequisite {
  readonly #detail: RWAOpenRequirementsDetail;
  readonly #providedArgs?: RWAOperationArgs;

  constructor(
    detail: Omit<RWAOpenRequirementsDetail, "requirements" | "missing">,
    providedArgs?: RWAOperationArgs,
  ) {
    super();
    this.#detail = { ...detail };
    this.#providedArgs = providedArgs;
  }

  protected async check(
    ctx: PrerequisiteContext,
  ): Promise<RWAOpenRequirementsResult> {
    const requirements = await ctx.sdk.accounts.getOpenAccountRequirements(
      ctx.wallet,
      this.#detail.creditManager,
      { tokenOutAddress: this.#detail.token },
    );
    // No requirements means the factory does not gate this token: satisfied.
    if (!requirements) {
      return {
        kind: "rwaOpenRequirements",
        detail: this.#detail,
        satisfied: true,
      };
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
    return {
      kind: "rwaOpenRequirements",
      detail: { ...this.#detail, requirements, missing },
      satisfied:
        !missing && requirements.securitizeTokensToRegister.length === 0,
    };
  }

  protected errorResult(error: PrerequisiteError): RWAOpenRequirementsResult {
    return { kind: "rwaOpenRequirements", detail: this.#detail, error };
  }
}
