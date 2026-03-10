import { iStakingRewardsAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import {
  type ConstructOptions,
  MissingSerializedParamsError,
} from "../../../sdk/index.js";
import { iStakingRewardsAbi } from "../abi/targetContractAbi.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iStakingRewardsAdapterAbi;
type abi = typeof abi;

const protocolAbi = iStakingRewardsAbi;
type protocolAbi = typeof protocolAbi;

export class StakingRewardsAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #stakingToken?: Address;
  #rewardsToken?: Address;
  #stakedPhantomToken?: Address;
  #referral?: number;

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const version = Number(args.baseParams.version);
      if (version === 310) {
        const decoded = decodeAbiParameters(
          [
            { type: "address", name: "creditManager" },
            { type: "address", name: "targetContract" },
            { type: "address", name: "stakingToken" },
            { type: "address", name: "rewardsToken" },
            { type: "address", name: "stakedPhantomToken" },
          ],
          args.baseParams.serializedParams,
        );

        this.#stakingToken = decoded[2];
        this.#rewardsToken = decoded[3];
        this.#stakedPhantomToken = decoded[4];
        this.#referral = 0;
      } else {
        const decoded = decodeAbiParameters(
          [
            { type: "address", name: "creditManager" },
            { type: "address", name: "targetContract" },
            { type: "address", name: "stakingToken" },
            { type: "address", name: "rewardsToken" },
            { type: "address", name: "stakedPhantomToken" },
            { type: "uint16", name: "referral" },
          ],
          args.baseParams.serializedParams,
        );

        this.#stakingToken = decoded[2];
        this.#rewardsToken = decoded[3];
        this.#stakedPhantomToken = decoded[4];
        this.#referral = decoded[5];
      }
    }
  }

  get stakingToken(): Address {
    if (!this.#stakingToken)
      throw new MissingSerializedParamsError("stakingToken");
    return this.#stakingToken;
  }

  get rewardsToken(): Address {
    if (!this.#rewardsToken)
      throw new MissingSerializedParamsError("rewardsToken");
    return this.#rewardsToken;
  }

  get stakedPhantomToken(): Address {
    if (!this.#stakedPhantomToken)
      throw new MissingSerializedParamsError("stakedPhantomToken");
    return this.#stakedPhantomToken;
  }

  get referral(): number {
    if (this.#referral === undefined)
      throw new MissingSerializedParamsError("referral");
    return this.#referral;
  }
}
