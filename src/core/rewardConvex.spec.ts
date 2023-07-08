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
      // {
      //   contract: "CONVEX_FRAX3CRV_POOL",
      //   contractAddress: contractsByNetwork.Goerli.CONVEX_FRAX3CRV_POOL,
      //   adapter: ADAPTER_CONVEX_FRAX3CRV_POOL,
      // },
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

    const calls: Array<MCall<IConvexV1BaseRewardPoolAdapterInterface>> = [
      {
        address: contractsByNetwork.Mainnet.CONVEX_3CRV_POOL,
        interface: RewardConvex.poolInterface,
        method: "earned(address)",
        params: [CREDIT_ACCOUNT],
      },
      // {
      //   address: contractsByNetwork.Goerli.CONVEX_FRAX3CRV_POOL,
      //   interface: RewardConvex.poolInterface,
      //   method: "earned(address)",
      //   params: [CREDIT_ACCOUNT],
      // },
      {
        address: (contractParams.CONVEX_FRAX3CRV_POOL as ConvexPoolParams)
          .extraRewards[0].poolAddress.Mainnet,
        interface: RewardConvex.poolInterface,
        method: "earned(address)",
        params: [CREDIT_ACCOUNT],
      },
    ];

    const distribution: Array<RewardDistribution> = [
      {
        adapter: ADAPTER_CONVEX_3CRV_POOL,
        contractAddress: contractsByNetwork.Mainnet.CONVEX_3CRV_POOL,
        contract: "CONVEX_3CRV_POOL",
        token: "CRV",
      },
      // {
      //   adapter: ADAPTER_CONVEX_FRAX3CRV_POOL,
      //   contractAddress: contractsByNetwork.Goerli.CONVEX_FRAX3CRV_POOL,
      //   contract: "CONVEX_FRAX3CRV_POOL",
      //   token: "CRV",
      // },
      // {
      //   adapter: ADAPTER_CONVEX_FRAX3CRV_POOL,
      //   contractAddress: contractsByNetwork.Goerli.CONVEX_FRAX3CRV_POOL,
      //   contract: "CONVEX_FRAX3CRV_POOL",
      //   token: "FXS",
      // },
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
      BigNumber.from(1000n),
      BigNumber.from(2000n),
      BigNumber.from(4000n),
    ];

    const distribution: Array<RewardDistribution> = [
      {
        adapter: ADAPTER_CONVEX_3CRV_POOL,
        contractAddress: contractsByNetwork.Mainnet.CONVEX_3CRV_POOL,
        contract: "CONVEX_3CRV_POOL",
        token: "CRV",
      },
      // {
      //   adapter: ADAPTER_CONVEX_FRAX3CRV_POOL,
      //   contractAddress: contractsByNetwork.Goerli.CONVEX_FRAX3CRV_POOL,
      //   contract: "CONVEX_FRAX3CRV_POOL",
      //   token: "CRV",
      // },
      // {
      //   adapter: ADAPTER_CONVEX_FRAX3CRV_POOL,
      //   contractAddress: contractsByNetwork.Goerli.CONVEX_FRAX3CRV_POOL,
      //   contract: "CONVEX_FRAX3CRV_POOL",
      //   token: "FXS",
      // },
    ];

    const parsed = RewardConvex.parseResults(rewards, distribution);

    const callData =
      RewardConvex.poolInterface.encodeFunctionData("getReward()");

    const expected: Array<Rewards> = [
      {
        contract: "CONVEX_3CRV_POOL",
        rewards: {
          CRV: 1000n,
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
          CRV: 2000n,
          FXS: 4000n,
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
