import { type Address, erc20Abi } from "viem";

import { hexEq, NATIVE_ADDRESS } from "../../sdk/index.js";
import { Prerequisite } from "./Prerequisite.js";
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
 * e.g. ETH-zapper deposits) whose balance is read via `getBalance`.
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

  protected async check(
    ctx: PrerequisiteContext,
  ): Promise<PrerequisiteResult<"balance">> {
    const actual = await this.#readBalance(ctx);
    return this.satisfiedResult(actual >= this.#detail.required, {
      ...this.#detail,
      actual,
    });
  }

  async #readBalance(ctx: PrerequisiteContext): Promise<bigint> {
    // `undefined` block number lets viem read at `latest`; it is only set for
    // testnet forks pinned to a specific block.
    if (hexEq(this.#detail.token, NATIVE_ADDRESS)) {
      // The native pseudo-address has no ERC-20 code; read the native balance.
      return ctx.sdk.client.getBalance({
        address: this.#detail.owner,
        blockNumber: ctx.blockNumber,
      });
    }
    return ctx.sdk.client.readContract({
      address: this.#detail.token,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [this.#detail.owner],
      blockNumber: ctx.blockNumber,
    });
  }
}
