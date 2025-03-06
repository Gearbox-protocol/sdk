import type { Address, ContractFunctionArgs } from "viem";
import { encodeFunctionData } from "viem";

import {
  iCreditAccountCompressorAbi,
  iPeripheryCompressorAbi,
  iRewardsCompressorAbi,
} from "../../abi/compressors";
import { iCreditFacadeV300MulticallAbi } from "../abi";
import type { CreditAccountData } from "../base";
import { SDKConstruct } from "../base";
import {
  ADDRESS_0X0,
  AP_CREDIT_ACCOUNT_COMPRESSOR,
  AP_PERIPHERY_COMPRESSOR,
  AP_REWARDS_COMPRESSOR,
  MAX_UINT256,
  MIN_INT96,
} from "../constants";
import type { GearboxSDK } from "../GearboxSDK";
import type {
  CreditSuite,
  IPriceFeedContract,
  IPriceOracleContract,
  OnDemandPriceUpdate,
  UpdatePriceFeedsResult,
} from "../market";
import { rawTxToMulticallPriceUpdate } from "../market";
import {
  type Asset,
  assetsMap,
  type CreditAccountDataSlice,
  type RouterCloseResult,
} from "../router";
import { iBaseRewardPoolAbi } from "../sdk-legacy";
import type { ILogger, MultiCall, RawTx } from "../types";
import { childLogger } from "../utils";
import { simulateMulticall } from "../utils/viem";

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
  creditAccount: CreditAccountDataSlice;
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
  creditAccount: CreditAccountDataSlice;
  to: Address;
  permits: Record<string, PermitResult>;
}

interface PrepareUpdateQuotasProps {
  minQuota: Array<Asset>;
  averageQuota: Array<Asset>;
}

interface UpdateQuotasProps extends PrepareUpdateQuotasProps {
  creditAccount: CreditAccountDataSlice;
}

interface AddCollateralProps extends PrepareUpdateQuotasProps {
  asset: Asset;
  ethAmount: bigint;
  permit: PermitResult | undefined;
  creditAccount: CreditAccountDataSlice;
}

interface WithdrawCollateralProps extends PrepareUpdateQuotasProps {
  assetsToWithdraw: Array<Asset>;
  to: Address;
  creditAccount: CreditAccountDataSlice;
}

interface ExecuteSwapProps extends PrepareUpdateQuotasProps {
  calls: Array<MultiCall>;
  creditAccount: CreditAccountDataSlice;
}

export interface ClaimFarmRewardsProps extends PrepareUpdateQuotasProps {
  tokensToDisable: Array<Asset>;
  calls: Array<MultiCall>;
  creditAccount: CreditAccountDataSlice;
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
  creditAccount: CreditAccountDataSlice;
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
    this.#compressor = sdk.addressProvider.getLatestVersion(
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

      const key = [adapter, stakedPhantomToken].join("-");

      if (!acc[key]) {
        const callData = encodeFunctionData({
          abi: iBaseRewardPoolAbi,
          functionName: "getReward",
          args: [],
        });

        acc[adapter] = {
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

      acc[adapter].rewards.push({
        token: rewardToken,
        balance: r.amount,
      });

      return acc;
    }, {});

