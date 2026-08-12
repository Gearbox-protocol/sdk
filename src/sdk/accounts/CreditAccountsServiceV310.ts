import type { Address, Hex } from "viem";
import { encodeFunctionData, getContract } from "viem";
import { iBotListV310Abi } from "../../abi/310/generated.js";
import { peripheryCompressorAbi } from "../../abi/compressors/peripheryCompressor.js";
import { rewardsCompressorAbi } from "../../abi/compressors/rewardsCompressor.js";
import { iBaseRewardPoolAbi } from "../../abi/iBaseRewardPool.js";
import { ierc4626AdapterAbi } from "../../abi/ierc4626Adapter.js";
import type { StrategyPosition } from "../../model/index.js";
import type { Asset, CreditAccountData } from "../base/index.js";
import { SDKConstruct } from "../base/index.js";
import {
  ADDRESS_0X0,
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
  getRawPriceUpdates,
  type IPriceFeedContract,
  type PriceUpdate,
} from "../market/index.js";
import type { RWAOpenAccountRequirements } from "../market/rwa/index.js";
import type { OnchainSDK } from "../OnchainSDK.js";
import type { RouterCASlice } from "../router/index.js";
import type { RouterRewardsResult } from "../router/types.js";
import type { MultiCall, RawTx } from "../types/index.js";
import { AddressSet } from "../utils/index.js";
import {
  CreditAccountCompressor,
  type GetCreditAccountsOptions,
  type ListStrategyPositionsProps,
} from "./credit-account-compressor/index.js";
import { getAccountPriceUpdateTxs } from "./getAccountPriceUpdateTxs.js";
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
  CreditAccountOperationResult,
  CreditAccountTokensSlice,
  CreditManagerOperationResult,
  FullyLiquidateProps,
  FullyLiquidateResult,
  GetApprovalAddressProps,
  GetConnectedBotsResult,
  GetConnectedMigrationBotsResult,
  GetOpenAccountRequirementsProps,
  GetPendingWithdrawalsProps,
  GetPendingWithdrawalsResult,
  ICreditAccountsService,
  OpenCAProps,
  PartiallyLiquidateProps,
  PermitResult,
  PrepareUpdateQuotasProps,
  PreviewDelayedWithdrawalProps,
  Rewards,
  SetBotProps,
} from "./types.js";
import type {
  IWithdrawalCompressorContract,
  RequestableWithdrawal,
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
  readonly #compressor: CreditAccountCompressor;

  constructor(sdk: OnchainSDK) {
    super(sdk);
    this.#compressor = new CreditAccountCompressor(sdk);
  }
  /**
   * {@inheritDoc ICreditAccountsService.getCreditAccountData}
   **/
  public async getCreditAccountData(
    account: Address,
    blockNumber?: bigint,
  ): Promise<CreditAccountData<true> | undefined> {
    return this.#compressor.getCreditAccountData(account, blockNumber);
  }

  /**
   * {@inheritDoc ICreditAccountsService.getCreditAccounts}
   **/
  public async getCreditAccounts(
    options?: GetCreditAccountsOptions,
    blockNumber?: bigint,
  ): Promise<Array<CreditAccountData>> {
    return this.#compressor.getCreditAccounts(options, blockNumber);
  }

  /**
   * {@inheritDoc ICreditAccountsService.getBorrowerCreditAccounts}
   **/
  public async getBorrowerCreditAccounts(
    borrower: Address,
    options?: GetCreditAccountsOptions,
    blockNumber?: bigint,
  ): Promise<Array<CreditAccountData<true>>> {
    return this.#compressor.getBorrowerCreditAccounts(
      borrower,
      options,
      blockNumber,
    );
  }

  /**
   * {@inheritDoc ICreditAccountsService.listPositions}
   **/
  public async listPositions(
    props: ListStrategyPositionsProps,
  ): Promise<StrategyPosition[]> {
    return this.#compressor.listPositions(props);
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
    const update = await getAccountPriceUpdateTxs(
      this.sdk,
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
        if (t.balance > DUST_THRESHOLD && isEnabled) {
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
