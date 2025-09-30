import { type Address, parseAbi } from "viem";
import { ierc20Abi } from "../../abi/iERC20.js";
import type { GearboxSDK } from "../../sdk/index.js";
import type { AnvilClient } from "../createAnvilClient.js";
import AbstractMinter from "./AbstractMinter.js";
import type { IMinter } from "./types.js";

export class TransferMinter extends AbstractMinter implements IMinter {
  constructor(sdk: GearboxSDK, anvil: AnvilClient) {
    super(sdk, anvil, "TransferMinter");
  }

  public override async mint(
    token: Address,
    dest: Address,
    amount: bigint,
  ): Promise<void> {
    const owner = await this.getOwner(token);
    const stopImpersonating = await this.impersonateWithBalance(owner);

    let hash = await this.anvil.writeContract({
      account: owner,
      address: token,
      abi: parseAbi(["function mint(uint256 amount) external returns (bool)"]),
      functionName: "mint",
      args: [amount],
      chain: this.anvil.chain,
    });
    this.logger?.debug(
      `mint ${this.fmt(token, amount)} to ${owner} in tx ${hash}`,
    );
    let receipt = await this.anvil.waitForTransactionReceipt({ hash });
    if (receipt.status === "reverted") {
      throw new Error(
        `failed to mint ${this.fmt(token, amount)} to ${owner} in tx ${hash}: reverted`,
      );
    }
    hash = await this.anvil.writeContract({
      account: owner,
      address: token,
      abi: ierc20Abi,
      functionName: "transfer",
      args: [dest, amount],
      chain: this.anvil.chain,
    });
    this.logger?.debug(
      `transfer ${this.fmt(token, amount)}  from ${owner} to ${dest} in tx ${hash}`,
    );
    receipt = await this.anvil.waitForTransactionReceipt({ hash });
    if (receipt.status === "reverted") {
      throw new Error(
        `failed to transfer ${this.fmt(token, amount)} from ${owner} to ${dest} in tx ${hash}: reverted`,
      );
    }

    await stopImpersonating();
  }
}
