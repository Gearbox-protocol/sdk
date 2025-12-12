import { type Address, parseAbi } from "viem";
import AbstractMinter from "./AbstractMinter.js";
import type { IMinter } from "./types.js";

export class DirectMinter extends AbstractMinter implements IMinter {
  public override async mint(
    token: Address,
    dest: Address,
    amount: bigint,
  ): Promise<void> {
    const owner = await this.getOwner(token);
    const stopImpersonating = await this.impersonateWithBalance(owner);
    const hash = await this.anvil.writeContract({
      account: owner,
      address: token,
      abi: parseAbi([
        "function mint(address to, uint256 amount) returns (bool)",
      ]),
      functionName: "mint",
      args: [dest, amount],
      chain: this.anvil.chain,
    });
    this.logger?.debug(
      `mint ${this.fmt(token, amount)} to ${owner} in tx ${hash}`,
    );
    const receipt = await this.anvil.waitForTransactionReceipt({ hash });
    if (receipt.status === "reverted") {
      throw new Error(
        `failed to mint ${this.fmt(token, amount)} to ${owner} in tx ${hash}: reverted`,
      );
    }
    await stopImpersonating();
  }
}
