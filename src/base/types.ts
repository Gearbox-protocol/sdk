import type {
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";
import type { Address } from "viem";

import type {
  dataCompressorV3Abi,
  iCreditAccountCompressorAbi,
  iMarketCompressorAbi,
  iPriceFeedCompressorAbi,
} from "../abi";

type Unarray<A> = A extends readonly unknown[] ? Unarray<A[number]> : A;

export type CreditManagerDataStruct = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<
      typeof dataCompressorV3Abi,
      "getCreditManagersV3List"
    >["outputs"]
  >
>;

export type CreditAccountStruct = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<
      typeof iCreditAccountCompressorAbi,
      "getCreditAccountData"
    >["outputs"]
  >
>;

export type TokenInfoStruct = Unarray<CreditAccountStruct["tokens"]>;

export type MarketDataStruct = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof iMarketCompressorAbi, "getMarketData">["outputs"]
  >
>;

export type CreditManagerStruct = Unarray<MarketDataStruct["creditManagers"]>;
export type TokenMetaStruct = Unarray<MarketDataStruct["tokens"]>;
export type PoolStruct = MarketDataStruct["pool"];
export type PoolQuotaKeeperStruct = MarketDataStruct["poolQuotaKeeper"];
export type RateKeeperStruct = MarketDataStruct["rateKeeper"];

export type PoolDataStruct = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof dataCompressorV3Abi, "getPoolsV3List">["outputs"]
  >
>;

export type GetPriceFeedsResult = AbiParametersToPrimitiveTypes<
  ExtractAbiFunction<typeof iPriceFeedCompressorAbi, "getPriceFeeds">["outputs"]
>;

export type PriceFeedMapEntry = Unarray<GetPriceFeedsResult[0]>;
export type PriceFeedTreeNode = Unarray<GetPriceFeedsResult[1]>;

export interface MarketData {
  riskCuratorManager: Address;
  acl: {
    addr: Address;
    version: bigint;
    owner: Address;
    pausableAdmins: Address[];
    unpausableAdmins: Address[];
    serialisedData: string;
  };
  pool: {
    addr: Address;
    version: bigint;
    contractType: string;
    symbol: string;
    name: string;
    decimals: number;
    totalSupply: bigint;
    poolQuotaKeeper: Address;
    interestRateModel: Address;
    controller: Address;
    underlying: Address;
    availableLiquidity: bigint;
    expectedLiquidity: bigint;
    baseInterestIndex: bigint;
    baseInterestRate: bigint;
    dieselRate: bigint;
    totalBorrowed: bigint;
    totalAssets: bigint;
    supplyRate: bigint;
    withdrawFee: bigint;
    totalDebtLimit: bigint;
    creditManagerDebtParams: CreditManagerDebtParamsStruct[];
    lastBaseInterestUpdate: bigint;
    baseInterestIndexLU: bigint;
    isPaused: boolean;
  };
  poolQuotaKeeper: {
    addr: Address;
    version: bigint;
    contractType: string;
    rateKeeper: Address;
    // {
    //   name: 'quotas',
    //   internalType: 'struct QuotaTokenParams[]',
    //   type: 'tuple[]',
    //   components: [
    //     { name: 'token', internalType: 'address', type: 'address' },
    //     { name: 'rate', internalType: 'uint16', type: 'uint16' },
    //     {
    //       name: 'cumulativeIndexLU',
    //       internalType: 'uint192',
    //       type: 'uint192',
    //     },
    //     {
    //       name: 'quotaIncreaseFee',
    //       internalType: 'uint16',
    //       type: 'uint16',
    //     },
    //     {
    //       name: 'totalQuoted',
    //       internalType: 'uint96',
    //       type: 'uint96',
    //     },
    //     { name: 'limit', internalType: 'uint96', type: 'uint96' },
    //     { name: 'isActive', internalType: 'bool', type: 'bool' },
    //   ],
    // },
    quotas: QuotaInfoStruct[];
    creditManagers: Address[];
    lastQuotaRateUpdate: bigint;
  };
  interestRateModel: {
    addr: Address;
    version: bigint;
    contractType: string;
    serializedParams: string;
  };
  rateKeeper: {
    addr: Address;
    version: bigint;
    contractType: string;
    rates: Array<{
      token: Address;
      rate: number;
    }>;
    serialisedData: string;
  };
  tokens: Array<Address>;
  creditManagers: Array<{
    creditFacade: {
      addr: Address;
      version: bigint;
      contractType: string;
      creditManager: Address;
      creditConfigurator: Address;
      minDebt: bigint;
      maxDebt: bigint;
      degenNFT: Address;
      forbiddenTokenMask: bigint;
      lossLiquidator: Address;
      isPaused: boolean;
    };
    creditManager: {
      addr: Address;
      version: bigint;
      contractType: string;
      name: string;
      creditFacade: Address;
      cfVersion: number;
      cfContractType: string;
      creditConfigurator: Address;
      underlying: Address;
      pool: Address;
      totalDebt: bigint;
      totalDebtLimit: bigint;
      minDebt: bigint;
      maxDebt: bigint;
      degenNFT: Address;
      availableToBorrow: bigint;
      collateralTokens: Address[];
      adapters: Array<{
        targetContract: Address;
        adapter: Address;
        adapterType: number;
        version: bigint;
        stateSerialised: string;
      }>;
      liquidationThresholds: number[];
      forbiddenTokenMask: bigint;
      maxEnabledTokensLength: number;
      feeInterest: number;
      feeLiquidation: number;
      liquidationDiscount: number;
      feeLiquidationExpired: number;
      liquidationDiscountExpired: number;
    };
  }>;
  priceOracleData: {
    addr: Address;
    version: bigint;
    contractType: string;
    priceFeedMapping: PriceFeedMapEntry[];
    priceFeedStructure: PriceFeedTreeNode[];
  };
  emergencyLiquidators: Array<Address>;
}

export type GaugeInfoStruct = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof dataCompressorV3Abi, "getGaugesV3Data">["outputs"]
  >
>;

export type CreditAccountDataStruct = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<
      typeof dataCompressorV3Abi,
      "getCreditAccountData"
    >["outputs"]
  >
>;

export interface CreditManagerDebtParamsStruct {
  creditManager: Address;
  borrowed: bigint;
  limit: bigint;
  availableToBorrow: bigint;
}

export interface QuotaInfoStruct {
  token: Address;
  rate: bigint;
  quotaIncreaseFee: bigint;
  totalQuoted: bigint;
  limit: bigint;
  isActive: boolean;
}

export interface LinearModelStruct {
  interestModel: Address;
  version: bigint;
  U_1: number;
  U_2: number;
  R_base: number;
  R_slope1: number;
  R_slope2: number;
  R_slope3: number;
  isBorrowingMoreU2Forbidden: boolean;
}

export interface GaugeQuotaParamsStruct {
  token: Address;
  minRate: number;
  maxRate: number;
  totalVotesLpSide: bigint;
  totalVotesCaSide: bigint;
  rate: number;
  quotaIncreaseFee: number;
  totalQuoted: bigint;
  limit: bigint;
  isActive: boolean;
  stakerVotesLpSide: bigint;
  stakerVotesCaSide: bigint;
}

export enum VotingContractStatus {
  NOT_ALLOWED = 0,
  ALLOWED = 1,
  UNVOTE_ONLY = 2,
}
