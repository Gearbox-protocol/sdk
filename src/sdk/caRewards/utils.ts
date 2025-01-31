import type { Address } from "viem";

import type { Asset } from "../router";
import type { MultiCall } from "../types";

export interface Rewards {
  adapter: Address;
  stakedPhantomToken: Address;
  calls: Array<MultiCall>;

  rewards: Array<Asset>;
}
