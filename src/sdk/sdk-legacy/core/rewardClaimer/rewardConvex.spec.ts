import { describe, expect, it } from "@jest/globals";
import type { Abi, Address } from "viem";
import { encodeFunctionData } from "viem";

import type { SupportedToken } from "../../../sdk-gov-legacy";
import {
  DUMB_ADDRESS,
  DUMB_ADDRESS2,
  DUMB_ADDRESS3,
  DUMB_ADDRESS4,
  Protocols,
} from "../../../sdk-gov-legacy";
import { iBaseRewardPoolAbi, iConvexTokenAbi } from "../../types";
import type { CreditManagerData_Legacy } from "../creditManager";
import type { AdapterWithType, Rewards } from ".";
import type { RewardDistribution } from "./rewardConvex";
import { RewardConvex } from "./rewardConvex";

const CONVEX_3CRV_POOL = "0x689440f2Ff927E1f24c72F1087E1FAF471eCe1c8";
const CURVE_FRAX_POOL = "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B";
const CONVEX_FRAX3CRV_POOL = "0xB900EF131301B307dB5eFcbed9DBb50A3e209B2e";

const ADAPTER_CONVEX_3CRV_POOL = DUMB_ADDRESS;
const ADAPTER_CURVE_FRAX_POOL = DUMB_ADDRESS2;
const ADAPTER_CONVEX_FRAX3CRV_POOL = DUMB_ADDRESS3;

const CREDIT_ACCOUNT = DUMB_ADDRESS4;

const CVX =
  "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B".toLowerCase() as Address;
const CRV =
  "0xD533a949740bb3306d119CC777fa900bA034cd52".toLowerCase() as Address;
const FXS =
  "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0".toLowerCase() as Address;

const currentTokens = { CVX, CRV, FXS } as Record<SupportedToken, Address>;

describe("RewardConvex test", () => {
  it("findAdapters find convex adapters correctly", () => {
    const cm = {
      adapters: {
        [CONVEX_3CRV_POOL]: {
          address: ADAPTER_CONVEX_3CRV_POOL,
        },
        [CURVE_FRAX_POOL]: {
          address: ADAPTER_CURVE_FRAX_POOL,
        },
        [CONVEX_FRAX3CRV_POOL]: {
          address: ADAPTER_CONVEX_FRAX3CRV_POOL,
        },
      },
    } as unknown as CreditManagerData_Legacy;

    const expectedResult: Array<AdapterWithType> = [
      {
        contract: "CONVEX_3CRV_POOL",
        contractAddress: CONVEX_3CRV_POOL,
        adapter: ADAPTER_CONVEX_3CRV_POOL,
      },
      {
        adapter: ADAPTER_CONVEX_FRAX3CRV_POOL,
        contract: "CONVEX_FRAX3CRV_POOL",
        contractAddress: CONVEX_FRAX3CRV_POOL,
      },
    ];

    const result = RewardConvex.findAdapters(cm);

    expect(result).toEqual(expectedResult);
  });

  it("prepareMultiCalls prepares multicall data correctly", () => {
    const cm = {
      adapters: {
        [CONVEX_3CRV_POOL]: {
          address: ADAPTER_CONVEX_3CRV_POOL,
        },
        [CURVE_FRAX_POOL]: {
          address: ADAPTER_CURVE_FRAX_POOL,
        },
        [CONVEX_FRAX3CRV_POOL]: {
          address: ADAPTER_CONVEX_FRAX3CRV_POOL,
        },
      },
    } as unknown as CreditManagerData_Legacy;

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
          address: CVX,
          abi: iConvexTokenAbi,
          functionName: "totalSupply",
          args: [],
        },
      ],
      [
        {
          address: CONVEX_3CRV_POOL,
          abi: iBaseRewardPoolAbi,
          functionName: "earned",
          args: [CREDIT_ACCOUNT],
        },
      ],
      [
        {
          address: CONVEX_FRAX3CRV_POOL,
          abi: iBaseRewardPoolAbi,
          functionName: "earned",
          args: [CREDIT_ACCOUNT],
        },
        {
          abi: iBaseRewardPoolAbi,
          address: "0xcDEC6714eB482f28f4889A0c122868450CDBF0b0",
          args: [CREDIT_ACCOUNT],
          functionName: "earned",
        },
      ],
    ];

    const distribution: Array<RewardDistribution> = [
      {
        adapter: ADAPTER_CONVEX_3CRV_POOL,
        contractAddress: CONVEX_3CRV_POOL,
        contract: "CONVEX_3CRV_POOL",
        token: "CRV",
        protocol: Protocols.Convex,
      },
    ];
    const distribution2: Array<RewardDistribution> = [
      {
        adapter: ADAPTER_CONVEX_FRAX3CRV_POOL,
        contract: "CONVEX_FRAX3CRV_POOL",
        contractAddress: CONVEX_FRAX3CRV_POOL,
        protocol: Protocols.Convex,
        token: "CRV",
      },
      {
        adapter: ADAPTER_CONVEX_FRAX3CRV_POOL,
        contract: "CONVEX_FRAX3CRV_POOL",
        contractAddress: CONVEX_FRAX3CRV_POOL,
        protocol: Protocols.Convex,
        token: "FXS",
      },
    ];

    const result = RewardConvex.prepareMultiCalls(
      CREDIT_ACCOUNT,
      cm,
      currentTokens as Record<SupportedToken, Address>,
      "Mainnet",
    );

    expect(result?.convexDistribution).toEqual([distribution, distribution2]);
    expect(result?.convexCalls).toEqual(calls);
  });

  it("parseResults parse data correctly", () => {
    const rewards = [1000n];

    const distribution: Array<RewardDistribution> = [
      {
        adapter: ADAPTER_CONVEX_3CRV_POOL,
        contractAddress: CONVEX_3CRV_POOL,
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

    expect(parsed).toEqual(expected);
  });
});
