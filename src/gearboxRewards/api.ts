import {
  CHAINS,
  extractTokenData,
  isDieselStakedToken,
  MULTICALL_ADDRESS,
  NetworkType,
  SupportedToken,
  toBigInt,
  tokenSymbolByAddress,
  TypedObjectUtils,
} from "@gearbox-protocol/sdk-gov";
import axios from "axios";
import {
  Address,
  getAddress,
  getContract,
  PublicClient,
  WalletClient,
} from "viem";

import {
  iAirdropDistributorAbi,
  iFarmingPoolAbi,
  iMulticall3Abi,
} from "../types";
import { toBN } from "../utils/formatter";
import { BigIntMath } from "../utils/math";
import {
  MerkleXYZApi,
  MerkleXYZRewardsCampaignsResponse,
  MerkleXYZUserRewardsResponse,
} from "./merklAPI";

export interface GearboxExtraMerkleLmReward {
  poolToken: Address;
  rewardToken: Address;
  amount: bigint;
  type: "extraMerkle";
}
export interface GearboxStakedV3LmReward {
  poolToken: Address;
  rewardToken: Address;
  amount: bigint;
  type: "stakedV3";
}
export interface GearboxMerkleV2LmReward {
  poolToken?: Address;
  rewardToken: Address;
  amount: bigint;
  type: "merkleV2";
}

export type GearboxLmReward =
  | GearboxStakedV3LmReward
  | GearboxMerkleV2LmReward
  | GearboxExtraMerkleLmReward;

interface GetTotalClaimedProps {
  account: Address;
  provider: PublicClient;
  airdropDistributorAddress: Address;
}

interface GetAmountOnContractProps {
  account: Address;
  merkleData: MerkleDistributorInfo | undefined;
}

export interface MerkleDistributorInfo {
  merkleRoot: string;
  tokenTotal: string;
  claims: Record<
    string,
    {
      index: number;
      amount: string;
      proof: Array<Address>;
    }
  >;
}

interface FarmInfoOutput {
  finished: number;
  duration: number;
  reward: bigint;
  balance: bigint;
}
export interface FarmInfo {
  finished: bigint;
  duration: bigint;
  reward: bigint;
  balance: bigint;
  symbol: SupportedToken;
}

type PoolsWithExtraRewardsList = Record<NetworkType, Array<SupportedToken>>;

const DEFAULT_POOLS_WITH_EXTRA_REWARDS: PoolsWithExtraRewardsList = {
  Mainnet: ["sdcrvUSDV3"],
  Arbitrum: [],
  Optimism: ["sdUSDC_eV3", "sdWETHV3"],
  Base: [],
};

type ReportHandler = (e: unknown, description?: string) => void;

export interface GetLmRewardsInfoProps {
  currentTokenData: Record<SupportedToken, Address>;
  provider: PublicClient;

  multicallAddress: Address;

  poolsWithExtraRewards?: PoolsWithExtraRewardsList;
  network: NetworkType;
  reportError?: ReportHandler;
}

export interface GetLmRewardsProps {
  baseRewardPoolsInfo: Record<string, FarmInfo>;
  currentTokenData: Record<SupportedToken, Address>;
  account: Address;
  provider: PublicClient;

  airdropDistributorAddress: Address | undefined;
  network: NetworkType;
  reportError?: ReportHandler;
}

export interface ClaimLmRewardsV2Props {
  signer: WalletClient;
  account: Address;
  provider: PublicClient;

  airdropDistributorAddress: Address | undefined;
  network: NetworkType;
}

export interface ClaimLmRewardsV3Props {
  reward: GearboxStakedV3LmReward;
  account: Address;
  signer: WalletClient;
}

