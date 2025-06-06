import type { Address } from "viem";

import type { IBaseContract } from "../../base/index.js";

export interface IAdapterContract extends IBaseContract {
  targetContract: Address;
}
