import type { Address, TestClient } from "viem";
import { deal } from "viem-deal";
import type { GearboxSDK } from "../../sdk/index.js";
import type { AnvilClient } from "../createAnvilClient.js";
import AbstractMinter from "./AbstractMinter.js";
import type { IMinter } from "./types.js";

export class DealMinter extends AbstractMinter implements IMinter {
  constructor(sdk: GearboxSDK, anvil: AnvilClient) {
    super(sdk, anvil, "DealMinter");
  }

  public override async mint(
    token: Address,
    dest: Address,
    amount: bigint,
  ): Promise<void> {
    await deal(this.anvil as unknown as TestClient, {
      erc20: token,
      account: dest,
      amount,
    });
  }
}
