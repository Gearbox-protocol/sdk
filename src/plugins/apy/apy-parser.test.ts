import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type {
  DataResult,
  PoolOutputDetails,
  TokenOutputDetails,
} from "../../rewards/apy/index.js";
import { numberToAPY, parseNetworkApy } from "./apy-parser.js";

type TokensDataOk = Extract<
  DataResult<TokenOutputDetails<string>[]>,
  { status: "ok" }
>;
type PoolsDataOk = Extract<
  DataResult<PoolOutputDetails<string>[]>,
  { status: "ok" }
>;

describe("parseNetworkApy", () => {
  const mockTokenAddress: Address = "0xtoken";
  const mockPoolAddress: Address = "0xpool";
  const mockRewardTokenAddress: Address = "0xreward";

  const baseToken: TokenOutputDetails<string> = {
    address: mockTokenAddress,
    symbol: "TOKEN",
    chainId: 1,
    rewards: {
      apy: [{ protocol: "test", value: 0.1, lastUpdated: "2023-01-01" }],
      points: [
        {
          rewards: [
            {
              name: "Test Reward",
              units: "pts",
              multiplier: 1000n,
              type: "test",
            },
          ],
          debtRewards: [
            {
              name: "Debt Reward",
              units: "pts",
              multiplier: 500n,
              type: "debt",
              cm: "0xcm",
            },
          ],
        },
      ],
      extraRewards: [
        {
          rewardToken: mockRewardTokenAddress,
          rewardSymbol: "REWARD",
          duration: 1000n,
          finished: 2000n,
          reward: 1000000n,
          balance: 500000n,
        },
      ],
      extraCollateralAPY: [
        {
          pool: mockPoolAddress,
          value: 0.05,
          type: "relative",
        },
      ],
      extraCollateralPoints: [
        {
          pool: mockPoolAddress,
          rewards: [
            {
              name: "Extra Reward",
              units: "pts",
              multiplier: 2000n,
              type: "extra",
            },
          ],
          debtRewards: [
            {
              name: "Extra Debt Reward",
              units: "pts",
              multiplier: 1500n,
              type: "extra-debt",
              cm: "0xextra-cm",
            },
          ],
        },
      ],
    },
  };

  const basePool: PoolOutputDetails<string> = {
    chainId: 1,
    pool: mockPoolAddress,
    rewards: {
      points: [
        {
          token: mockTokenAddress,
          amount: 1000000n,
          estimation: "relative",
          symbol: "TOKEN",
          name: "Test Token",
          type: "test",
          duration: "1000",
          condition: "deposit",
        },
      ],
      externalAPY: [
        {
          value: 0.06,
          name: "External APY",
        },
      ],
      extraAPY: [
        {
          token: mockTokenAddress,
          apy: 0.03,
          rewardToken: mockRewardTokenAddress,
          rewardTokenSymbol: "REWARD",
          endTimestamp: 1234567890,
          lastUpdated: "2023-01-01",
        },
      ],
    },
  };

  const createTokensData = (
    tokens: TokenOutputDetails<string>[] = [baseToken],
  ): TokensDataOk => ({
    status: "ok",
    data: tokens,
  });

  const createPoolsData = (
    pools: PoolOutputDetails<string>[] = [basePool],
  ): PoolsDataOk => ({
    status: "ok",
    data: pools,
  });

  it("returns complete APY data when all responses are successful", () => {
    const apyResp = createTokensData();
    const poolResp = createPoolsData();

    const result = parseNetworkApy(apyResp, poolResp);

    expect(result).toBeDefined();
    expect(result?.apyList).toEqual({
      [mockTokenAddress]: numberToAPY(apyResp.data[0].rewards.apy[0].value),
    });
    expect(result?.extraCollateralAPYList).toEqual({
      [mockPoolAddress]: {
        [mockTokenAddress]: {
          ...apyResp.data[0].rewards.extraCollateralAPY[0],
          address: apyResp.data[0].address,
          symbol: apyResp.data[0].symbol,
          value: numberToAPY(
            apyResp.data[0].rewards.extraCollateralAPY[0].value,
          ),
        },
      },
    });
    expect(result?.pointsList).toEqual({
      [mockTokenAddress]: {
        address: apyResp.data[0].address,
        symbol: apyResp.data[0].symbol,
        rewards: apyResp.data[0].rewards.points[0].rewards.map(r => ({
          ...r,
          multiplier: BigInt(r.multiplier),
        })),
        debtRewards: apyResp.data[0].rewards.points[0].debtRewards?.map(r => ({
          ...r,
          multiplier: BigInt(r.multiplier),
        })),
      },
    });
    expect(result?.extraCollateralPointsList).toEqual({
      [mockPoolAddress]: {
        [mockTokenAddress]: {
          address: apyResp.data[0].address,
          symbol: apyResp.data[0].symbol,
          rewards: apyResp.data[0].rewards.extraCollateralPoints[0].rewards.map(
            r => ({
              ...r,
              multiplier: BigInt(r.multiplier),
            }),
          ),
          debtRewards: apyResp.data[0].rewards.extraCollateralPoints[0]
            .debtRewards
            ? apyResp.data[0].rewards.extraCollateralPoints[0].debtRewards?.map(
                r => ({
                  ...r,
                  multiplier: BigInt(r.multiplier),
                }),
              )
            : undefined,
        },
      },
    });
    expect(result?.tokenExtraRewardsList).toEqual({
      [mockTokenAddress]: [
        {
          address: "0xtoken" as Address,
          rewardToken: mockRewardTokenAddress,
          rewardSymbol: "REWARD",
          symbol: apyResp.data[0].rewards.extraRewards[0].rewardSymbol,
          token: apyResp.data[0].rewards.extraRewards[0].rewardToken,

          finished: BigInt(
            apyResp.data[0].rewards.extraRewards[0].finished || 0,
          ),
          duration: BigInt(
            apyResp.data[0].rewards.extraRewards[0].duration || 0,
          ),
          reward: BigInt(apyResp.data[0].rewards.extraRewards[0].reward || 0),
          balance: BigInt(apyResp.data[0].rewards.extraRewards[0].balance || 0),
        },
      ],
    });
    expect(result?.poolRewardsList).toEqual({
      [mockPoolAddress]: [
        {
          ...poolResp.data[0].rewards.points[0],
          token: poolResp.data[0].rewards.points[0].token,
          pool: poolResp.data[0].pool,
          amount: BigInt(poolResp.data[0].rewards.points[0].amount || 0),
        },
      ],
    });
    expect(result?.poolExternalAPYList).toEqual({
      [mockPoolAddress]: [
        {
          ...poolResp.data[0].rewards.externalAPY[0],
          pool: poolResp.data[0].pool,
        },
      ],
    });
    expect(result?.poolExtraAPYList).toEqual({
      [mockTokenAddress]: [
        {
          ...poolResp.data[0].rewards.extraAPY[0],
          token: mockTokenAddress,
          rewardToken: poolResp.data[0].rewards.extraAPY[0].rewardToken,
          rewardTokenSymbol:
            poolResp.data[0].rewards.extraAPY[0].rewardTokenSymbol,
          endTimestamp: poolResp.data[0].rewards.extraAPY[0].endTimestamp,
          lastUpdated: poolResp.data[0].rewards.extraAPY[0].lastUpdated,
        },
      ],
    });
  });

  it("returns undefined when all responses are rejected", () => {
    const apyResp = {
      status: "error",
      message: "APY request failed",
    } as DataResult<TokenOutputDetails<string>[]>;

    const poolResp = {
      status: "error",
      message: "Market rewards request failed",
    } as DataResult<PoolOutputDetails<string>[]>;

    const result = parseNetworkApy(apyResp, poolResp);

    expect(result).toBeUndefined();
  });

  it("handles rejected apyResp gracefully", () => {
    const apyResp = {
      status: "error",
      message: "APY request failed",
    } as DataResult<TokenOutputDetails<string>[]>;

    const poolResp = createPoolsData();

    const result = parseNetworkApy(apyResp, poolResp);

    expect(result).toBeDefined();
    expect(result?.apyList).toBeUndefined();
    expect(result?.pointsList).toBeUndefined();
    expect(result?.extraCollateralAPYList).toBeUndefined();
    expect(result?.extraCollateralPointsList).toBeUndefined();
    expect(result?.tokenExtraRewardsList).toBeUndefined();
    expect(result?.poolRewardsList).toEqual({
      [mockPoolAddress]: [
        {
          ...poolResp.data[0].rewards.points[0],
          token: mockTokenAddress,
          pool: mockPoolAddress,
          amount: BigInt(poolResp.data[0].rewards.points[0].amount || 0),
        },
      ],
    });
    expect(result?.poolExternalAPYList).toEqual({
      [mockPoolAddress]: [
        {
          ...poolResp.data[0].rewards.externalAPY[0],
          pool: poolResp.data[0].pool,
        },
      ],
    });
    expect(result?.poolExtraAPYList).toEqual({
      [mockTokenAddress]: [
        {
          ...poolResp.data[0].rewards.extraAPY[0],
          token: mockTokenAddress,
          rewardToken: poolResp.data[0].rewards.extraAPY[0].rewardToken,
          rewardTokenSymbol:
            poolResp.data[0].rewards.extraAPY[0].rewardTokenSymbol,
          endTimestamp: poolResp.data[0].rewards.extraAPY[0].endTimestamp,
          lastUpdated: poolResp.data[0].rewards.extraAPY[0].lastUpdated,
        },
      ],
    });
  });

  it("handles rejected poolResp gracefully", () => {
    const apyResp = createTokensData();

    const poolResp = {
      status: "error",
      message: "Market rewards request failed",
    } as DataResult<PoolOutputDetails<string>[]>;

    const result = parseNetworkApy(apyResp, poolResp);

    expect(result).toBeDefined();
    expect(result?.apyList).toEqual({
      [mockTokenAddress]: numberToAPY(apyResp.data[0].rewards.apy[0].value),
    });
    expect(result?.poolRewardsList).toBeUndefined();
    expect(result?.poolExternalAPYList).toBeUndefined();
    expect(result?.poolExtraAPYList).toBeUndefined();
  });

  it("handles empty data arrays", () => {
    const apyResp: DataResult<TokenOutputDetails<string>[]> = {
      status: "ok",
      data: [],
    };

    const poolResp: DataResult<PoolOutputDetails<string>[]> = {
      status: "ok",
      data: [],
    };

    const result = parseNetworkApy(apyResp, poolResp);

    expect(result).toBeDefined();
    expect(result?.apyList).toBeUndefined();
    expect(result?.pointsList).toBeUndefined();
    expect(result?.extraCollateralAPYList).toBeUndefined();
    expect(result?.extraCollateralPointsList).toBeUndefined();
    expect(result?.tokenExtraRewardsList).toBeUndefined();
    expect(result?.poolRewardsList).toBeUndefined();
    expect(result?.poolExternalAPYList).toBeUndefined();
    expect(result?.poolExtraAPYList).toBeUndefined();
  });

  it("processes 'soon' multiplier correctly", () => {
    const apyResp = createTokensData([
      {
        ...baseToken,
        rewards: {
          ...baseToken.rewards,
          points: [
            {
              rewards: [
                {
                  name: "Soon Reward",
                  units: "pts",
                  multiplier: "soon",
                  type: "test",
                },
              ],
              debtRewards: [
                {
                  name: "Soon Debt Reward",
                  units: "pts",
                  multiplier: "soon",
                  type: "debt",
                  cm: "0xcm",
                },
              ],
            },
          ],
          extraRewards: [],
          extraCollateralAPY: [],
          extraCollateralPoints: [],
        },
      },
    ]);

    const poolResp = createPoolsData();

    const result = parseNetworkApy(apyResp, poolResp);

    expect(result).toBeDefined();
    expect(result?.pointsList).toEqual({
      [mockTokenAddress]: {
        address: mockTokenAddress,
        symbol: "TOKEN",
        rewards: [
          {
            name: "Soon Reward",
            units: "pts",
            multiplier: "soon",
            type: "test",
          },
        ],
        debtRewards: [
          {
            name: "Soon Debt Reward",
            units: "pts",
            multiplier: "soon",
            type: "debt",
            cm: "0xcm",
          },
        ],
      },
    });
  });

  it("handles missing optional fields gracefully", () => {
    const apyResp = createTokensData([
      {
        ...baseToken,
        rewards: {
          apy: [{ protocol: "test", value: 0.1, lastUpdated: "2023-01-01" }],
          points: [],
          extraRewards: [],
          extraCollateralAPY: [],
          extraCollateralPoints: [],
        },
      },
    ]);

    const poolResp = createPoolsData([
      {
        chainId: 1,
        pool: mockPoolAddress,
        rewards: {
          points: [],
          externalAPY: [],
          extraAPY: [],
        },
      },
    ]);

    const result = parseNetworkApy(apyResp, poolResp);

    expect(result).toBeDefined();
    expect(result?.apyList).toEqual({
      [mockTokenAddress]: numberToAPY(0.1),
    });
    expect(result?.pointsList).toBeUndefined();
    expect(result?.extraCollateralAPYList).toBeUndefined();
    expect(result?.extraCollateralPointsList).toBeUndefined();
    expect(result?.tokenExtraRewardsList).toBeUndefined();
  });
});
