import { type Address, erc20Abi } from "viem";

import { Prerequisite } from "./Prerequisite.js";
import type {
  PrerequisiteContext,
  PrerequisiteDetail,
  PrerequisiteResult,
} from "./types.js";

export interface AllowancePrerequisiteProps {
  token: Address;
  owner: Address;
  spender: Address;
  required: bigint;
  title?: string;
  id?: string;
}

/** Checks that `owner` granted `spender` an ERC-20 allowance >= `required`. */
export class AllowancePrerequisite extends Prerequisite<"allowance"> {
  readonly #id: string;
  readonly #title: string;
  readonly #detail: PrerequisiteDetail<"allowance">;

  constructor(props: AllowancePrerequisiteProps) {
    super();
    this.#id =
      props.id ?? `allowance:${props.token}:${props.owner}:${props.spender}`;
    this.#title = props.title ?? "Token approval";
    this.#detail = {
      token: props.token,
      owner: props.owner,
      spender: props.spender,
      required: props.required,
    };
  }

  public get id(): string {
    return this.#id;
  }

  public get kind(): "allowance" {
    return "allowance";
  }

  public get title(): string {
    return this.#title;
  }

  public get detail(): PrerequisiteDetail<"allowance"> {
    return this.#detail;
  }

  protected async check(
    ctx: PrerequisiteContext,
  ): Promise<PrerequisiteResult<"allowance">> {
    const actual = await ctx.sdk.client.readContract({
      address: this.#detail.token,
      abi: erc20Abi,
      functionName: "allowance",
      args: [this.#detail.owner, this.#detail.spender],
      // `undefined` lets viem read at `latest`; `blockNumber` is only set for
      // testnet forks pinned to a specific block.
      blockNumber: ctx.blockNumber,
    });
    return this.satisfiedResult(actual >= this.#detail.required, {
      ...this.#detail,
      actual,
    });
  }
}
