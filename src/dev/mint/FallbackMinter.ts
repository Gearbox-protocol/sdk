import type { Address } from "viem";
import type { GearboxSDK } from "../../sdk/index.js";
import type { AnvilClient } from "../createAnvilClient.js";
import AbstractMinter from "./AbstractMinter.js";
import type { IMinter } from "./types.js";

export class FallbackMinter extends AbstractMinter implements IMinter {
  #minters: IMinter[];

  constructor(sdk: GearboxSDK, anvil: AnvilClient, minters: IMinter[]) {
    super(sdk, anvil);
    this.#minters = minters;
  }

  public override async mint(
    token: Address,
    dest: Address,
    amount: bigint,
  ): Promise<void> {
    for (const minter of this.#minters) {
      try {
        await minter.mint(token, dest, amount);
        this.logger?.debug(`${minter.name} succeeded`);
        return;
      } catch (e) {
        this.logger?.warn(`${minter.name} failed: ${e}`);
      }
    }
    throw new Error("all minters failed");
  }
}
