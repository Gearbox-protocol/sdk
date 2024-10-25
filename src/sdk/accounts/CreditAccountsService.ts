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
  type CreditFactory,
  type IPriceFeedContract,
  type OnDemandPriceUpdate,
  type PriceOracleContract,
  rawTxToMulticallPriceUpdate,
  type UpdatePriceFeedsResult,
} from "../market";
import type { RouterCloseResult } from "../router";
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

export interface CloseCreditAccountResult {
  tx: RawTx;
  routerCloseResult: RouterCloseResult;
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
  ): Promise<CreditAccountData[]> {
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

    const allCAs: CreditAccountData[] = [];
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
    account: CreditAccountData,
    to: Address,
    slippage = 50n,
  ): Promise<FullyLiquidateAccountResult> {
    const cm = this.sdk.marketRegister.findCreditManager(account.creditManager);
    const routerCloseResult = await this.sdk.router.findBestClosePath(
      account,
      cm.creditManager,
      slippage,
    );
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
   * @param ca
   * @param assetsToKeep Tokens to withdraw from credit account
   * @param to Address to withdraw underlying to
   * @param slippage
   * @returns
   */
  async closeCreditAccount(
    operation: "close" | "zeroDebt",
    ca: CreditAccountData,
    assetsToKeep: Address[],
    to: Address,
    slippage = 50n,
  ): Promise<CloseCreditAccountResult> {
    const cm = this.sdk.marketRegister.findCreditManager(ca.creditManager);
    const { calls, routerCloseResult } = await this.#prepareCloseCreditAccount(
      ca,
      cm,
      assetsToKeep,
      to,
      slippage,
    );
    const tx =
      operation === "close"
        ? cm.creditFacade.closeCreditAccount(ca.creditAccount, calls)
        : cm.creditFacade.multicall(ca.creditAccount, calls);
    return { tx, routerCloseResult };
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
    priceUpdateTxs?: RawTx[],
    options?: ReadContractOptions,
  ): Promise<[accounts: CreditAccountData[], newOffset: bigint]> {
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
        CreditAccountData[],
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
    accounts: CreditAccountData[],
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
    const priceFeeds: IPriceFeedContract[] = [];
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
    acc: CreditAccountData,
  ): Promise<OnDemandPriceUpdate[]> {
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
    acc: CreditAccountData,
  ): Promise<MultiCall[]> {
    const cm = this.sdk.marketRegister.findCreditManager(acc.creditManager);
    const updates = await this.getOnDemandPriceUpdates(acc);
    return cm.creditFacade.encodeOnDemandPriceUpdates(updates);
  }

  async #prepareCloseCreditAccount(
    ca: CreditAccountData,
    cm: CreditFactory,
    assetsToKeep: Address[],
    to: Address,
    slippage = 50n,
  ): Promise<{ calls: MultiCall[]; routerCloseResult: RouterCloseResult }> {
    const routerCloseResult = await this.sdk.router.findBestClosePath(
      ca,
      cm.creditManager,
      slippage,
    );
    const priceUpdates = await this.getPriceUpdatesForFacade(ca);
    const calls = [
      ...priceUpdates,
      ...routerCloseResult.calls,
      ...this.#prepareDisableQuotas(ca),
      ...this.#prepareDecreaseDebt(ca),
      ...this.#prepareDisableTokens(ca),
      ...assetsToKeep.map(t =>
        this.#prepareWithdrawToken(ca, t, MAX_UINT256, to),
      ),
    ];
    return { calls, routerCloseResult };
  }

  #prepareDisableQuotas(ca: CreditAccountData): MultiCall[] {
    const calls: MultiCall[] = [];
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

  #prepareDecreaseDebt(ca: CreditAccountData): MultiCall[] {
    if (ca.totalDebtUSD > 0n) {
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

  #prepareDisableTokens(ca: CreditAccountData): MultiCall[] {
    const calls: MultiCall[] = [];
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

  #prepareWithdrawToken(
    ca: CreditAccountData,
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

  /**
   * Returns addresses of pools of attached markets
   */
  private get pools(): Address[] {
    return this.sdk.marketRegister.pools.map(p => p.pool.address);
  }
}
