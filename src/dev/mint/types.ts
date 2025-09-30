import type { Address } from "viem";

export interface IMinter {
  /**
   * Tries to mint tokens, returns the balance after attempt (success or not)
   * If mint failed, does not throw
   * @param token
   * @param dest
   * @param amount
   */
  tryMint: (token: Address, dest: Address, amount: bigint) => Promise<bigint>;
  /**
   * Tries to mint tokens, throws if failed
   * @param token
   * @param dest
   * @param amount
   * @returns
   */
  mint: (token: Address, dest: Address, amount: bigint) => Promise<void>;
  name: string;
}
