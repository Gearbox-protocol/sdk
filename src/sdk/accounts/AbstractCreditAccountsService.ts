import type { Address } from "viem";
import { encodeFunctionData, getAddress, getContract } from "viem";

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
  PERCENTAGE_FACTOR,
  RAY,
  VERSION_RANGE_310,
} from "../constants/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type {
  IPriceFeedContract,
  IPriceOracleContract,
  OnDemandPriceUpdate,
  UpdatePriceFeedsResult,
} from "../market/index.js";
import { type Asset, assetsMap, type RouterCASlice } from "../router/index.js";
import type { ILogger, IPriceUpdateTx, MultiCall } from "../types/index.js";
import { AddressMap, childLogger } from "../utils/index.js";
import { simulateWithPriceUpdates } from "../utils/viem/index.js";
import type {
  FullyLiquidateProps,
  GetConnectedBotsResult,
  StartDelayedWithdrawalProps,
} from "./types";
import type {
  AddCollateralProps,
  ChangeDeptProps,
  CloseCreditAccountProps,
  CloseCreditAccountResult,
  CreditAccountFilter,
  CreditAccountOperationResult,
  CreditManagerFilter,
  EnableTokensProps,
  ExecuteSwapProps,
  GetCreditAccountsArgs,
  GetCreditAccountsOptions,
  OpenCAProps,
  PermitResult,
  PrepareUpdateQuotasProps,
  Rewards,
  UpdateQuotasProps,
} from "./types.js";
import { stringifyGetCreditAccountsArgs } from "./utils.js";

type CompressorAbi = typeof iCreditAccountCompressorAbi;

export interface CreditAccountServiceOptions {
  batchSize?: number;
}

export abstract class AbstractCreditAccountService extends SDKConstruct {
  #compressor: Address;
  #batchSize?: number;
  #logger?: ILogger;

