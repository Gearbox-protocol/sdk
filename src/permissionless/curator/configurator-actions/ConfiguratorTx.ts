import type { Address } from "viem";
import type { RawTx } from "../../../onchain/index.js";
import type { ConfiguratorActions } from "./types.js";

export interface ConfiguratorTx {
  tx: RawTx;
  action: ConfiguratorActions;
  newContract?: Address;
}
