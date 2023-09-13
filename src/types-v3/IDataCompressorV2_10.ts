/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "./common";

export type TokenBalanceStruct = {
  token: PromiseOrValue<string>;
  balance: PromiseOrValue<BigNumberish>;
  isForbidden: PromiseOrValue<boolean>;
  isEnabled: PromiseOrValue<boolean>;
  isQuoted: PromiseOrValue<boolean>;
  quota: PromiseOrValue<BigNumberish>;
  quotaRate: PromiseOrValue<BigNumberish>;
};

export type TokenBalanceStructOutput = [
  string,
  BigNumber,
  boolean,
  boolean,
  boolean,
  BigNumber,
  number,
] & {
  token: string;
  balance: BigNumber;
  isForbidden: boolean;
  isEnabled: boolean;
  isQuoted: boolean;
  quota: BigNumber;
  quotaRate: number;
};

export type ScheduledWithdrawalStruct = {
  tokenIndex: PromiseOrValue<BigNumberish>;
  maturity: PromiseOrValue<BigNumberish>;
  token: PromiseOrValue<string>;
  amount: PromiseOrValue<BigNumberish>;
};

export type ScheduledWithdrawalStructOutput = [
  number,
  number,
  string,
  BigNumber,
] & { tokenIndex: number; maturity: number; token: string; amount: BigNumber };

export type CreditAccountDataStruct = {
  isSuccessful: PromiseOrValue<boolean>;
  priceFeedsNeeded: PromiseOrValue<string>[];
  addr: PromiseOrValue<string>;
  borrower: PromiseOrValue<string>;
  creditManager: PromiseOrValue<string>;
  creditFacade: PromiseOrValue<string>;
  underlying: PromiseOrValue<string>;
  debt: PromiseOrValue<BigNumberish>;
  cumulativeIndexNow: PromiseOrValue<BigNumberish>;
  cumulativeIndexLastUpdate: PromiseOrValue<BigNumberish>;
  cumulativeQuotaInterest: PromiseOrValue<BigNumberish>;
  accruedInterest: PromiseOrValue<BigNumberish>;
  accruedFees: PromiseOrValue<BigNumberish>;
  totalDebtUSD: PromiseOrValue<BigNumberish>;
  totalValue: PromiseOrValue<BigNumberish>;
  totalValueUSD: PromiseOrValue<BigNumberish>;
  twvUSD: PromiseOrValue<BigNumberish>;
  enabledTokensMask: PromiseOrValue<BigNumberish>;
  healthFactor: PromiseOrValue<BigNumberish>;
  baseBorrowRate: PromiseOrValue<BigNumberish>;
  aggregatedBorrowRate: PromiseOrValue<BigNumberish>;
  balances: TokenBalanceStruct[];
  since: PromiseOrValue<BigNumberish>;
  cfVersion: PromiseOrValue<BigNumberish>;
  expirationDate: PromiseOrValue<BigNumberish>;
  activeBots: PromiseOrValue<string>[];
  maxApprovedBots: PromiseOrValue<BigNumberish>;
  schedultedWithdrawals: [ScheduledWithdrawalStruct, ScheduledWithdrawalStruct];
};

export type CreditAccountDataStructOutput = [
  boolean,
  string[],
  string,
  string,
  string,
  string,
  string,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  TokenBalanceStructOutput[],
  BigNumber,
  BigNumber,
  number,
  string[],
  BigNumber,
  [ScheduledWithdrawalStructOutput, ScheduledWithdrawalStructOutput],
] & {
  isSuccessful: boolean;
  priceFeedsNeeded: string[];
  addr: string;
  borrower: string;
  creditManager: string;
  creditFacade: string;
  underlying: string;
  debt: BigNumber;
  cumulativeIndexNow: BigNumber;
  cumulativeIndexLastUpdate: BigNumber;
  cumulativeQuotaInterest: BigNumber;
  accruedInterest: BigNumber;
  accruedFees: BigNumber;
  totalDebtUSD: BigNumber;
  totalValue: BigNumber;
  totalValueUSD: BigNumber;
  twvUSD: BigNumber;
  enabledTokensMask: BigNumber;
  healthFactor: BigNumber;
  baseBorrowRate: BigNumber;
  aggregatedBorrowRate: BigNumber;
  balances: TokenBalanceStructOutput[];
  since: BigNumber;
  cfVersion: BigNumber;
  expirationDate: number;
  activeBots: string[];
  maxApprovedBots: BigNumber;
  schedultedWithdrawals: [
    ScheduledWithdrawalStructOutput,
    ScheduledWithdrawalStructOutput,
  ];
};

