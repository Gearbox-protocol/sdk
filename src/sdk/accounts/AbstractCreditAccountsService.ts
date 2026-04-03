import type { Address, Hex } from "viem";
import { encodeFunctionData, getAddress, getContract } from "viem";
import {
  iBotListV310Abi,
  iCreditFacadeMulticallV310Abi,
} from "../../abi/310/generated.js";
import { creditAccountCompressorAbi } from "../../abi/compressors/creditAccountCompressor.js";
import { peripheryCompressorAbi } from "../../abi/compressors/peripheryCompressor.js";
import { rewardsCompressorAbi } from "../../abi/compressors/rewardsCompressor.js";
import { iWithdrawalCompressorV310Abi } from "../../abi/IWithdrawalCompressorV310.js";
import { iBaseRewardPoolAbi } from "../../abi/iBaseRewardPool.js";
import type { CreditAccountData } from "../base/index.js";
import { SDKConstruct } from "../base/index.js";
import { chains } from "../chain/chains.js";
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
  OnDemandPriceUpdates,
  UpdatePriceFeedsResult,
} from "../market/index.js";
import { type Asset, assetsMap, type RouterCASlice } from "../router/index.js";
import type { IPriceUpdateTx, MultiCall, RawTx } from "../types/index.js";
import { AddressMap } from "../utils/index.js";
import { simulateWithPriceUpdates } from "../utils/viem/index.js";
import type {
  AccountToCheck,
  AddCollateralProps,
  ChangeDeptProps,
  ClaimDelayedProps,
  CloseCreditAccountProps,
  CloseCreditAccountResult,
  CreditAccountFilter,
  CreditAccountOperationResult,
  CreditManagerFilter,
  ExecuteSwapProps,
  FullyLiquidateProps,
  FullyLiquidateResult,
  GetConnectedBotsResult,
  GetConnectedMigrationBotsResult,
  GetCreditAccountsArgs,
  GetCreditAccountsOptions,
  GetPendingWithdrawalsProps,
  GetPendingWithdrawalsResult,
  OpenCAProps,
  PermitResult,
  PrepareUpdateQuotasProps,
  PreviewDelayedWithdrawalProps,
  PreviewDelayedWithdrawalResult,
  PriceUpdatesOptions,
  Rewards,
  StartDelayedWithdrawalProps,
  UpdateQuotasProps,
} from "./types.js";

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

// TODO: HARDCODED
const COMPRESSORS: Record<number, Address> = {
  [chains.Mainnet.id]: "0x36F3d0Bb73CBC2E94fE24dF0f26a689409cF9023",
  [chains.Monad.id]: "0x36F3d0Bb73CBC2E94fE24dF0f26a689409cF9023",
};

/**
 * Returns the withdrawal compressor contract address for the given chain, or `undefined` if none is configured.
 * @param chainId - Numeric chain ID.
 * @returns Withdrawal compressor address, or `undefined`.
 **/
export function getWithdrawalCompressorAddress(chainId: number) {
  return COMPRESSORS[chainId];
}

/**
 * @internal
 */
export abstract class AbstractCreditAccountService extends SDKConstruct {
  #compressor: Address;
  #batchSize?: number;

  constructor(sdk: GearboxSDK, options?: CreditAccountServiceOptions) {
    super(sdk);
    [this.#compressor] = sdk.addressProvider.mustGetLatest(
      AP_CREDIT_ACCOUNT_COMPRESSOR,
      VERSION_RANGE_310,
    );
    this.#batchSize = options?.batchSize;
    this.logger?.debug(
      `credit account compressor address: ${this.#compressor}`,
    );
  }