  constructor(sdk: GearboxSDK, options?: CreditAccountServiceOptions) {
    super(sdk);
    [this.#compressor] = sdk.addressProvider.mustGetLatest(
      AP_CREDIT_ACCOUNT_COMPRESSOR,
      VERSION_RANGE_310,
    );
    this.#batchSize = options?.batchSize;
    this.#logger = childLogger("CreditAccountsService", sdk.logger);
    this.#logger?.debug(
      `credit account compressor address: ${this.#compressor}`,
    );
  }

  /**
   * Returns single credit account data, or undefined if it's not found
   * Performs all necessary price feed updates under the hood
   * @param account
   * @param blockNumber
   * @returns
   */
  public async getCreditAccountData(
    account: Address,
    blockNumber?: bigint,
  ): Promise<CreditAccountData | undefined> {
    let raw: CreditAccountData;
    try {
      raw = await this.provider.publicClient.readContract({
        abi: iCreditAccountCompressorAbi,
        address: this.#compressor,
        functionName: "getCreditAccountData",
        args: [account],
        blockNumber,
        // @ts-expect-error
        gas: this.sdk.gasLimit,
      });
    } catch (_e) {
      // TODO: reverts if account is not found, how to handle other revert reasons?
      return undefined;
    }
    if (raw.success) {
      return raw;
    }
    const { txs: priceUpdateTxs } =
      await this.sdk.priceFeeds.generatePriceFeedsUpdateTxs(undefined, {
        account,
      });
    const [cad] = await simulateWithPriceUpdates(this.provider.publicClient, {
      priceUpdates: priceUpdateTxs,
      contracts: [
        {
          abi: iCreditAccountCompressorAbi,
          address: this.#compressor,
          functionName: "getCreditAccountData",
          args: [account],
        },
      ],
      blockNumber,
      gas: this.sdk.gasLimit,
    });
    return cad;
  }

  /**
   * Methods to get all credit accounts with some optional filtering
   * Performs all necessary price feed updates under the hood
   *
   * @param options
   * @param blockNumber
   * @returns returned credit accounts are sorted by health factor in ascending order
   */
  public async getCreditAccounts(
    options?: GetCreditAccountsOptions,
    blockNumber?: bigint,
  ): Promise<Array<CreditAccountData>> {
    const {
      creditManager,
      includeZeroDebt = false,
      maxHealthFactor = MAX_UINT256,
      minHealthFactor = 0n,
      owner = ADDRESS_0X0,
    } = options ?? {};
    // either credit manager or all attached markets
    const arg0 =
      creditManager ??
      ({
        configurators: this.marketConfigurators,
        creditManagers: [],
        pools: [],
        underlying: ADDRESS_0X0,
      } as CreditManagerFilter);
    const caFilter: CreditAccountFilter = {
      owner,
      includeZeroDebt,
      minHealthFactor,
      maxHealthFactor,
      reverting: false,
    };

    const { txs: priceUpdateTxs } =
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
          blockNumber,
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
  public async getRewards(creditAccount: Address): Promise<Array<Rewards>> {
    const rewards = await this.provider.publicClient.readContract({
      abi: iRewardsCompressorAbi,
      address: this.rewardCompressor,
      functionName: "getRewards",
      args: [creditAccount],
    });

    const callData = encodeFunctionData({
      abi: iBaseRewardPoolAbi,
      functionName: "getReward",
      args: [],
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
   * @param {Array<{ creditAccount: Address; creditManager: Address }>} accountsToCheck - list of credit accounts 
      and their credit managers to check connected bots on
   * @returns call result of getConnectedBots for each credit account
   */
  public async getConnectedBots(
    accountsToCheck: Array<{ creditAccount: Address; creditManager: Address }>,
  ): Promise<GetConnectedBotsResult> {
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
   * @param props - {@link FullyLiquidateProps}
   * @returns
   */
  public async fullyLiquidate(
    props: FullyLiquidateProps,
  ): Promise<CloseCreditAccountResult> {
    const { account, to, slippage = 50n, force = false, keepAssets } = props;
    const cm = this.sdk.marketRegister.findCreditManager(account.creditManager);
    const routerCloseResult = await this.sdk
      .routerFor(account)
      .findBestClosePath({
        creditAccount: account,
        creditManager: cm.creditManager,
        slippage,
        force,
        keepAssets,
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
     - Ca is closed in the following order: price update -> close path to swap all tokens into underlying -> 
       -> disable quotas of exiting tokens -> decrease debt -> disable exiting tokens tokens -> withdraw underlying tokenz
   * @param {CloseOptions} operation - {@link CloseOptions}: close or zeroDebt
   * @param {RouterCASlice} creditAccount - minimal credit account data {@link RouterCASlice} on which operation is performed
   * @param {Array<Address>} assetsToWithdraw - tokens to withdraw from credit account. 
      For credit account closing this is the underlying token, because during the closure, 
      all tokens on account are swapped into the underlying, 
      and only the underlying token will remain on the credit account
   * @param {Address} to - Wallet address to withdraw underlying to
   * @param {number} slippage  - Slippage in PERCENTAGE_FORMAT (100% = 10_000) per operation
   * @default 50n
   * @param {RouterCloseResult | undefined} closePath - result of findBestClosePath method from router; if omited, calls marketRegister.findCreditManager {@link RouterCloseResult}
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  public async closeCreditAccount({
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
      (await this.sdk.routerFor(ca).findBestClosePath({
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
      ...(operation === "close" ? [] : priceUpdates),
      ...routerCloseResult.calls,
      ...this.prepareDisableQuotas(ca),
      ...this.prepareDecreaseDebt(ca),
      ...this.prepareDisableTokens(ca),
      ...assetsToWithdraw.map(t =>
        this.prepareWithdrawToken(ca.creditFacade, t, MAX_UINT256, to),
      ),
    ];

    const tx =
      operation === "close"
        ? cm.creditFacade.closeCreditAccount(ca.creditAccount, calls)
        : cm.creditFacade.multicall(ca.creditAccount, calls);
    return { tx, calls, routerCloseResult, creditFacade: cm.creditFacade };
  }

  /**
   * Updates quota of credit account.
     - CA quota updated in the following order: price update -> update quotas
   * @param {RouterCASlice} creditAccount - minimal credit account data {@link RouterCASlice} on which operation is performed
   * @param {Array<Asset>} averageQuota - average quota for desired tokens {@link Asset}
   * @param {Array<Asset>} minQuota - minimum quota for desired tokens {@link Asset}
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  public async updateQuotas({
    minQuota,
    averageQuota,
    creditAccount,
  }: UpdateQuotasProps): Promise<CreditAccountOperationResult> {
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
      ...this.prepareUpdateQuotas(creditAccount.creditFacade, {
        minQuota,
        averageQuota,
      }),
    ];

    const tx = cm.creditFacade.multicall(creditAccount.creditAccount, calls);

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * Adds a single collateral to credit account and updates quotas
     - Collateral is added in the following order: price update -> add collateral (with permit) -> update quotas
   * @param {RouterCASlice} creditAccount - minimal credit account data {@link RouterCASlice} on which operation is performed
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
  }: AddCollateralProps): Promise<CreditAccountOperationResult> {
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
      ...this.prepareAddCollateral(
        creditAccount.creditFacade,
        [asset],
        permit ? { [asset.token]: permit } : {},
      ),
      ...this.prepareUpdateQuotas(creditAccount.creditFacade, {
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
     - Debt is changed in the following order: price update -> (enables underlying if it was disabled) -> change debt
   * @param {RouterCASlice} creditAccount - minimal credit account data {@link RouterCASlice} on which operation is performed
   * @param {bigint} amount - amount to change debt by; 
      0 - prohibited value; 
      negative value for debt decrease; 
      positive value for debt increase.
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  public async changeDebt({
    creditAccount,
    amount,
  }: ChangeDeptProps): Promise<CreditAccountOperationResult> {
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
   * Executes swap specified by given calls, update quotas of affected tokens
     - Swap is executed in the following order: price update -> execute swap path -> update quotas
   * @param {RouterCASlice} creditAccount - minimal credit account data {@link RouterCASlice} on which operation is performed
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
  }: ExecuteSwapProps): Promise<CreditAccountOperationResult> {
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
      ...this.prepareUpdateQuotas(creditAccount.creditFacade, {
        minQuota,
        averageQuota,
      }),
    ];

    const tx = cm.creditFacade.multicall(creditAccount.creditAccount, calls);

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * Start delayed withdrawal for given token
     - Withdrawal is executed in the following order: price update -> execute withdraw calls -> update quotas
   * @param props - {@link StartDelayedWithdrawalProps}
   * @returns
  */
  public async startDelayedWithdrawal_Mellow({
    creditAccount,
    minQuota,
    averageQuota,

    instantWithdrawals,
    delayedWithdrawals,
    sourceAmount,
    sourceToken,
  }: StartDelayedWithdrawalProps): Promise<CreditAccountOperationResult> {
    const cm = this.sdk.marketRegister.findCreditManager(
      creditAccount.creditManager,
    );

    const balances = [...instantWithdrawals, ...delayedWithdrawals].filter(
      a => a.balance > 0,
    );
    const storeExpectedBalances: MultiCall = {
      target: cm.creditFacade.address,
      callData: encodeFunctionData({
        abi: iCreditFacadeV300MulticallAbi,
        functionName: "storeExpectedBalances",
        args: [
          balances.map(a => ({ token: a.token, amount: a.balance - 10n })),
        ],
      }),
    };
    const compareBalances: MultiCall = {
      target: cm.creditFacade.address,
      callData: encodeFunctionData({
        abi: iCreditFacadeV300MulticallAbi,
        functionName: "compareBalances",
        args: [],
      }),
    };

    const priceUpdatesCalls = await this.getPriceUpdatesForFacade(
      creditAccount.creditManager,
      creditAccount,
      averageQuota,
    );

    const mellowAdapter = cm.creditManager.adapters.mustGet(sourceToken);
    const redeem: MultiCall = {
      target: mellowAdapter.address,
      callData: encodeFunctionData({
        abi: ierc4626AdapterAbi,
        functionName: "redeem",
        args: [sourceAmount, ADDRESS_0X0, ADDRESS_0X0],
      }),
    };

    const CLAIMER = "0x25024a3017B8da7161d8c5DCcF768F8678fB5802";
    const mellowClaimerAdapter = cm.creditManager.adapters.mustGet(CLAIMER);

    const multiAcceptContract = getContract({
      address: mellowClaimerAdapter.address,
      abi: iMellowClaimerAdapterAbi,
      client: this.sdk.provider.publicClient,
    });

    const indices = await multiAcceptContract.read.getMultiVaultSubvaultIndices(
      [sourceToken],
    );

    const multiaccept: MultiCall = {
      target: mellowClaimerAdapter.address,
      callData: encodeFunctionData({
        abi: iMellowClaimerAdapterAbi,
        functionName: "multiAccept",
        args: [sourceToken, ...indices],
      }),
    };

    const calls: Array<MultiCall> = [
      ...priceUpdatesCalls,
      storeExpectedBalances,
      redeem,
      multiaccept,
      compareBalances,
      ...this.prepareUpdateQuotas(creditAccount.creditFacade, {
        minQuota,
        averageQuota,
      }),
    ];

    const tx = cm.creditFacade.multicall(creditAccount.creditAccount, calls);

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * Executes enable/disable tokens specified by given tokens lists and token prices
   * @param {RouterCASlice} creditAccount - minimal credit account data {@link RouterCASlice} on which operation is performed
   * @param {Array<Asset>} enabledTokens - list of tokens to enable {@link Asset};
   * @param {Array<Asset>} disabledTokens - list of tokens to disable {@link Asset};
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  public async enableTokens({
    enabledTokens,
    disabledTokens,
    creditAccount: ca,
  }: EnableTokensProps): Promise<CreditAccountOperationResult> {
    const cm = this.sdk.marketRegister.findCreditManager(ca.creditManager);

    const priceUpdatesCalls = await this.getPriceUpdatesForFacade(
      ca.creditManager,
      ca,
      undefined,
    );

    const calls = [
      ...priceUpdatesCalls,
      ...disabledTokens.map(token =>
        this.prepareDisableToken(ca.creditFacade, token),
      ),
      ...this.#prepareEnableTokens(ca.creditFacade, enabledTokens),
    ];

    const tx = cm.creditFacade.multicall(ca.creditAccount, calls);

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * Executes swap specified by given calls, update quotas of affected tokens
     - Open credit account is executed in the following order: price update -> increase debt -> add collateral ->
      -> update quotas -> (optionally: execute swap path for trading/strategy) -> 
      -> (optionally: withdraw debt for lending)
    - Basic open credit account: price update -> increase debt -> add collateral -> update quotas
    - Lending: price update -> increase debt -> add collateral -> update quotas -> withdraw debt
    - Strategy/trading: price update -> increase debt -> add collateral -> update quotas -> execute swap path
    - In strategy is possible situation when collateral is added, but not swapped; the only swapped value in this case will be debt
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
  }: OpenCAProps): Promise<CreditAccountOperationResult> {
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
      ...this.prepareAddCollateral(cm.creditFacade, collateral, permits),
      ...openPathCalls,
      ...(withdrawDebt
        ? [this.prepareWithdrawToken(cm.creditFacade, cm.underlying, debt, to)]
        : []),
      ...this.prepareUpdateQuotas(cm.creditFacade, {
        minQuota,
        averageQuota,
      }),
    ];

    const tx = cmSuite.creditFacade.openCreditAccount(to, calls, referralCode);
    tx.value = ethAmount.toString(10);

    return { calls, tx, creditFacade: cmSuite.creditFacade };
  }

  /**
   * Returns borrow rate with 4 digits precision (10000 = 100%)
   * @param ca
   * @returns
   */
  public getBorrowRate(ca: CreditAccountData): bigint {
    // R = Debt * baserate with fee / (total value or debt)
    // Qr = sum(quota rate * quota amount) * (1+fee) / (total value or debt)
    // Total = r+qr
    const { creditManager } = this.sdk.marketRegister.findCreditManager(
      ca.creditManager,
    );
    const { pool } = this.sdk.marketRegister.findByCreditManager(
      ca.creditManager,
    );
    const { feeInterest } = creditManager;
    const { baseInterestRate } = pool.pool;
    const baseRateWithFee =
      baseInterestRate * (BigInt(feeInterest) + PERCENTAGE_FACTOR);
    const totalDebt = ca.debt + ca.accruedInterest + ca.accruedFees;
    const r = (ca.debt * baseRateWithFee) / (totalDebt * RAY);

    const caTokens = new AddressMap(ca.tokens.map(t => [t.token, t]));
    let qr = 0n;

    for (const t of creditManager.collateralTokens) {
      const b = caTokens.get(t);
      if (b) {
        qr += b.quota * BigInt(pool.pqk.quotas.get(t)?.rate ?? 0);
      }
    }
    qr = (qr * (BigInt(feeInterest) + PERCENTAGE_FACTOR)) / PERCENTAGE_FACTOR;
    qr /= totalDebt;
    return r + qr;
  }

  /**
   * Returns optimal HF for partial liquidation with 4 digits precision (10000 = 100%)
   * @param ca
   */
  public getOptimalHFForPartialLiquidation(ca: CreditAccountData): bigint {
    const borrowRate = this.getBorrowRate(ca);
    return PERCENTAGE_FACTOR + (borrowRate < 100n ? borrowRate : 100n);
  }

  /**
   * Internal wrapper for CreditAccountCompressor.getCreditAccounts + price updates wrapped into multicall
   * @param args
   * @param priceUpdateTxs
   * @param blockNumber
   * @returns
   */
  async #getCreditAccounts(
    args: GetCreditAccountsArgs,
    priceUpdateTxs?: IPriceUpdateTx[],
    blockNumber?: bigint,
  ): Promise<[accounts: Array<CreditAccountData>, newOffset: bigint]> {
    this.#logger?.debug(
      { args: stringifyGetCreditAccountsArgs(args) },
      "getting credit accounts",
    );
    let resp: [CreditAccountData[], bigint];
    if (priceUpdateTxs?.length) {
      [resp] = await simulateWithPriceUpdates(this.provider.publicClient, {
        priceUpdates: priceUpdateTxs,
        contracts: [
          {
            abi: iCreditAccountCompressorAbi,
            address: this.#compressor,
            functionName: "getCreditAccounts",
            args,
          },
        ],
        blockNumber,
        gas: this.sdk.gasLimit,
      });
    } else {
      resp = await this.provider.publicClient.readContract<
        CompressorAbi,
        "getCreditAccounts",
        GetCreditAccountsArgs
      >({
        abi: iCreditAccountCompressorAbi,
        address: this.#compressor,
        functionName: "getCreditAccounts",
        args,
        blockNumber,
        // @ts-expect-error
        gas: this.sdk.gasLimit,
      });
    }

    this.#logger?.debug(
      {
        accounts: resp[0]?.length ?? 0,
        nextOffset: Number(resp[1]),
      },
      "got credit accounts",
    );

    return resp;
  }

  /**
   * Returns raw txs that are needed to update all price feeds so that all credit accounts (possibly from different markets) compute
   *
   * This can be used by batch liquidator
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

  protected async getUpdateForAccount(
    creditManager: Address,
    creditAccount: RouterCASlice | undefined,
    desiredQuotas: Array<Asset> | undefined,
  ): Promise<UpdatePriceFeedsResult> {
    const quotaRecord = desiredQuotas
      ? assetsMap(desiredQuotas)
      : desiredQuotas;
    const caBalancesRecord = creditAccount
      ? assetsMap(creditAccount.tokens)
      : creditAccount;

    const market = this.sdk.marketRegister.findByCreditManager(creditManager);
    const cm =
      this.sdk.marketRegister.findCreditManager(creditManager).creditManager;
    // underlying token price should always be updated
    // if it's not updatable, it'll be filtered out on following steps
    const tokens = new Set<Address>([getAddress(cm.underlying)]);

    for (const t of cm.collateralTokens) {
      if (creditAccount && caBalancesRecord && quotaRecord) {
        const balanceAsset = caBalancesRecord.get(t);
        const balance = balanceAsset?.balance || 0n;
        const mask = balanceAsset?.mask || 0n;
        const isEnabled = (mask & creditAccount.enabledTokensMask) !== 0n;

        const quotaAsset = quotaRecord.get(t);
        const quotaBalance = quotaAsset?.balance || 0n;

        if ((balance > 10n && isEnabled) || quotaBalance > 0) {
          tokens.add(getAddress(t));
        }
      } else if (creditAccount && caBalancesRecord) {
        const balanceAsset = caBalancesRecord.get(t);
        const balance = balanceAsset?.balance || 0n;
        const mask = balanceAsset?.mask || 0n;
        const isEnabled = (mask & creditAccount.enabledTokensMask) !== 0n;

        if (balance > 10n && isEnabled) {
          tokens.add(getAddress(t));
        }
      } else if (quotaRecord) {
        const quotaAsset = quotaRecord.get(t);
        const quotaBalance = quotaAsset?.balance || 0n;

        if (quotaBalance > 0) {
          tokens.add(getAddress(t));
        }
      }
    }

    const priceFeeds: Array<IPriceFeedContract> =
      market.priceOracle.priceFeedsForTokens(Array.from(tokens));
    const tStr = Array.from(tokens)
      .map(t => this.labelAddress(t))
      .join(", ");
    this.#logger?.debug(
      { account: creditAccount?.creditAccount, manager: cm.name },
      `generating price feed updates for ${tStr} from ${priceFeeds.length} price feeds`,
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
   * - If there are desiredQuotas and creditAccount update quotaBalance > 0 || (balance > 10n && isEnabled). Is used when account has both: balances and quota buys.
   * - If there is creditAccount update balance > 10n && isEnabled. Is used in credit account actions when quota is not being bought.
   * - If there is desiredQuotas update quotaBalance > 0. Is used on credit account opening, when quota is bought for the first time.
   * @param acc
   * @returns
   */
  protected async getPriceUpdatesForFacade(
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

  protected prepareDisableQuotas(ca: RouterCASlice): Array<MultiCall> {
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

  protected prepareUpdateQuotas(
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

  protected prepareDecreaseDebt(ca: RouterCASlice): Array<MultiCall> {
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

  protected prepareDisableTokens(ca: RouterCASlice): Array<MultiCall> {
    const calls: Array<MultiCall> = [];
    for (const t of ca.tokens) {
      const isEnabled = (t.mask & ca.enabledTokensMask) !== 0n;

      if (t.token !== ca.underlying && isEnabled && t.quota === 0n) {
        calls.push(this.prepareDisableToken(ca.creditFacade, t.token));
      }
    }
    return calls;
  }
  protected prepareDisableToken(
    creditFacade: Address,
    token: Address,
  ): MultiCall {
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

  protected prepareWithdrawToken(
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

  protected prepareAddCollateral(
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
    return this.sdk.addressProvider.mustGetLatest(
      AP_REWARDS_COMPRESSOR,
      VERSION_RANGE_310,
    )[0];
  }

  private get peripheryCompressor(): Address {
    return this.sdk.addressProvider.mustGetLatest(
      AP_PERIPHERY_COMPRESSOR,
      VERSION_RANGE_310,
    )[0];
  }
}

const iMellowClaimerAdapterAbi = [
  {
    type: "function",
    name: "getMultiVaultSubvaultIndices",
    inputs: [{ name: "multiVault", type: "address", internalType: "address" }],
    outputs: [
      {
        name: "subvaultIndices",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      {
        name: "withdrawalIndices",
        type: "uint256[][]",
        internalType: "uint256[][]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserSubvaultIndices",
    inputs: [
      { name: "multiVault", type: "address", internalType: "address" },
      { name: "user", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "subvaultIndices",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      {
        name: "withdrawalIndices",
        type: "uint256[][]",
        internalType: "uint256[][]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "multiAccept",
    inputs: [
      { name: "multiVault", type: "address", internalType: "address" },
      {
        name: "subvaultIndices",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      { name: "indices", type: "uint256[][]", internalType: "uint256[][]" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "multiAcceptAndClaim",
    inputs: [
      { name: "multiVault", type: "address", internalType: "address" },
      {
        name: "subvaultIndices",
        type: "uint256[]",
        internalType: "uint256[]",
      },
      { name: "indices", type: "uint256[][]", internalType: "uint256[][]" },
      { name: "", type: "address", internalType: "address" },
      { name: "maxAssets", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

const ierc4626AdapterAbi = [
  {
    type: "function",
    inputs: [
      { name: "shares", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "redeem",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;
