import type { Address, ContractFunctionArgs } from "viem";
import { encodeFunctionData } from "viem";

import {
  iCreditAccountCompressorAbi,
  iPeripheryCompressorAbi,
  iRewardsCompressorAbi,
} from "../../abi/compressors.js";
import { iBaseRewardPoolAbi } from "../../abi/iBaseRewardPool.js";
import { iCreditFacadeV300MulticallAbi } from "../../abi/v300.js";
import type { CreditAccountData } from "../base/index.js";
import { SDKConstruct } from "../base/index.js";
import {
  ADDRESS_0X0,
  AP_CREDIT_ACCOUNT_COMPRESSOR,
  AP_PERIPHERY_COMPRESSOR,
  AP_REWARDS_COMPRESSOR,
  MAX_UINT256,
  MIN_INT96,
} from "../constants/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type {
  CreditSuite,
  IPriceFeedContract,
  IPriceOracleContract,
  OnDemandPriceUpdate,
  UpdatePriceFeedsResult,
} from "../market/index.js";
import { rawTxToMulticallPriceUpdate } from "../market/index.js";
import {
  type Asset,
  assetsMap,
  type RouterCASlice,
  type RouterCloseResult,
} from "../router/index.js";
import type { ILogger, MultiCall, RawTx } from "../types/index.js";
import { childLogger } from "../utils/index.js";
import { simulateMulticall } from "../utils/viem/index.js";

type CompressorAbi = typeof iCreditAccountCompressorAbi;

type GetCreditAccountsArgs = ContractFunctionArgs<
  typeof iCreditAccountCompressorAbi,
  "pure" | "view",
  "getCreditAccounts"
>;

export interface CreditAccountServiceOptions {
  batchSize?: number;
}

interface ReadContractOptions {
  blockNumber?: bigint;
}

export interface CreditAccountFilter {
  creditManager?: Address;
  owner?: Address;
  includeZeroDebt?: boolean;
  minHealthFactor?: number;
  maxHealthFactor?: number;
}

export interface CloseCreditAccountResult extends CommonResult {
  routerCloseResult: RouterCloseResult;
}

export interface CommonResult {
  tx: RawTx;
  calls: Array<MultiCall>;
  creditFacade: CreditSuite["creditFacade"];
}

type CloseOptions = "close" | "zeroDebt";

interface CloseCreditAccountProps {
  operation: CloseOptions;
  creditAccount: RouterCASlice;
  assetsToWithdraw: Array<Address>;
  to: Address;
  slippage?: bigint;
  closePath?: RouterCloseResult;
}

interface RepayCreditAccountProps extends RepayAndLiquidateCreditAccountProps {
  operation: CloseOptions;
}

interface RepayAndLiquidateCreditAccountProps {
  collateralAssets: Array<Asset>;
  assetsToWithdraw: Array<Address>;
  creditAccount: RouterCASlice;
  to: Address;
  permits: Record<string, PermitResult>;
}

interface PrepareUpdateQuotasProps {
  minQuota: Array<Asset>;
  averageQuota: Array<Asset>;
}

interface UpdateQuotasProps extends PrepareUpdateQuotasProps {
  creditAccount: RouterCASlice;
}

interface AddCollateralProps extends PrepareUpdateQuotasProps {
  asset: Asset;
  ethAmount: bigint;
  permit: PermitResult | undefined;
  creditAccount: RouterCASlice;
}

interface WithdrawCollateralProps extends PrepareUpdateQuotasProps {
  assetsToWithdraw: Array<Asset>;
  to: Address;
  creditAccount: RouterCASlice;
}

interface ExecuteSwapProps extends PrepareUpdateQuotasProps {
  calls: Array<MultiCall>;
  creditAccount: RouterCASlice;
}

export interface ClaimFarmRewardsProps extends PrepareUpdateQuotasProps {
  tokensToDisable: Array<Asset>;
  calls: Array<MultiCall>;
  creditAccount: RouterCASlice;
}

export interface OpenCAProps extends PrepareUpdateQuotasProps {
  ethAmount: bigint;
  collateral: Array<Asset>;
  debt: bigint;
  withdrawDebt?: boolean;
  permits: Record<string, PermitResult>;
  calls: Array<MultiCall>;

  creditManager: Address;

  to: Address;
  referralCode: bigint;
}

interface ChangeDeptProps {
  creditAccount: RouterCASlice;
  amount: bigint;
}

export interface PermitResult {
  r: Address;
  s: Address;
  v: number;

  token: Address;
  owner: Address;
  spender: Address;
  value: bigint;

  deadline: bigint;
  nonce: bigint;
}

export interface Rewards {
  adapter: Address;
  stakedPhantomToken: Address;
  calls: Array<MultiCall>;

  rewards: Array<Asset>;
}

export class CreditAccountsService extends SDKConstruct {
  #compressor: Address;
  #batchSize?: number;
  #logger?: ILogger;

  constructor(sdk: GearboxSDK, options?: CreditAccountServiceOptions) {
    super(sdk);
    [this.#compressor] = sdk.addressProvider.getLatestVersion(
      AP_CREDIT_ACCOUNT_COMPRESSOR,
    );
    this.#batchSize = options?.batchSize;
    this.#logger = childLogger("CreditAccountsService", sdk.logger);
  }