    return Object.values(r);
  }

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
    account: CreditAccountDataSlice,
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
   * Closes credit account or sets debt to zero (but keep account)
   * @param operation
   * @param creditAccount
   * @param assetsToWithdraw Tokens to withdraw from credit account
   * @param to Address to withdraw underlying to
   * @param slippage
   * @param closePath
   * @returns
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

    const calls: Array<MultiCall> = [
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
   * Repays credit account or sets debt to zero (but keep account)
   * @param operation
   * @param creditAccount
   * @param assetsToWithdraw Tokens to withdraw from credit account
   * @param collateralAssets Tokens to pay for
   * @param to Address to withdraw underlying to
   * @param slippage
   * @param permits
   * @returns
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

    const calls: Array<MultiCall> = [
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
   * Repays liquidatable credit account
   * @param creditAccount
   * @param assetsToWithdraw Tokens to withdraw from credit account
   * @param collateralAssets Tokens to pay for
   * @param to Address to withdraw underlying to
   * @param slippage
   * @returns
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

  public async updateQuotas(props: UpdateQuotasProps): Promise<CommonResult> {
    const { creditAccount } = props;
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
      ...this.#prepareUpdateQuotas(props.creditAccount.creditFacade, props),
    ];

    const tx = cm.creditFacade.multicall(creditAccount.creditAccount, [
      ...priceUpdates,
      ...this.#prepareUpdateQuotas(props.creditAccount.creditFacade, props),
    ]);

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  public async addCollateral(props: AddCollateralProps): Promise<CommonResult> {
    const { creditAccount, asset, permit, ethAmount } = props;
    const cm = this.sdk.marketRegister.findCreditManager(
      creditAccount.creditManager,
    );

    const priceUpdatesCalls = await this.getPriceUpdatesForFacade(
      creditAccount.creditManager,
      creditAccount,
      props.averageQuota,
    );

    const calls: Array<MultiCall> = [
      ...priceUpdatesCalls,
      ...this.#prepareAddCollateral(
        creditAccount.creditFacade,
        [asset],
        permit ? { [asset.token]: permit } : {},
      ),
      ...this.#prepareUpdateQuotas(creditAccount.creditFacade, props),
    ];

    const tx = cm.creditFacade.multicall(creditAccount.creditAccount, calls);
    tx.value = ethAmount.toString(10);

    return { tx, calls, creditFacade: cm.creditFacade };
  }

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

  public async withdrawCollateral(
    props: WithdrawCollateralProps,
  ): Promise<CommonResult> {
    const { creditAccount, assetsToWithdraw, to } = props;

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
      ...this.#prepareUpdateQuotas(creditAccount.creditFacade, props),
    ];

    const tx = cm.creditFacade.multicall(creditAccount.creditAccount, calls);

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  public async executeSwap(props: ExecuteSwapProps): Promise<CommonResult> {
    const { creditAccount, calls: swapCalls } = props;
    if (swapCalls.length === 0) throw new Error("No path to execute");

    const cm = this.sdk.marketRegister.findCreditManager(
      creditAccount.creditManager,
    );

    const priceUpdatesCalls = await this.getPriceUpdatesForFacade(
      creditAccount.creditManager,
      creditAccount,
      props.averageQuota,
    );

    const calls: Array<MultiCall> = [
      ...priceUpdatesCalls,
      ...swapCalls,
      ...this.#prepareUpdateQuotas(creditAccount.creditFacade, props),
    ];

    const tx = cm.creditFacade.multicall(creditAccount.creditAccount, calls);

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  public async claimFarmRewards(
    props: ClaimFarmRewardsProps,
  ): Promise<CommonResult> {
    const { tokensToDisable, calls: claimCalls, creditAccount: ca } = props;
    if (claimCalls.length === 0) throw new Error("No path to execute");

    const cm = this.sdk.marketRegister.findCreditManager(ca.creditManager);

    const priceUpdatesCalls = await this.getPriceUpdatesForFacade(
      ca.creditManager,
      ca,
      props.averageQuota,
    );

    // TODO: probably needs a better way to handle reward tokens
    const calls = [
      ...priceUpdatesCalls,
      ...claimCalls,
      ...tokensToDisable.map(a =>
        this.#prepareDisableToken(ca.creditFacade, a.token),
      ),
      ...this.#prepareUpdateQuotas(ca.creditFacade, props),
    ];

    const tx = cm.creditFacade.multicall(ca.creditAccount, calls);

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  public async openCA(props: OpenCAProps): Promise<CommonResult> {
    const {
      ethAmount,
      creditManager,
      collateral,
      permits,
      debt,
      withdrawDebt,
      referralCode,
      to,
      calls: openPathCalls,
    } = props;

    const cmSuite = this.sdk.marketRegister.findCreditManager(creditManager);
    const cm = cmSuite.creditManager;

    const priceUpdatesCalls = await this.getPriceUpdatesForFacade(
      cm.address,
      undefined,
      props.averageQuota,
    );

    const calls = [
      ...priceUpdatesCalls,
      this.#prepareIncreaseDebt(cm.creditFacade, debt),
      ...this.#prepareAddCollateral(cm.creditFacade, collateral, permits),
      ...this.#prepareUpdateQuotas(cm.creditFacade, props),
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
    accounts: Array<CreditAccountDataSlice>,
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
    creditAccount: CreditAccountDataSlice | undefined,
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
    creditAccount: CreditAccountDataSlice | undefined,
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
   * Returns price updates in format that is accepted by various credit facade methods (multicall, close/liquidate, etc...)
   * @param acc
   * @returns
   */
  public async getPriceUpdatesForFacade(
    creditManager: Address,
    creditAccount: CreditAccountDataSlice | undefined,
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

  #prepareDisableQuotas(ca: CreditAccountDataSlice): Array<MultiCall> {
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

  #prepareDecreaseDebt(ca: CreditAccountDataSlice): Array<MultiCall> {
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

  #prepareDisableTokens(ca: CreditAccountDataSlice): Array<MultiCall> {
    const calls: Array<MultiCall> = [];
    for (const t of ca.tokens) {
      if (
        t.token !== ca.underlying &&
        (t.mask & ca.enabledTokensMask) !== 0n &&
        t.quota === 0n
      ) {
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
    return this.sdk.addressProvider.getLatestVersion(AP_REWARDS_COMPRESSOR);
  }

  private get peripheryCompressor(): Address {
    return this.sdk.addressProvider.getLatestVersion(AP_PERIPHERY_COMPRESSOR);
  }
}