export class GearboxRewardsApi {
  static async getLmRewardsInfo({
    currentTokenData,
    provider,
    multicallAddress,

    poolsWithExtraRewards = DEFAULT_POOLS_WITH_EXTRA_REWARDS,
    network,
    reportError,
  }: GetLmRewardsInfoProps) {
    const poolTokens = TypedObjectUtils.entries(currentTokenData).filter(
      ([symbol]) => isDieselStakedToken(symbol),
    );

    const farmInfoCalls = poolTokens.map(([, address]) => ({
      address,
      abi: iFarmingPoolAbi,
      functionName: "farmInfo",
      args: [],
    }));

    const farmSupplyCalls = poolTokens.map(([, address]) => ({
      address,
      abi: iFarmingPoolAbi,
      functionName: "totalSupply",
      args: [],
    }));

    const rewardTokenCalls = poolTokens.map(([, address]) => ({
      address,
      abi: POOL_REWARDS_ABI,
      functionName: "rewardsToken",
      args: [],
    }));

    const tokenWithExtraRewards = poolsWithExtraRewards[network] || [];
    const chainId = CHAINS[network];

    const [mc, ...extra] = await Promise.allSettled([
      provider.multicall({
        allowFailure: false,
        multicallAddress: MULTICALL_ADDRESS,
        contracts: [
          {
            address: multicallAddress,
            abi: iMulticall3Abi as any,
            functionName: "getCurrentBlockTimestamp",
            args: [],
          },

          ...farmInfoCalls,
          ...farmSupplyCalls,
          ...rewardTokenCalls,
        ],
      }),

      ...tokenWithExtraRewards.map(symbol => {
        const addr = currentTokenData[symbol];

        if (!addr)
          return (async () => {
            getAddress(addr);
          })();

        return axios.get<MerkleXYZRewardsCampaignsResponse>(
          MerkleXYZApi.getRewardsCampaignsUrl({
            params: {
              chainId,
              mainParameter: getAddress(addr),
            },
          }),
        );
      }),
    ]);

    const mcResponse =
      this.extractFulfilled(mc, reportError, "rewardsInfoMulticall") || [];
    const [ts = 0n, ...restMCResponse] = mcResponse;
    const blockTimestamp = (ts as bigint) || 0n;

    const farmInfoCallsEnd = farmInfoCalls.length;
    const farmInfo = restMCResponse.slice(
      0,
      farmInfoCallsEnd,
    ) as Array<FarmInfoOutput>;

    const farmSupplyCallsEnd = farmInfoCallsEnd + farmSupplyCalls.length;
    const farmSupply = restMCResponse.slice(
      farmInfoCallsEnd,
      farmSupplyCallsEnd,
    ) as Array<bigint>;

    const rewardTokenCallsEnd = farmSupplyCallsEnd + rewardTokenCalls.length;
    const rewardTokens = restMCResponse.slice(
      farmSupplyCallsEnd,
      rewardTokenCallsEnd,
    ) as Array<string>;

    const extraRewards = extra.reduce<Record<string, Array<FarmInfo>>>(
      (acc, r, index) => {
        const stakedSymbol = tokenWithExtraRewards[index];

        const safeResp = this.extractFulfilled(
          r,
          reportError,
          `merkleCampaign: ${stakedSymbol}`,
        );

        const l = safeResp?.data.reduce<Array<FarmInfo>>((infos, d) => {
          const started = toBigInt(d.startTimestamp || 0);
          const finished = toBigInt(d.endTimestamp || 0);

          if (blockTimestamp >= started && blockTimestamp <= finished) {
            const rewardTokenLc = (d.rewardToken || "").toLowerCase();
            const [rewardSymbol, decimals = 18] =
              extractTokenData(rewardTokenLc);
            const reward = toBN(d.amountDecimal, decimals);

            if (rewardSymbol && reward > 0) {
              infos.push({
                duration: toBigInt(d.endTimestamp - d.startTimestamp),
                finished,
                reward,
                balance: 0n,
                symbol: rewardSymbol,
              });
            }
          }

          return infos;
        }, []);

        if (l) {
          acc[currentTokenData[stakedSymbol]] = l;
        }

        return acc;
      },
      {},
    );

    const rewardPoolsInfo = poolTokens.reduce<{
      base: Record<string, FarmInfo>;
      extra: Record<string, Array<FarmInfo>>;
      all: Record<string, Array<FarmInfo>>;
    }>(
      (acc, [, address], i) => {
        const currentInfo = farmInfo[i];
        const [symbol] = extractTokenData(rewardTokens[i] || "");

        if (symbol) {
          const baseReward: FarmInfo = {
            duration: BigInt(currentInfo.duration),
            finished: BigInt(currentInfo.finished),
            reward: currentInfo.reward,
            balance: currentInfo.balance,
            symbol: symbol,
          };

          const extra = extraRewards[address] || [];

          acc.base[address] = baseReward;
          acc.extra[address] = extra;
          acc.all[address] = [baseReward, ...extra];
        }

        return acc;
      },
      { base: {}, extra: {}, all: {} },
    );

    const rewardPoolsSupply = poolTokens.reduce<Record<string, bigint>>(
      (acc, [, address], i) => {
        acc[address] = farmSupply[i] || 0n;

        return acc;
      },
      {},
    );

    return {
      rewardPoolsInfo: rewardPoolsInfo.all,
      baseRewardPoolsInfo: rewardPoolsInfo.base,
      extraRewardPoolsInfo: rewardPoolsInfo.extra,
      rewardPoolsSupply,
    };
  }

