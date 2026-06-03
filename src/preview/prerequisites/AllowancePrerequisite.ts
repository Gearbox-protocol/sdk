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
  private readonly _id: string;
  private readonly _title: string;
  private readonly _detail: PrerequisiteDetail<"allowance">;

  constructor(props: AllowancePrerequisiteProps) {
    super();
    this._id =
      props.id ?? `allowance:${props.token}:${props.owner}:${props.spender}`;
    this._title = props.title ?? "Token approval";
    this._detail = {
      token: props.token,
      owner: props.owner,
      spender: props.spender,
      required: props.required,
    };
  }

  public get id(): string {
    return this._id;
  }

  public get kind(): "allowance" {
    return "allowance";
  }

  public get title(): string {
    return this._title;
  }

  public get detail(): PrerequisiteDetail<"allowance"> {
    return this._detail;
  }

  public calls(): ContractFunctionParameters[] {
    return [
      {
        address: this._detail.token,
        abi: erc20Abi,
        functionName: "allowance",
        args: [this._detail.owner, this._detail.spender],
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
    return this.satisfiedResult(actual >= this._detail.required, {
      ...this._detail,
      actual,
    });
  }
}
