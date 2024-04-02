import {
  contractsByNetwork,
  DUMB_ADDRESS,
  DUMB_ADDRESS2,
  DUMB_ADDRESS3,
  DUMB_ADDRESS4,
  MCall,
  Protocols,
  tokenDataByNetwork,
} from "@gearbox-protocol/sdk-gov";
import { expect } from "chai";
import { BigNumber } from "ethers";

import { IConvexToken__factory } from "../types";
import { IBaseRewardPoolInterface } from "../types/IBaseRewardPool";
import { IConvexTokenInterface } from "../types/IConvexToken";
import { CreditManagerData } from "./creditManager";
import { AdapterWithType, Rewards } from "./rewardClaimer";
import { RewardConvex, RewardDistribution } from "./rewardConvex";

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

    const calls: [
      Array<MCall<IConvexTokenInterface>>,
      Array<MCall<IBaseRewardPoolInterface>>,
    ] = [
      [
        {
          address: tokenDataByNetwork.Mainnet.CVX,
          interface: IConvexToken__factory.createInterface(),
          method: "totalSupply()",
        },
      ],
      [
        {
          address: contractsByNetwork.Mainnet.CONVEX_3CRV_POOL,
          interface: RewardConvex.poolInterface,
          method: "earned(address)",
          params: [CREDIT_ACCOUNT],
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
    const rewards = [BigNumber.from(1000n)];

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

    const callData =
      RewardConvex.poolInterface.encodeFunctionData("getReward()");

    const expected: Array<Rewards> = [
      {
        protocol: Protocols.Convex,
        totalSupply: 0n,
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
