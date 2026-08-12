import type { Address, Hex } from "viem";
import { encodeFunctionData, getContract } from "viem";
import { iBotListV310Abi } from "../../abi/310/generated.js";
import { creditAccountCompressorAbi } from "../../abi/compressors/creditAccountCompressor.js";
import { peripheryCompressorAbi } from "../../abi/compressors/peripheryCompressor.js";
import { rewardsCompressorAbi } from "../../abi/compressors/rewardsCompressor.js";
import { iBaseRewardPoolAbi } from "../../abi/iBaseRewardPool.js";
import { ierc4626AdapterAbi } from "../../abi/ierc4626Adapter.js";
import { iRWAFactoryAbi } from "../../abi/rwa/iRWAFactory.js";
import type {
  DelayedReceivedAsset,
  StrategyPosition,
} from "../../model/index.js";
import type { Asset, CreditAccountData } from "../base/index.js";
import { SDKConstruct } from "../base/index.js";
import {
  ADDRESS_0X0,
  AP_CREDIT_ACCOUNT_COMPRESSOR,
  AP_PERIPHERY_COMPRESSOR,
  AP_REWARDS_COMPRESSOR,
  DUST_THRESHOLD,
  MAX_UINT256,
  VERSION_RANGE_310,
} from "../constants/index.js";
import type {
  BalanceDelta,
  CreditSuite,
  RWAOperationArgs,
} from "../market/index.js";
import {
  dominantCollateral,
  getRawPriceUpdates,
  type IPriceFeedContract,
  type PriceUpdate,
  type UpdatePriceFeedsResult,
} from "../market/index.js";
import {
  borrowApyBps,
  healthFactorBps,
  positionLeverage,
  usdToNumber,
} from "../market/math.js";
import type { RWAOpenAccountRequirements } from "../market/rwa/index.js";
import type { OnchainSDK } from "../OnchainSDK.js";
import type { RouterCASlice } from "../router/index.js";
import type { RouterRewardsResult } from "../router/types.js";
import type { IPriceUpdateTx, MultiCall, RawTx } from "../types/index.js";
import { AddressMap, AddressSet, hexEq } from "../utils/index.js";
import { simulateWithPriceUpdates } from "../utils/viem/index.js";
import {
  extractPriceUpdates,
  extractQuotaTokens,
  mergePriceUpdates,
} from "./multicall-utils.js";
import type {
  AccountToCheck,
  AssembleCaOperationsProps,
  AssembleClaimDelayedCallsProps,
  AssembleCloseCreditAccountCallsProps,
  AssembleRepayCreditAccountCallsProps,
  AssembleStartDelayedWithdrawalCallsProps,
  ClaimFarmRewardsProps,
  CreditAccountFilter,
  CreditAccountOperationResult,
  CreditAccountTokensSlice,
  CreditManagerFilter,
  CreditManagerOperationResult,
  FullyLiquidateProps,
  FullyLiquidateResult,
  GetApprovalAddressProps,
  GetConnectedBotsResult,
  GetConnectedMigrationBotsResult,
  GetCreditAccountsArgs,
  GetCreditAccountsOptions,
  GetOpenAccountRequirementsProps,
  GetPendingWithdrawalsProps,
  GetPendingWithdrawalsResult,
  ICreditAccountsService,
  ListStrategyPositionsProps,
  OpenCAProps,
  PartiallyLiquidateProps,
  PermitResult,
  PrepareUpdateQuotasProps,
  PreviewDelayedWithdrawalProps,
  Rewards,
  SetBotProps,
} from "./types.js";
import type {
  ClaimableWithdrawal,
  IWithdrawalCompressorContract,
  PendingWithdrawal,
  RequestableWithdrawal,
  WithdrawalOutput,
} from "./withdrawal-compressor/index.js";

type MulticallWithFailure<T> = (
  | {
      error?: undefined;
      result: T;
      status: "success";
    }
  | {
      error: Error;
      result?: undefined;
      status: "failure";
    }
)[];

type BotResponseCompressor = MulticallWithFailure<
  readonly {
    baseParams: {
      addr: `0x${string}`;
      version: bigint;
      contractType: `0x${string}`;
      serializedParams: `0x${string}`;
    };
    requiredPermissions: bigint;
    creditAccount: `0x${string}`;
    permissions: bigint;
    forbidden: boolean;
  }[]
>;
type BotsDirectResponse = MulticallWithFailure<
  readonly [bigint, boolean, boolean] | readonly [bigint, boolean]
>;

type CompressorAbi = typeof creditAccountCompressorAbi;

/**
 * Options for configuring the credit account service.
 **/
export interface CreditAccountServiceOptions {
  /**
   * Maximum number of credit accounts to fetch per compressor call.
   * When set, accounts are loaded in batches of this size until all are fetched.
   **/
  batchSize?: number;
}

/**
 * Service for querying and operating on Gearbox credit accounts.
 *
 * Provides methods to fetch account data, build transactions for common operations
 * (open, close, liquidate, swap, manage collateral/debt/quotas), and generate
 * the price feed updates required by the credit facade.
 *
 * @see {@link ICreditAccountsService}
 **/
