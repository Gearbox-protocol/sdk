import { type Address, type ContractFunctionParameters, erc20Abi } from "viem";

import {
  type MulticallCallResult,
  Prerequisite,
  toPrerequisiteError,
} from "./Prerequisite.js";
import type { PrerequisiteDetail, PrerequisiteResult } from "./types.js";

export interface BalancePrerequisiteProps {
  token: Address;
  owner: Address;
  required: bigint;
  title?: string;
  id?: string;
}

/** Checks that `owner` holds an ERC-20 balance >= `required`. */
export class BalancePrerequisite extends Prerequisite<"balance"> {
  readonly #id: string;
  readonly #title: string;
  readonly #detail: PrerequisiteDetail<"balance">;

  constructor(props: BalancePrerequisiteProps) {
    super();
    this.#id = props.id ?? `balance:${props.token}:${props.owner}`;
    this.#title = props.title ?? "Sufficient balance";
    this.#detail = {
      token: props.token,
      owner: props.owner,
      required: props.required,
    };
  }

  public get id(): string {
    return this.#id;
  }

  public get kind(): "balance" {
    return "balance";
  }

  public get title(): string {
    return this.#title;
  }

  public get detail(): PrerequisiteDetail<"balance"> {
    return this.#detail;
  }

  public calls(): ContractFunctionParameters[] {
    return [
      {
        address: this.#detail.token,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [this.#detail.owner],
      },
    ];
  }

  public resolve(slice: MulticallCallResult[]): PrerequisiteResult<"balance"> {
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
