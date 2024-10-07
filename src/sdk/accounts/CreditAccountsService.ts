import type { Address, ContractFunctionArgs } from "viem";
import { decodeFunctionData, encodeFunctionData } from "viem";

import {
  iCreditAccountCompressorAbi,
  iCreditFacadeV3MulticallAbi,
  iUpdatablePriceFeedAbi,
} from "../abi";
import { type CreditAccountData, SDKConstruct } from "../base";
import {
  ADDRESS_0X0,
  AP_CREDIT_ACCOUNT_COMPRESSOR,
  MAX_UINT256,
  MIN_INT96,
} from "../constants";
import type { GearboxSDK } from "../GearboxSDK";
import type {
  CreditFactory,
  IPriceFeedContract,
  OnDemandPriceUpdate,
  PriceOracleContract,
  UpdatePriceFeedsResult,
} from "../market";
import type { MultiCall, RawTx, ReadContractOptions } from "../types";
import { simulateMulticall } from "../utils/viem";

type CompressorAbi = typeof iCreditAccountCompressorAbi;

type GetCreditAccountsArgs = ContractFunctionArgs<
  typeof iCreditAccountCompressorAbi,
  "pure" | "view",
  "getCreditAccounts"
>;

export interface CreditAccountFilter {
  creditManager?: Address;
  owner?: Address;
  includeZeroDebt?: boolean;
  minHealthFactor?: number;
  maxHealthFactor?: number;
  batchLimit?: bigint;
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
        blockNumber, // TODO: we should cache price updates for block to speed up optimistic liquidator
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
      account: this.provider.account,
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
      batchLimit,
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
          [arg0, { ...caFilter, reverting }, offset, batchLimit!].filter(
            Boolean,
          ) as unknown as GetCreditAccountsArgs,
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
    to?: Address,
    slippage = 50n,
  ): Promise<RawTx> {
    const cm = this.sdk.marketRegister.findCreditManager(account.creditManager);
    const preview = await this.sdk.router.findBestClosePath(
      account,
      cm.creditManager,
      slippage,
    );
    const priceUpdates = await this.getPriceUpdatesForFacade(account);
    const recipient = to ?? this.sdk.provider.account;
    if (!recipient) {
      throw new Error("liquidate account: assets recipient not specied");
    }
    return cm.creditFacade.createRawTx({
      functionName: "liquidateCreditAccount",
      args: [
        account.creditAccount,
        recipient,
        [...priceUpdates, ...preview.calls],
      ],
    });
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
    to?: Address,
    slippage = 50n,
  ): Promise<RawTx> {
    const cm = this.sdk.marketRegister.findCreditManager(ca.creditManager);
    const recipient = to ?? this.sdk.provider.account;
    if (!recipient) {
      throw new Error("close account: assets recipient not specied");
    }
    const calls = await this.#prepareCloseCreditAccount(
      ca,
      cm,
      assetsToKeep,
      recipient,
      slippage,
    );
    return cm.creditFacade.createRawTx({
      functionName: operation === "close" ? "closeCreditAccount" : "multicall",
      args: [ca.creditAccount, calls],
    });
  }

  /**
   * Internal wrapper for CreditAccountCompressor.getCreditAccounts + price updates wrapped into multicall
   * @param param0
   * @returns
   */
  async #getCreditAccounts(
    args: GetCreditAccountsArgs,
    priceUpdateTxs?: RawTx[],
    options?: ReadContractOptions,
  ): Promise<[accounts: CreditAccountData[], newOffset: bigint]> {
    if (priceUpdateTxs?.length) {
      const resp = await simulateMulticall(this.provider.publicClient, {
        account: this.provider.account,
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
        blockNumber: options?.blockNumber,
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
      blockNumber: options?.blockNumber,
    });
  }

  /**
   * Returns raw txs that are needed to update all price feeds so that all credit accounts (possibly from different markets) compute
   * @param accounts
   * @returns
   */
  public async getUpdateForAccounts(
    accounts: CreditAccountData[],
    blockNumber?: bigint,
  ): Promise<UpdatePriceFeedsResult> {
    // for each market, using pool address as key, gather tokens to update and find PriceFeedFactories
    const tokensByPool = new Map<Address, Set<Address>>();
    const oracleByPool = new Map<Address, PriceOracleContract>();
    for (const acc of accounts) {
      const market = this.sdk.marketRegister.findByCreditManager(
        acc.creditManager,
      );
      const pool = market.state.pool.pool.address;
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
   * @param blockNumber
   * @returns
   */
  public async getOnDemandPriceUpdates(
    acc: CreditAccountData,
    blockNumber?: bigint,
  ): Promise<OnDemandPriceUpdate[]> {
    const market = this.sdk.marketRegister.findByCreditManager(
      acc.creditManager,
    );
    const update = await this.getUpdateForAccounts([acc], blockNumber);
    return market.priceOracle.onDemandPriceUpdates(update);
  }

  /**
   * Returns price updates in format that is accepted by various credit facade methods (multicall, close/liquidate, etc...)
   * @param acc
   * @param blockNumber
   * @returns
   */
  public async getPriceUpdatesForFacade(
    acc: CreditAccountData,
    blockNumber?: bigint,
  ): Promise<MultiCall[]> {
    const cm = this.sdk.marketRegister.findCreditManager(acc.creditManager);
    const updates = await this.getOnDemandPriceUpdates(acc, blockNumber);
    return updates.map(({ token, reserve, data }) => ({
      target: cm.creditFacade.address,
      callData: encodeFunctionData({
        abi: iCreditFacadeV3MulticallAbi,
        functionName: "onDemandPriceUpdate",
        args: [token, reserve, data],
      }),
    }));
  }

  async #prepareCloseCreditAccount(
    ca: CreditAccountData,
    cm: CreditFactory,
    assetsToKeep: Address[],
    to: Address,
    slippage = 50n,
  ): Promise<MultiCall[]> {
    const closePath = await this.sdk.router.findBestClosePath(
      ca,
      cm.creditManager,
      slippage,
    );
    const priceUpdates = await this.getPriceUpdatesForFacade(ca);
    return [
      ...priceUpdates,
      ...closePath.calls,
      ...this.#prepareDisableQuotas(ca),
      ...this.#prepareDecreaseDebt(ca),
      ...this.#prepareDisableTokens(ca),
      ...assetsToKeep.map(t =>
        this.#prepareWithdrawToken(ca, t, MAX_UINT256, to),
      ),
    ];
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
    return this.sdk.marketRegister.poolState.map(p => p.pool.address);
  }
}

/**
 * Helper method to convert our RawTx into viem's multicall format
 * Involves decoding what was previously encoded, but it's better than adding another method to PriceFeedFactory
 * @param tx
 * @returns
 */
function rawTxToMulticallPriceUpdate(tx: RawTx) {
  const { to, callData } = tx;
  const { args, functionName } = decodeFunctionData({
    abi: iUpdatablePriceFeedAbi,
    data: callData,
  });
  return {
    abi: iUpdatablePriceFeedAbi,
    address: to,
    functionName,
    args,
  };
}
