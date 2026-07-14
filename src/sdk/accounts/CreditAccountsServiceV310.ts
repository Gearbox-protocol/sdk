import type { Address, Hex } from "viem";
import { encodeFunctionData, getContract } from "viem";
import {
  iBotListV310Abi,
  iCreditFacadeMulticallV310Abi,
} from "../../abi/310/generated.js";
import { creditAccountCompressorAbi } from "../../abi/compressors/creditAccountCompressor.js";
import { peripheryCompressorAbi } from "../../abi/compressors/peripheryCompressor.js";
import { rewardsCompressorAbi } from "../../abi/compressors/rewardsCompressor.js";
import { iBaseRewardPoolAbi } from "../../abi/iBaseRewardPool.js";
import { ierc4626AdapterAbi } from "../../abi/ierc4626Adapter.js";
import { iRWAFactoryAbi } from "../../abi/rwa/iRWAFactory.js";
import type { Asset, CreditAccountData } from "../base/index.js";
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
import type { CreditSuite, RWAOperationArgs } from "../market/index.js";
import {
  getRawPriceUpdates,
  type IPriceFeedContract,
  type PriceUpdate,
  type UpdatePriceFeedsResult,
} from "../market/index.js";
import type { RWAOpenAccountRequirements } from "../market/rwa/index.js";
import type { OnchainSDK } from "../OnchainSDK.js";
import type { RouterCASlice } from "../router/index.js";
import type { RouterRewardsResult } from "../router/types.js";
import type { IPriceUpdateTx, MultiCall, RawTx } from "../types/index.js";
import { AddressMap, AddressSet, AssetsMap, hexEq } from "../utils/index.js";
import { simulateWithPriceUpdates } from "../utils/viem/index.js";
import {
  extractPriceUpdates,
  extractQuotaTokens,
  mergePriceUpdates,
} from "./multicall-utils.js";
import type {
  AccountToCheck,
  AddCollateralProps,
  AssembleCaOperationsProps,
  AssembleClaimDelayedCallsProps,
  AssembleCloseCreditAccountCallsProps,
  AssembleRepayCreditAccountCallsProps,
  AssembleStartDelayedWithdrawalCallsProps,
  ChangeDeptProps,
  ClaimDelayedProps,
  ClaimFarmRewardsProps,
  CloseCreditAccountProps,
  CloseCreditAccountResult,
  CloseOptions,
  CreditAccountFilter,
  CreditAccountOperationResult,
  CreditAccountTokensSlice,
  CreditManagerFilter,
  CreditManagerOperationResult,
  DefaultPartialLiquidationParams,
  ExecuteSwapProps,
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
  OpenCAProps,
  PartiallyLiquidateProps,
  PermitResult,
  PrepareUpdateQuotasProps,
  PreviewDelayedWithdrawalProps,
  RepayAndLiquidateCreditAccountProps,
  RepayCreditAccountProps,
  Rewards,
  SetBotProps,
  StartDelayedWithdrawalProps,
  UpdateQuotasProps,
  WithdrawCollateralProps,
} from "./types.js";
import type { RequestableWithdrawal } from "./withdrawal-compressor/index.js";

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
   * {@inheritDoc ICreditAccountsService.defaultPartialLiquidationParams}
   */
  public defaultPartialLiquidationParams(
    ca: CreditAccountData,
  ): DefaultPartialLiquidationParams {
    const tokenOut = this.#getBestTokenOut(ca);
    const optimalHF = this.getOptimalHFForPartialLiquidation(ca);
    const repaidAmount = this.#calcOptimalRepaidAmount(ca, tokenOut, optimalHF);
    const minSeizedAmount = this.#calcMinSeizedAmount(
      ca,
      tokenOut,
      repaidAmount,
    );
    return { tokenOut, optimalHF, repaidAmount, minSeizedAmount };
  }

  /**
   * {@inheritDoc ICreditAccountsService.partiallyLiquidate}
   */
  public async partiallyLiquidate(
    props: PartiallyLiquidateProps,
  ): Promise<RawTx> {
    const { account, to } = props;
    const tokenOut = props.tokenOut ?? this.#getBestTokenOut(account);
    const optimalHF =
      props.optimalHF ?? this.getOptimalHFForPartialLiquidation(account);
    const repaidAmount =
      props.repaidAmount ??
      this.#calcOptimalRepaidAmount(account, tokenOut, optimalHF);
    const minSeizedAmount =
      props.minSeizedAmount ??
      this.#calcMinSeizedAmount(account, tokenOut, repaidAmount);

    const cm = this.sdk.marketRegister.findCreditManager(account.creditManager);
    const updates = await this.getOnDemandPriceUpdates(account, true);
    const tx = cm.creditFacade.partiallyLiquidateCreditAccount(
      account.creditAccount,
      tokenOut,
      repaidAmount,
      minSeizedAmount,
      to,
      updates,
    );
    return tx;
  }

  /**
   * Picks the most valuable enabled non-underlying collateral token on the
   * credit account (by oracle value in underlying).
   *
   * Ported from solidity:
   * https://github.com/Gearbox-protocol/router-v3/blob/main/contracts/liquidation/AbstractLiquidator.sol#L270
   */
  #getBestTokenOut(account: CreditAccountData): Address {
    const market = this.sdk.marketRegister.findByCreditManager(
      account.creditManager,
    );
    const underlying = market.underlying;

    let bestVal = 0n;
    let bestToken: Address | undefined;
    for (const t of account.tokens) {
      if (t.token === underlying) continue;
      if ((t.mask & account.enabledTokensMask) === 0n) continue;
      if (t.balance === 0n) continue;
      const val = market.priceOracle.convert(t.token, underlying, t.balance);
      if (val > bestVal) {
        bestVal = val;
        bestToken = t.token;
      }
    }

    if (!bestToken) {
      throw new Error(
        `cannot determine tokenOut for partial liquidation of ${this.sdk.labelAddress(account.creditAccount)}: no enabled non-underlying collateral with value`,
      );
    }
    return bestToken;
  }

  /**
   * Returns the minimum amount of `token` collateral that must be seized when
   * repaying `repaidAmount` of underlying. Mirrors the on-chain liquidation
   * discount math, expired-aware.
   */
  #calcMinSeizedAmount(
    account: CreditAccountData,
    token: Address,
    repaidAmount: bigint,
  ): bigint {
    const market = this.sdk.marketRegister.findByCreditManager(
      account.creditManager,
    );
    const suite = this.sdk.marketRegister.findCreditManager(
      account.creditManager,
    );
    const fee = suite.isExpired
      ? suite.creditManager.liquidationDiscountExpired
      : suite.creditManager.liquidationDiscount;

    const tokenAmount = market.priceOracle.convert(
      market.underlying,
      token,
      repaidAmount,
    );
    return (tokenAmount * 9990n) / BigInt(fee);
  }

  /**
   * Computes the optimal `repaidAmount` (in underlying) that brings the credit
   * account's health factor close to `optimalHF` after partial liquidation.
   *
   * Ported from solidity:
   * https://github.com/Gearbox-protocol/router-v3/blob/56e2d515ec6d9bb1e324e71c3708e59710779b24/contracts/liquidation/AbstractLiquidator.sol#L292
   */
  #calcOptimalRepaidAmount(
    account: CreditAccountData,
    token: Address,
    optimalHF: bigint,
  ): bigint {
    const suite = this.sdk.marketRegister.findCreditManager(
      account.creditManager,
    );
    const market = this.sdk.marketRegister.findByCreditManager(
      account.creditManager,
    );
    const cm = suite.creditManager;

    const feeLiquidation = suite.isExpired
      ? cm.feeLiquidationExpired
      : cm.feeLiquidation;
    const liquidationDiscount = suite.isExpired
      ? cm.liquidationDiscountExpired
      : cm.liquidationDiscount;
    const discount = BigInt(liquidationDiscount) - BigInt(feeLiquidation);

    const ltTokenOut = cm.liquidationThresholds.get(token);
    if (ltTokenOut === undefined) {
      throw new Error(
        `token ${this.sdk.labelAddress(token)} is not a collateral token in credit manager ${this.sdk.labelAddress(account.creditManager)}`,
      );
    }

    const totalDebt =
      account.debt + account.accruedInterest + account.accruedFees;
    const twvUnderlying = market.priceOracle.convertFromUSD(
      market.underlying,
      account.twvUSD,
    );

    const denominator =
      (discount * optimalHF) / PERCENTAGE_FACTOR - BigInt(ltTokenOut);
    if (denominator <= 0n) {
      throw new Error(
        "cannot compute optimal repaid amount: invalid liquidation parameters (discount * hfOptimal <= ltTokenOut)",
      );
    }
    const numerator = totalDebt * optimalHF - twvUnderlying * PERCENTAGE_FACTOR;
    if (numerator <= 0n) {
      // Account is already healthy enough; nothing to repay.
      return 0n;
    }
    const optimalValueSeized = numerator / denominator;

    let repaidAmount = (optimalValueSeized * discount) / PERCENTAGE_FACTOR;

    const minDebt = suite.creditFacade.minDebt;
    if (totalDebt < minDebt) {
      return 0n;
    }
    const surplusDebt = totalDebt - minDebt;
    if (repaidAmount > surplusDebt) {
      repaidAmount = (surplusDebt * 999n) / 1000n;
    }
    return repaidAmount;
  }

  /**
   * {@inheritDoc ICreditAccountsService.closeCreditAccount}
   **/
  public async closeCreditAccount({
    operation,
    assetsToWithdraw,
    creditAccount: ca,
    to,
    slippage = 50n,
    closePath,
  }: CloseCreditAccountProps): Promise<CloseCreditAccountResult> {
    const cm = this.sdk.marketRegister.findCreditManager(ca.creditManager);

    await this.sdk.tokensMeta.loadTokenData(cm.underlying);
    const underlying = this.sdk.tokensMeta.mustGet(cm.underlying);
    if (this.sdk.tokensMeta.isRWAUnderlying(underlying)) {
      throw new Error(
        "closeCreditAccount is not supported for RWA underlying credit accounts",
      );
    }

    const routerCloseResult =
      closePath ||
      (await this.sdk.routerFor(ca).findBestClosePath({
        creditAccount: ca,
        creditManager: cm.creditManager,
        slippage,
      }));

    const operationCalls = await this.assembleCloseCreditAccountCalls({
      creditAccount: ca,
      routerCalls: routerCloseResult.calls,
      assetsToWithdraw,
      to,
    });

    const calls =
      operation === "close"
        ? operationCalls
        : await this.#prependPriceUpdates(ca.creditManager, operationCalls, ca);
    const tx = await this.#closeCreditAccountTx(
      cm,
      ca.creditAccount,
      calls,
      operation,
    );

    return { tx, calls, routerCloseResult, creditFacade: cm.creditFacade };
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
    const cm = this.sdk.marketRegister.findCreditManager(ca.creditManager);

    await this.sdk.tokensMeta.loadTokenData(cm.underlying);
    const underlying = this.sdk.tokensMeta.mustGet(cm.underlying);
    if (this.sdk.tokensMeta.isRWAUnderlying(underlying)) {
      throw new Error(
        "closeCreditAccount is not supported for RWA underlying credit accounts",
      );
    }

    return [
      ...routerCalls,
      ...this.#prepareDisableQuotas(ca),
      ...this.#prepareDecreaseDebt(ca),
      ...assetsToWithdraw.map(t =>
        this.#prepareWithdrawToken(ca.creditFacade, t, MAX_UINT256, to),
      ),
    ];
  }

  /**
   * {@inheritDoc ICreditAccountsService.updateQuotas}
   **/
  public async updateQuotas({
    minQuota,
    averageQuota,
    creditAccount,
  }: UpdateQuotasProps): Promise<CreditAccountOperationResult> {
    const cm = this.sdk.marketRegister.findCreditManager(
      creditAccount.creditManager,
    );

    const operationCalls = this.#prepareUpdateQuotas(
      creditAccount.creditFacade,
      { minQuota, averageQuota },
    );

    const calls = await this.#prependPriceUpdates(
      creditAccount.creditManager,
      operationCalls,
      creditAccount,
    );

    const tx = await this.#multicallTx(cm, creditAccount.creditAccount, calls);

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * {@inheritDoc ICreditAccountsService.addCollateral}
   **/
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

    const operationCalls: Array<MultiCall> = [
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

    const calls = await this.#prependPriceUpdates(
      creditAccount.creditManager,
      operationCalls,
      creditAccount,
    );

    const tx = await this.#multicallTx(cm, creditAccount.creditAccount, calls);
    tx.value = ethAmount.toString(10);

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * {@inheritDoc ICreditAccountsService.changeDebt}
   **/
  public async changeDebt({
    creditAccount,
    amount,
    collateral,
  }: ChangeDeptProps): Promise<CreditAccountOperationResult> {
    if (amount === 0n) {
      throw new Error("debt increase or decrease must be non-zero");
    }
    const isDecrease = amount < 0n;
    const change = amount > 0n ? amount : -amount;

    const cm = this.sdk.marketRegister.findCreditManager(
      creditAccount.creditManager,
    );

    const addCollateralCalls =
      collateral && isDecrease
        ? this.#prepareAddCollateral(
            creditAccount.creditFacade,
            [
              {
                token: collateral[0].token,
                balance: collateral[0].balance,
              },
            ],
            {},
          )
        : [];
    const unwrapCalls =
      collateral && isDecrease
        ? (await this.getRWAUnwrapCalls(
            collateral[0].balance,
            creditAccount.creditManager,
          )) || []
        : [];

    if (
      addCollateralCalls.length > 0 &&
      unwrapCalls.length === 0 &&
      collateral &&
      collateral?.[0].token !== creditAccount.underlying
    ) {
      throw new Error(
        "Can't use collateral other than underlying for non RWA market",
      );
    }

    const operationCalls: Array<MultiCall> = [
      ...addCollateralCalls,
      ...unwrapCalls,
      this.#prepareChangeDebt(creditAccount.creditFacade, change, isDecrease),
    ];

    const calls = await this.#prependPriceUpdates(
      creditAccount.creditManager,
      operationCalls,
      creditAccount,
    );
    const tx = await this.#multicallTx(cm, creditAccount.creditAccount, calls);

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * {@inheritDoc ICreditAccountsService.executeSwap}
   **/
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

    const operationCalls: Array<MultiCall> = [
      ...swapCalls,
      ...this.#prepareUpdateQuotas(creditAccount.creditFacade, {
        minQuota,
        averageQuota,
      }),
    ];

    const calls = await this.#prependPriceUpdates(
      creditAccount.creditManager,
      operationCalls,
      creditAccount,
    );
    const tx = await this.#multicallTx(cm, creditAccount.creditAccount, calls);

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * {@inheritDoc ICreditAccountsService.previewDelayedWithdrawal}
   **/
  public async previewDelayedWithdrawal({
    creditAccount,
    amount,
    token,
    intent,
  }: PreviewDelayedWithdrawalProps): Promise<RequestableWithdrawal> {
    // TODO: return multiple configs
    return this.sdk.withdrawalCompressor.getWithdrawalRequestResult(
      creditAccount,
      token,
      amount,
      intent,
    );
  }

  /**
   * {@inheritDoc ICreditAccountsService.getPendingWithdrawals}
   **/
  public async getPendingWithdrawals({
    creditAccount,
  }: GetPendingWithdrawalsProps): Promise<GetPendingWithdrawalsResult> {
    // TODO: return multiple configs
    const { claimable, pending } =
      await this.sdk.withdrawalCompressor.getCurrentWithdrawals(creditAccount);

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

    const storeExpectedBalances: MultiCall = {
      target: creditFacade,
      callData: encodeFunctionData({
        abi: iCreditFacadeMulticallV310Abi,
        functionName: "storeExpectedBalances",
        args: [
          balances.map(([token, amount]) => ({
            token: token as Address,
            amount: amount > 10n ? amount - 10n : 0n,
          })),
        ],
      }),
    };
    const compareBalances: MultiCall = {
      target: creditFacade,
      callData: encodeFunctionData({
        abi: iCreditFacadeMulticallV310Abi,
        functionName: "compareBalances",
        args: [],
      }),
    };

    return [storeExpectedBalances, ...preview.requestCalls, compareBalances];
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

    const storeExpectedBalances: MultiCall = {
      target: creditFacade,
      callData: encodeFunctionData({
        abi: iCreditFacadeMulticallV310Abi,
        functionName: "storeExpectedBalances",
        args: [
          balances.map(([token, amount]) => ({
            token: token as Address,
            amount: amount > 10n ? amount - 10n : 0n,
          })),
        ],
      }),
    };
    const compareBalances: MultiCall = {
      target: creditFacade,
      callData: encodeFunctionData({
        abi: iCreditFacadeMulticallV310Abi,
        functionName: "compareBalances",
        args: [],
      }),
    };

    return [storeExpectedBalances, ...claimableNow.claimCalls, compareBalances];
  }

  /**
   * {@inheritDoc ICreditAccountsService.startDelayedWithdrawal}
   **/
  public async startDelayedWithdrawal({
    creditAccount,
    minQuota,
    averageQuota,

    preview,
  }: StartDelayedWithdrawalProps): Promise<CreditAccountOperationResult> {
    const cm = this.sdk.marketRegister.findCreditManager(
      creditAccount.creditManager,
    );

    const operationCalls: Array<MultiCall> = [
      ...this.assembleStartDelayedWithdrawalCalls({
        creditFacade: cm.creditFacade.address,
        preview,
      }),
      ...this.#prepareUpdateQuotas(cm.creditFacade.address, {
        minQuota,
        averageQuota,
      }),
    ];

    const calls = await this.#prependPriceUpdates(
      creditAccount.creditManager,
      operationCalls,
      creditAccount,
    );
    const tx = await this.#multicallTx(cm, creditAccount.creditAccount, calls);

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * {@inheritDoc ICreditAccountsService.claimDelayed}
   **/
  public async claimDelayed({
    creditAccount,
    minQuota,
    averageQuota,

    claimableNow,
  }: ClaimDelayedProps): Promise<CreditAccountOperationResult> {
    const zeroDebt = creditAccount.debt === 0n;

    const cm = this.sdk.marketRegister.findCreditManager(
      creditAccount.creditManager,
    );

    const quotaCalls = zeroDebt
      ? []
      : this.#prepareUpdateQuotas(cm.creditFacade.address, {
          minQuota,
          averageQuota,
        });

    const operationCalls: Array<MultiCall> = [
      ...this.assembleClaimDelayedCalls({
        creditFacade: cm.creditFacade.address,
        claimableNow,
      }),
      ...quotaCalls,
    ];

    const calls = zeroDebt
      ? operationCalls
      : await this.#prependPriceUpdates(
          creditAccount.creditManager,
          operationCalls,
          creditAccount,
        );

    const tx = await this.#multicallTx(cm, creditAccount.creditAccount, calls);

    return { tx, calls, creditFacade: cm.creditFacade };
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
  public async openCA(
    props: OpenCAProps,
  ): Promise<CreditAccountOperationResult> {
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

    const operationCalls = [
      this.#prepareIncreaseDebt(cm.creditFacade, debt),
      ...this.#prepareAddCollateral(cm.creditFacade, collateral, permits),
      ...openPathCalls, // path from underlying to withdrawal token
      ...(tokenToWithdraw
        ? [
            this.#prepareWithdrawToken(
              cm.creditFacade,
              tokenToWithdraw,
              MAX_UINT256,
              to,
            ),
          ]
        : []),
      ...this.#prepareUpdateQuotas(cm.creditFacade, {
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

    return { calls, tx, creditFacade: cmSuite.creditFacade };
  }

  /**
   * {@inheritDoc ICreditAccountsService.getBorrowRate}
   **/
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
   * {@inheritDoc ICreditAccountsService.getOptimalHFForPartialLiquidation}
   **/
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
   * Returns multicall entries to redeem (unwrap) RWA ERC-4626 vault shares into underlying for the given credit manager.
   * Used when withdrawing debt from a RWA market: redeems adapter vault shares so the underlying can be withdrawn.
   * Only applies when the credit manager's underlying is RWA-gated and has an ERC-4626 adapter configured.
   * @param amount - Number of vault shares (adapter tokens) to redeem
   * @param creditManager - Credit manager address
   * @returns Array of MultiCall to pass to credit facade multicall, or undefined if underlying is not RWA or no adapter is configured
   */
  public async getRWAUnwrapCalls(
    amount: bigint,
    creditManager: Address,
  ): Promise<Array<MultiCall> | undefined> {
    const suite = this.sdk.marketRegister.findCreditManager(creditManager);
    const meta = this.sdk.tokensMeta.mustGet(suite.underlying);
    if (!this.sdk.tokensMeta.isRWAUnderlying(meta)) {
      return undefined;
    }

    const adapter = suite.creditManager.adapters.get(meta.addr);
    const adapterAddress = adapter?.address;

    if (!adapterAddress) {
      return undefined;
    }

    const mc: Array<MultiCall> = [
      {
        target: adapterAddress,
        callData: encodeFunctionData({
          abi: ierc4626AdapterAbi,
          functionName: "redeem",
          args: [amount, ADDRESS_0X0, ADDRESS_0X0],
        }),
      },
    ];

    return mc;
  }
  /**
   * Returns multicall entries to deposit (wrap) underlying into RWA ERC-4626 vault shares for the given credit manager.
   * Used when adding debt on a RWA market: deposits underlying into the adapter vault so shares are minted on the account.
   * Only applies when the credit manager's underlying is RWA-gated and has an ERC-4626 adapter configured.
   * @param amount - Amount of underlying assets to deposit into the vault (in underlying decimals)
   * @param creditManager - Credit manager address
   * @returns Array of MultiCall to pass to credit facade multicall, or undefined if underlying is not RWA or no adapter is configured
   */
  public async getRWAWrapCalls(
    amount: bigint,
    creditManager: Address,
  ): Promise<Array<MultiCall> | undefined> {
    const suite = this.sdk.marketRegister.findCreditManager(creditManager);
    const meta = this.sdk.tokensMeta.mustGet(suite.underlying);
    if (!this.sdk.tokensMeta.isRWAUnderlying(meta)) {
      return undefined;
    }

    const adapter = suite.creditManager.adapters.get(meta.addr);
    const adapterAddress = adapter?.address;

    if (!adapterAddress) {
      return undefined;
    }

    const mc: Array<MultiCall> = [
      {
        target: adapterAddress,
        callData: encodeFunctionData({
          abi: ierc4626AdapterAbi,
          functionName: "deposit",
          args: [amount, ADDRESS_0X0],
        }),
      },
    ];

    return mc;
  }

  /**
   * Returns multicall entries to call redeemDiff on the RWA ERC-4626 adapter for the given credit manager.
   * Redeems the leftover vault shares (e.g. after repaying debt) so the account does not hold excess RWA vault tokens.
   * Only applies when the credit manager's underlying is RWA-gated and has an ERC-4626 adapter configured.
   * @param amount - Leftover vault share amount to redeem (in adapter/vault decimals)
   * @param creditManager - Credit manager address
   * @returns Array of MultiCall to pass to credit facade multicall, or undefined if underlying is not RWA or no adapter is configured
   */
  public async getRedeemDiffCalls(
    amount: bigint,
    creditManager: Address,
  ): Promise<Array<MultiCall> | undefined> {
    const suite = this.sdk.marketRegister.findCreditManager(creditManager);
    const meta = this.sdk.tokensMeta.mustGet(suite.underlying);
    if (!this.sdk.tokensMeta.isRWAUnderlying(meta)) {
      return undefined;
    }

    const adapter = suite.creditManager.adapters.get(meta.addr);
    const adapterAddress = adapter?.address;

    if (!adapterAddress) {
      return undefined;
    }

    const mc: Array<MultiCall> = [
      {
        target: adapterAddress,
        callData: encodeFunctionData({
          abi: ierc4626AdapterAbi,
          functionName: "redeemDiff",
          args: [amount],
        }),
      },
    ];

    return mc;
  }

  /**
   * Returns multicall entries to call depositDiff on the RWA ERC-4626 adapter for the given credit manager.
   * Deposits the leftover underlying (e.g. after decreasing debt) into the vault so the account does not hold excess underlying.
   * Only applies when the credit manager's underlying is RWA-gated and has an ERC-4626 adapter configured.
   * @param amount - Leftover underlying amount to deposit into the vault (in underlying decimals)
   * @param creditManager - Credit manager address
   * @returns Array of MultiCall to pass to credit facade multicall, or undefined if underlying is not RWA or no adapter is configured
   */
  public async getDepositDiffCalls(
    amount: bigint,
    creditManager: Address,
  ): Promise<Array<MultiCall> | undefined> {
    const suite = this.sdk.marketRegister.findCreditManager(creditManager);
    const meta = this.sdk.tokensMeta.mustGet(suite.underlying);
    if (!this.sdk.tokensMeta.isRWAUnderlying(meta)) {
      return undefined;
    }

    const adapter = suite.creditManager.adapters.get(meta.addr);
    const adapterAddress = adapter?.address;

    if (!adapterAddress) {
      return undefined;
    }

    const mc: Array<MultiCall> = [
      {
        target: adapterAddress,
        callData: encodeFunctionData({
          abi: ierc4626AdapterAbi,
          functionName: "depositDiff",
          args: [amount],
        }),
      },
    ];

    return mc;
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
    const addBotCall: MultiCall = {
      target: cm.creditFacade.address,
      callData: encodeFunctionData({
        abi: iCreditFacadeMulticallV310Abi,
        functionName: "setBotPermissions",
        args: [botAddress, permissions],
      }),
    };

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
   * {@inheritDoc ICreditAccountsService.withdrawCollateral}
   */
  public async withdrawCollateral({
    creditAccount,
    assetsToWithdraw,
    to,

    minQuota,
    averageQuota,
  }: WithdrawCollateralProps): Promise<CreditAccountOperationResult> {
    const cm = this.sdk.marketRegister.findCreditManager(
      creditAccount.creditManager,
    );

    const operationCalls: Array<MultiCall> = [
      ...assetsToWithdraw.map(a =>
        this.#prepareWithdrawToken(
          cm.creditFacade.address,
          a.token,
          a.balance,
          to,
        ),
      ),
      ...this.#prepareUpdateQuotas(cm.creditFacade.address, {
        minQuota,
        averageQuota,
      }),
    ];

    const calls = await this.#prependPriceUpdates(
      creditAccount.creditManager,
      operationCalls,
      creditAccount,
    );
    const tx = await this.#multicallTx(cm, creditAccount.creditAccount, calls);

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * {@inheritDoc ICreditAccountsService.repayCreditAccount}
   */
  async repayCreditAccount(
    props: RepayCreditAccountProps,
  ): Promise<CreditAccountOperationResult> {
    const { operation, creditAccount: ca } = props;
    const cm = this.sdk.marketRegister.findCreditManager(ca.creditManager);

    const operationCalls = await this.assembleRepayCreditAccountCalls(props);

    const calls =
      operation === "close"
        ? operationCalls
        : await this.#prependPriceUpdates(ca.creditManager, operationCalls, ca);
    const tx = await this.#closeCreditAccountTx(
      cm,
      ca.creditAccount,
      calls,
      operation,
    );

    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * {@inheritDoc ICreditAccountsService.assembleRepayCreditAccountCalls}
   */
  async assembleRepayCreditAccountCalls({
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
      (await this.getRedeemDiffCalls(1n, ca.creditManager)) ?? [];

    const claimPath = await router.findClaimAllRewards({
      tokensToClaim,
      creditAccount: ca,
    });

    const operationCalls: Array<MultiCall> = [
      ...this.#prepareAddCollateral(ca.creditFacade, addCollateral, permits),
      ...wrapCalls,
      ...this.#prepareDisableQuotas(ca),
      ...this.#prepareDecreaseDebt(ca),
      ...unwrapCalls,
      ...claimPath.calls,
      ...assetsToWithdraw.map(t =>
        this.#prepareWithdrawToken(ca.creditFacade, t.token, MAX_UINT256, to),
      ),
    ];

    return operationCalls;
  }

  /**
   * {@inheritDoc ICreditAccountsService.repayAndLiquidateCreditAccount}
   */
  async repayAndLiquidateCreditAccount({
    collateralAssets,
    assetsToWithdraw,
    creditAccount: ca,
    permits,
    to,
    tokensToClaim,
  }: RepayAndLiquidateCreditAccountProps): Promise<CreditAccountOperationResult> {
    const cm = this.sdk.marketRegister.findCreditManager(ca.creditManager);

    const router = this.sdk.routerFor(ca);
    const claimPath = await router.findClaimAllRewards({
      tokensToClaim,
      creditAccount: ca,
    });

    const wrapCalls =
      (await this.getDepositDiffCalls(1n, ca.creditManager)) ?? [];

    const addCollateral = collateralAssets.filter(a => a.balance > 0);

    const operationCalls: Array<MultiCall> = [
      ...this.#prepareAddCollateral(ca.creditFacade, addCollateral, permits),
      ...claimPath.calls,
      ...wrapCalls,
      ...assetsToWithdraw.map(t =>
        this.#prepareWithdrawToken(ca.creditFacade, t.token, MAX_UINT256, to),
      ),
    ];

    const calls = await this.#prependPriceUpdates(
      ca.creditManager,
      operationCalls,
      ca,
    );

    const tx = cm.creditFacade.liquidateCreditAccount(
      ca.creditAccount,
      to,
      calls,
    );
    return { tx, calls, creditFacade: cm.creditFacade };
  }

  /**
   * {@inheritDoc ICreditAccountsService.claimFarmRewards}
   */
  async claimFarmRewards({
    calls: externalCalls,
    creditAccount: ca,

    minQuota,
    averageQuota,
    tokensToClaim,
  }: ClaimFarmRewardsProps): Promise<CreditAccountOperationResult> {
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
      ...this.#prepareUpdateQuotas(ca.creditFacade, { minQuota, averageQuota }),
    ];

    const calls = await this.#prependPriceUpdates(
      ca.creditManager,
      operationCalls,
      ca,
    );
    const tx = await this.#multicallTx(cm, ca.creditAccount, calls);

    return { tx, calls, creditFacade: cm.creditFacade };
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
    const cm =
      this.sdk.marketRegister.findCreditManager(creditManager).creditManager;

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
      {
        target: cm.creditFacade,
        callData: encodeFunctionData({
          abi: iCreditFacadeMulticallV310Abi,
          functionName: "onDemandPriceUpdates",
          args: [merged],
        }),
      },
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
   * {@inheritDoc ICreditAccountsService.multicall}
   */
  public async multicall(
    creditAccount: RouterCASlice,
    calls: MultiCall[],
    options?: { ignoreReservePrices?: boolean },
  ): Promise<RawTx> {
    const cm = this.sdk.marketRegister.findCreditManager(
      creditAccount.creditManager,
    );
    const callsWithPrices = await this.#prependPriceUpdates(
      creditAccount.creditManager,
      calls,
      creditAccount,
      options,
    );
    return cm.creditFacade.multicall(
      creditAccount.creditAccount,
      callsWithPrices,
    );
  }

  /**
   * {@inheritDoc ICreditAccountsService.botMulticall}
   */
  public async botMulticall(
    creditAccount: RouterCASlice,
    calls: MultiCall[],
    options?: { ignoreReservePrices?: boolean },
  ): Promise<RawTx> {
    const cm = this.sdk.marketRegister.findCreditManager(
      creditAccount.creditManager,
    );
    const callsWithPrices = await this.#prependPriceUpdates(
      creditAccount.creditManager,
      calls,
      creditAccount,
      options,
    );
    return cm.creditFacade.botMulticall(
      creditAccount.creditAccount,
      callsWithPrices,
    );
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
    const calls: MultiCall[] = [];

    for (const op of operations) {
      switch (op.type) {
        case "increaseDebt":
          calls.push(this.#prepareIncreaseDebt(creditFacade, op.amount));
          break;

        case "decreaseDebt":
          calls.push(this.#prepareChangeDebt(creditFacade, op.amount, true));
          break;

        case "addCollateral":
          calls.push(
            ...this.#prepareAddCollateral(
              creditFacade,
              [{ token: op.token, balance: op.amount }],
              {},
            ),
          );
          break;

        case "withdrawCollateral":
          calls.push(
            this.#prepareWithdrawToken(
              creditFacade,
              op.token,
              op.amount,
              op.to,
            ),
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
            ...this.#prepareUpdateQuotas(creditFacade, {
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
  ): Promise<{ tx: RawTx; calls: MultiCall[] }> {
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

    return { tx, calls: callsWithPrices };
  }

  #prepareDisableQuotas(ca: RouterCASlice): Array<MultiCall> {
    const calls: Array<MultiCall> = [];
    for (const { token, quota } of ca.tokens) {
      if (quota > 0n) {
        calls.push({
          target: ca.creditFacade,
          callData: encodeFunctionData({
            abi: iCreditFacadeMulticallV310Abi,
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
    const minRecord = new AssetsMap(minQuota);

    const calls: Array<MultiCall> = averageQuota.map(q => {
      const minBalance = minRecord.get(q.token);
      const min = minBalance && minBalance > 0n ? minBalance : 0n;

      return {
        target: creditFacade,
        callData: encodeFunctionData({
          abi: iCreditFacadeMulticallV310Abi,
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
            abi: iCreditFacadeMulticallV310Abi,
            functionName: "decreaseDebt",
            args: [MAX_UINT256],
          }),
        },
      ];
    }
    return [];
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
        abi: iCreditFacadeMulticallV310Abi,
        functionName: "withdrawCollateral",
        args: [token, amount, to],
      }),
    };
  }

  #prepareIncreaseDebt(creditFacade: Address, debt: bigint): MultiCall {
    return {
      target: creditFacade,
      callData: encodeFunctionData({
        abi: iCreditFacadeMulticallV310Abi,
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
        abi: iCreditFacadeMulticallV310Abi,
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
            abi: iCreditFacadeMulticallV310Abi,
            functionName: "addCollateralWithPermit",
            args: [token, balance, p.deadline, p.v, p.r, p.s],
          }),
        };
      }

      return {
        target: creditFacade,
        callData: encodeFunctionData({
          abi: iCreditFacadeMulticallV310Abi,
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
   * Wrapper that selects between credit facade and RWA factory
   * @param suite
   * @param creditAccount
   * @param calls
   * @param operation
   * @param rwaOptions
   * @returns
   */
  async #closeCreditAccountTx(
    suite: CreditSuite,
    creditAccount: Address,
    calls: MultiCall[],
    operation: CloseOptions,
    rwaOptions?: RWAOperationArgs,
  ): Promise<RawTx> {
    const marketSuite = this.sdk.marketRegister.findByCreditManager(
      suite.creditManager.address,
    );
    const factory = marketSuite.rwaFactory;

    if (operation === "close") {
      if (factory) {
        throw new Error(
          "CloseOptions=close is not supported for RWA underlying credit accounts",
        );
      }
      return suite.creditFacade.closeCreditAccount(creditAccount, calls);
    }

    if (factory) {
      return factory.multicall(creditAccount, calls, rwaOptions);
    }

    return suite.creditFacade.multicall(creditAccount, calls);
  }
}
