import type { Address, Hex } from "viem";
import { encodeFunctionData } from "viem";
import { rewardsCompressorAbi } from "../../abi/compressors/rewardsCompressor.js";
import { iBaseRewardPoolAbi } from "../../abi/iBaseRewardPool.js";
import { ierc4626AdapterAbi } from "../../abi/ierc4626Adapter.js";
import type { StrategyPosition } from "../../model/index.js";
import type {
  Asset,
  CreditAccountData,
  CreditAccountTokensSlice,
  PermitResult,
} from "../base/index.js";
import { SDKConstruct } from "../base/index.js";
import {
  ADDRESS_0X0,
  AP_REWARDS_COMPRESSOR,
  MAX_UINT256,
  VERSION_RANGE_310,
} from "../constants/index.js";
import {
  expectedBalanceDeltas,
  type PrepareUpdateQuotasProps,
  type PriceUpdate,
} from "../market/index.js";
import type {
  GetOpenAccountRequirementsProps,
  RWAOpenAccountRequirements,
} from "../market/rwa/index.js";
import type { OnchainSDK } from "../OnchainSDK.js";
import type { RouterCASlice } from "../router/index.js";
import type { RouterRewardsResult } from "../router/types.js";
import type { MultiCall, RawTx } from "../types/index.js";
import { AccountBotsService } from "./bots/index.js";
import {
  CreditAccountCompressor,
  type GetCreditAccountsOptions,
  type ListStrategyPositionsProps,
} from "./credit-account-compressor/index.js";
import {
  extractPriceUpdates,
  extractQuotaTokens,
  mergePriceUpdates,
} from "./multicall-utils.js";
import type {
  AssembleCaOperationsProps,
  AssembleClaimDelayedCallsProps,
  AssembleCloseCreditAccountCallsProps,
  AssembleRepayCreditAccountCallsProps,
  AssembleStartDelayedWithdrawalCallsProps,
  ClaimFarmRewardsProps,
  FullyLiquidateProps,
  FullyLiquidateResult,
  GetApprovalAddressProps,
  GetPendingWithdrawalsProps,
  GetPendingWithdrawalsResult,
  ICreditAccountsService,
  OpenCAProps,
  PartiallyLiquidateProps,
  PreviewDelayedWithdrawalProps,
  Rewards,
} from "./types.js";
import type {
  IWithdrawalCompressorContract,
  RequestableWithdrawal,
} from "./withdrawal-compressor/index.js";

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

  /**
   * {@inheritDoc ICreditAccountsService.bots}
   **/
  public readonly bots: AccountBotsService;

  constructor(sdk: OnchainSDK) {
    super(sdk);
    this.#compressor = new CreditAccountCompressor(sdk);
    this.bots = new AccountBotsService(sdk);
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
    const calls = await this.prependPriceUpdates(
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
    return this.sdk.marketRegister
      .findCreditFacade(creditFacade)
      .prepareWithBalanceCheck(
        expectedBalanceDeltas({
          outputs: preview.outputs,
          spentToken: preview.token,
          spentAmount: preview.amountIn,
        }),
        preview.requestCalls,
      );
  }

  /**
   * {@inheritDoc ICreditAccountsService.assembleClaimDelayedCalls}
   **/
  public assembleClaimDelayedCalls({
    creditFacade,
    claimableNow,
  }: AssembleClaimDelayedCallsProps): Array<MultiCall> {
    return this.sdk.marketRegister
      .findCreditFacade(creditFacade)
      .prepareWithBalanceCheck(
        expectedBalanceDeltas({
          outputs: claimableNow.outputs,
          spentToken: claimableNow.withdrawalPhantomToken,
          spentAmount: claimableNow.withdrawalTokenSpent,
        }),
        claimableNow.claimCalls,
      );
  }

  /**
   * {@inheritDoc ICreditAccountsService.getApprovalAddress}
   **/
  public async getApprovalAddress(
    options: GetApprovalAddressProps,
  ): Promise<Address> {
    const { creditManager } = options;
    const suite = this.sdk.marketRegister.findCreditManager(creditManager);

    return suite.rwaFactory
      ? suite.rwaFactory.getApprovalAddress(options)
      : suite.creditManager.address;
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
      this.sdk.marketRegister.findCreditManager(creditManager);
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

    const calls = await this.prependPriceUpdates(cm.address, operationCalls);
    const tx: RawTx = reopenCreditAccount
      ? cmSuite.multicallTx(reopenCreditAccount, calls)
      : cmSuite.openCreditAccountTx(to, calls, referralCode, rwaOptions);
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

    const calls = await this.prependPriceUpdates(
      ca.creditManager,
      operationCalls,
      ca,
    );

    return cm.multicallTx(ca.creditAccount, calls);
  }

  /**
   * Returns raw txs that are needed to update all price feeds so that all credit accounts (possibly from different markets) compute
   * {@inheritDoc ICreditAccountsService.getOnDemandPriceUpdates}
   **/
  public async getOnDemandPriceUpdates(
    account: CreditAccountTokensSlice,
    ignoreReservePrices?: boolean,
  ): Promise<PriceUpdate[]> {
    const { priceOracle } = this.sdk.marketRegister.findByCreditManager(
      account.creditManager,
    );
    return priceOracle.priceUpdatesForAccount(account, {
      reserve: !ignoreReservePrices,
    });
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
    const { priceOracle } =
      this.sdk.marketRegister.findByCreditManager(creditManager);
    const suite = this.sdk.marketRegister.findCreditManager(creditManager);

    const { priceUpdates: existingUpdates, remainingCalls } =
      extractPriceUpdates(calls);
    // tokens from `updateQuota` calls
    const extraTokens = extractQuotaTokens(calls).asArray();
    const opts = {
      reserve: !options?.ignoreReservePrices,
      extraTokens,
    };
    // there's no account when opening one, or when setting a bot on the credit manager
    const generatedUpdates = creditAccount
      ? await priceOracle.priceUpdatesForAccount(creditAccount, opts)
      : await priceOracle.priceUpdatesForTokens(
          [suite.creditManager.underlying, ...extraTokens],
          opts,
        );

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
    const callsWithPrices = await this.prependPriceUpdates(
      creditAccount.creditManager,
      calls,
      creditAccount,
      { ignoreReservePrices: options?.ignoreReservePrices },
    );
    const tx = cm.multicallTx(creditAccount.creditAccount, callsWithPrices);

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
