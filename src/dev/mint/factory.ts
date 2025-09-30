import type { Address } from "viem";
import type { GearboxSDK } from "../../sdk/index.js";
import type { AnvilClient } from "../createAnvilClient";
import { DealMinter } from "./DealMinter.js";
import { DirectMinter } from "./DirectMinter.js";
import { FallbackMinter } from "./FallbackMinter.js";
import { TransferMinter } from "./TransferMinter.js";
import type { IMinter } from "./types.js";

export function createMinter(
  sdk: GearboxSDK,
  anvil: AnvilClient,
  token: Address,
): IMinter {
  // Put recipies for other tokens here
  return new FallbackMinter(sdk, anvil, [
    new DealMinter(sdk, anvil),
    new DirectMinter(sdk, anvil),
    new TransferMinter(sdk, anvil),
  ]);
}
