import type { Address } from "viem";

import type { IBaseContract } from "../../base";

export interface IAdapterContract extends IBaseContract {
  targetContract: Address;
}
