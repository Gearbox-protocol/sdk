import { type Address, erc20Abi } from "viem";

import { Prerequisite } from "./Prerequisite.js";
import type {
  PrerequisiteContext,
  PrerequisiteError,
  PrerequisiteOutcome,
} from "./types.js";

/** ERC-20 allowance from `owner` to `spender` must cover `required`. */
export interface AllowanceDetail {
  token: Address;
  owner: Address;
  spender: Address;
  required: bigint;
  /** On-chain allowance read; only present when the read succeeded. */
  actual?: bigint;
}

export type AllowanceResult = PrerequisiteOutcome & {
  kind: "allowance";
  detail: AllowanceDetail;
};

/** Checks that `owner` granted `spender` an ERC-20 allowance >= `required`. */
export class AllowancePrerequisite extends Prerequisite {
  readonly #detail: AllowanceDetail;

  constructor(detail: Omit<AllowanceDetail, "actual">) {
    super();
    this.#detail = { ...detail };
  }

  protected async check(ctx: PrerequisiteContext): Promise<AllowanceResult> {
    const actual = await ctx.sdk.client.readContract({
      address: this.#detail.token,
      abi: erc20Abi,
      functionName: "allowance",
      args: [this.#detail.owner, this.#detail.spender],
      // `undefined` lets viem read at `latest`; `blockNumber` is only set for
      // testnet forks pinned to a specific block.
      blockNumber: ctx.blockNumber,
    });
    return {
      kind: "allowance",
      detail: { ...this.#detail, actual },
      satisfied: actual >= this.#detail.required,
    };
  }

  protected errorResult(error: PrerequisiteError): AllowanceResult {
    return { kind: "allowance", detail: this.#detail, error };
  }
}
