import { type Address, type ContractFunctionParameters, erc20Abi } from "viem";

import { iMulticall3Abi } from "../../abi/iMulticall3.js";
import { hexEq, NATIVE_ADDRESS } from "../../sdk/index.js";
import {
  type MulticallCallResult,
  Prerequisite,
  toPrerequisiteError,
} from "./Prerequisite.js";
import type {
  PrerequisiteContext,
  PrerequisiteDetail,
  PrerequisiteResult,
} from "./types.js";

export interface BalancePrerequisiteProps {
  token: Address;
  owner: Address;
  required: bigint;
  title?: string;
  id?: string;
}

/**
 * Checks that `owner` holds a token balance >= `required`. The token is read
 * as an ERC-20, except for the native pseudo-address ({@link NATIVE_ADDRESS},
 * e.g. ETH-zapper deposits) whose balance is read via multicall3's
 * `getEthBalance`.
 */
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

  public calls(ctx: PrerequisiteContext): ContractFunctionParameters[] {
    if (hexEq(this.#detail.token, NATIVE_ADDRESS)) {
      // The native pseudo-address has no ERC-20 code; read the balance via
      // multicall3's getEthBalance instead.
      const multicall3 = ctx.sdk.client.chain.contracts?.multicall3?.address;
      if (!multicall3) {
        throw new Error(
          "multicall3 is not configured for this chain, cannot read native balance",
        );
      }
      return [
        {
          address: multicall3,
          abi: iMulticall3Abi,
          functionName: "getEthBalance",
          args: [this.#detail.owner],
        },
      ];
    }
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
