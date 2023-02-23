import { expect } from "chai";
import { BigNumber } from "ethers";

import {
  contractParams,
  contractsByNetwork,
  ConvexPoolParams,
} from "../contracts/contracts";
import { IConvexV1BaseRewardPoolAdapterInterface } from "../types/@gearbox-protocol/integrations-v2/contracts/interfaces/convex/IConvexV1BaseRewardPoolAdapter.sol/IConvexV1BaseRewardPoolAdapter";
import { MCall } from "../utils/multicall";
import {
  DUMB_ADDRESS,
  DUMB_ADDRESS2,
  DUMB_ADDRESS3,
  DUMB_ADDRESS4,
} from "./constants";
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
        [contractsByNetwork.Goerli.CONVEX_FRAX3CRV_POOL]:
          ADAPTER_CONVEX_FRAX3CRV_POOL,
      },
    } as unknown as CreditManagerData;

    const expectedResult: Array<AdapterWithType> = [
      {
        adapter: ADAPTER_CONVEX_3CRV_POOL,
        contract: "CONVEX_3CRV_POOL",
      },
      {
        adapter: ADAPTER_CONVEX_FRAX3CRV_POOL,
        contract: "CONVEX_FRAX3CRV_POOL",
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
        [contractsByNetwork.Goerli.CONVEX_FRAX3CRV_POOL]:
          ADAPTER_CONVEX_FRAX3CRV_POOL,
      },
    } as unknown as CreditManagerData;

    const calls: Array<MCall<IConvexV1BaseRewardPoolAdapterInterface>> = [
      {
        address: ADAPTER_CONVEX_3CRV_POOL,
        interface: RewardConvex.poolInterface,
        method: "earned(address)",
        params: [CREDIT_ACCOUNT],
      },
      {
        address: ADAPTER_CONVEX_FRAX3CRV_POOL,
        interface: RewardConvex.poolInterface,
        method: "earned(address)",
        params: [CREDIT_ACCOUNT],
      },
      {
        address: (contractParams.CONVEX_FRAX3CRV_POOL as ConvexPoolParams)
          .extraRewards[0].poolAddress.Mainnet,
        interface: RewardConvex.poolInterface,
        method: "earned(address)",
        params: [CREDIT_ACCOUNT],
      },
    ];

    const distribution = [
      {
        adapter: ADAPTER_CONVEX_3CRV_POOL,
        contract: "CONVEX_3CRV_POOL",
        token: "CRV",
      },
      {
        adapter: ADAPTER_CONVEX_FRAX3CRV_POOL,
        contract: "CONVEX_FRAX3CRV_POOL",
        token: "CRV",
      },
      {
        adapter: ADAPTER_CONVEX_FRAX3CRV_POOL,
        contract: "CONVEX_FRAX3CRV_POOL",
        token: "FXS",
      },
    ];

    const result = RewardConvex.prepareMultiCalls(
      CREDIT_ACCOUNT,
      cm,
      "Mainnet",
    );

    expect(result).to.be.eql({ calls, distribution });
  });

  it("parseResults parse data correctly", () => {
    const rewards = [
      BigNumber.from(1000),
      BigNumber.from(2000),
      BigNumber.from(4000),
    ];

    const distribution: Array<RewardDistribution> = [
      {
        adapter: ADAPTER_CONVEX_3CRV_POOL,
        contract: "CONVEX_3CRV_POOL",
        token: "CRV",
      },
      {
        adapter: ADAPTER_CONVEX_FRAX3CRV_POOL,
        contract: "CONVEX_FRAX3CRV_POOL",
        token: "CRV",
      },
      {
        adapter: ADAPTER_CONVEX_FRAX3CRV_POOL,
        contract: "CONVEX_FRAX3CRV_POOL",
        token: "FXS",
      },
    ];

    const parsed = RewardConvex.parseResults(
      CREDIT_ACCOUNT,
      rewards,
      distribution,
    );

    const callData = RewardConvex.poolInterface.encodeFunctionData(
      "getReward(address,bool)",
      [CREDIT_ACCOUNT, true],
    );

    const expected: Array<Rewards> = [
      {
        contract: "CONVEX_3CRV_POOL",
        rewards: {
          CRV: BigNumber.from(1000),
        },
        calls: [
          {
            target: ADAPTER_CONVEX_3CRV_POOL,
            callData,
          },
        ],
      },
      {
        contract: "CONVEX_FRAX3CRV_POOL",
        rewards: {
          CRV: BigNumber.from(2000),
          FXS: BigNumber.from(4000),
        },
        calls: [
          {
            target: ADAPTER_CONVEX_FRAX3CRV_POOL,
            callData,
          },
        ],
      },
    ];

    expect(parsed).to.be.eql(expected);
  });
});
