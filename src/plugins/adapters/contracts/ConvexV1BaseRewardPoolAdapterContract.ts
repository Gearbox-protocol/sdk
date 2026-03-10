import { iConvexV1BaseRewardPoolAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters, zeroAddress } from "viem";
import {
  type ConstructOptions,
  MissingSerializedParamsError,
  type ParsedCallV2,
} from "../../../sdk/index.js";
import { iBaseRewardPoolAbi } from "../abi/targetContractAbi.js";
import type {
  LegacyAdapterOperation,
  Transfers,
} from "../legacyAdapterOperations.js";
import {
  allTransfersAsTokenAmounts,
  fnSigToName,
  parsePosNegAmount,
  rewardsFromTransfers,
  swapFromTransfers,
} from "../transferHelpers.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iConvexV1BaseRewardPoolAdapterAbi;
type abi = typeof abi;

const protocolAbi = iBaseRewardPoolAbi;
type protocolAbi = typeof protocolAbi;

export class ConvexV1BaseRewardPoolAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #curveLPtoken?: Address;
  #stakingToken?: Address;
  #stakedPhantomToken?: Address;
  #extraRewards?: [Address, Address, Address, Address];

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "curveLPtoken" },
          { type: "address", name: "stakingToken" },
          { type: "address", name: "stakedPhantomToken" },
          { type: "address[4]", name: "extraRewards" },
        ],
        args.baseParams.serializedParams,
      );

      this.#curveLPtoken = decoded[2];
      this.#stakingToken = decoded[3];
      this.#stakedPhantomToken = decoded[4];
      this.#extraRewards = [
        decoded[5][0],
        decoded[5][1],
        decoded[5][2],
        decoded[5][3],
      ];
    }
  }

  get curveLPtoken(): Address {
    if (!this.#curveLPtoken)
      throw new MissingSerializedParamsError("curveLPtoken");
    return this.#curveLPtoken;
  }

  get stakingToken(): Address {
    if (!this.#stakingToken)
      throw new MissingSerializedParamsError("stakingToken");
    return this.#stakingToken;
  }

  get stakedPhantomToken(): Address {
    if (!this.#stakedPhantomToken)
      throw new MissingSerializedParamsError("stakedPhantomToken");
    return this.#stakedPhantomToken;
  }

  get extraRewards(): [Address, Address, Address, Address] {
    if (!this.#extraRewards)
      throw new MissingSerializedParamsError("extraRewards");
    return this.#extraRewards;
  }

  /**
   * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type.go#L200-L262
   * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type_v3.go#L76-L83
   */
  protected override classifyLegacyOperation(
    parsed: ParsedCallV2,
    transfers: Transfers,
  ): LegacyAdapterOperation {
    const fn = fnSigToName(parsed.functionName);
    const { rawArgs: args } = parsed;

    if (fn === "getReward") {
      return {
        operation: "GetReward",
        rewards: rewardsFromTransfers(transfers),
      };
    }
    if (fn === "stake" || fn === "stakeDiff" || fn === "depositPhantomToken") {
      const neg = parsePosNegAmount(transfers).neg;
      return {
        operation: "ConvexStake",
        stakedToken: neg[0] ?? { token: zeroAddress, amount: "0" },
      };
    }
    if (fn === "withdrawAll") {
      return {
        operation: "CurveClaims",
        claims: parsePosNegAmount(transfers).pos,
      };
    }
    const claim = args.claim as boolean | undefined;
    if (claim) {
      return {
        operation: "ConvexWithdrawAndClaim",
        rewards: allTransfersAsTokenAmounts(transfers),
      };
    }
    const swap = swapFromTransfers(transfers);
    return {
      operation: "ConvexWithdraw",
      withdrawToken: swap.to,
      withdrawAmount: swap.toAmount,
    };
  }
}