  /**
   * Returns single credit account data, or undefined if it's not found
   * Performs all necessary price feed updates under the hood
   * @param account
   * @param options
   * @returns
   */
  public async getCreditAccountData(
    account: Address,
    options?: ReadContractOptions,
  ): Promise<CreditAccountData | undefined> {
    const blockNumber = options?.blockNumber;
    let raw: CreditAccountData;
    try {
      raw = await this.provider.publicClient.readContract({
        abi: iCreditAccountCompressorAbi,
        address: this.#compressor,
        functionName: "getCreditAccountData",
        args: [account],
        blockNumber,
      });
    } catch (e) {
      // TODO: reverts if account is not found, how to handle other revert reasons?
      return undefined;
    }
    if (raw.success) {
      return raw;
    }
    const { txs: priceUpdateTxs, timestamp: _ } =
      await this.sdk.priceFeeds.generatePriceFeedsUpdateTxs(undefined, {
        account,
      });
    const resp = await simulateMulticall(this.provider.publicClient, {
      contracts: [
        ...priceUpdateTxs.map(rawTxToMulticallPriceUpdate),
        {
          abi: iCreditAccountCompressorAbi,
          address: this.#compressor,
          functionName: "getCreditAccountData",
          args: [account],
        },
      ],
      allowFailure: false,
      // gas: 550_000_000n,
      batchSize: 0, // we cannot have price updates and compressor request in different batches
      blockNumber,
    });
    const cad = resp.pop() as CreditAccountData;
    return cad;
  }

  /**
   * Methods to get all credit accounts with some optional filtering
   * Performs all necessary price feed updates under the hood
   *
   * TODO: do we want to expose pagination?
   * TODO: do we want to expose "reverting"?
   * TODO: do we want to expose MarketFilter in any way? If so, we need to check that the MarketFilter is compatibled with attached markets?
   * @param args
   * @param options
   * @returns returned credit accounts are sorted by health factor in ascending order
   */
  public async getCreditAccounts(
    args?: CreditAccountFilter,
    options?: ReadContractOptions,
  ): Promise<Array<CreditAccountData>> {
    const {
      creditManager,
      includeZeroDebt = false,
      maxHealthFactor = 65_535, // TODO: this will change to bigint
      minHealthFactor = 0,
      owner = ADDRESS_0X0,
    } = args ?? {};
    // either credit manager or all attached markets
    const arg0 = creditManager ?? {
      configurators: this.marketConfigurators,
      pools: [],
      underlying: ADDRESS_0X0,
    };
    const caFilter = {
      owner,
      includeZeroDebt,
      minHealthFactor,
      maxHealthFactor,
    };

    const { txs: priceUpdateTxs, timestamp: _ } =
      await this.sdk.priceFeeds.generatePriceFeedsUpdateTxs();

    const allCAs: Array<CreditAccountData> = [];
    // reverting filter is exclusive, we need both options to get all accounts
    for (const reverting of [false, true]) {
      let offset = 0n;
      do {
        const [accounts, newOffset] = await this.#getCreditAccounts(
          this.#batchSize
            ? [
                arg0,
                { ...caFilter, reverting },
                offset,
                BigInt(this.#batchSize), // limit
              ]
            : [arg0, { ...caFilter, reverting }, offset],
          priceUpdateTxs,
          options,
        );
        allCAs.push(...accounts);
        offset = newOffset;
      } while (offset !== 0n);
    }

    // sort by health factor ascending
    return allCAs.sort((a, b) => Number(a.healthFactor - b.healthFactor));
  }

  /**
   * Method to get all claimable rewards for credit account (ex. stkUSDS SKY rewards)
     Assosiates rewards by adapter + stakedPhantomToken
   * @param {Address} creditAccount - address of credit account to get rewards for
   * @returns {Array<Rewards>} list of {@link Rewards} that can be claimed
   */
  async getRewards(creditAccount: Address): Promise<Array<Rewards>> {
    const rewards = await this.provider.publicClient.readContract({
      abi: iRewardsCompressorAbi,
      address: this.rewardCompressor,
      functionName: "getRewards",
      args: [creditAccount],
    });

    const r = rewards.reduce<Record<string, Rewards>>((acc, r) => {
      const adapter = r.adapter.toLowerCase() as Address;
      const stakedPhantomToken = r.stakedPhantomToken.toLowerCase() as Address;
      const rewardToken = r.rewardToken.toLowerCase() as Address;

      // it is possible that the same adapter can have multiple rewards
      // but all of them will have the same stakedPhantomToken and call to claim
      // can be changed in future (ex. adapter can have multiple stakedPhantomTokens)
      const key = [adapter, stakedPhantomToken].join("-");

      if (!acc[key]) {
        const callData = encodeFunctionData({
          abi: iBaseRewardPoolAbi,
          functionName: "getReward",
          args: [],
        });

        acc[key] = {
          adapter,
          stakedPhantomToken,
          calls: [
            {
              target: adapter,
              callData,
            },
          ],
          rewards: [],
        };
      }

      acc[key].rewards.push({
        token: rewardToken,
        balance: r.amount,
      });

      return acc;
    }, {});

    return Object.values(r);
  }

