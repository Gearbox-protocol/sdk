import { type Address, type ContractFunctionParameters, erc20Abi } from "viem";

import {
  type MulticallCallResult,
  Prerequisite,
  toPrerequisiteError,
} from "./Prerequisite.js";
import type { PrerequisiteDetail, PrerequisiteResult } from "./types.js";

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

  public calls(): ContractFunctionParameters[] {
    return [
      {
        address: this.#detail.token,
        abi: erc20Abi,
        functionName: "allowance",
        args: [this.#detail.owner, this.#detail.spender],
      },
    ];
  }

  public resolve(
    slice: MulticallCallResult[],
  ): PrerequisiteResult<"allowance"> {
    const res = slice[0];
    if (!res || res.status === "failure") {
      return this.errorResult(toPrerequisiteError(res?.error));
    }
    const actual = res.result as bigint;
    return this.satisfiedResult(actual >= this.#detail.required, {
      ...this.#detail,
      actual,
    });
  }
}
