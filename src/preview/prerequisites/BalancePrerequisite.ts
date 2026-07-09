import { type Address, erc20Abi } from "viem";

import { hexEq, NATIVE_ADDRESS } from "../../sdk/index.js";
import { Prerequisite } from "./Prerequisite.js";
import type {
  PrerequisiteContext,
  PrerequisiteError,
  PrerequisiteOutcome,
} from "./types.js";

/** ERC-20 balance of `owner` must cover `required`. */
export interface BalanceDetail {
  token: Address;
  owner: Address;
  required: bigint;
  /** On-chain balance read; only present when the read succeeded. */
  actual?: bigint;
}

export type BalanceResult = PrerequisiteOutcome & {
  kind: "balance";
  detail: BalanceDetail;
};

/**
 * Checks that `owner` holds a token balance >= `required`. The token is read
 * as an ERC-20, except for the native pseudo-address ({@link NATIVE_ADDRESS},
 * e.g. ETH-zapper deposits) whose balance is read via `getBalance`.
 */
export class BalancePrerequisite extends Prerequisite {
  readonly #detail: BalanceDetail;

  constructor(detail: Omit<BalanceDetail, "actual">) {
    super();
    this.#detail = { ...detail };
  }

  protected async check(ctx: PrerequisiteContext): Promise<BalanceResult> {
    const actual = await this.#readBalance(ctx);
    return {
      kind: "balance",
      detail: { ...this.#detail, actual },
      satisfied: actual >= this.#detail.required,
    };
  }

  protected errorResult(error: PrerequisiteError): BalanceResult {
    return { kind: "balance", detail: this.#detail, error };
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