  /**
   * Method to get all connected bots for credit account
   * @param {Array<{ creditAccount: Address; creditManager: Address }>} accountsToCheck - list of credit accounts to check connected bots on
   * @returns call result of getConnectedBots for each credit account
   */
  async getConnectedBots(
    accountsToCheck: Array<{ creditAccount: Address; creditManager: Address }>,
  ) {
    const resp = await this.provider.publicClient.multicall({
      contracts: accountsToCheck.map(o => {
        const pool = this.sdk.marketRegister.findByCreditManager(
          o.creditManager,
        );

        return {
          abi: iPeripheryCompressorAbi,
          address: this.peripheryCompressor,
          functionName: "getConnectedBots",
          args: [pool.configurator.address, o.creditAccount],
        } as const;
      }),
      allowFailure: true,
    });

    return resp;
  }

  /**
   * Generates transaction to liquidate credit account
   * @param account
   * @param to Address to transfer underlying left after liquidation
   * @param slippage
   * @returns
   */
  public async fullyLiquidate(
    account: RouterCASlice,
    to: Address,
    slippage = 50n,
  ): Promise<CloseCreditAccountResult> {
    const cm = this.sdk.marketRegister.findCreditManager(account.creditManager);
    const routerCloseResult = await this.sdk.router.findBestClosePath({
      creditAccount: account,
      creditManager: cm.creditManager,
      slippage,
    });
    const priceUpdates = await this.getPriceUpdatesForFacade(
      account.creditManager,
      account,
      undefined,
    );
    const calls = [...priceUpdates, ...routerCloseResult.calls];
    const tx = cm.creditFacade.liquidateCreditAccount(
      account.creditAccount,
      to,
      calls,
    );
    return { tx, calls, routerCloseResult, creditFacade: cm.creditFacade };
  }

  /**
   * Closes credit account or closes credit account and keeps it open with zero debt.
      Ca is closed in the following order: price update -> close path to swap all tokens into underlying -> 
       -> disable quotas of exiting tokens -> decrease debt -> disable exiting tokens tokens -> withdraw underlying tokenz
   * @param {CloseOptions} operation - {@link CloseOptions}: close or zeroDebt
   * @param {RouterCASlice} creditAccount - minimal credit account data {@link RouterCASlice}
   * @param {Array<Address>} assetsToWithdraw - tokens to withdraw from credit account. 
      For credit account closing this is the underlying token, because during the closure, 
      all tokens on account are swapped into the underlying, 
      and only the underlying token will remain on the credit account
   * @param {Address} to - Wallet address to withdraw underlying to
   * @param {number} slippage  - SLIPPAGE_DECIMALS = 100n 
   * @default 50n
   * @param {RouterCloseResult | undefined} closePath - result of findBestClosePath method from router; if omited, calls marketRegister.findCreditManager {@link RouterCloseResult}
   * @returns All necessary data to execute the transaction (call, credit facade, routerCloseResult)
   */
  async closeCreditAccount({
    operation,
    assetsToWithdraw,
    creditAccount: ca,
    to,
    slippage = 50n,
    closePath,
  }: CloseCreditAccountProps): Promise<CloseCreditAccountResult> {
    const cm = this.sdk.marketRegister.findCreditManager(ca.creditManager);

    const routerCloseResult =
      closePath ||
      (await this.sdk.router.findBestClosePath({
        creditAccount: ca,
        creditManager: cm.creditManager,
        slippage,
      }));

    const priceUpdates = await this.getPriceUpdatesForFacade(
      ca.creditManager,
      ca,
      undefined,
    );

    const calls: Array<MultiCall> = [
      ...priceUpdates,
      ...routerCloseResult.calls,
      ...this.#prepareDisableQuotas(ca),
      ...this.#prepareDecreaseDebt(ca),
      ...this.#prepareDisableTokens(ca),
      ...assetsToWithdraw.map(t =>
        this.#prepareWithdrawToken(ca.creditFacade, t, MAX_UINT256, to),
      ),
    ];

    const tx =
      operation === "close"
        ? cm.creditFacade.closeCreditAccount(ca.creditAccount, calls)
        : cm.creditFacade.multicall(ca.creditAccount, calls);
    return { tx, calls, routerCloseResult, creditFacade: cm.creditFacade };
  }