export type ContractAdapterStruct = {
  targetContract: PromiseOrValue<string>;
  adapter: PromiseOrValue<string>;
};

export type ContractAdapterStructOutput = [string, string] & {
  targetContract: string;
  adapter: string;
};

export type QuotaInfoStruct = {
  token: PromiseOrValue<string>;
  rate: PromiseOrValue<BigNumberish>;
  quotaIncreaseFee: PromiseOrValue<BigNumberish>;
  totalQuoted: PromiseOrValue<BigNumberish>;
  limit: PromiseOrValue<BigNumberish>;
};

export type QuotaInfoStructOutput = [
  string,
  number,
  number,
  BigNumber,
  BigNumber,
] & {
  token: string;
  rate: number;
  quotaIncreaseFee: number;
  totalQuoted: BigNumber;
  limit: BigNumber;
};

export type LinearModelStruct = {
  interestModel: PromiseOrValue<string>;
  version: PromiseOrValue<BigNumberish>;
  U_1: PromiseOrValue<BigNumberish>;
  U_2: PromiseOrValue<BigNumberish>;
  R_base: PromiseOrValue<BigNumberish>;
  R_slope1: PromiseOrValue<BigNumberish>;
  R_slope2: PromiseOrValue<BigNumberish>;
  R_slope3: PromiseOrValue<BigNumberish>;
};

export type LinearModelStructOutput = [
  string,
  BigNumber,
  number,
  number,
  number,
  number,
  number,
  number,
] & {
  interestModel: string;
  version: BigNumber;
  U_1: number;
  U_2: number;
  R_base: number;
  R_slope1: number;
  R_slope2: number;
  R_slope3: number;
};

export type CreditManagerDataStruct = {
  addr: PromiseOrValue<string>;
  cfVersion: PromiseOrValue<BigNumberish>;
  creditFacade: PromiseOrValue<string>;
  creditConfigurator: PromiseOrValue<string>;
  underlying: PromiseOrValue<string>;
  pool: PromiseOrValue<string>;
  totalDebt: PromiseOrValue<BigNumberish>;
  totalDebtLimit: PromiseOrValue<BigNumberish>;
  baseBorrowRate: PromiseOrValue<BigNumberish>;
  minDebt: PromiseOrValue<BigNumberish>;
  maxDebt: PromiseOrValue<BigNumberish>;
  availableToBorrow: PromiseOrValue<BigNumberish>;
  collateralTokens: PromiseOrValue<string>[];
  adapters: ContractAdapterStruct[];
  liquidationThresholds: PromiseOrValue<BigNumberish>[];
  isDegenMode: PromiseOrValue<boolean>;
  degenNFT: PromiseOrValue<string>;
  forbiddenTokenMask: PromiseOrValue<BigNumberish>;
  maxEnabledTokensLength: PromiseOrValue<BigNumberish>;
  feeInterest: PromiseOrValue<BigNumberish>;
  feeLiquidation: PromiseOrValue<BigNumberish>;
  liquidationDiscount: PromiseOrValue<BigNumberish>;
  feeLiquidationExpired: PromiseOrValue<BigNumberish>;
  liquidationDiscountExpired: PromiseOrValue<BigNumberish>;
  quotas: QuotaInfoStruct[];
  lirm: LinearModelStruct;
  isPaused: PromiseOrValue<boolean>;
};

export type CreditManagerDataStructOutput = [
  string,
  BigNumber,
  string,
  string,
  string,
  string,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  string[],
  ContractAdapterStructOutput[],
  BigNumber[],
  boolean,
  string,
  BigNumber,
  number,
  number,
  number,
  number,
  number,
  number,
  QuotaInfoStructOutput[],
  LinearModelStructOutput,
  boolean,
] & {
  addr: string;
  cfVersion: BigNumber;
  creditFacade: string;
  creditConfigurator: string;
  underlying: string;
  pool: string;
  totalDebt: BigNumber;
  totalDebtLimit: BigNumber;
  baseBorrowRate: BigNumber;
  minDebt: BigNumber;
  maxDebt: BigNumber;
  availableToBorrow: BigNumber;
  collateralTokens: string[];
  adapters: ContractAdapterStructOutput[];
  liquidationThresholds: BigNumber[];
  isDegenMode: boolean;
  degenNFT: string;
  forbiddenTokenMask: BigNumber;
  maxEnabledTokensLength: number;
  feeInterest: number;
  feeLiquidation: number;
  liquidationDiscount: number;
  feeLiquidationExpired: number;
  liquidationDiscountExpired: number;
  quotas: QuotaInfoStructOutput[];
  lirm: LinearModelStructOutput;
  isPaused: boolean;
};

