import {
  CHAINS,
  extractTokenData,
  isDieselStakedToken,
  MCall,
  multicall,
  MULTICALL_ADDRESS,
  NetworkType,
  SupportedToken,
  toBigInt,
  tokenSymbolByAddress,
  TypedObjectUtils,
} from "@gearbox-protocol/sdk-gov";
import axios from "axios";
import { getAddress, Interface, Provider, Signer } from "ethers";
import { Address, PublicClient } from "viem";

import {
  IAirdropDistributor,
  IAirdropDistributor__factory,
  IFarmingPool,
  IFarmingPool__factory,
} from "../types";
import { iFarmingPoolAbi, iMulticall3Abi } from "../types-viem";
import { makeTransactionCall } from "../utils/calls";
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
  distributor: IAirdropDistributor;
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
  Optimism: [],
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
  provider: Provider | Signer;

  airdropDistributorAddress: Address | undefined;
  network: NetworkType;
  reportError?: ReportHandler;
}

export interface ClaimLmRewardsV2Props {
  signer: Signer;
  account: Address;
  provider: Provider;

  airdropDistributorAddress: Address | undefined;
  network: NetworkType;
}

export interface ClaimLmRewardsV3Props {
  reward: GearboxStakedV3LmReward;
  signer: Signer;
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

      ...tokenWithExtraRewards.map(symbol =>
        axios.get<MerkleXYZRewardsCampaignsResponse>(
          MerkleXYZApi.getRewardsCampaignsUrl({
            params: {
              chainId,
              mainParameter: getAddress(currentTokenData[symbol]),
            },
          }),
        ),
      ),
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

    const distributor = IAirdropDistributor__factory.connect(
      airdropDistributorAddress,
      provider,
    );

    const [claimedResp, merkleDataResp] = await Promise.all([
      this.getClaimed({ distributor, account }),
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

    const farmedCalls: Array<MCall<IFarmingPool["interface"]>> = poolTokens.map(
      address => ({
        address: address,
        interface: IFarmingPool__factory.createInterface(),
        method: "farmed(address)",
        params: [account],
      }),
    );

    const [gearboxLmResponse, merkleXYZLMResponse] = await Promise.allSettled([
      multicall<Array<bigint>>(farmedCalls, provider),
      axios.get<MerkleXYZUserRewardsResponse>(
        MerkleXYZApi.getUserRewardsUrl({
          params: {
            chainId: CHAINS[network],
            user: getAddress(account),
          },
        }),
      ),
    ]);

    const gearboxLm =
      this.extractFulfilled(gearboxLmResponse, reportError, "v3Rewards") || [];
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

    const distributor = IAirdropDistributor__factory.connect(
      airdropDistributorAddress,
      signer,
    );
    const merkleData = await this.getMerkle(
      provider,
      airdropDistributorAddress,
      network,
      account,
    );

    const rewardFromMerkle = merkleData?.claims[account];
    if (!rewardFromMerkle) throw new Error("No rewards found");

    return makeTransactionCall(
      distributor.claim,
      [
        rewardFromMerkle.index,
        account,
        rewardFromMerkle.amount,
        rewardFromMerkle.proof,
      ],
      signer,
    );
  }

  static async claimLmRewardsV3({ reward, signer }: ClaimLmRewardsV3Props) {
    const pool = IFarmingPool__factory.connect(reward.poolToken, signer);

    return makeTransactionCall(pool.claim, [], signer);
  }

  private static async getMerkle(
    provider: Provider | Signer,
    distributorAddress: string,
    network: NetworkType,
    account: string,
  ): Promise<MerkleDistributorInfo> {
    const distributor = IAirdropDistributor__factory.connect(
      distributorAddress,
      provider,
    );
    const root = await distributor.merkleRoot();

    const path = `${network}_${root.slice(2)}/${account.slice(2, 4)}`;
    const url = `https://am.gearbox.finance/${path.toLowerCase()}.json`;

    const result = await axios.get<MerkleDistributorInfo>(url);
    return result.data;
  }

  private static async getClaimed({
    distributor,
    account,
  }: GetTotalClaimedProps) {
    const claimedRewardsResponse = await distributor.queryFilter(
      distributor.filters.Claimed(account, undefined, false),
    );

    const claimedRewards = (claimedRewardsResponse || []).reduce(
      (acc, r) => acc + r.args.amount,
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

const POOL_REWARD_INTERFACE = new Interface(POOL_REWARDS_ABI);
