import type { Address, ContractFunctionArgs } from "viem";
import { encodeFunctionData } from "viem";

import {
  iCreditAccountCompressorAbi,
  iCreditFacadeV3MulticallAbi,
} from "../abi";
import { type CreditAccountData, SDKConstruct } from "../base";
import {
  ADDRESS_0X0,
  AP_CREDIT_ACCOUNT_COMPRESSOR,
  MAX_UINT256,
  MIN_INT96,
} from "../constants";
import type { GearboxSDK } from "../GearboxSDK";
import {
  type IPriceFeedContract,
  type OnDemandPriceUpdate,
  type PriceOracleContract,
  rawTxToMulticallPriceUpdate,
  type UpdatePriceFeedsResult,
} from "../market";
import {
  type Asset,
  assetsMap,
  type CreditAccountDataSlice,
  type RouterCloseResult,
} from "../router";
import type { MultiCall, RawTx } from "../types";
import { simulateMulticall } from "../utils/viem";

type CompressorAbi = typeof iCreditAccountCompressorAbi;

type GetCreditAccountsArgs = ContractFunctionArgs<
  typeof iCreditAccountCompressorAbi,
  "pure" | "view",
  "getCreditAccounts"
>;

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

export interface FullyLiquidateAccountResult {
  tx: RawTx;
  routerCloseResult: RouterCloseResult;
}

export interface CloseCreditAccountResult extends CommonResult {
  routerCloseResult: RouterCloseResult;
}

export interface CommonResult {
  tx: RawTx;
  calls: Array<MultiCall>;
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

interface UpdateQuotasProps {
  creditAccount: CreditAccountDataSlice;
  minQuota: Array<Asset>;
  averageQuota: Array<Asset>;
}

interface AddCollateralProps extends UpdateQuotasProps {
  asset: Asset;
  ethAmount: bigint;
  permit?: PermitResult;
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

export class CreditAccountsService extends SDKConstruct {
  #compressor: Address;

  constructor(sdk: GearboxSDK) {
    super(sdk);
    this.#compressor = sdk.addressProvider.getLatestVersion(
      AP_CREDIT_ACCOUNT_COMPRESSOR,
    );
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
      await this.sdk.priceFeeds.generatePriceFeedsUpdateTxs();
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
      gas: 550_000_000n,
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
      curators: [],
      pools: this.pools,
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
          [arg0, { ...caFilter, reverting }, offset],
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
  ): Promise<FullyLiquidateAccountResult> {
    const cm = this.sdk.marketRegister.findCreditManager(account.creditManager);
    const routerCloseResult = await this.sdk.router.findBestClosePath({
      creditAccount: account,
      creditManager: cm.creditManager,
      slippage,
    });
    const priceUpdates = await this.getPriceUpdatesForFacade(account);
    const tx = cm.creditFacade.liquidateCreditAccount(
      account.creditAccount,
      to,
      [...priceUpdates, ...routerCloseResult.calls],
    );
    return { tx, routerCloseResult };
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
        this.#prepareWithdrawToken(ca, t, MAX_UINT256, to),
      ),
    ];

