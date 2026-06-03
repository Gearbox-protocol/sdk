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
  private readonly _id: string;
  private readonly _title: string;
  private readonly _detail: PrerequisiteDetail<"balance">;

  constructor(props: BalancePrerequisiteProps) {
    super();
    this._id = props.id ?? `balance:${props.token}:${props.owner}`;
    this._title = props.title ?? "Sufficient balance";
    this._detail = {
      token: props.token,
      owner: props.owner,
      required: props.required,
    };
  }

  public get id(): string {
    return this._id;
  }

  public get kind(): "balance" {
    return "balance";
  }

  public get title(): string {
    return this._title;
  }

  public get detail(): PrerequisiteDetail<"balance"> {
    return this._detail;
  }

  public calls(): ContractFunctionParameters[] {
    return [
      {
        address: this._detail.token,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [this._detail.owner],
      },
    ];
  }

  public resolve(slice: MulticallCallResult[]): PrerequisiteResult<"balance"> {
    const res = slice[0];
    if (!res || res.status === "failure") {
      return this.errorResult(toPrerequisiteError(res?.error));
    }
    const actual = res.result as bigint;
    return this.satisfiedResult(actual >= this._detail.required, {
      ...this._detail,
      actual,
    });
  }
}