  /**
   * Fully repays credit account or repays credit account and keeps it open with zero debt
   * @param {CloseOptions} operation - {@link CloseOptions}: close or zeroDebt
   * @param {RouterCASlice} creditAccount - minimal credit account data {@link RouterCASlice}
   * @param {Array<Address>} collateralAssets - tokens to repay dept. 
      In the current implementation, this is the (debt+interest+fess) * buffer, 
      where buffer refers to amount of tokens which will exceed current debt 
      in order to cover possible debt increase over tx execution
   * @param {Array<Address>} assetsToWithdraw - tokens to withdraw from credit account. 
      Typically all non zero ca assets (including unclaimed rewards) 
      plus underlying token (to withdraw any exceeding underlying token after repay)
   * @param {Record<Address, PermitResult>} permits - permits of tokens to withdraw (in any permittable token is present) {@link PermitResult}
   * @param {Address} to - Wallet address to withdraw underlying to
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  async repayCreditAccount({
    operation,
    collateralAssets,
    assetsToWithdraw,
    creditAccount: ca,
    permits,
    to,
  }: RepayCreditAccountProps): Promise<CommonResult> {
    const cm = this.sdk.marketRegister.findCreditManager(ca.creditManager);
    const addCollateral = collateralAssets.filter(a => a.balance > 0);

    const priceUpdates = await this.getPriceUpdatesForFacade(
      ca.creditManager,
      ca,
      undefined,
    );

    const calls: Array<MultiCall> = [
      ...priceUpdates,
      ...this.#prepareAddCollateral(ca.creditFacade, addCollateral, permits),
      ...this.#prepareDisableQuotas(ca),
      ...this.#prepareDecreaseDebt(ca),
      ...this.#prepareDisableTokens(ca),
      // TODO: probably needs a better way to handle reward tokens
      ...assetsToWithdraw.map(t =>
        this.#prepareWithdrawToken(ca.creditFacade, t, MAX_UINT256, to),
      ),
    ];

    const tx =
      operation === "close"
        ? cm.creditFacade.closeCreditAccount(ca.creditAccount, calls)
        : cm.creditFacade.multicall(ca.creditAccount, calls);
    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * Fully repays liquidatable account
   * @param {RouterCASlice} creditAccount - minimal credit account data {@link RouterCASlice}
   * @param {Array<Address>} collateralAssets - tokens to repay dept. 
      In the current implementation, this is the (debt+interest+fess) * buffer, 
      where buffer refers to amount of tokens which will exceed current debt 
      in order to cover possible debt increase over tx execution
   * @param {Array<Address>} assetsToWithdraw - tokens to withdraw from credit account. 
      Typically all non zero ca assets (including unclaimed rewards) 
      plus underlying token (to withdraw any exceeding underlying token after repay)
   * @param {Record<Address, PermitResult>} permits - permits of tokens to withdraw (in any permittable token is present) {@link PermitResult}
   * @param {Address} to - Wallet address to withdraw underlying to
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  async repayAndLiquidateCreditAccount({
    collateralAssets,
    assetsToWithdraw,
    creditAccount: ca,
    permits,
    to,
  }: RepayAndLiquidateCreditAccountProps): Promise<CommonResult> {
    const cm = this.sdk.marketRegister.findCreditManager(ca.creditManager);

    const priceUpdates = await this.getPriceUpdatesForFacade(
      ca.creditManager,
      ca,
      undefined,
    );

    const addCollateral = collateralAssets.filter(a => a.balance > 0);

    const calls: Array<MultiCall> = [
      ...priceUpdates,
      ...this.#prepareAddCollateral(ca.creditFacade, addCollateral, permits),
      ...assetsToWithdraw.map(t =>
        this.#prepareWithdrawToken(ca.creditFacade, t, MAX_UINT256, to),
      ),
    ];

    const tx = cm.creditFacade.liquidateCreditAccount(
      ca.creditAccount,
      to,
      calls,
    );
    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * Updates quota of credit account.
      CA quota updated in the following order: price update -> update quotas
   * @param {RouterCASlice} creditAccount - minimal credit account data {@link RouterCASlice}
   * @param {Array<Asset>} averageQuota - average quota for desired tokens {@link Asset}
   * @param {Array<Asset>} minQuota - minimum quota for desired tokens {@link Asset}
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  public async updateQuotas({
    minQuota,
    averageQuota,
    creditAccount,
  }: UpdateQuotasProps): Promise<CommonResult> {
    const cm = this.sdk.marketRegister.findCreditManager(
      creditAccount.creditManager,
    );
    const priceUpdates = await this.getPriceUpdatesForFacade(
      creditAccount.creditManager,
      creditAccount,
      undefined,
    );

    const calls: Array<MultiCall> = [
      ...priceUpdates,
      ...this.#prepareUpdateQuotas(creditAccount.creditFacade, {
        minQuota,
        averageQuota,
      }),
    ];

    const tx = cm.creditFacade.multicall(creditAccount.creditAccount, [
      ...priceUpdates,
      ...this.#prepareUpdateQuotas(creditAccount.creditFacade, {
        minQuota,
        averageQuota,
      }),
    ]);

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * Adds a single collateral to credit account and updates quotas
      Collateral is added in the following order: price update -> add collateral (with permit) -> update quotas
   * @param {RouterCASlice} creditAccount - minimal credit account data {@link RouterCASlice}
   * @param {Array<Asset>} averageQuota - average quota for desired token {@link Asset}
   * @param {Array<Asset>} minQuota - minimum quota for desired token {@link Asset}
   * @param {Asset} asset - asset to add as collateral {@link Asset}
   * @param {PermitResult | undefined} permits - permits of collateral asset if it is permittable {@link PermitResult}
   * @param {bigint} ethAmount - native token amount to attach to tx
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  public async addCollateral({
    creditAccount,
    asset,
    permit,
    ethAmount,
    minQuota,
    averageQuota,
  }: AddCollateralProps): Promise<CommonResult> {
    const cm = this.sdk.marketRegister.findCreditManager(
      creditAccount.creditManager,
    );

    const priceUpdatesCalls = await this.getPriceUpdatesForFacade(
      creditAccount.creditManager,
      creditAccount,
      averageQuota,
    );

    const calls: Array<MultiCall> = [
      ...priceUpdatesCalls,
      ...this.#prepareAddCollateral(
        creditAccount.creditFacade,
        [asset],
        permit ? { [asset.token]: permit } : {},
      ),
      ...this.#prepareUpdateQuotas(creditAccount.creditFacade, {
        minQuota,
        averageQuota,
      }),
    ];

    const tx = cm.creditFacade.multicall(creditAccount.creditAccount, calls);
    tx.value = ethAmount.toString(10);

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * Increases or decreases debt of credit account; debt decrease uses token ON CREDIT ACCOUNT
      Debt is changed in the following order: price update -> (enables underlying if it was disabled) -> change debt
   * @param {RouterCASlice} creditAccount - minimal credit account data {@link RouterCASlice}
   * @param {bigint} amount - amount to change debt by; 
      0 - prohibited value; 
      negative value for debt decrease; 
      positive value for debt increase.
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  public async changeDebt({
    creditAccount,
    amount,
  }: ChangeDeptProps): Promise<CommonResult> {
    if (amount === 0n) {
      throw new Error("debt increase or decrease must be non-zero");
    }
    const isDecrease = amount < 0n;
    const change = isDecrease ? -amount : amount;

    const cm = this.sdk.marketRegister.findCreditManager(
      creditAccount.creditManager,
    );

    const priceUpdatesCalls = await this.getPriceUpdatesForFacade(
      creditAccount.creditManager,
      creditAccount,
      undefined,
    );

    const underlyingEnabled = (creditAccount.enabledTokensMask & 1n) === 1n;
    const shouldEnable = !isDecrease && !underlyingEnabled;

    const calls: Array<MultiCall> = [
      ...priceUpdatesCalls,
      ...(shouldEnable
        ? this.#prepareEnableTokens(creditAccount.creditFacade, [
            creditAccount.underlying,
          ])
        : []),
      this.#prepareChangeDebt(creditAccount.creditFacade, change, isDecrease),
    ];

    const tx = cm.creditFacade.multicall(creditAccount.creditAccount, calls);

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * Withdraws a single collateral from credit account to wallet to and updates quotas; 
      technically can withdraw several tokens at once
   * @param {RouterCASlice} creditAccount - minimal credit account data {@link RouterCASlice}
   * @param {Array<Asset>} averageQuota - average quota for desired token {@link Asset}
   * @param {Array<Asset>} minQuota - minimum quota for desired token {@link Asset}
   * @param {Address} to - Wallet address to withdraw token to
   * @param {Array<Asset>} assetsToWithdraw - permits for asset if it is permittable {@link PermitResult}
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  public async withdrawCollateral({
    creditAccount,
    assetsToWithdraw,
    to,

    minQuota,
    averageQuota,
  }: WithdrawCollateralProps): Promise<CommonResult> {
    const cm = this.sdk.marketRegister.findCreditManager(
      creditAccount.creditManager,
    );

    const priceUpdatesCalls = await this.getPriceUpdatesForFacade(
      creditAccount.creditManager,
      creditAccount,
      undefined,
    );

    const calls: Array<MultiCall> = [
      ...priceUpdatesCalls,
      ...assetsToWithdraw.map(a =>
        this.#prepareWithdrawToken(
          creditAccount.creditFacade,
          a.token,
          a.balance,
          to,
        ),
      ),
      ...this.#prepareUpdateQuotas(creditAccount.creditFacade, {
        minQuota,
        averageQuota,
      }),
    ];

    const tx = cm.creditFacade.multicall(creditAccount.creditAccount, calls);

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * Executes swap specified by given calls, update quotas of affected tokens
      Swap is executed in the following order: price update -> execute swap path -> update quotas
   * @param {RouterCASlice} creditAccount - minimal credit account data {@link RouterCASlice}
   * @param {Array<Asset>} averageQuota - average quota for desired token {@link Asset}
   * @param {Array<Asset>} minQuota - minimum quota for desired token {@link Asset}
   * @param {Array<MultiCall>} calls - array of MultiCall from router methods getSingleSwap or getAllSwaps {@link MultiCall}
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  public async executeSwap({
    creditAccount,
    calls: swapCalls,
    minQuota,
    averageQuota,
  }: ExecuteSwapProps): Promise<CommonResult> {
    if (swapCalls.length === 0) throw new Error("No path to execute");

    const cm = this.sdk.marketRegister.findCreditManager(
      creditAccount.creditManager,
    );

    const priceUpdatesCalls = await this.getPriceUpdatesForFacade(
      creditAccount.creditManager,
      creditAccount,
      averageQuota,
    );

    const calls: Array<MultiCall> = [
      ...priceUpdatesCalls,
      ...swapCalls,
      ...this.#prepareUpdateQuotas(creditAccount.creditFacade, {
        minQuota,
        averageQuota,
      }),
    ];

    const tx = cm.creditFacade.multicall(creditAccount.creditAccount, calls);

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * Executes swap specified by given calls, update quotas of affected tokens
      Claim rewards is executed in the following order: price update -> execute claim calls -> 
      -> (optionally: disable reward tokens) -> (optionally: update quotas)
   * @param {RouterCASlice} creditAccount - minimal credit account data {@link RouterCASlice}
   * @param {Array<Asset>} averageQuota - average quota for desired token; 
      in this case can be omitted since rewards tokens do not require quotas {@link Asset}
   * @param {Array<Asset>} minQuota - minimum quota for desired token;
      in this case can be omitted since rewards tokens do not require quotas {@link Asset}
   * @param {Array<MultiCall>} calls - array of MultiCall from getRewards {@link MultiCall}
   * @param {Array<Asset>} tokensToDisable - tokens to disable after rewards claiming;
      sometimes is needed since old credit facade used to enable tokens on claim {@link Asset}
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  public async claimFarmRewards({
    tokensToDisable,
    calls: claimCalls,
    creditAccount: ca,

    minQuota,
    averageQuota,
  }: ClaimFarmRewardsProps): Promise<CommonResult> {
    if (claimCalls.length === 0) throw new Error("No path to execute");

    const cm = this.sdk.marketRegister.findCreditManager(ca.creditManager);

    const priceUpdatesCalls = await this.getPriceUpdatesForFacade(
      ca.creditManager,
      ca,
      averageQuota,
    );

    // TODO: probably needs a better way to handle reward tokens
    const calls = [
      ...priceUpdatesCalls,
      ...claimCalls,
      ...tokensToDisable.map(a =>
        this.#prepareDisableToken(ca.creditFacade, a.token),
      ),
      ...this.#prepareUpdateQuotas(ca.creditFacade, { minQuota, averageQuota }),
    ];

    const tx = cm.creditFacade.multicall(ca.creditAccount, calls);

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * Executes swap specified by given calls, update quotas of affected tokens
      Open credit account is executed in the following order: price update -> increase debt -> add collateral ->
      -> update quotas -> (optionally: execute swap path for trading/strategy) -> 
      -> (optionally: withdraw debt for lending)
    Basic open credit account: price update -> increase debt -> add collateral -> update quotas
    Lending: price update -> increase debt -> add collateral -> update quotas -> withdraw debt
    Strategy/trading: price update -> increase debt -> add collateral -> update quotas -> execute swap path
    In strategy is possible situation when collateral is added, but not swapped; the only swapped value in this case will be debt
   * @param {bigint} ethAmount - native token amount to attach to tx
   * @param {Address} creditManager - address of credit manager to open credit account on
   * @param {Array<Asset>} collateral - array of collateral which can be just directly added or swapped using the path {@link Asset}
   * @param {Record<Address, PermitResult>} permits - permits of collateral tokens (in any permittable token is present) {@link PermitResult}
   * @param {bigint} debt - debt to open credit account with
   * @param {boolean} withdrawDebt - flag to withdraw debt to wallet after opening credit account; 
      used for borrowing functionality
   * @param {bigint} referralCode - referral code to open credit account with
   * @param {Address} to - wallet address to transfer credit account to\
   * @param {Array<MultiCall>} calls - array of MultiCall from router methods findOpenStrategyPath {@link MultiCall}.
      Used for trading and strategy functionality
   * @param {Array<Asset>} averageQuota - average quota for tokens after open {@link Asset}
   * @param {Array<Asset>} minQuota - minimum quota for tokens after open  {@link Asset}
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  public async openCA({
    ethAmount,
    creditManager,
    collateral,
    permits,
    debt,
    withdrawDebt,
    referralCode,
    to,
    calls: openPathCalls,

    minQuota,
    averageQuota,
  }: OpenCAProps): Promise<CommonResult> {
    const cmSuite = this.sdk.marketRegister.findCreditManager(creditManager);
    const cm = cmSuite.creditManager;

    const priceUpdatesCalls = await this.getPriceUpdatesForFacade(
      cm.address,
      undefined,
      averageQuota,
    );

    const calls = [
      ...priceUpdatesCalls,
      this.#prepareIncreaseDebt(cm.creditFacade, debt),
      ...this.#prepareAddCollateral(cm.creditFacade, collateral, permits),
      ...this.#prepareUpdateQuotas(cm.creditFacade, {
        minQuota,
        averageQuota,
      }),
      ...openPathCalls,
      ...(withdrawDebt
        ? [this.#prepareWithdrawToken(cm.creditFacade, cm.underlying, debt, to)]
        : []),
    ];

    const tx = cmSuite.creditFacade.openCreditAccount(to, calls, referralCode);
    tx.value = ethAmount.toString(10);

    return { calls, tx, creditFacade: cmSuite.creditFacade };
  }

  /**
   * Internal wrapper for CreditAccountCompressor.getCreditAccounts + price updates wrapped into multicall
   * @param args
   * @param priceUpdateTxs
   * @param options
   * @returns
   */
  async #getCreditAccounts(
    args: GetCreditAccountsArgs,
    priceUpdateTxs?: Array<RawTx>,
    options?: ReadContractOptions,
  ): Promise<[accounts: Array<CreditAccountData>, newOffset: bigint]> {
    const blockNumber = options?.blockNumber;
    if (priceUpdateTxs?.length) {
      const resp = await simulateMulticall(this.provider.publicClient, {
        contracts: [
          ...priceUpdateTxs.map(rawTxToMulticallPriceUpdate),
          {
            abi: iCreditAccountCompressorAbi,
            address: this.#compressor,
            functionName: "getCreditAccounts",
            args,
          },
        ],
        allowFailure: false,
        // gas: 550_000_000n,
        batchSize: 0, // we cannot have price updates and compressor request in different batches
        blockNumber,
      });
      const getCreditAccountsResp = resp.pop() as any as [
        Array<CreditAccountData>,
        bigint,
      ];
      return getCreditAccountsResp;
    }

    return this.provider.publicClient.readContract<
      CompressorAbi,
      "getCreditAccounts",
      GetCreditAccountsArgs
    >({
      abi: iCreditAccountCompressorAbi,
      address: this.#compressor,
      functionName: "getCreditAccounts",
      args,
      blockNumber,
    });
  }

  /**
   * Returns raw txs that are needed to update all price feeds so that all credit accounts (possibly from different markets) compute
   * @param accounts
   * @returns
   */
  public async getUpdateForAccounts(
    accounts: Array<RouterCASlice>,
  ): Promise<UpdatePriceFeedsResult> {
    // for each market, using pool address as key, gather tokens to update and find PriceFeedFactories
    const tokensByPool = new Map<Address, Set<Address>>();
    const oracleByPool = new Map<Address, IPriceOracleContract>();

    for (const acc of accounts) {
      const market = this.sdk.marketRegister.findByCreditManager(
        acc.creditManager,
      );
      const pool = market.pool.pool.address;
      oracleByPool.set(pool, market.priceOracle);

      for (const t of acc.tokens) {
        if (t.balance > 10n) {
          const tokens = tokensByPool.get(pool) ?? new Set<Address>();
          tokens.add(t.token);
          tokensByPool.set(pool, tokens);
        }
      }
    }
    // priceFeeds can contain PriceFeeds from different markets
    const priceFeeds: Array<IPriceFeedContract> = [];
    for (const [pool, oracle] of oracleByPool.entries()) {
      const tokens = Array.from(tokensByPool.get(pool) ?? []);
      priceFeeds.push(...oracle.priceFeedsForTokens(tokens));
    }
    return this.sdk.priceFeeds.generatePriceFeedsUpdateTxs(priceFeeds);
  }

  public async getUpdateForAccount(
    creditManager: Address,
    creditAccount: RouterCASlice | undefined,
    desiredQuotas: Array<Asset> | undefined,
  ): Promise<UpdatePriceFeedsResult> {
    // for each market, using pool address as key, gather tokens to update and find PriceFeedFactories
    const tokensByPool = new Map<Address, Set<Address>>();
    const oracleByPool = new Map<Address, IPriceOracleContract>();
    const quotaRecord = desiredQuotas
      ? assetsMap(desiredQuotas)
      : desiredQuotas;
    const caBalancesRecord = creditAccount
      ? assetsMap(creditAccount.tokens)
      : creditAccount;

    const market = this.sdk.marketRegister.findByCreditManager(creditManager);
    const cm =
      this.sdk.marketRegister.findCreditManager(creditManager).creditManager;
    const pool = market.pool.pool.address;

    oracleByPool.set(pool, market.priceOracle);

    const insertToken = (p: Address, t: Address) => {
      const tokens = tokensByPool.get(p) ?? new Set<Address>();
      tokens.add(t);
      tokensByPool.set(pool, tokens);
    };

    for (const t of cm.collateralTokens) {
      if (creditAccount && caBalancesRecord && quotaRecord) {
        const balanceAsset = caBalancesRecord.get(t);
        const balance = balanceAsset?.balance || 0n;
        const mask = balanceAsset?.mask || 0n;
        const isEnabled = (mask & creditAccount.enabledTokensMask) !== 0n;

        const quotaAsset = quotaRecord.get(t);
        const quotaBalance = quotaAsset?.balance || 0n;

        if ((balance > 10n && isEnabled) || quotaBalance > 0)
          insertToken(pool, t);
      } else if (creditAccount && caBalancesRecord) {
        const balanceAsset = caBalancesRecord.get(t);
        const balance = balanceAsset?.balance || 0n;
        const mask = balanceAsset?.mask || 0n;
        const isEnabled = (mask & creditAccount.enabledTokensMask) !== 0n;

        if (balance > 10n && isEnabled) insertToken(pool, t);
      } else if (quotaRecord) {
        const quotaAsset = quotaRecord.get(t);
        const quotaBalance = quotaAsset?.balance || 0n;

        if (quotaBalance > 0) insertToken(pool, t);
      }
    }

    // priceFeeds can contain PriceFeeds from different markets
    const priceFeeds: Array<IPriceFeedContract> = [];
    for (const [pool, oracle] of oracleByPool.entries()) {
      const tokens = Array.from(tokensByPool.get(pool) ?? []);
      priceFeeds.push(...oracle.priceFeedsForTokens(tokens));
    }
    this.#logger?.debug(
      { account: creditAccount?.creditAccount, manager: cm.name },
      `generating price feed updates for ${priceFeeds.length} price feeds`,
    );
    return this.sdk.priceFeeds.generatePriceFeedsUpdateTxs(
      priceFeeds,
      creditAccount ? { account: creditAccount.creditAccount } : undefined,
    );
  }

  /**
   * Returns account price updates in a non-encoded format
   * @param acc
   * @returns
   */
  public async getOnDemandPriceUpdates(
    creditManager: Address,
    creditAccount: RouterCASlice | undefined,
    desiredQuotas: Array<Asset> | undefined,
  ): Promise<Array<OnDemandPriceUpdate>> {
    const market = this.sdk.marketRegister.findByCreditManager(creditManager);
    const cm = this.sdk.marketRegister.findCreditManager(creditManager);
    const update = await this.getUpdateForAccount(
      creditManager,
      creditAccount,
      desiredQuotas,
    );
    this.#logger?.debug(
      { account: creditAccount?.creditAccount, manager: cm.name },
      `getting on demand price updates from ${update.txs.length} txs`,
    );
    return market.priceOracle.onDemandPriceUpdates(update);
  }

  /**
   * Returns price updates in format that is accepted by various credit facade methods (multicall, close/liquidate, etc...).
   * If there are desiredQuotas and creditAccount update quotaBalance > 0 || (balance > 10n && isEnabled).
   * If there is creditAccount update balance > 10n && isEnabled.
   * If there is desiredQuotas update quotaBalance > 0.
   * @param acc
   * @returns
   */
  public async getPriceUpdatesForFacade(
    creditManager: Address,
    creditAccount: RouterCASlice | undefined,
    desiredQuotas: Array<Asset> | undefined,
  ): Promise<Array<MultiCall>> {
    const cm = this.sdk.marketRegister.findCreditManager(creditManager);
    const updates = await this.getOnDemandPriceUpdates(
      creditManager,
      creditAccount,
      desiredQuotas,
    );
    return cm.creditFacade.encodeOnDemandPriceUpdates(updates);
  }

  #prepareDisableQuotas(ca: RouterCASlice): Array<MultiCall> {
    const calls: Array<MultiCall> = [];
    for (const { token, quota } of ca.tokens) {
      if (quota > 0n) {
        calls.push({
          target: ca.creditFacade,
          callData: encodeFunctionData({
            abi: iCreditFacadeV300MulticallAbi,
            functionName: "updateQuota",
            args: [token, MIN_INT96, 0n],
          }),
        });
      }
    }
    return calls;
  }

  #prepareUpdateQuotas(
    creditFacade: Address,
    { averageQuota, minQuota }: PrepareUpdateQuotasProps,
  ): Array<MultiCall> {
    const minRecord = assetsMap(minQuota);

    const calls: Array<MultiCall> = averageQuota.map(q => {
      const minAsset = minRecord.get(q.token);
      const min = minAsset && minAsset?.balance > 0 ? minAsset.balance : 0n;

      return {
        target: creditFacade,
        callData: encodeFunctionData({
          abi: iCreditFacadeV300MulticallAbi,
          functionName: "updateQuota",
          args: [q.token, q.balance, min],
        }),
      };
    });

    return calls;
  }

  #prepareDecreaseDebt(ca: RouterCASlice): Array<MultiCall> {
    if (ca.debt > 0n) {
      return [
        {
          target: ca.creditFacade,
          callData: encodeFunctionData({
            abi: iCreditFacadeV300MulticallAbi,
            functionName: "decreaseDebt",
            args: [MAX_UINT256],
          }),
        },
      ];
    }
    return [];
  }

  #prepareDisableTokens(ca: RouterCASlice): Array<MultiCall> {
    const calls: Array<MultiCall> = [];
    for (const t of ca.tokens) {
      const isEnabled = (t.mask & ca.enabledTokensMask) !== 0n;

      if (t.token !== ca.underlying && isEnabled && t.quota === 0n) {
        calls.push(this.#prepareDisableToken(ca.creditFacade, t.token));
      }
    }
    return calls;
  }
  #prepareDisableToken(creditFacade: Address, token: Address): MultiCall {
    return {
      target: creditFacade,
      callData: encodeFunctionData({
        abi: iCreditFacadeV300MulticallAbi,
        functionName: "disableToken",
        args: [token],
      }),
    };
  }

  #prepareEnableTokens(
    creditFacade: Address,
    tokens: Array<Address>,
  ): Array<MultiCall> {
    return tokens.map(t => ({
      target: creditFacade,
      callData: encodeFunctionData({
        abi: iCreditFacadeV300MulticallAbi,
        functionName: "enableToken",
        args: [t],
      }),
    }));
  }

  #prepareWithdrawToken(
    creditFacade: Address,
    token: Address,
    amount: bigint,
    to: Address,
  ): MultiCall {
    return {
      target: creditFacade,
      callData: encodeFunctionData({
        abi: iCreditFacadeV300MulticallAbi,
        functionName: "withdrawCollateral",
        args: [token, amount, to],
      }),
    };
  }

  #prepareIncreaseDebt(creditFacade: Address, debt: bigint): MultiCall {
    return {
      target: creditFacade,
      callData: encodeFunctionData({
        abi: iCreditFacadeV300MulticallAbi,
        functionName: "increaseDebt",
        args: [debt],
      }),
    };
  }
  #prepareChangeDebt(
    creditFacade: Address,
    change: bigint,
    isDecrease: boolean,
  ): MultiCall {
    return {
      target: creditFacade,
      callData: encodeFunctionData({
        abi: iCreditFacadeV300MulticallAbi,
        functionName: isDecrease ? "decreaseDebt" : "increaseDebt",
        args: [change],
      }),
    };
  }

  #prepareAddCollateral(
    creditFacade: Address,
    assets: Array<Asset>,
    permits: Record<string, PermitResult>,
  ): Array<MultiCall> {
    const calls = assets.map(({ token, balance }) => {
      const p = permits[token];

      if (p) {
        return {
          target: creditFacade,
          callData: encodeFunctionData({
            abi: iCreditFacadeV300MulticallAbi,
            functionName: "addCollateralWithPermit",
            args: [token, balance, p.deadline, p.v, p.r, p.s],
          }),
        };
      }

      return {
        target: creditFacade,
        callData: encodeFunctionData({
          abi: iCreditFacadeV300MulticallAbi,
          functionName: "addCollateral",
          args: [token, balance],
        }),
      };
    });

    return calls;
  }

  /**
   * Returns addresses of market configurators
   */
  private get marketConfigurators(): Array<Address> {
    return this.sdk.marketRegister.marketConfigurators.map(mc => mc.address);
  }

  private get rewardCompressor(): Address {
    return this.sdk.addressProvider.getLatestVersion(AP_REWARDS_COMPRESSOR)[0];
  }

  private get peripheryCompressor(): Address {
    return this.sdk.addressProvider.getLatestVersion(
      AP_PERIPHERY_COMPRESSOR,
    )[0];
  }
}
