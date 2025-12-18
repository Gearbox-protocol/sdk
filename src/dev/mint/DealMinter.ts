import type { Address, TestClient } from "viem";
import AbstractMinter from "./AbstractMinter.js";
import type { IMinter } from "./types.js";

export class DealMinter extends AbstractMinter implements IMinter {
  public override async mint(
    token: Address,
    dest: Address,
    amount: bigint,
  ): Promise<void> {
    // Dynamic import of viem-deal to avoid affecting builds when not used
    const { deal } = await import("viem-deal").catch(() => ({ deal: null }));
    if (!deal) {
      throw new Error("peer dependency viem-deal is not installed");
    }
    // deal explicitly sets balance, so we need to account for what we already have
    let balance = await this.balanceOf(token, dest);
    balance += amount;

    this.logger?.debug(`set balance of ${dest} to ${this.fmt(token, balance)}`);

    await deal(this.anvil as unknown as TestClient, {
      erc20: token,
      account: dest,
      amount: balance,
    });
  }
}