  /**
   * {@inheritDoc ICreditAccountsService.getCreditAccountData}
   **/
  public async getCreditAccountData(
    account: Address,
    blockNumber?: bigint,
  ): Promise<CreditAccountData | undefined> {
    let raw: CreditAccountData;
    try {
      raw = await this.client.readContract({
        abi: creditAccountCompressorAbi,
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
    const { txs: priceUpdateTxs } = await this.getUpdateForAccount({
      creditManager: raw.creditManager,
      creditAccount: raw,
    });
    const [cad] = await simulateWithPriceUpdates(this.client, {
      priceUpdates: priceUpdateTxs,
      contracts: [
        {
          abi: creditAccountCompressorAbi,
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
      additionalBots: this.getActiveBots(
        accountsToCheck,
        additionalBots,
        additionalResp,
      ),
      legacyMigration: this.getActiveMigrationBots(
        accountsToCheck,
        legacyMigrationBot,
        migrationResp,
      ),
    };
  }
  private getActiveBots(
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
  private getActiveMigrationBots(
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
    const priceUpdates = await this.getPriceUpdatesForFacade({
      creditManager: account.creditManager,
      creditAccount: account,
      ignoreReservePrices,
    });
    const calls = [...priceUpdates, ...routerCloseResult.calls];

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

    const routerCloseResult =
      closePath ||
      (await this.sdk.routerFor(ca).findBestClosePath({
        creditAccount: ca,
        creditManager: cm.creditManager,
        slippage,
      }));

    const priceUpdates = await this.getPriceUpdatesForFacade({
      creditManager: ca.creditManager,
      creditAccount: ca,
    });

    const calls: Array<MultiCall> = [
      ...(operation === "close" ? [] : priceUpdates),
      ...routerCloseResult.calls,
      ...this.prepareDisableQuotas(ca),
      ...this.prepareDecreaseDebt(ca),
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
    const priceUpdates = await this.getPriceUpdatesForFacade({
      creditManager: creditAccount.creditManager,
      creditAccount,
    });

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

    const priceUpdatesCalls = await this.getPriceUpdatesForFacade({
      creditManager: creditAccount.creditManager,
      creditAccount,
      desiredQuotas: averageQuota,
    });

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
   * {@inheritDoc ICreditAccountsService.changeDebt}
   **/
  public async changeDebt({
    creditAccount,
    amount,
    addCollateral,
  }: ChangeDeptProps): Promise<CreditAccountOperationResult> {
    if (amount === 0n) {
      throw new Error("debt increase or decrease must be non-zero");
    }
    const isDecrease = amount < 0n;
    const change = amount > 0n ? amount : -amount;

    const cm = this.sdk.marketRegister.findCreditManager(
      creditAccount.creditManager,
    );

    const priceUpdatesCalls = await this.getPriceUpdatesForFacade({
      creditManager: creditAccount.creditManager,
      creditAccount,
    });

    const addCollateralCalls =
      addCollateral && isDecrease
        ? this.prepareAddCollateral(
            creditAccount.creditFacade,
            [
              {
                token: creditAccount.underlying,
                balance: change,
              },
            ],
            {},
          )
        : [];

    const calls: Array<MultiCall> = [
      ...priceUpdatesCalls,
      ...addCollateralCalls,
      this.#prepareChangeDebt(creditAccount.creditFacade, change, isDecrease),
    ];

    const tx = cm.creditFacade.multicall(creditAccount.creditAccount, calls);

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

    const priceUpdatesCalls = await this.getPriceUpdatesForFacade({
      creditManager: creditAccount.creditManager,
      creditAccount,
      desiredQuotas: averageQuota,
    });

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
   * {@inheritDoc ICreditAccountsService.previewDelayedWithdrawal}
   **/
  public async previewDelayedWithdrawal({
    creditAccount,
    amount,
    token,
  }: PreviewDelayedWithdrawalProps): Promise<PreviewDelayedWithdrawalResult> {
    const compressor = getWithdrawalCompressorAddress(this.sdk.chainId);
    if (!compressor)
      throw new Error(
        `No compressor for current chain ${this.sdk.networkType}`,
      );

    const contract = getContract({
      address: compressor,
      abi: iWithdrawalCompressorV310Abi,
      client: this.client,
    });

    // TODO: return multiple configs
    const resp = await contract.read.getWithdrawalRequestResult([
      creditAccount,
      token,
      amount,
    ]);

    return resp;
  }

  /**
   * {@inheritDoc ICreditAccountsService.getPendingWithdrawals}
   **/
  public async getPendingWithdrawals({
    creditAccount,
  }: GetPendingWithdrawalsProps): Promise<GetPendingWithdrawalsResult> {
    const compressor = getWithdrawalCompressorAddress(this.sdk.chainId);
    if (!compressor)
      throw new Error(
        `No compressor for current chain ${this.sdk.networkType}`,
      );

    const contract = getContract({
      address: compressor,
      abi: iWithdrawalCompressorV310Abi,
      client: this.client,
    });

    // TODO: return multiple configs
    const resp = await contract.read.getCurrentWithdrawals([creditAccount]);

    const claimableNow = resp?.[0] || [];
    const pendingResult = [...(resp?.[1] || [])].sort((a, b) =>
      a.claimableAt < b.claimableAt ? -1 : 1,
    );

    const respResult: GetPendingWithdrawalsResult = {
      claimableNow: [...claimableNow],
      pending: pendingResult,
    };

    return respResult;
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

    const record = preview.outputs.reduce<Record<Address, bigint>>((acc, o) => {
      const token = o.token.toLowerCase() as Address;
      acc[token] = (acc[token] || 0n) + o.amount;

      return acc;
    }, {});
    const balances = Object.entries(record).filter(([, a]) => a > 10n);

    const storeExpectedBalances: MultiCall = {
      target: cm.creditFacade.address,
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
      target: cm.creditFacade.address,
      callData: encodeFunctionData({
        abi: iCreditFacadeMulticallV310Abi,
        functionName: "compareBalances",
        args: [],
      }),
    };

    const priceUpdatesCalls = await this.getPriceUpdatesForFacade({
      creditManager: creditAccount.creditManager,
      creditAccount,
      desiredQuotas: averageQuota,
    });

    const calls: Array<MultiCall> = [
      ...priceUpdatesCalls,
      storeExpectedBalances,
      ...preview.requestCalls,
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
      target: cm.creditFacade.address,
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
      target: cm.creditFacade.address,
      callData: encodeFunctionData({
        abi: iCreditFacadeMulticallV310Abi,
        functionName: "compareBalances",
        args: [],
      }),
    };

    const priceUpdatesCalls = zeroDebt
      ? []
      : await this.getPriceUpdatesForFacade({
          creditManager: creditAccount.creditManager,
          creditAccount,
          desiredQuotas: averageQuota,
        });

    const quotaCalls = zeroDebt
      ? []
      : this.prepareUpdateQuotas(creditAccount.creditFacade, {
          minQuota,
          averageQuota,
        });

    const calls: Array<MultiCall> = [
      ...priceUpdatesCalls,
      storeExpectedBalances,
      ...claimableNow.claimCalls,
      compareBalances,
      ...quotaCalls,
    ];

    const tx = cm.creditFacade.multicall(creditAccount.creditAccount, calls);

    return { tx, calls, creditFacade: cm.creditFacade };
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
    } = props;
    const cmSuite = this.sdk.marketRegister.findCreditManager(creditManager);
    const cm = cmSuite.creditManager;
    let tokenToWithdraw: Address | undefined;
    if (withdrawToken === true) {
      tokenToWithdraw = cm.underlying;
    } else if (typeof withdrawToken === "string") {
      tokenToWithdraw = withdrawToken;
    }

    const priceUpdatesCalls = await this.getPriceUpdatesForFacade({
      creditManager: cm.address,
      desiredQuotas: averageQuota,
    });

    const calls = [
      ...priceUpdatesCalls,
      this.#prepareIncreaseDebt(cm.creditFacade, debt),
      ...this.prepareAddCollateral(cm.creditFacade, collateral, permits),
      ...openPathCalls,
      ...(tokenToWithdraw
        ? [
            this.prepareWithdrawToken(
              cm.creditFacade,
              tokenToWithdraw,
              MAX_UINT256,
              to,
            ),
          ]
        : []),
      ...this.prepareUpdateQuotas(cm.creditFacade, {
        minQuota,
        averageQuota,
      }),
      ...(callsAfter ?? []),
    ];

    let tx: RawTx;
    if (reopenCreditAccount) {
      tx = await cmSuite.creditFacade.multicall(reopenCreditAccount, calls);
    } else {
      tx = cmSuite.creditFacade.openCreditAccount(to, calls, referralCode);
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
            address: this.#compressor,
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
        address: this.#compressor,
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
   * {@inheritDoc ICreditAccountsService.getUpdateForAccounts}
   **/
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
    options: PriceUpdatesOptions,
  ): Promise<UpdatePriceFeedsResult> {
    const { creditManager, creditAccount, desiredQuotas, ignoreReservePrices } =
      options;
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
      market.priceOracle.priceFeedsForTokens(Array.from(tokens), {
        main: true,
        reserve: !ignoreReservePrices,
      });
    const tStr = Array.from(tokens)
      .map(t => this.labelAddress(t))
      .join(", ");
    const remark = ignoreReservePrices ? " main" : "";
    this.logger?.debug(
      { account: creditAccount?.creditAccount, manager: cm.name },
      `generating price feed updates for ${tStr} from ${priceFeeds.length}${remark} price feeds`,
    );
    return this.sdk.priceFeeds.generatePriceFeedsUpdateTxs(priceFeeds);
  }

  /**
   * {@inheritDoc ICreditAccountsService.getOnDemandPriceUpdates}
   **/
  public async getOnDemandPriceUpdates(
    options: PriceUpdatesOptions,
  ): Promise<OnDemandPriceUpdates> {
    const { creditManager, creditAccount } = options;
    const market = this.sdk.marketRegister.findByCreditManager(creditManager);
    const cm = this.sdk.marketRegister.findCreditManager(creditManager);
    const update = await this.getUpdateForAccount(options);
    this.logger?.debug(
      { account: creditAccount?.creditAccount, manager: cm.name },
      `getting on demand price updates from ${update.txs.length} txs`,
    );
    return market.priceOracle.onDemandPriceUpdates(
      cm.creditFacade.address,
      update,
    );
  }

  /**
   * {@inheritDoc ICreditAccountsService.getPriceUpdatesForFacade}
   **/
  public async getPriceUpdatesForFacade(
    options: PriceUpdatesOptions,
  ): Promise<Array<MultiCall>> {
    const updates = await this.getOnDemandPriceUpdates(options);
    return updates.multicall;
  }

  protected prepareDisableQuotas(ca: RouterCASlice): Array<MultiCall> {
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
          abi: iCreditFacadeMulticallV310Abi,
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
            abi: iCreditFacadeMulticallV310Abi,
            functionName: "decreaseDebt",
            args: [MAX_UINT256],
          }),
        },
      ];
    }
    return [];
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