  static async getLmRewardsV2({
    provider,
    account,
    currentTokenData,

    network,
    airdropDistributorAddress,
  }: GetLmRewardsProps) {
    if (!airdropDistributorAddress) return { rewards: [] };

    const [claimedResp, merkleDataResp] = await Promise.all([
      this.getClaimed({ airdropDistributorAddress, provider, account }),
      this.getMerkle(provider, airdropDistributorAddress, network, account),
    ]);

    const amountOnContract = this.getAmountOnContract({
      account,
      merkleData: merkleDataResp,
    });
    const diff = amountOnContract - claimedResp;
    const availableToClaimV2 = BigIntMath.max(0n, diff);

    const rewards: Array<GearboxLmReward> = [
      {
        amount: availableToClaimV2,
        type: "merkleV2",
        rewardToken: currentTokenData.GEAR,
      },
    ];

    return { rewards: rewards };
  }

  static async getLmRewardsV3({
    baseRewardPoolsInfo,
    currentTokenData,
    provider,
    account,

    network,
    reportError,
  }: GetLmRewardsProps) {
    const poolTokens = Object.keys(baseRewardPoolsInfo) as Array<Address>;

    const [gearboxLmResponse, merkleXYZLMResponse] = await Promise.allSettled([
      provider.multicall({
        allowFailure: false,
        multicallAddress: MULTICALL_ADDRESS,
        contracts: poolTokens.map(address => ({
          address: address,
          abi: iFarmingPoolAbi,
          functionName: "farmed",
          args: [account],
        })),
      }),
      axios.get<MerkleXYZUserRewardsResponse>(
        MerkleXYZApi.getUserRewardsUrl({
          params: {
            chainId: CHAINS[network],
            user: getAddress(account),
          },
        }),
      ),
    ]);

    const gearboxLm = (this.extractFulfilled(
      gearboxLmResponse,
      reportError,
      "v3Rewards",
    ) || []) as Array<bigint>;
    const merkleXYZLM = this.extractFulfilled(
      merkleXYZLMResponse,
      reportError,
      "merkleRewards",
    )?.data;

    const PREFIX = "ERC20";
    const REWARD_KEYS_RECORD = poolTokens.reduce<Record<string, Address>>(
      (acc, t) => {
        const key = [PREFIX, getAddress(t)].join("_");
        acc[key] = t;
        return acc;
      },
      {},
    );

    const extraRewards = Object.entries(merkleXYZLM || {}).reduce<
      Array<GearboxLmReward>
    >((acc, [k, v]) => {
      const rewardToken = k.toLowerCase() as Address;

      Object.entries(v.reasons).forEach(([key, reason]) => {
        const poolToken = REWARD_KEYS_RECORD[key];
        if (poolToken && tokenSymbolByAddress[rewardToken]) {
          acc.push({
            poolToken,
            rewardToken,
            amount: toBigInt(reason.unclaimed || 0n),
            type: "extraMerkle",
          });
        }
      });

      return acc;
    }, []);

    const gearboxLmRewards = poolTokens.map((address, i): GearboxLmReward => {
      return {
        poolToken: address,
        rewardToken: currentTokenData[baseRewardPoolsInfo[address].symbol],
        amount: gearboxLm[i] || 0n,
        type: "stakedV3",
      };
    });

    const { zero, nonZero } = gearboxLmRewards.reduce<{
      nonZero: Array<GearboxLmReward>;
      zero: Array<GearboxLmReward>;
    }>(
      (acc, r) => {
        const amount = r.amount || 0n;
        if (amount > 0n) {
          acc.nonZero.push(r);
        } else {
          acc.zero.push(r);
        }

        return acc;
      },
      { nonZero: [], zero: [] },
    );

    return {
      rewards: [...nonZero, ...extraRewards, zero],
    };
  }