export class CreditAccountsServiceV310
  extends SDKConstruct
  implements ICreditAccountsService
{
  #compressor?: Address;
  #batchSize?: number;

  constructor(sdk: OnchainSDK, options?: CreditAccountServiceOptions) {
    super(sdk);
    this.#batchSize = options?.batchSize;
  }

  public setBatchSize(batchSize: number) {
    this.#batchSize = batchSize;
  }

  /**
   * {@inheritDoc ICreditAccountsService.getCreditAccountData}
   **/
  public async getCreditAccountData(
    account: Address,
    blockNumber?: bigint,
  ): Promise<CreditAccountData<true> | undefined> {
    let raw: CreditAccountData;
    try {
      raw = await this.client.readContract({
        abi: creditAccountCompressorAbi,
        address: this.compressor,
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
    const marketSuite = this.sdk.marketRegister.findByCreditManager(
      raw.creditManager,
    );
    const factory = marketSuite.rwaFactory;

    let ca: CreditAccountData;
    let investor: Address | undefined;
    if (raw.success) {
      ca = raw;
      investor = await factory?.getInvestor(raw.creditAccount, false);
    } else {
      const { txs: priceUpdateTxs } = await this.#getUpdateForAccount(raw);
      [ca, investor] = (await simulateWithPriceUpdates(this.client, {
        priceUpdates: priceUpdateTxs,
        contracts: [
          {
            abi: creditAccountCompressorAbi,
            address: this.compressor,
            functionName: "getCreditAccountData",
            args: [account],
          },
          ...(factory
            ? [
                {
                  abi: iRWAFactoryAbi,
                  address: factory.address,
                  functionName: "getInvestor",
                  args: [raw.creditAccount],
                },
              ]
            : []),
        ] as any,
        blockNumber,
        gas: this.sdk.gasLimit,
      })) as [CreditAccountData, Address | undefined];
    }

    return { ...ca, investor };
  }

  /**
   * {@inheritDoc ICreditAccountsService.getCreditAccounts}
   **/
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
      ignoreReservePrices = false,
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
      await this.sdk.priceFeeds.generatePriceFeedsUpdateTxs(
        ignoreReservePrices ? { main: true } : undefined,
      );

    const allCAs: Array<CreditAccountData> = [];
    let revertingOffset = 0;
    // reverting filter is exclusive, we need both options to get all accounts
    for (const reverting of [false, true]) {
      let offset = 0n;
      revertingOffset = allCAs.length;
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
    this.logger?.debug(
      `loaded ${allCAs.length} credit accounts (${
        allCAs.length - revertingOffset
      } reverting)`,
    );

    // sort by health factor ascending
    return allCAs.sort((a, b) => Number(a.healthFactor - b.healthFactor));
  }

  /**
   * {@inheritDoc ICreditAccountsService.getBorrowerCreditAccounts}
   **/
  public async getBorrowerCreditAccounts(
    borrower: Address,
    options?: GetCreditAccountsOptions,
    blockNumber?: bigint,
  ): Promise<Array<CreditAccountData<true>>> {
    const {
      creditManager,
      includeZeroDebt = false,
      maxHealthFactor = MAX_UINT256,
      minHealthFactor = 0n,
      ignoreReservePrices = false,
    } = options ?? {};

    const { txs: priceUpdateTxs } =
      await this.sdk.priceFeeds.generatePriceFeedsUpdateTxs(
        ignoreReservePrices ? { main: true } : undefined,
      );

    // 1. Discover RWA credit accounts for this borrower across all factories
    const investorDataList = await this.sdk.rwa.getInvestorData(borrower);
    const rwaAccountAddresses: Address[] = investorDataList.flatMap(d =>
      d.creditAccounts.map(ca => ca.creditAccount),
    );

    // 2. Build a single multicall:
    //    - getCreditAccountData for each RWA account
    //    - getCreditAccounts(borrower, reverting=false)
    //    - getCreditAccounts(borrower, reverting=true)
    const cmFilter: CreditManagerFilter = creditManager
      ? {
          configurators: [],
          creditManagers: [creditManager],
          pools: [],
          underlying: ADDRESS_0X0,
        }
      : {
          configurators: this.marketConfigurators,
          creditManagers: [],
          pools: [],
          underlying: ADDRESS_0X0,
        };

    const permissiveFilter: CreditAccountFilter = {
      owner: borrower,
      includeZeroDebt: true,
      minHealthFactor: 0n,
      maxHealthFactor: MAX_UINT256,
      reverting: false,
    };

    const rwaContracts = rwaAccountAddresses.map(
      account =>
        ({
          abi: creditAccountCompressorAbi,
          address: this.compressor,
          functionName: "getCreditAccountData" as const,
          args: [account],
        }) as const,
    );

    const getCreditAccountsContracts = [false, true].map(
      reverting =>
        ({
          abi: creditAccountCompressorAbi,
          address: this.compressor,
          functionName: "getCreditAccounts" as const,
          args: [cmFilter, { ...permissiveFilter, reverting }, 0n],
        }) as const,
    );

    const allContracts = [...rwaContracts, ...getCreditAccountsContracts];

    const results = await simulateWithPriceUpdates(this.client, {
      priceUpdates: priceUpdateTxs,
      contracts: allContracts,
      blockNumber,
      gas: this.sdk.gasLimit,
    });

    // 3. Split results back
    const rwaResults = results.slice(
      0,
      rwaAccountAddresses.length,
    ) as Array<CreditAccountData>;
    const normalResults = results.slice(rwaAccountAddresses.length) as Array<
      [CreditAccountData[], bigint]
    >;

    // 4. Assemble with investor
    const seen = new AddressSet();
    const allCAs: Array<CreditAccountData<true>> = [];

    for (const ca of rwaResults) {
      if (!seen.has(ca.creditAccount)) {
        seen.add(ca.creditAccount);
        allCAs.push({ ...ca, investor: borrower });
      }
    }

    for (const [accounts] of normalResults) {
      for (const ca of accounts) {
        if (!seen.has(ca.creditAccount)) {
          seen.add(ca.creditAccount);
          allCAs.push({ ...ca, investor: undefined });
        }
      }
    }

    // 5. Apply remaining TS-side filters
    const filtered = allCAs.filter(ca => {
      if (!includeZeroDebt && ca.debt === 0n) return false;
      if (ca.healthFactor < minHealthFactor) return false;
      if (ca.healthFactor > maxHealthFactor) return false;
      if (creditManager && !hexEq(ca.creditManager, creditManager))
        return false;
      return true;
    });

    this.logger?.debug(
      `loaded ${allCAs.length} borrower credit accounts (${rwaResults.length} RWA, ${filtered.length} after filter)`,
    );

    return filtered.sort((a, b) => Number(a.healthFactor - b.healthFactor));
  }

  /**
   * {@inheritDoc ICreditAccountsService.listPositions}
   **/
  public async listPositions(
    props: ListStrategyPositionsProps,
  ): Promise<StrategyPosition[]> {
    const { owner, includeZeroDebt } = props;
    const [accounts] = await Promise.all([
      this.getBorrowerCreditAccounts(owner, { includeZeroDebt }),
      // phantom token lookups below are sync, so the cache has to be warm
      this.sdk.withdrawalCompressor?.loadWithdrawableAssets(),
    ]);

    const describable = accounts.filter(ca => {
      // collateral computation reverted (e.g. dead price feed) — none of the
      // account's amounts can be computed, so it is left out of the list
      if (!ca.success) {
        this.logger?.warn(
          `cannot describe position of ${this.labelAddress(ca.creditAccount)}: collateral computation failed`,
        );
      }
      return ca.success;
    });

    const withdrawals = await Promise.all(
      describable.map(ca => this.#accountWithdrawals(ca)),
    );

    return describable.map((ca, i) =>
      this.#strategyPosition(ca, withdrawals[i] ?? new AddressMap()),
    );
  }

  /**
   * Builds one strategy position from an account snapshot.
   *
   * @param withdrawals - Delayed withdrawals of the account, keyed by the
   * phantom token that represents them on it.
   **/
  #strategyPosition(
    ca: CreditAccountData,
    withdrawals: AddressMap<DelayedReceivedAsset[]>,
  ): StrategyPosition {
    const suite = this.sdk.marketRegister.findCreditManager(ca.creditManager);
    const { market } = suite;
    const { priceOracle } = market;
    const { pool } = market.pool;

    // for RWA markets, amounts are denominated in the unwrapped asset
    // (e.g. USDC instead of dcUSDC); the wrapped underlying converts 1:1
    const token = this.sdk.tokensMeta.mustGetToken(market.unwrappedUnderlying);
    const totalDebtValue = ca.debt + ca.accruedInterest + ca.accruedFees;
    const collateral = dominantCollateral(ca, market);

    return {
      kind: "strategy",
      chainId: this.sdk.chainId,
      creditManager: ca.creditManager,
      creditAccount: ca.creditAccount,
      name: collateral ? suite.strategyName(collateral) : token.symbol,
      // the read model asks for the collateral the position was opened into,
      // which needs its history; the chain can only tell what it holds now
      targetCollateral: collateral
        ? this.sdk.tokensMeta.mustGetToken(collateral)
        : null,
      leverage: positionLeverage(totalDebtValue, ca.totalValue),
      borrowApy: borrowApyBps(
        pool.baseInterestRate,
        suite.creditManager.feeInterest,
      ),
      // the compressor prices the whole account in one pass, so the USD values
      // of the two totals come from it rather than from a second price lookup
      totalDebt: {
        token,
        value: totalDebtValue,
        valueUsd: usdToNumber(ca.totalDebtUSD),
      },
      totalValue: {
        token,
        value: ca.totalValue,
        valueUsd: usdToNumber(ca.totalValueUSD),
      },
      healthFactor: healthFactorBps(ca.healthFactor),
      collaterals: ca.tokens.flatMap(t => {
        if (
          (t.mask & ca.enabledTokensMask) === 0n ||
          t.balance <= DUST_THRESHOLD
        ) {
          return [];
        }
        return [
          {
            // phantom tokens are reported as themselves, the asset they
            // redeem into shows up in `withdrawals`
            collateral: priceOracle.toTokenAmount(t.token, t.balance),
            quota: priceOracle.toTokenAmount(market.underlying, t.quota),
            withdrawals: withdrawals.get(t.token) ?? [],
          },
        ];
      }),
    };
  }

  /**
   * Delayed withdrawals of one account, keyed by the phantom token that
   * represents them on it, so that each collateral row can pick up its own.
   **/
  async #accountWithdrawals(
    ca: CreditAccountData,
  ): Promise<AddressMap<DelayedReceivedAsset[]>> {
    const compressor = this.sdk.withdrawalCompressor;
    const byPhantomToken = new AddressMap<DelayedReceivedAsset[]>(
      undefined,
      "accountWithdrawals",
    );
    // an account with no phantom token balance has nothing on its way out, and
    // asking the compressor about it would be one RPC call per such account
    const holdsPhantomToken = ca.tokens.some(
      t =>
        t.balance > DUST_THRESHOLD &&
        compressor?.getWithdrawalSourceToken(t.token) !== undefined,
    );
    if (!compressor || !holdsPhantomToken) {
      return byPhantomToken;
    }
    const { priceOracle } = this.sdk.marketRegister.findByCreditManager(
      ca.creditManager,
    );
    const { claimable, pending } = await compressor.getCurrentWithdrawals(
      ca.creditAccount,
    );

    const add = (
      w: ClaimableWithdrawal | PendingWithdrawal,
      outputs: readonly WithdrawalOutput[],
      claimableAt?: bigint,
    ): void => {
      const assets = outputs.map(
        (o): DelayedReceivedAsset => ({
          isDelayed: true,
          ...priceOracle.toTokenAmount(o.token, o.amount),
          redeemer: w.redeemer,
          claimableAt:
            claimableAt === undefined ? undefined : Number(claimableAt),
        }),
      );
      byPhantomToken.upsert(w.withdrawalPhantomToken, [
        ...(byPhantomToken.get(w.withdrawalPhantomToken) ?? []),
        ...assets,
      ]);
    };

    for (const w of claimable) {
      add(w, w.outputs);
    }
    for (const w of pending) {
      add(w, w.expectedOutputs, w.claimableAt);
    }
    return byPhantomToken;
  }

  /**
   * {@inheritDoc ICreditAccountsService.getRewards}
   **/
  public async getRewards(creditAccount: Address): Promise<Array<Rewards>> {
    const rewards = await this.client.readContract({
      abi: rewardsCompressorAbi,
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
   * {@inheritDoc ICreditAccountsService.getConnectedBots}
   **/
  public async getConnectedBots(
    accountsToCheck: Array<AccountToCheck>,
    legacyMigrationBot: Address | undefined,
    additionalBots: Array<Address>,
  ): Promise<{
    legacy: GetConnectedBotsResult;
    legacyMigration: GetConnectedMigrationBotsResult;
    additionalBots: Array<
      Omit<NonNullable<GetConnectedMigrationBotsResult>, "botAddress">
    >;
  }> {
    const allResp = await this.client.multicall({
      contracts: [
        ...accountsToCheck.map(o => {
          const pool = this.sdk.marketRegister.findByCreditManager(
            o.creditManager,
          );

          return {
            abi: peripheryCompressorAbi,
            address: this.peripheryCompressor,
            functionName: "getConnectedBots",
            args: [pool.configurator.address, o.creditAccount],
          } as const;
        }),
        ...(legacyMigrationBot
          ? accountsToCheck.map(ca => {
              const cm = this.sdk.marketRegister.findCreditManager(
                ca.creditManager,
              );

              return {
                abi: iBotListV310Abi,
                address: cm.creditFacade.botList,
                functionName: "getBotStatus",
                args: [legacyMigrationBot, ca.creditAccount],
              } as const;
            })
          : []),
        ...accountsToCheck.flatMap(ca => {
          const cm = this.sdk.marketRegister.findCreditManager(
            ca.creditManager,
          );

          return additionalBots.map(bot => {
            return {
              abi: iBotListV310Abi,
              address: cm.creditFacade.botList,
              functionName: "getBotStatus",
              args: [bot, ca.creditAccount],
            } as const;
          });
        }),
      ],
      allowFailure: true,
      batchSize: 0,
    });

    const legacyStart = 0;
    const legacyEnd = accountsToCheck.length;
    const legacy: BotResponseCompressor = allResp.slice(
      legacyStart,
      legacyEnd,
    ) as BotResponseCompressor;

    const migrationStart = legacyEnd;
    const migrationEnd = legacyMigrationBot
      ? migrationStart + accountsToCheck.length
      : migrationStart;
    const migrationResp: BotsDirectResponse = allResp.slice(
      migrationStart,
      migrationEnd,
    ) as BotsDirectResponse;

    const additionalStart = migrationEnd;
    const additionalResp: BotsDirectResponse = allResp.slice(
      additionalStart,
    ) as BotsDirectResponse;

    return {
      legacy,
      additionalBots: this.#getActiveBots(
        accountsToCheck,
        additionalBots,
        additionalResp,
      ),
      legacyMigration: this.#getActiveMigrationBots(
        accountsToCheck,
        legacyMigrationBot,
        migrationResp,
      ),
    };
  }

  #getActiveBots(
    accountsToCheck: Array<AccountToCheck>,
    bots: Array<Address>,
    result: BotsDirectResponse,
  ) {
    if (result.length !== bots.length * accountsToCheck.length) {
      console.error(
        "result length mismatch",
        result.length,
        bots.length * accountsToCheck.length,
      );
    }

    const botsByCAIndex = accountsToCheck.reduce<
      Array<Omit<NonNullable<GetConnectedMigrationBotsResult>, "botAddress">>
    >((acc, _, index) => {
      const r = result.slice(index * bots.length, (index + 1) * bots.length);

      acc.push({
        result: r,
      });

      return acc;
    }, []);

    return botsByCAIndex;
  }

  #getActiveMigrationBots(
    accountsToCheck: Array<{ creditAccount: Address; creditManager: Address }>,
    bot: Address | undefined,
    result: BotsDirectResponse,
  ) {
    if (bot) {
      if (result.length !== accountsToCheck.length) {
        console.error(
          "result length mismatch for migration bots",
          result.length,
          accountsToCheck.length,
        );
      }

      return { result, botAddress: bot };
    }

    return undefined;
  }

  /**
   * {@inheritDoc ICreditAccountsService.fullyLiquidate}
   **/
  public async fullyLiquidate(
    props: FullyLiquidateProps,
  ): Promise<FullyLiquidateResult> {
    const {
      account,
      to,
      slippage = 50n,
      keepAssets,
      ignoreReservePrices,
      applyLossPolicy,
      debtOnly,
    } = props;
    const cm = this.sdk.marketRegister.findCreditManager(account.creditManager);
    const routerCloseResult = await this.sdk
      .routerFor(account)
      .findBestClosePath({
        creditAccount: account,
        creditManager: cm.creditManager,
        slippage,
        keepAssets,
        debtOnly,
      });
    const calls = await this.#prependPriceUpdates(
      account.creditManager,
      routerCloseResult.calls,
      account,
      { ignoreReservePrices },
    );

    let lossPolicyData: Hex | undefined;
    if (applyLossPolicy) {
      const market = this.sdk.marketRegister.findByCreditManager(
        account.creditManager,
      );
      lossPolicyData = await market.lossPolicy.getLiquidationData(
        account.creditAccount,
      );
      this.logger?.debug({ lossPolicyData }, "loss policy data");
    }

    const tx = cm.creditFacade.liquidateCreditAccount(
      account.creditAccount,
      to,
      calls,
      lossPolicyData,
    );
    return {
      tx,
      calls,
      routerCloseResult,
      lossPolicyData,
      creditFacade: cm.creditFacade,
    };
  }

  /**
   * {@inheritDoc ICreditAccountsService.partiallyLiquidate}
   */
  public async partiallyLiquidate(
    props: PartiallyLiquidateProps,
  ): Promise<RawTx> {
    const { account, to } = props;
    const cm = this.sdk.marketRegister.findCreditManager(account.creditManager);
    const { tokenOut, repaidAmount, minSeizedAmount } =
      cm.partialLiquidationParams(account, props);

    const updates = await this.getOnDemandPriceUpdates(account, true);
    return cm.creditFacade.partiallyLiquidateCreditAccount(
      account.creditAccount,
      tokenOut,
      repaidAmount,
      minSeizedAmount,
      to,
      updates,
    );
  }

  /**
   * {@inheritDoc ICreditAccountsService.assembleCloseCreditAccountCalls}
   */
  public async assembleCloseCreditAccountCalls({
    creditAccount: ca,
    routerCalls,
    assetsToWithdraw,
    to,
  }: AssembleCloseCreditAccountCallsProps): Promise<Array<MultiCall>> {
    // RWA: after debt repay, redeem leftover vault shares so withdraw can take rwa.asset
    const unwrapCalls =
      (await this.assembleRedeemDiffCalls(1n, ca.creditManager)) ?? [];
    const { creditFacade } = this.sdk.marketRegister.findCreditManager(
      ca.creditManager,
    );

    return [
      ...routerCalls,
      ...creditFacade.prepareDisableQuotas([...ca.tokens]),
      ...(ca.debt > 0n ? [creditFacade.prepareDecreaseDebtFull()] : []),
      ...unwrapCalls,
      ...assetsToWithdraw.map(t =>
        creditFacade.prepareWithdrawCollateral(t, MAX_UINT256, to),
      ),
    ];
  }

  /**
   * {@inheritDoc ICreditAccountsService.previewDelayedWithdrawal}
   **/
  public async previewDelayedWithdrawal({
    creditAccount,
    amount,
    token,
    withdrawalPhantomToken,
    intent,
  }: PreviewDelayedWithdrawalProps): Promise<RequestableWithdrawal> {
    return this.#withdrawalCompressor.getWithdrawalRequestResult({
      creditAccount,
      token,
      amount,
      withdrawalPhantomToken,
      intent,
    });
  }

  /**
   * {@inheritDoc ICreditAccountsService.getPendingWithdrawals}
   **/
  public async getPendingWithdrawals({
    creditAccount,
  }: GetPendingWithdrawalsProps): Promise<GetPendingWithdrawalsResult> {
    // TODO: return multiple configs
    const { claimable, pending } =
      await this.#withdrawalCompressor.getCurrentWithdrawals(creditAccount);

    return {
      claimableNow: claimable,
      pending,
    };
  }

  /**
   * {@inheritDoc ICreditAccountsService.assembleStartDelayedWithdrawalCalls}
   **/
  public assembleStartDelayedWithdrawalCalls({
    creditFacade,
    preview,
  }: AssembleStartDelayedWithdrawalCallsProps): Array<MultiCall> {
    const record = preview.outputs.reduce<Record<Address, bigint>>((acc, o) => {
      const token = o.token.toLowerCase() as Address;
      acc[token] = (acc[token] || 0n) + o.amount;
      return acc;
    }, {});
    const balances = Object.entries(record).filter(([, a]) => a > 10n);

    const deltas: Array<BalanceDelta> = balances.map(([token, amount]) => ({
      token: token as Address,
      amount: amount > 10n ? amount - 10n : 0n,
    }));
    // The negative delta of the spent source token makes the input-side
    // balance decrease previewable from the multicall calldata alone; without
    // it, adapter previewBalanceChanges handlers would need RPC calls to
    // recover the spent token/amount, since the calldata does not carry
    // sufficient info.
    if (preview.amountIn > 0n) {
      deltas.push({ token: preview.token, amount: -preview.amountIn });
    }

    const facade = this.sdk.marketRegister.findCreditFacade(creditFacade);

    return [
      facade.prepareStoreExpectedBalances(deltas),
      ...preview.requestCalls,
      facade.prepareCompareBalances(),
    ];
  }

  /**
   * {@inheritDoc ICreditAccountsService.assembleClaimDelayedCalls}
   **/
  public assembleClaimDelayedCalls({
    creditFacade,
    claimableNow,
  }: AssembleClaimDelayedCallsProps): Array<MultiCall> {
    const record = claimableNow.outputs.reduce<Record<Address, bigint>>(
      (acc, o) => {
        const token = o.token.toLowerCase() as Address;
        acc[token] = (acc[token] || 0n) + o.amount;
        return acc;
      },
      {},
    );
    const balances = Object.entries(record).filter(([, a]) => a > 10n);

    const deltas: Array<BalanceDelta> = balances.map(([token, amount]) => ({
      token: token as Address,
      amount: amount > 10n ? amount - 10n : 0n,
    }));
    // The negative delta of the burned withdrawal phantom token makes the
    // input-side balance decrease previewable from the multicall calldata
    // alone; without it, adapter previewBalanceChanges handlers would need
    // RPC calls to recover the burned amount
    if (claimableNow.withdrawalTokenSpent > 0n) {
      deltas.push({
        token: claimableNow.withdrawalPhantomToken,
        amount: -claimableNow.withdrawalTokenSpent,
      });
    }

    const facade = this.sdk.marketRegister.findCreditFacade(creditFacade);

    return [
      facade.prepareStoreExpectedBalances(deltas),
      ...claimableNow.claimCalls,
      facade.prepareCompareBalances(),
    ];
  }

  /**
   * {@inheritDoc ICreditAccountsService.getApprovalAddress}
   **/
  public async getApprovalAddress(
    options: GetApprovalAddressProps,
  ): Promise<Address> {
    const { creditManager } = options;
    const suite = this.sdk.marketRegister.findCreditManager(creditManager);
    const marketSuite = this.sdk.marketRegister.findByPool(suite.pool);
    const factory = marketSuite.rwaFactory;

    if (factory) {
      return factory.getApprovalAddress(options);
    }
    return suite.creditManager.address;
  }

  /**
   * {@inheritDoc ICreditAccountsService.getOpenAccountRequirements}
   */
  public async getOpenAccountRequirements(
    borrower: Address,
    creditManager: Address,
    props: GetOpenAccountRequirementsProps,
  ): Promise<RWAOpenAccountRequirements | undefined> {
    const { rwaFactory } =
      this.sdk.marketRegister.findByCreditManager(creditManager);
    if (!rwaFactory) {
      return undefined;
    }
    return rwaFactory.getOpenAccountRequirements(borrower, props);
  }

  /**
   * {@inheritDoc ICreditAccountsService.openCA}
   **/
  public async openCA(props: OpenCAProps): Promise<RawTx> {
    const {
      ethAmount,
      creditManager,
      reopenCreditAccount,
      collateral,
      permits,
      debt,
      withdrawToken,
      referralCode,
      to,
      calls: openPathCalls,
      callsAfter,

      minQuota,
      averageQuota,

      rwaOptions,
    } = props;
    const cmSuite = this.sdk.marketRegister.findCreditManager(creditManager);
    const cm = cmSuite.creditManager;
    let tokenToWithdraw: Address | undefined;
    if (withdrawToken === true) {
      tokenToWithdraw = cm.underlying;
    } else if (typeof withdrawToken === "string") {
      tokenToWithdraw = withdrawToken;
    }

    const { creditFacade } = cmSuite;
    const operationCalls = [
      creditFacade.prepareIncreaseDebt(debt),
      ...creditFacade.prepareAddCollateral(collateral, permits),
      ...openPathCalls, // path from underlying to withdrawal token
      ...(tokenToWithdraw
        ? [
            creditFacade.prepareWithdrawCollateral(
              tokenToWithdraw,
              MAX_UINT256,
              to,
            ),
          ]
        : []),
      ...creditFacade.prepareUpdateQuotas({
        minQuota,
        averageQuota,
      }),
      ...(callsAfter ?? []),
    ];

    const calls = await this.#prependPriceUpdates(cm.address, operationCalls);
    let tx: RawTx;
    if (reopenCreditAccount) {
      tx = await this.#multicallTx(cmSuite, reopenCreditAccount, calls);
    } else {
      tx = await this.#openCreditAccountTx(
        cmSuite,
        to,
        calls,
        referralCode,
        rwaOptions,
      );
    }
    tx.value = ethAmount.toString(10);

    return tx;
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
    // this.#logger?.debug(
    //   { args: stringifyGetCreditAccountsArgs(args) },
    //   "getting credit accounts",
    // );
    let resp: [CreditAccountData[], bigint];
    if (priceUpdateTxs?.length) {
      [resp] = await simulateWithPriceUpdates(this.client, {
        priceUpdates: priceUpdateTxs,
        contracts: [
          {
            abi: creditAccountCompressorAbi,
            address: this.compressor,
            functionName: "getCreditAccounts",
            args,
          },
        ],
        blockNumber,
        gas: this.sdk.gasLimit,
      });
    } else {
      resp = await this.client.readContract<
        CompressorAbi,
        "getCreditAccounts",
        GetCreditAccountsArgs
      >({
        abi: creditAccountCompressorAbi,
        address: this.compressor,
        functionName: "getCreditAccounts",
        args,
        blockNumber,
        // @ts-expect-error
        gas: this.sdk.gasLimit,
      });
    }

    this.logger?.debug(
      {
        accounts: resp[0]?.length ?? 0,
        nextOffset: Number(resp[1]),
      },
      "got credit accounts",
    );

    return resp;
  }

  /**
   * Encodes one ERC-4626 adapter call for an RWA market's underlying vault.
   *
   * @param functionName - Adapter function to call
   * @param amount - Amount passed to the adapter, in the units the function expects
   * @param creditManager - Credit manager address
   * @returns Array of MultiCall to pass to credit facade multicall, or undefined
   * if the underlying is not RWA-gated or no adapter is configured for it
   */
  #rwaVaultCalls(
    functionName: "deposit" | "redeem" | "depositDiff" | "redeemDiff",
    amount: bigint,
    creditManager: Address,
  ): Array<MultiCall> | undefined {
    const suite = this.sdk.marketRegister.findCreditManager(creditManager);
    const meta = this.sdk.tokensMeta.mustGet(suite.underlying);
    if (!this.sdk.tokensMeta.isRWAUnderlying(meta)) {
      return undefined;
    }

    const target = suite.creditManager.adapters.get(meta.addr)?.address;
    if (!target) {
      return undefined;
    }

    let callData: Hex;
    switch (functionName) {
      case "deposit":
        callData = encodeFunctionData({
          abi: ierc4626AdapterAbi,
          functionName,
          // receiver is ignored by the adapter
          args: [amount, ADDRESS_0X0],
        });
        break;
      case "redeem":
        callData = encodeFunctionData({
          abi: ierc4626AdapterAbi,
          functionName,
          // receiver and owner are ignored by the adapter
          args: [amount, ADDRESS_0X0, ADDRESS_0X0],
        });
        break;
      default:
        callData = encodeFunctionData({
          abi: ierc4626AdapterAbi,
          functionName,
          args: [amount],
        });
    }

    return [{ target, callData }];
  }

  /**
   * {@inheritDoc ICreditAccountsService.assembleRWAUnwrapCalls}
   */
  public async assembleRWAUnwrapCalls(
    amount: bigint,
    creditManager: Address,
  ): Promise<Array<MultiCall> | undefined> {
    return this.#rwaVaultCalls("redeem", amount, creditManager);
  }

  /**
   * {@inheritDoc ICreditAccountsService.assembleRWAWrapCalls}
   */
  public async assembleRWAWrapCalls(
    amount: bigint,
    creditManager: Address,
  ): Promise<Array<MultiCall> | undefined> {
    return this.#rwaVaultCalls("deposit", amount, creditManager);
  }

  /**
   * {@inheritDoc ICreditAccountsService.assembleRedeemDiffCalls}
   */
  public async assembleRedeemDiffCalls(
    amount: bigint,
    creditManager: Address,
  ): Promise<Array<MultiCall> | undefined> {
    return this.#rwaVaultCalls("redeemDiff", amount, creditManager);
  }

  /**
   * {@inheritDoc ICreditAccountsService.assembleDepositDiffCalls}
   */
  public async assembleDepositDiffCalls(
    amount: bigint,
    creditManager: Address,
  ): Promise<Array<MultiCall> | undefined> {
    return this.#rwaVaultCalls("depositDiff", amount, creditManager);
  }

  /**
   * {@inheritDoc ICreditAccountsService.setBot}
   */
  public async setBot({
    botAddress,
    permissions: defaultPermissions,

    targetContract,
  }: SetBotProps): Promise<
    CreditAccountOperationResult | CreditManagerOperationResult
  > {
    const cm = this.sdk.marketRegister.findCreditManager(
      targetContract.creditManager,
    );

    const permissions =
      defaultPermissions !== null
        ? defaultPermissions
        : await getContract({
            address: botAddress,
            client: this.sdk.client,
            abi: [
              {
                type: "function",
                name: "requiredPermissions",
                inputs: [],
                outputs: [
                  { name: "", type: "uint192", internalType: "uint192" },
                ],
                stateMutability: "view",
              },
            ],
          }).read.requiredPermissions();
    const addBotCall = cm.creditFacade.prepareSetBotPermissions(
      botAddress,
      permissions,
    );

    const calls =
      targetContract.type === "creditAccount"
        ? await this.#prependPriceUpdates(
            targetContract.creditManager,
            [addBotCall],
            targetContract,
          )
        : [addBotCall];

    const tx =
      targetContract.type === "creditAccount"
        ? await this.#multicallTx(cm, targetContract.creditAccount, calls)
        : undefined;

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * {@inheritDoc ICreditAccountsService.assembleRepayCreditAccountCalls}
   */
  public async assembleRepayCreditAccountCalls({
    collateralAssets,
    assetsToWithdraw,
    creditAccount: ca,
    permits,
    to,
    tokensToClaim,
    calls: wrapCalls = [],
  }: AssembleRepayCreditAccountCallsProps): Promise<Array<MultiCall>> {
    const addCollateral = collateralAssets.filter(a => a.balance > 0);

    const router = this.sdk.routerFor(ca);

    const unwrapCalls =
      (await this.assembleRedeemDiffCalls(1n, ca.creditManager)) ?? [];

    const claimPath = await router.findClaimAllRewards({
      tokensToClaim,
      creditAccount: ca,
    });

    const { creditFacade } = this.sdk.marketRegister.findCreditManager(
      ca.creditManager,
    );

    const operationCalls: Array<MultiCall> = [
      ...creditFacade.prepareAddCollateral(addCollateral, permits),
      ...wrapCalls,
      ...creditFacade.prepareDisableQuotas([...ca.tokens]),
      ...(ca.debt > 0n ? [creditFacade.prepareDecreaseDebtFull()] : []),
      ...unwrapCalls,
      ...claimPath.calls,
      ...assetsToWithdraw.map(t =>
        creditFacade.prepareWithdrawCollateral(t.token, MAX_UINT256, to),
      ),
    ];

    return operationCalls;
  }

  /**
   * {@inheritDoc ICreditAccountsService.claimFarmRewards}
   */
  public async claimFarmRewards({
    calls: externalCalls,
    creditAccount: ca,

    minQuota,
    averageQuota,
    tokensToClaim,
  }: ClaimFarmRewardsProps): Promise<RawTx> {
    const cm = this.sdk.marketRegister.findCreditManager(ca.creditManager);

    const router = this.sdk.routerFor(ca);
    let claimPath: RouterRewardsResult;
    if (externalCalls) {
      claimPath = { calls: externalCalls };
    } else {
      claimPath = await router.findClaimAllRewards({
        tokensToClaim,
        creditAccount: ca,
      });
    }
    if (claimPath.calls.length === 0) throw new Error("No path to execute");

    const operationCalls = [
      ...claimPath.calls,
      ...cm.creditFacade.prepareUpdateQuotas({ minQuota, averageQuota }),
    ];

    const calls = await this.#prependPriceUpdates(
      ca.creditManager,
      operationCalls,
      ca,
    );
    const tx = await this.#multicallTx(cm, ca.creditAccount, calls);

    return tx;
  }

  /**
   * Returns raw txs that are needed to update all price feeds so that all credit accounts (possibly from different markets) compute
   * {@inheritDoc ICreditAccountsService.getOnDemandPriceUpdates}
   **/
  public async getOnDemandPriceUpdates(
    account: CreditAccountTokensSlice,
    ignoreReservePrices?: boolean,
  ): Promise<PriceUpdate[]> {
    const { creditManager, creditAccount } = account;
    const cm = this.sdk.marketRegister.findCreditManager(creditManager);
    const update = await this.#getUpdateForAccount(
      account,
      ignoreReservePrices,
    );
    this.logger?.debug(
      { account: creditAccount, manager: cm.name },
      `getting on demand price updates from ${update.txs.length} txs`,
    );
    return getRawPriceUpdates(update);
  }
  /**
   * Analyzes a multicall array and prepends necessary on-demand price feed updates.
   *
   * Deduplicates existing `onDemandPriceUpdates` calls
   *
   * @param creditManager - Address of the credit manager
   * @param calls - The multicall array to prepend price updates to
   * @param ca - Credit account slice, undefined when opening a new account
   * @param options - Optional settings for price update generation
   * @returns A new array with a single consolidated price update call prepended,
   *          followed by the non-price-update calls in their original order
   */
  async #prependPriceUpdates(
    creditManager: Address,
    calls: MultiCall[],
    ca?: RouterCASlice,
    options?: { ignoreReservePrices?: boolean },
  ): Promise<MultiCall[]> {
    const market = this.sdk.marketRegister.findByCreditManager(creditManager);
    const suite = this.sdk.marketRegister.findCreditManager(creditManager);
    const cm = suite.creditManager;

    const { priceUpdates: existingUpdates, remainingCalls } =
      extractPriceUpdates(calls);
    // Token to update
    const tokens = new AddressSet([
      cm.underlying, // underlying - always included
      ...extractQuotaTokens(calls), // tokens from `updateQuota` calls
    ]);

    // enabled tokens with non-zero balance
    if (ca) {
      for (const t of ca.tokens) {
        const isEnabled = (t.mask & ca.enabledTokensMask) !== 0n;
        if (t.balance > 10n && isEnabled) {
          tokens.add(t.token);
        }
      }
    }

    const ignoreReservePrices = options?.ignoreReservePrices;
    const priceFeeds: IPriceFeedContract[] =
      market.priceOracle.priceFeedsForTokens(Array.from(tokens), {
        main: true,
        reserve: !ignoreReservePrices,
      });

    const tStr = tokens.map(t => this.labelAddress(t)).join(", ");
    const remark = ignoreReservePrices ? " main" : "";
    this.logger?.debug(
      { account: ca?.creditAccount, manager: cm.name },
      `prependPriceUpdates for ${tStr} from ${priceFeeds.length}${remark} price feeds`,
    );

    const generatedUpdates =
      await this.sdk.priceFeeds.generatePriceFeedsUpdates(priceFeeds);

    const merged = mergePriceUpdates(existingUpdates, generatedUpdates);
    if (merged.length === 0) {
      return remainingCalls;
    }

    return [
      suite.creditFacade.prepareOnDemandPriceUpdates(merged),
      ...remainingCalls,
    ];
  }

  async #getUpdateForAccount(
    account: CreditAccountTokensSlice,
    ignoreReservePrices?: boolean,
  ): Promise<UpdatePriceFeedsResult> {
    const { creditManager, creditAccount, enabledTokensMask } = account;
    const market = this.sdk.marketRegister.findByCreditManager(creditManager);
    const cm =
      this.sdk.marketRegister.findCreditManager(creditManager).creditManager;

    // underlying - always included
    const tokens = new AddressSet([cm.underlying]);

    // enabled tokens with non-zero balance
    for (const t of account.tokens) {
      const isEnabled = (t.mask & enabledTokensMask) !== 0n;
      if (t.balance > 10n && isEnabled) {
        tokens.add(t.token);
      }
    }

    const priceFeeds: Array<IPriceFeedContract> =
      market.priceOracle.priceFeedsForTokens(Array.from(tokens), {
        main: true,
        reserve: !ignoreReservePrices,
      });
    const tStr = tokens.map(t => this.labelAddress(t)).join(", ");
    const remark = ignoreReservePrices ? " main" : "";
    this.logger?.debug(
      { account: creditAccount, manager: cm.name },
      `generating price feed updates for ${tStr} from ${priceFeeds.length}${remark} price feeds`,
    );
    return this.sdk.priceFeeds.generatePriceFeedsUpdateTxs(priceFeeds);
  }

  /**
   * {@inheritDoc ICreditAccountsService.prependPriceUpdates}
   */
  public async prependPriceUpdates(
    creditManager: Address,
    calls: MultiCall[],
    creditAccount?: RouterCASlice,
    options?: { ignoreReservePrices?: boolean },
  ): Promise<MultiCall[]> {
    return this.#prependPriceUpdates(
      creditManager,
      calls,
      creditAccount,
      options,
    );
  }

  /**
   * {@inheritDoc ICreditAccountsService.assembleCaOperations}
   */
  public assembleCaOperations({
    operations,
    creditFacade,
  }: AssembleCaOperationsProps): MultiCall[] {
    const facade = this.sdk.marketRegister.findCreditFacade(creditFacade);
    const calls: MultiCall[] = [];

    for (const op of operations) {
      switch (op.type) {
        case "increaseDebt":
          calls.push(facade.prepareIncreaseDebt(op.amount));
          break;

        case "decreaseDebt":
          calls.push(facade.prepareChangeDebt(op.amount, true));
          break;

        case "addCollateral":
          calls.push(
            ...facade.prepareAddCollateral(
              [{ token: op.token, balance: op.amount }],
              {},
            ),
          );
          break;

        case "withdrawCollateral":
          calls.push(
            facade.prepareWithdrawCollateral(op.token, op.amount, op.to),
          );
          break;

        case "swap":
        case "wrapRwaCollateral":
        case "unwrapRwaCollateral":
          calls.push(...op.calls);
          break;

        case "changeQuota": {
          const quotaAssets = [...op.quotaIncrease, ...op.quotaDecrease];
          if (quotaAssets.length === 0) {
            break;
          }
          calls.push(
            ...facade.prepareUpdateQuotas({
              averageQuota: quotaAssets,
              minQuota: quotaAssets,
            }),
          );
          break;
        }

        default: {
          const _exhaustive: never = op;
          throw new Error(
            `assembleCaOperations: unsupported operation ${JSON.stringify(_exhaustive)}`,
          );
        }
      }
    }

    return calls;
  }

  /**
   * {@inheritDoc ICreditAccountsService.executeCaUpdate}
   */
  public async executeCaUpdate(
    creditAccount: RouterCASlice,
    calls: MultiCall[],
    options?: { ignoreReservePrices?: boolean; ethAmount?: bigint },
  ): Promise<RawTx> {
    const cm = this.sdk.marketRegister.findCreditManager(
      creditAccount.creditManager,
    );
    const callsWithPrices = await this.#prependPriceUpdates(
      creditAccount.creditManager,
      calls,
      creditAccount,
      { ignoreReservePrices: options?.ignoreReservePrices },
    );
    const tx = await this.#multicallTx(
      cm,
      creditAccount.creditAccount,
      callsWithPrices,
    );

    if (options?.ethAmount && options.ethAmount > 0n) {
      tx.value = options.ethAmount.toString(10);
    }

    return tx;
  }

  /**
   * {@inheritDoc ICreditAccountsService.prepareUpdateQuotas}
   */
  public prepareUpdateQuotas(
    creditFacade: Address,
    props: PrepareUpdateQuotasProps,
  ): Array<MultiCall> {
    return this.sdk.marketRegister
      .findCreditFacade(creditFacade)
      .prepareUpdateQuotas(props);
  }

  /**
   * {@inheritDoc ICreditAccountsService.prepareWithdrawToken}
   */
  public prepareWithdrawToken(
    creditFacade: Address,
    token: Address,
    amount: bigint,
    to: Address,
  ): MultiCall {
    return this.sdk.marketRegister
      .findCreditFacade(creditFacade)
      .prepareWithdrawCollateral(token, amount, to);
  }

  /**
   * {@inheritDoc ICreditAccountsService.prepareIncreaseDebt}
   */
  public prepareIncreaseDebt(creditFacade: Address, debt: bigint): MultiCall {
    return this.sdk.marketRegister
      .findCreditFacade(creditFacade)
      .prepareIncreaseDebt(debt);
  }

  /**
   * {@inheritDoc ICreditAccountsService.prepareChangeDebt}
   */
  public prepareChangeDebt(
    creditFacade: Address,
    change: bigint,
    isDecrease: boolean,
  ): MultiCall {
    return this.sdk.marketRegister
      .findCreditFacade(creditFacade)
      .prepareChangeDebt(change, isDecrease);
  }

  /**
   * {@inheritDoc ICreditAccountsService.prepareAddCollateral}
   */
  public prepareAddCollateral(
    creditFacade: Address,
    assets: Array<Asset>,
    permits: Record<string, PermitResult>,
  ): Array<MultiCall> {
    return this.sdk.marketRegister
      .findCreditFacade(creditFacade)
      .prepareAddCollateral(assets, permits);
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

  private get compressor(): Address {
    if (!this.#compressor) {
      [this.#compressor] = this.sdk.addressProvider.mustGetLatest(
        AP_CREDIT_ACCOUNT_COMPRESSOR,
        VERSION_RANGE_310,
      );
      this.logger?.debug(
        `credit account compressor address: ${this.#compressor}`,
      );
    }
    return this.#compressor;
  }

  /**
   * Wrapper that selects between credit facade and RWA factory
   * @param suite
   * @param to
   * @param calls
   * @param referralCode
   * @param rwaOptions
   * @returns
   */
  async #openCreditAccountTx(
    suite: CreditSuite,
    to: Address,
    calls: MultiCall[],
    referralCode?: bigint,
    rwaOptions?: RWAOperationArgs,
  ): Promise<RawTx> {
    const marketSuite = this.sdk.marketRegister.findByPool(suite.pool);
    const factory = marketSuite.rwaFactory;

    if (factory) {
      return factory.openCreditAccount(
        suite.creditManager.address,
        calls,
        rwaOptions,
      );
    }

    return suite.creditFacade.openCreditAccount(to, calls, referralCode ?? 0n);
  }

  /**
   * Wrapper that selects between credit facade and RWA factory
   * @param suite
   * @param creditAccount
   * @param calls
   * @param rwaOptions
   * @returns
   */
  async #multicallTx(
    suite: CreditSuite,
    creditAccount: Address,
    calls: MultiCall[],
    rwaOptions?: RWAOperationArgs,
  ): Promise<RawTx> {
    const marketSuite = this.sdk.marketRegister.findByCreditManager(
      suite.creditManager.address,
    );
    const factory = marketSuite.rwaFactory;

    if (factory) {
      return factory.multicall(creditAccount, calls, rwaOptions);
    }

    return suite.creditFacade.multicall(creditAccount, calls);
  }

  /**
   * Withdrawal compressor of the current chain.
   * @throws If no withdrawal compressor is supported on the current chain.
   **/
  get #withdrawalCompressor(): IWithdrawalCompressorContract {
    const compressor = this.sdk.withdrawalCompressor;
    if (!compressor) {
      throw new Error(`no withdrawal compressor on ${this.sdk.networkType}`);
    }
    return compressor;
  }
}