    const tx =
      operation === "close"
        ? cm.creditFacade.closeCreditAccount(ca.creditAccount, calls)
        : cm.creditFacade.multicall(ca.creditAccount, calls);
    return { tx, calls, routerCloseResult };
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
      ...this.#prepareAddCollateral(addCollateral, ca, permits),
      ...this.#prepareDisableQuotas(ca),
      ...this.#prepareDecreaseDebt(ca),
      ...this.#prepareDisableTokens(ca),
      // TODO: probably needs a way to handle reward tokens
      ...assetsToWithdraw.map(t =>
        this.#prepareWithdrawToken(ca, t, MAX_UINT256, to),
      ),
    ];

    const tx =
      operation === "close"
        ? cm.creditFacade.closeCreditAccount(ca.creditAccount, calls)
        : cm.creditFacade.multicall(ca.creditAccount, calls);
    return { tx, calls };
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

    const priceUpdates = await this.getPriceUpdatesForFacade(ca);

    const addCollateral = collateralAssets.filter(a => a.balance > 0);

    const calls: Array<MultiCall> = [
      ...priceUpdates,
      ...this.#prepareAddCollateral(addCollateral, ca, permits),
      ...assetsToWithdraw.map(t =>
        this.#prepareWithdrawToken(ca, t, MAX_UINT256, to),
      ),
    ];

    const tx = cm.creditFacade.liquidateCreditAccount(
      ca.creditAccount,
      to,
      calls,
    );
    return { tx, calls };
  }

  public async updateQuotas(props: UpdateQuotasProps): Promise<CommonResult> {
    const { creditAccount } = props;
    const cm = this.sdk.marketRegister.findCreditManager(
      creditAccount.creditManager,
    );
    const priceUpdates = await this.getPriceUpdatesForFacade(creditAccount);

    const calls: Array<MultiCall> = [
      ...priceUpdates,
      ...this.#prepareUpdateQuotas(props),
    ];

    const tx = cm.creditFacade.multicall(creditAccount.creditAccount, [
      ...priceUpdates,
      ...this.#prepareUpdateQuotas(props),
    ]);

    return {
      tx,
      calls,
    };
  }

  public async addCollateral(props: AddCollateralProps): Promise<CommonResult> {
    const { creditAccount, asset, permit, ethAmount } = props;
    const cm = this.sdk.marketRegister.findCreditManager(
      creditAccount.creditManager,
    );

    const priceUpdatesCalls =
      await this.getPriceUpdatesForFacade(creditAccount);

    const addCollateralCalls = this.#prepareAddCollateral(
      [asset],
      creditAccount,
      permit ? { [asset.token]: permit } : {},
    );

    const updateQuotaCalls = this.#prepareUpdateQuotas(props);

    const calls: Array<MultiCall> = [
      ...priceUpdatesCalls,
      ...addCollateralCalls,
      ...updateQuotaCalls,
    ];

    const tx = cm.creditFacade.multicall(creditAccount.creditAccount, calls);
    tx.value = ethAmount.toString(10);

    return { tx, calls };
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

    const priceUpdatesCalls =
      await this.getPriceUpdatesForFacade(creditAccount);

    const underlyingEnabled = (creditAccount.enabledTokensMask & 1n) === 1n;
    const shouldEnable = !isDecrease && !underlyingEnabled;

    const calls: Array<MultiCall> = [
      ...priceUpdatesCalls,
      ...(shouldEnable
        ? this.#prepareEnableTokens(creditAccount, [creditAccount.underlying])
        : []),
      {
        target: creditAccount.creditFacade,
        callData: encodeFunctionData({
          abi: iCreditFacadeV3MulticallAbi,
          functionName: isDecrease ? "increaseDebt" : "decreaseDebt",
          args: [change],
        }),
      },
    ];

    const tx = cm.creditFacade.multicall(creditAccount.creditAccount, calls);

    return { tx, calls };
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
        gas: 550_000_000n,
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
    const oracleByPool = new Map<Address, PriceOracleContract>();
    for (const acc of accounts) {
      const market = this.sdk.marketRegister.findByCreditManager(
        acc.creditManager,
      );
      const pool = market.poolFactory.pool.address;
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
    for (const [pool, priceFeedFactory] of oracleByPool.entries()) {
      const tokens = Array.from(tokensByPool.get(pool) ?? []);
      priceFeeds.push(...priceFeedFactory.priceFeedsForTokens(tokens));
    }
    return this.sdk.priceFeeds.generatePriceFeedsUpdateTxs(priceFeeds);
  }

  /**
   * Returns account price updates in a non-encoded format
   * @param acc
   * @returns
   */
  public async getOnDemandPriceUpdates(
    acc: CreditAccountDataSlice,
  ): Promise<Array<OnDemandPriceUpdate>> {
    const market = this.sdk.marketRegister.findByCreditManager(
      acc.creditManager,
    );
    const update = await this.getUpdateForAccounts([acc]);
    return market.priceOracle.onDemandPriceUpdates(update);
  }

  /**
   * Returns price updates in format that is accepted by various credit facade methods (multicall, close/liquidate, etc...)
   * @param acc
   * @returns
   */
  public async getPriceUpdatesForFacade(
    acc: CreditAccountDataSlice,
  ): Promise<Array<MultiCall>> {
    const cm = this.sdk.marketRegister.findCreditManager(acc.creditManager);
    const updates = await this.getOnDemandPriceUpdates(acc);
    return cm.creditFacade.encodeOnDemandPriceUpdates(updates);
  }

  #prepareDisableQuotas(ca: CreditAccountDataSlice): Array<MultiCall> {
    const calls: Array<MultiCall> = [];
    for (const { token, quota } of ca.tokens) {
      if (quota > 0n) {
        calls.push({
          target: ca.creditFacade,
          callData: encodeFunctionData({
            abi: iCreditFacadeV3MulticallAbi,
            functionName: "updateQuota",
            args: [token, MIN_INT96, 0n],
          }),
        });
      }
    }
    return calls;
  }

  #prepareUpdateQuotas(props: UpdateQuotasProps): Array<MultiCall> {
    const { creditAccount, averageQuota, minQuota } = props;
    const minRecord = assetsMap(minQuota);

    const calls: Array<MultiCall> = averageQuota.map(q => {
      const minAsset = minRecord.get(q.token);
      const min = minAsset && minAsset?.balance > 0 ? minAsset.balance : 0n;

      return {
        target: creditAccount.creditFacade,
        callData: encodeFunctionData({
          abi: iCreditFacadeV3MulticallAbi,
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
            abi: iCreditFacadeV3MulticallAbi,
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
        calls.push({
          target: ca.creditFacade,
          callData: encodeFunctionData({
            abi: iCreditFacadeV3MulticallAbi,
            functionName: "disableToken",
            args: [t.token],
          }),
        });
      }
    }
    return calls;
  }

  #prepareEnableTokens(
    ca: CreditAccountDataSlice,
    tokens: Array<Address>,
  ): Array<MultiCall> {
    return tokens.map(t => ({
      target: ca.creditFacade,
      callData: encodeFunctionData({
        abi: iCreditFacadeV3MulticallAbi,
        functionName: "enableToken",
        args: [t],
      }),
    }));
  }

  #prepareWithdrawToken(
    ca: CreditAccountDataSlice,
    token: Address,
    amount: bigint,
    to: Address,
  ): MultiCall {
    return {
      target: ca.creditFacade,
      callData: encodeFunctionData({
        abi: iCreditFacadeV3MulticallAbi,
        functionName: "withdrawCollateral",
        args: [token, amount, to],
      }),
    };
  }

  #prepareAddCollateral(
    assets: Array<Asset>,
    ca: CreditAccountDataSlice,
    permits: Record<string, PermitResult>,
  ): Array<MultiCall> {
    const calls = assets.map(({ token, balance }) => {
      const p = permits[token];

      if (p) {
        return {
          target: ca.creditFacade,
          callData: encodeFunctionData({
            abi: iCreditFacadeV3MulticallAbi,
            functionName: "addCollateralWithPermit",
            args: [token, balance, p.deadline, p.v, p.r, p.s],
          }),
        };
      }

      return {
        target: ca.creditFacade,
        callData: encodeFunctionData({
          abi: iCreditFacadeV3MulticallAbi,
          functionName: "addCollateral",
          args: [token, balance],
        }),
      };
    });

    return calls;
  }

  /**
   * Returns addresses of pools of attached markets
   */
  private get pools(): Array<Address> {
    return this.sdk.marketRegister.pools.map(p => p.pool.address);
  }
}
