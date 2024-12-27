import { expect } from "chai";
import type { Abi, Address } from "viem";
import { encodeFunctionData } from "viem";

import {
  contractsByNetwork,
  DUMB_ADDRESS,
  DUMB_ADDRESS2,
  DUMB_ADDRESS3,
  DUMB_ADDRESS4,
  Protocols,
  tokenDataByNetwork,
} from "../../../sdk-gov-legacy";
import { iBaseRewardPoolAbi, iConvexTokenAbi } from "../../types";
import type { CreditManagerData } from "../creditManager";
import type { AdapterWithType, Rewards } from ".";
import type { RewardDistribution } from "./rewardConvex";
import { RewardConvex } from "./rewardConvex";

const ADAPTER_CONVEX_3CRV_POOL = DUMB_ADDRESS;
const ADAPTER_CURVE_FRAX_POOL = DUMB_ADDRESS2;
const ADAPTER_CONVEX_FRAX3CRV_POOL = DUMB_ADDRESS3;

const CREDIT_ACCOUNT = DUMB_ADDRESS4;

describe("RewardConvex test", () => {
  it("findAdapters find convex adapters correctly", () => {
    const cm = {
      adapters: {
        [contractsByNetwork.Mainnet.CONVEX_3CRV_POOL]: ADAPTER_CONVEX_3CRV_POOL,
        [contractsByNetwork.Mainnet.CURVE_FRAX_POOL]: ADAPTER_CURVE_FRAX_POOL,
        [contractsByNetwork.Arbitrum.CONVEX_FRAX3CRV_POOL]:
          ADAPTER_CONVEX_FRAX3CRV_POOL,
      },
    } as unknown as CreditManagerData;

    const expectedResult: Array<AdapterWithType> = [
      {
        contract: "CONVEX_3CRV_POOL",
        contractAddress: contractsByNetwork.Mainnet.CONVEX_3CRV_POOL,
        adapter: ADAPTER_CONVEX_3CRV_POOL,
      },
    ];

    const result = RewardConvex.findAdapters(cm);

    expect(result).to.be.eql(expectedResult);
  });

  it("prepareMultiCalls prepares multicall data correctly", () => {
    const cm = {
      adapters: {
        [contractsByNetwork.Mainnet.CONVEX_3CRV_POOL]: ADAPTER_CONVEX_3CRV_POOL,
        [contractsByNetwork.Mainnet.CURVE_FRAX_POOL]: ADAPTER_CURVE_FRAX_POOL,
        [contractsByNetwork.Arbitrum.CONVEX_FRAX3CRV_POOL]:
          ADAPTER_CONVEX_FRAX3CRV_POOL,
      },
    } as unknown as CreditManagerData;

    const calls: Array<
      Array<{
        address: Address;
        abi: Abi;
        functionName: string;
        args: unknown[];
      }>
    > = [
      [
        {
          address: tokenDataByNetwork.Mainnet.CVX,
          abi: iConvexTokenAbi,
          functionName: "totalSupply",
          args: [],
        },
      ],
      [
        {
          address: contractsByNetwork.Mainnet.CONVEX_3CRV_POOL,
          abi: iBaseRewardPoolAbi,
          functionName: "earned",
          args: [CREDIT_ACCOUNT],
        },
      ],
    ];

    const distribution: Array<RewardDistribution> = [
      {
        adapter: ADAPTER_CONVEX_3CRV_POOL,
        contractAddress: contractsByNetwork.Mainnet.CONVEX_3CRV_POOL,
        contract: "CONVEX_3CRV_POOL",
        token: "CRV",
        protocol: Protocols.Convex,
      },
    ];

    const result = RewardConvex.prepareMultiCalls(
      CREDIT_ACCOUNT,
      cm,
      "Mainnet",
    );

    expect(result?.convexDistribution).to.be.eql([distribution]);
    expect(result?.convexCalls).to.be.eql(calls);
  });

  it("parseResults parse data correctly", () => {
    const rewards = [1000n];

    const distribution: Array<RewardDistribution> = [
      {
        adapter: ADAPTER_CONVEX_3CRV_POOL,
        contractAddress: contractsByNetwork.Mainnet.CONVEX_3CRV_POOL,
        contract: "CONVEX_3CRV_POOL",
        token: "CRV",
        protocol: Protocols.Convex,
      },
    ];

    const parsed = RewardConvex.parseResults({
      convexDistribution: [distribution],
      convexResponse: rewards,
      convexTotalSupply: 0n,

      auraDistribution: [],
      auraResponse: [],
      auraTotalSupply: 0n,
    });

    const callData = encodeFunctionData({
      abi: iBaseRewardPoolAbi,
      functionName: "getReward",
      args: [],
    });

    const expected: Array<Rewards> = [
      {
        protocol: Protocols.Convex,
        contract: "CONVEX_3CRV_POOL",
        rewards: {
          CRV: 1000n,
          CVX: 1000n,
        },
        calls: [
          {
            target: ADAPTER_CONVEX_3CRV_POOL,
            callData,
          },
        ],
      },
    ];

    expect(parsed).to.be.eql(expected);
  });
});