export type CreditManagerDebtParamsStruct = {
  creditManager: PromiseOrValue<string>;
  borrowed: PromiseOrValue<BigNumberish>;
  limit: PromiseOrValue<BigNumberish>;
  availableToBorrow: PromiseOrValue<BigNumberish>;
};

export type CreditManagerDebtParamsStructOutput = [
  string,
  BigNumber,
  BigNumber,
  BigNumber,
] & {
  creditManager: string;
  borrowed: BigNumber;
  limit: BigNumber;
  availableToBorrow: BigNumber;
};

export type PoolDataStruct = {
  addr: PromiseOrValue<string>;
  underlying: PromiseOrValue<string>;
  dieselToken: PromiseOrValue<string>;
  linearCumulativeIndex: PromiseOrValue<BigNumberish>;
  availableLiquidity: PromiseOrValue<BigNumberish>;
  expectedLiquidity: PromiseOrValue<BigNumberish>;
  totalBorrowed: PromiseOrValue<BigNumberish>;
  totalDebtLimit: PromiseOrValue<BigNumberish>;
  creditManagerDebtParams: CreditManagerDebtParamsStruct[];
  totalAssets: PromiseOrValue<BigNumberish>;
  totalSupply: PromiseOrValue<BigNumberish>;
  supplyRate: PromiseOrValue<BigNumberish>;
  baseInterestRate: PromiseOrValue<BigNumberish>;
  dieselRate_RAY: PromiseOrValue<BigNumberish>;
  withdrawFee: PromiseOrValue<BigNumberish>;
  cumulativeIndex_RAY: PromiseOrValue<BigNumberish>;
  baseInterestIndexLU: PromiseOrValue<BigNumberish>;
  version: PromiseOrValue<BigNumberish>;
  quotas: QuotaInfoStruct[];
  lirm: LinearModelStruct;
  isPaused: PromiseOrValue<boolean>;
};

export type PoolDataStructOutput = [
  string,
  string,
  string,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  CreditManagerDebtParamsStructOutput[],
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  BigNumber,
  QuotaInfoStructOutput[],
  LinearModelStructOutput,
  boolean,
] & {
  addr: string;
  underlying: string;
  dieselToken: string;
  linearCumulativeIndex: BigNumber;
  availableLiquidity: BigNumber;
  expectedLiquidity: BigNumber;
  totalBorrowed: BigNumber;
  totalDebtLimit: BigNumber;
  creditManagerDebtParams: CreditManagerDebtParamsStructOutput[];
  totalAssets: BigNumber;
  totalSupply: BigNumber;
  supplyRate: BigNumber;
  baseInterestRate: BigNumber;
  dieselRate_RAY: BigNumber;
  withdrawFee: BigNumber;
  cumulativeIndex_RAY: BigNumber;
  baseInterestIndexLU: BigNumber;
  version: BigNumber;
  quotas: QuotaInfoStructOutput[];
  lirm: LinearModelStructOutput;
  isPaused: boolean;
};

export interface IDataCompressorV2_10Interface extends utils.Interface {
  functions: {
    "getAdapter(address,address)": FunctionFragment;
    "getCreditAccountData(address,address)": FunctionFragment;
    "getCreditAccountList(address)": FunctionFragment;
    "getCreditManagerData(address)": FunctionFragment;
    "getCreditManagersV2List()": FunctionFragment;
    "getPoolData(address)": FunctionFragment;
    "getPoolsV1List()": FunctionFragment;
    "hasOpenedCreditAccount(address,address)": FunctionFragment;
    "version()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "getAdapter"
      | "getCreditAccountData"
      | "getCreditAccountList"
      | "getCreditManagerData"
      | "getCreditManagersV2List"
      | "getPoolData"
      | "getPoolsV1List"
      | "hasOpenedCreditAccount"
      | "version",
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "getAdapter",
    values: [PromiseOrValue<string>, PromiseOrValue<string>],
  ): string;
  encodeFunctionData(
    functionFragment: "getCreditAccountData",
    values: [PromiseOrValue<string>, PromiseOrValue<string>],
  ): string;
  encodeFunctionData(
    functionFragment: "getCreditAccountList",
    values: [PromiseOrValue<string>],
  ): string;
  encodeFunctionData(
    functionFragment: "getCreditManagerData",
    values: [PromiseOrValue<string>],
  ): string;
  encodeFunctionData(
    functionFragment: "getCreditManagersV2List",
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: "getPoolData",
    values: [PromiseOrValue<string>],
  ): string;
  encodeFunctionData(
    functionFragment: "getPoolsV1List",
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: "hasOpenedCreditAccount",
    values: [PromiseOrValue<string>, PromiseOrValue<string>],
  ): string;
  encodeFunctionData(functionFragment: "version", values?: undefined): string;