  private static extractFulfilled<T>(
    r: PromiseSettledResult<T>,
    reportError?: ReportHandler,
    description?: string,
  ) {
    if (r.status === "fulfilled") {
      return r.value;
    } else {
      if (reportError) {
        reportError(r.reason, description);
      } else {
        console.error(r.reason);
      }
      return undefined;
    }
  }

  static async claimLmRewardsV2({
    signer,
    account,
    provider,

    network,
    airdropDistributorAddress,
  }: ClaimLmRewardsV2Props) {
    if (!airdropDistributorAddress)
      throw new Error(`V2 rewards are not supported on chain: ${network}`);

    const merkleData = await this.getMerkle(
      provider,
      airdropDistributorAddress,
      network,
      account,
    );

    const rewardFromMerkle = merkleData?.claims[account];
    if (!rewardFromMerkle) throw new Error("No rewards found");

    const distributor = getContract({
      address: airdropDistributorAddress,
      abi: iAirdropDistributorAbi,
      client: signer,
    });

    return distributor.write.claim(
      [
        BigInt(rewardFromMerkle.index),
        account,
        toBigInt(rewardFromMerkle.amount),
        rewardFromMerkle.proof,
      ],
      {
        account: account,
        chain: signer.chain,
      },
    );
  }

  static async claimLmRewardsV3({
    reward,
    signer,
    account,
  }: ClaimLmRewardsV3Props) {
    const pool = getContract({
      address: reward.poolToken,
      abi: iFarmingPoolAbi,
      client: signer,
    });

    return pool.write.claim({
      account: account,
      chain: signer.chain,
    });
  }

  private static async getMerkle(
    provider: PublicClient,
    distributorAddress: Address,
    network: NetworkType,
    account: Address,
  ): Promise<MerkleDistributorInfo> {
    const distributor = getContract({
      address: distributorAddress,
      abi: iAirdropDistributorAbi,
      client: provider,
    });

    const root = await distributor.read.merkleRoot();

    const path = `${network}_${root.slice(2)}/${account.slice(2, 4)}`;
    const url = `https://am.gearbox.finance/${path.toLowerCase()}.json`;

    const result = await axios.get<MerkleDistributorInfo>(url);
    return result.data;
  }

  private static async getClaimed({
    provider,
    airdropDistributorAddress,
    account,
  }: GetTotalClaimedProps) {
    const distributor = getContract({
      address: airdropDistributorAddress,
      abi: iAirdropDistributorAbi,
      client: provider,
    });

    const claimedRewardsResponse = await distributor.getEvents.Claimed(
      {
        account,
        historic: false,
      },
      {
        fromBlock: 0n,
      },
    );

    const claimedRewards = (claimedRewardsResponse || []).reduce(
      (acc, r) => acc + (r.args.amount || 0n),
      0n,
    );
    return claimedRewards;
  }

  private static getAmountOnContract({
    account,
    merkleData,
  }: GetAmountOnContractProps) {
    const { claims = {} } = merkleData || {};
    const { amount } = claims[account] || {};

    return BigInt(amount || 0);
  }
}

const POOL_REWARDS_ABI = [
  {
    inputs: [],
    name: "rewardsToken",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
