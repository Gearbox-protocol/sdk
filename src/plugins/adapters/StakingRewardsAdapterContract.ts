import type { GearboxSDK } from "../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";
import { iStakingRewardsAdapterAbi } from "./abi/index.js";

const abi = iStakingRewardsAdapterAbi;
type abi = typeof abi;

export class StakingRewardsAdapterContract extends AbstractAdapterContract<
  typeof abi
> {
  constructor(
    sdk: GearboxSDK,
    args: Omit<AbstractAdapterContractOptions<abi>, "abi">,
  ) {
    super(sdk, {
      ...args,
      abi,
    });
  }
}