  decodeFunctionResult(functionFragment: "getAdapter", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getCreditAccountData",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCreditAccountList",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCreditManagerData",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCreditManagersV2List",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: "getPoolData",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: "getPoolsV1List",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: "hasOpenedCreditAccount",
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;

  events: {};
}

export interface IDataCompressorV2_10 extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IDataCompressorV2_10Interface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined,
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>,
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>,
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    getAdapter(
      _creditManager: PromiseOrValue<string>,
      _allowedContract: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<[string] & { adapter: string }>;

    getCreditAccountData(
      _creditManager: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<[CreditAccountDataStructOutput]>;

    getCreditAccountList(
      borrower: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<[CreditAccountDataStructOutput[]]>;

    getCreditManagerData(
      _creditManager: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<[CreditManagerDataStructOutput]>;

    getCreditManagersV2List(
      overrides?: CallOverrides,
    ): Promise<[CreditManagerDataStructOutput[]]>;

    getPoolData(
      _pool: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<[PoolDataStructOutput]>;

    getPoolsV1List(
      overrides?: CallOverrides,
    ): Promise<[PoolDataStructOutput[]]>;

    hasOpenedCreditAccount(
      creditManager: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<[boolean]>;

    version(overrides?: CallOverrides): Promise<[BigNumber]>;
  };

  getAdapter(
    _creditManager: PromiseOrValue<string>,
    _allowedContract: PromiseOrValue<string>,
    overrides?: CallOverrides,
  ): Promise<string>;

  getCreditAccountData(
    _creditManager: PromiseOrValue<string>,
    borrower: PromiseOrValue<string>,
    overrides?: CallOverrides,
  ): Promise<CreditAccountDataStructOutput>;

  getCreditAccountList(
    borrower: PromiseOrValue<string>,
    overrides?: CallOverrides,
  ): Promise<CreditAccountDataStructOutput[]>;

  getCreditManagerData(
    _creditManager: PromiseOrValue<string>,
    overrides?: CallOverrides,
  ): Promise<CreditManagerDataStructOutput>;

  getCreditManagersV2List(
    overrides?: CallOverrides,
  ): Promise<CreditManagerDataStructOutput[]>;

  getPoolData(
    _pool: PromiseOrValue<string>,
    overrides?: CallOverrides,
  ): Promise<PoolDataStructOutput>;

  getPoolsV1List(overrides?: CallOverrides): Promise<PoolDataStructOutput[]>;

  hasOpenedCreditAccount(
    creditManager: PromiseOrValue<string>,
    borrower: PromiseOrValue<string>,
    overrides?: CallOverrides,
  ): Promise<boolean>;

  version(overrides?: CallOverrides): Promise<BigNumber>;

  callStatic: {
    getAdapter(
      _creditManager: PromiseOrValue<string>,
      _allowedContract: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<string>;

    getCreditAccountData(
      _creditManager: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<CreditAccountDataStructOutput>;

    getCreditAccountList(
      borrower: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<CreditAccountDataStructOutput[]>;

    getCreditManagerData(
      _creditManager: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<CreditManagerDataStructOutput>;

    getCreditManagersV2List(
      overrides?: CallOverrides,
    ): Promise<CreditManagerDataStructOutput[]>;

    getPoolData(
      _pool: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<PoolDataStructOutput>;

    getPoolsV1List(overrides?: CallOverrides): Promise<PoolDataStructOutput[]>;

    hasOpenedCreditAccount(
      creditManager: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<boolean>;

    version(overrides?: CallOverrides): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    getAdapter(
      _creditManager: PromiseOrValue<string>,
      _allowedContract: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    getCreditAccountData(
      _creditManager: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    getCreditAccountList(
      borrower: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    getCreditManagerData(
      _creditManager: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    getCreditManagersV2List(overrides?: CallOverrides): Promise<BigNumber>;

    getPoolData(
      _pool: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    getPoolsV1List(overrides?: CallOverrides): Promise<BigNumber>;

    hasOpenedCreditAccount(
      creditManager: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<BigNumber>;

    version(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    getAdapter(
      _creditManager: PromiseOrValue<string>,
      _allowedContract: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    getCreditAccountData(
      _creditManager: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    getCreditAccountList(
      borrower: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    getCreditManagerData(
      _creditManager: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    getCreditManagersV2List(
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    getPoolData(
      _pool: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    getPoolsV1List(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    hasOpenedCreditAccount(
      creditManager: PromiseOrValue<string>,
      borrower: PromiseOrValue<string>,
      overrides?: CallOverrides,
    ): Promise<PopulatedTransaction>;

    version(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
