import type { Address } from "viem";
import { iLiquidationCompressorV313Abi } from "../../../abi/ILiquidationCompressorV313.js";
import type {
  LiquidatableAccount,
  LiquidationApproval,
  LiquidationDetails,
  LiquidationPosition,
  ReceivedAsset,
  TokenAmount,
  TxCall,
} from "../../../model/index.js";
import { matchesLiquidatableAccountFilter } from "../../../model/index.js";
import type { CreditAccountData } from "../../base/index.js";
import { SDKConstruct } from "../../base/index.js";
import {
  ADDRESS_0X0,
  DUST_THRESHOLD,
  PERCENTAGE_FACTOR,
  WAD,
} from "../../constants/index.js";
import type {
  CreditSuite,
  IPriceOracleContract,
  MarketSuite,
} from "../../market/index.js";
import { dominantCollateral } from "../../market/index.js";
import { usdToNumber } from "../../market/math.js";
import {
  MidasLiquidatorContract,
  RWA_LIQUIDATOR_MIDAS,
} from "../../market/rwa/midas/index.js";
import {
  RWA_LIQUIDATOR_SECURITIZE,
  SecuritizeLiquidatorContract,
} from "../../market/rwa/securitize/index.js";
import type { MultiCall } from "../../types/index.js";
import type { AddressMap } from "../../utils/index.js";
import { AddressSet, bytes32ToString, hexEq } from "../../utils/index.js";
import type { WithdrawalOutput } from "../withdrawal-compressor/index.js";
import {
  LIQUIDATION_APPROVAL_BUFFER,
  LIQUIDATION_COMPRESSOR_V313_ADDRESS,
} from "./constants.js";
import {
  type OptimalPartialLiquidation,
  optimalPartialLiquidation,
  partialLiquidationParams,
} from "./partialLiquidation.js";
import { skipLiquidatableAccount } from "./skipLiquidatableAccount.js";
import type {
  BuildLiquidationTxProps,
  BuildPartialLiquidationTxProps,
  GetLiquidatableAccountsProps,
  GetLiquidationDetailsProps,
  GetLiquidationPositionsProps,
  GetPartialLiquidationDetailsProps,
  LoadRWALiquidatorsProps,
  OnchainLiquidationData,
  OnchainLiquidationOutput,
  PartialLiquidationParams,
  RWALiquidatorInfo,
} from "./types.js";

/**
 * Service for discovering liquidatable credit accounts and previewing manual
 * liquidations.
 **/
export class LiquidationsService extends SDKConstruct {
  /**
   * Returns all liquidatable credit accounts: accounts with health factor
   * below 1 plus accounts of expired credit managers with outstanding debt.
   **/
  public async getLiquidatableAccounts(
    props?: GetLiquidatableAccountsProps,
  ): Promise<LiquidatableAccount[]> {
    const unhealthy = await this.sdk.accounts.getCreditAccounts(
      {
        maxHealthFactor: WAD - 1n,
        includeZeroDebt: false,
      },
      props?.blockNumber,
    );
    const seen = new AddressSet(unhealthy.map(ca => ca.creditAccount));
    let expired = await this.#getExpiredCreditAccounts(props?.blockNumber);
    expired = expired.filter(ca => !seen.has(ca.creditAccount));

    return [...unhealthy, ...expired]
      .flatMap(ca => {
        if (
          skipLiquidatableAccount(
            ca,
            token => this.sdk.tokensMeta.get(token)?.contractType,
          )
        ) {
          this.logger?.warn(
            `skipping liquidatable account ${ca.creditAccount}`,
          );
          return [];
        }
        return [this.#buildAccount(ca)];
      })
      .filter(row => matchesLiquidatableAccountFilter(row, props));
  }

  /**
   * Returns detailed information about a liquidatable credit account,
   * including the full list of assets the liquidator receives.
   *
   * @throws When the account is not found or its collateral computation fails.
   **/
  public async getLiquidationDetails(
    props: GetLiquidationDetailsProps,
  ): Promise<LiquidationDetails> {
    const { creditAccount, liquidator, ignoreReservePrices, blockNumber } =
      props;
    const ca = await this.#getCreditAccountData(creditAccount, blockNumber);
    const suite = this.sdk.marketRegister.findCreditManager(ca.creditManager);
    const { priceOracle } = suite.market;

    const account = this.#buildAccount(ca, suite);
    const data = await this.#getLiquidationData(
      ca,
      liquidator,
      ignoreReservePrices,
      blockNumber,
    );

    return {
      ...account,
      // the compressor reports the exact amounts of the liquidation path it
      // selected, which supersede the estimates of the list row
      repaymentAmount: priceOracle.toTokenAmount(
        // paths that need no capital from the liquidator report a zero token
        hexEq(data.requiredToken, ADDRESS_0X0)
          ? account.totalValue.token.address
          : data.requiredToken,
        data.requiredAmount,
      ),
      isDelayed: data.expectedOutputs.some(o => o.delayed),
      receivedAssets: this.#receivedAssets(data.expectedOutputs, priceOracle),
      isLiquidatorEligible: data.isLiquidatorEligible,
      isCreditAccountFrozen: data.isCreditAccountFrozen,
      kycProtocol: data.kycProtocol || undefined,
      kycToken: hexEq(data.kycToken, ADDRESS_0X0)
        ? undefined
        : this.sdk.tokensMeta.getToken(data.kycToken),
      approve: this.#liquidationApproval(data, suite, priceOracle),
    };
  }

  /**
   * Builds the transaction that fully liquidates a credit account, repaying
   * the debt from own funds and receiving the collateral from the credit account.
   **/
  public async buildLiquidationTx(
    props: BuildLiquidationTxProps,
  ): Promise<TxCall> {
    const { creditAccount, liquidator, ignoreReservePrices, blockNumber } =
      props;
    const ca = await this.#getCreditAccountData(creditAccount, blockNumber);
    const { liquidationCall } = await this.#getLiquidationData(
      ca,
      liquidator,
      ignoreReservePrices,
      blockNumber,
    );
    this.logger?.debug(
      `built tx to liquidate credit account ${this.labelAddress(creditAccount)} to ${this.labelAddress(liquidator)}`,
    );
    // depending on the liquidated assets, the target is either the credit
    // facade or a dedicated liquidator contract with its own function
    // signature, so the calldata is passed through as-is
    return { to: liquidationCall.target, callData: liquidationCall.callData };
  }

  /**
   * Details of a partial liquidation of a credit account, in the shape of a
   * full one: what the liquidator pays, what it receives and what it must
   * approve, plus {@link LiquidationDetails.isPartiallyLiquidatable}.
   *
   * A local estimate from the synced oracle state, without fresh price
   * updates. Parameters left out of `props` are derived from current state.
   *
   * @throws For RWA markets, for a withdrawal phantom `tokenOut`, and when no
   * `tokenOut` can be picked.
   **/
  public async getPartialLiquidationDetails(
    props: GetPartialLiquidationDetailsProps,
  ): Promise<LiquidationDetails> {
    const { creditAccount, blockNumber } = props;
    const ca = await this.#getCreditAccountData(creditAccount, blockNumber);
    const suite = this.sdk.marketRegister.findCreditManager(ca.creditManager);
    const { priceOracle } = suite.market;
    const { underlying } = suite;
    const { tokenOut, repaidAmount, isPartiallyLiquidatable } =
      this.#getPartialLiquidationParams(ca, suite, props);

    const { liquidationDiscount } = suite.liquidationFees();
    // the seized collateral is priced off everything the liquidator pays, fee included
    const seizedValue =
      (repaidAmount * PERCENTAGE_FACTOR) / BigInt(liquidationDiscount);
    const seizedAmount =
      (priceOracle.convert(underlying, tokenOut, repaidAmount) *
        PERCENTAGE_FACTOR) /
      BigInt(liquidationDiscount);

    return {
      ...this.#buildAccount(ca, suite),
      repaymentAmount: priceOracle.toTokenAmount(underlying, repaidAmount),
      estimatedProfit: priceOracle.toTokenAmount(
        underlying,
        seizedValue - repaidAmount,
      ),
      isDelayed: false,
      receivedAssets: [
        {
          isDelayed: false,
          ...priceOracle.toTokenAmount(tokenOut, seizedAmount),
          token: this.sdk.tokensMeta.mustGetToken(
            this.sdk.tokensMeta.depositedToken(tokenOut),
          ),
        },
      ],
      isLiquidatorEligible: true,
      isCreditAccountFrozen: false,
      approve:
        repaidAmount === 0n
          ? undefined
          : {
              spender: suite.creditManager.address,
              // debt accrues interest until the tx is built, raising repaidAmount
              ...priceOracle.toTokenAmount(
                underlying,
                (repaidAmount *
                  (PERCENTAGE_FACTOR + LIQUIDATION_APPROVAL_BUFFER)) /
                  PERCENTAGE_FACTOR,
              ),
            },
      isPartiallyLiquidatable,
    };
  }

  /**
   * Builds the transaction that partially liquidates a credit account,
   * repaying part of its debt from the liquidator's funds in exchange for
   * discounted collateral sent to the liquidator. Parameters left out of
   * `props` are derived from current state.
   *
   * @throws For RWA markets, for a withdrawal phantom `tokenOut`, when no
   * `tokenOut` can be picked, and when the account cannot be partially
   * liquidated, see {@link LiquidationDetails.isPartiallyLiquidatable}.
   **/
  public async buildPartialLiquidationTx(
    props: BuildPartialLiquidationTxProps,
  ): Promise<TxCall> {
    const { creditAccount, liquidator, blockNumber } = props;
    const ca = await this.#getCreditAccountData(creditAccount, blockNumber);
    const suite = this.sdk.marketRegister.findCreditManager(ca.creditManager);
    const params = this.#getPartialLiquidationParams(ca, suite, props);
    if (!params.isPartiallyLiquidatable) {
      throw new Error(
        `credit account ${this.labelAddress(creditAccount)} cannot be partially liquidated`,
      );
    }
    const updates = await this.sdk.accounts.getOnDemandPriceUpdates(ca, true);
    const tx = suite.creditFacade.partiallyLiquidateCreditAccount(
      ca.creditAccount,
      params.tokenOut,
      params.repaidAmount,
      params.minSeizedAmount,
      liquidator,
      updates,
    );
    this.logger?.debug(
      `built tx to partially liquidate credit account ${this.labelAddress(creditAccount)} to ${this.labelAddress(liquidator)}`,
    );
    return { to: tx.to, callData: tx.callData };
  }

  /**
   * Optimal partial liquidation of a credit account: the collateral to seize
   * and the amounts that bring its health factor close to `optimalHF`.
   *
   * Prices come from the last synced oracle state and `ca`, not from fresh
   * price updates. Withdrawal phantom tokens are never seized.
   *
   * @param ca - Credit account to partially liquidate.
   * @param optimalHF - Health factor to aim for, in basis points. Defaults to
   * {@link CreditSuite.optimalHFForPartialLiquidation}.
   * @param liquidationThresholds - Liquidation thresholds to use instead of
   * the credit manager's cached ones, for example LTs just set on a fork.
   * @throws If no `tokenOut` can be picked.
   **/
  public getOptimalPartialLiquidation(
    ca: CreditAccountData,
    optimalHF?: bigint,
    liquidationThresholds?: AddressMap<number>,
  ): OptimalPartialLiquidation {
    return optimalPartialLiquidation({
      suite: this.sdk.marketRegister.findCreditManager(ca.creditManager),
      account: ca,
      optimalHF,
      exclude: token => this.#isWithdrawalPhantom(token),
      liquidationThresholds,
    });
  }

  /**
   * Returns the status of delayed-withdrawal positions (redemption receipts)
   * owned by a liquidator wallet: what is receivable, how much, and when it
   * becomes claimable.
   **/
  public async getLiquidationPositions(
    props: GetLiquidationPositionsProps,
  ): Promise<LiquidationPosition[]> {
    const compressor = this.sdk.withdrawalCompressor;
    if (!compressor) {
      return [];
    }
    // the same phantom token can be configured in several credit managers;
    // duplicates would double-count redeemers in the compressor's loop
    const phantomTokens = new AddressSet(
      compressor.getWithdrawableAssets().map(a => a.withdrawalPhantomToken),
    );
    const { claimable, pending } =
      await compressor.getExternalAccountCurrentWithdrawals({
        account: props.liquidator,
        withdrawalTokens: phantomTokens.asArray(),
        blockNumber: props.blockNumber,
      });
    return [
      ...claimable.map(w => ({
        ...this.#liquidationPosition(w.token, w.outputs),
        claimTx: this.#claimTx(w.claimCalls, w.token),
        redeemer: w.redeemer,
      })),
      ...pending.map(w => ({
        ...this.#liquidationPosition(w.token, w.expectedOutputs),
        claimableAt: Number(w.claimableAt),
        redeemer: w.redeemer,
      })),
    ];
  }

  /**
   * Discovers the dedicated RWA liquidator contracts (Securitize, Midas)
   * deployed for the markets of the chain and registers them in the SDK
   * contracts register.
   **/
  public async loadRWALiquidators(
    props?: LoadRWALiquidatorsProps,
  ): Promise<void> {
    const configurators = this.sdk.marketRegister.marketConfigurators;
    if (configurators.length === 0) {
      return;
    }
    const resp = await this.client.multicall({
      contracts: configurators.map(
        mc =>
          ({
            address: LIQUIDATION_COMPRESSOR_V313_ADDRESS,
            abi: iLiquidationCompressorV313Abi,
            functionName: "getRWALiquidators",
            args: [mc.address],
          }) as const,
      ),
      allowFailure: false,
      batchSize: 0,
      blockNumber: props?.blockNumber,
    });
    for (const info of resp.flat()) {
      this.#createRWALiquidator(info);
    }
  }

  #createRWALiquidator(info: RWALiquidatorInfo): void {
    const liquidator = info.liquidatorAddress;
    // the same gateway can be configured in several credit managers, so the
    // compressor reports duplicates
    if (this.sdk.getContract(liquidator)) {
      return;
    }
    switch (bytes32ToString(info.contractType)) {
      case RWA_LIQUIDATOR_SECURITIZE:
        new SecuritizeLiquidatorContract(this.sdk, liquidator);
        this.logger?.debug(`registered Securitize liquidator ${liquidator}`);
        return;
      case RWA_LIQUIDATOR_MIDAS:
        new MidasLiquidatorContract(this.sdk, liquidator);
        this.logger?.debug(`registered Midas liquidator ${liquidator}`);
        return;
    }
  }

  // delayed-withdrawal positions are owned by a wallet rather than by a credit
  // account, so they span markets and there is no single oracle to ask; a
  // token no oracle prices is reported without a USD value
  #anyMarketTokenAmount(token: Address, value: bigint): TokenAmount {
    const meta = this.sdk.tokensMeta.mustGetToken(token);
    for (const market of this.sdk.marketRegister.markets) {
      const priced = market.priceOracle.safeConvertToUSD(token, value);
      if (!priced.error) {
        return {
          token: meta,
          value,
          valueUsd: usdToNumber(priced.value),
        };
      }
    }
    return { token: meta, value, valueUsd: null };
  }

  /**
   * The part a claimable and a pending withdrawal describe the same way. What
   * separates them — the claim transaction and the moment it becomes
   * available — is added by the caller.
   **/
  #liquidationPosition(
    token: Address,
    outputs: readonly WithdrawalOutput[],
  ): LiquidationPosition {
    const sourceToken = this.sdk.tokensMeta.mustGetToken(token);
    const output = this.#withdrawalOutput(outputs, token);
    return {
      kind: "liquidation",
      name: `${sourceToken.symbol} → ${output.token.symbol}`,
      chainId: this.sdk.chainId,
      sourceToken,
      output,
    };
  }

  #withdrawalOutput(
    outputs: readonly WithdrawalOutput[],
    sourceToken: Address,
  ): TokenAmount {
    const [output] = outputs;
    if (outputs.length !== 1 || !output) {
      throw new Error(
        `expected exactly one output for withdrawal of ${sourceToken}, got ${outputs.length}`,
      );
    }
    return this.#anyMarketTokenAmount(output.token, output.amount);
  }

  #claimTx(
    claimCalls: readonly MultiCall[],
    sourceToken: Address,
  ): TxCall | undefined {
    if (claimCalls.length > 1) {
      throw new Error(
        `expected at most one claim call for withdrawal of ${sourceToken}, got ${claimCalls.length}`,
      );
    }
    const [call] = claimCalls;
    return call ? { to: call.target, callData: call.callData } : undefined;
  }

  #receivedAssets(
    outputs: readonly OnchainLiquidationOutput[],
    priceOracle: IPriceOracleContract,
  ): ReceivedAsset[] {
    return outputs.map((o): ReceivedAsset => {
      const amount = priceOracle.toTokenAmount(o.token, o.amount);
      if (!o.delayed) {
        return { isDelayed: false, ...amount };
      }
      return {
        isDelayed: true,
        ...amount,
        // the contracts use zero for "not applicable"
        redeemer: hexEq(o.redeemerAddress, ADDRESS_0X0)
          ? undefined
          : o.redeemerAddress,
        claimableAt: o.claimableAt === 0n ? undefined : Number(o.claimableAt),
      };
    });
  }

  #liquidationApproval(
    data: OnchainLiquidationData,
    suite: CreditSuite,
    priceOracle: IPriceOracleContract,
  ): LiquidationApproval | undefined {
    const { requiredToken, requiredAmount, liquidationCall } = data;
    if (requiredAmount === 0n) {
      return undefined;
    }
    // a call targeting the credit facade is paid by msg.sender but transferred
    // by the credit manager, so the latter is the spender; any other target is
    // a dedicated liquidator contract (Midas / Securitize) that pulls the token
    // to itself and re-approves the credit manager, so it is the spender itself
    const spender = hexEq(liquidationCall.target, suite.creditFacade.address)
      ? suite.creditManager.address
      : liquidationCall.target;
    // the compressor's amount is an estimate, so the approval is buffered
    const bufferedAmount =
      (requiredAmount * (PERCENTAGE_FACTOR + LIQUIDATION_APPROVAL_BUFFER)) /
      PERCENTAGE_FACTOR;
    return {
      spender,
      ...priceOracle.toTokenAmount(requiredToken, bufferedAmount),
    };
  }

  /**
   * Everything a partial liquidation of a credit account needs, with any
   * parameter the caller pinned down taken as given and the rest derived from
   * current state. A derived `tokenOut` is never a withdrawal phantom token.
   *
   * @throws For RWA markets, whose wrapped underlying and KYC-gated collateral
   * the bare facade call cannot handle, for a withdrawal phantom `tokenOut`,
   * which does not redeem instantly, if a derived `tokenOut` cannot be picked,
   * and if the seized token is not a collateral token of the credit manager.
   **/
  #getPartialLiquidationParams(
    ca: CreditAccountData,
    suite: CreditSuite,
    overrides: Partial<PartialLiquidationParams>,
  ): PartialLiquidationParams {
    const label = this.labelAddress(ca.creditAccount);
    if (suite.market.rwa) {
      throw new Error(
        `cannot partially liquidate ${label}: RWA markets are not supported`,
      );
    }
    if (overrides.tokenOut && this.#isWithdrawalPhantom(overrides.tokenOut)) {
      throw new Error(
        `cannot partially liquidate ${label}: ${this.labelAddress(overrides.tokenOut)} is a withdrawal phantom token`,
      );
    }
    return partialLiquidationParams({
      suite,
      account: ca,
      overrides,
      exclude: token => this.#isWithdrawalPhantom(token),
    });
  }

  async #getCreditAccountData(
    creditAccount: Address,
    blockNumber?: bigint,
  ): Promise<CreditAccountData> {
    const ca = await this.sdk.accounts.getCreditAccountData(
      creditAccount,
      blockNumber,
    );
    if (!ca) {
      throw new Error(`credit account ${creditAccount} not found`);
    }
    if (!ca.success) {
      throw new Error(
        `cannot compute liquidation details for ${creditAccount}: collateral computation failed`,
      );
    }
    return ca;
  }

  // an unknown liquidator (zero address) only affects the KYC eligibility
  // fields and the receiver encoded into the calls
  async #getLiquidationData(
    ca: CreditAccountData,
    liquidator: Address = ADDRESS_0X0,
    ignoreReservePrices?: boolean,
    blockNumber?: bigint,
  ): Promise<OnchainLiquidationData> {
    const priceUpdates = await this.sdk.accounts.getOnDemandPriceUpdates(
      ca,
      ignoreReservePrices,
    );
    const { result } = await this.client.simulateContract({
      address: LIQUIDATION_COMPRESSOR_V313_ADDRESS,
      abi: iLiquidationCompressorV313Abi,
      functionName: "getLiquidationData",
      args: [liquidator, ca.creditAccount, priceUpdates],
      blockNumber,
    });
    return result;
  }

  // accounts of expired credit managers with outstanding debt are liquidatable
  // regardless of their health factor
  async #getExpiredCreditAccounts(
    blockNumber?: bigint,
  ): Promise<CreditAccountData[]> {
    const expiredCMs: Address[] = [];
    for (const market of this.sdk.marketRegister.markets) {
      // nothing borrowed === no accounts
      if (market.pool.pool.totalBorrowed === 0n) {
        continue;
      }
      for (const cm of market.creditManagers) {
        const borrowed =
          market.pool.pool.creditManagerDebtParams.get(cm.creditManager.address)
            ?.borrowed ?? 0n;
        if (cm.isExpired && borrowed > 0n) {
          expiredCMs.push(cm.creditManager.address);
        }
      }
    }
    if (expiredCMs.length === 0) {
      return [];
    }
    this.logger?.debug(
      `getting credit accounts of ${expiredCMs.length} expired credit managers`,
    );
    const accounts = await Promise.all(
      expiredCMs.map(creditManager =>
        this.sdk.accounts.getCreditAccounts(
          {
            creditManager,
            includeZeroDebt: false,
          },
          blockNumber,
        ),
      ),
    );
    return accounts.flat();
  }

  // requires the compressor's withdrawable assets cache to be loaded
  // (by attach/hydrate) so that phantom token lookups are sync
  #buildAccount(
    ca: CreditAccountData,
    suite = this.sdk.marketRegister.findCreditManager(ca.creditManager),
  ): LiquidatableAccount {
    const market = suite.market;

    // for RWA markets, values are denominated in the unwrapped asset
    // (e.g. USDC instead of dcUSDC); the wrapped underlying converts 1:1
    const unwrappedUnderlying = this.sdk.tokensMeta.unwrapRWA(suite.underlying);
    // the manager's own figure — the complement of the premium alone, which is
    // what the liquidator pays; the row's `liquidationDiscount` is the wider one
    const { liquidationDiscount } = suite.liquidationFees();

    const repaymentAmount =
      (ca.totalValue * BigInt(liquidationDiscount)) / PERCENTAGE_FACTOR;
    const estimatedProfit = ca.totalValue - repaymentAmount;

    // every amount here is denominated in the same token, so its USD value is
    // a proportion of the account's total value in USD rather than a price
    // lookup — which also keeps them consistent with the compressor's number
    const token = this.sdk.tokensMeta.mustGetToken(unwrappedUnderlying);
    const usd = (part: bigint): number =>
      ca.totalValue > 0n
        ? usdToNumber((ca.totalValueUSD * part) / ca.totalValue)
        : 0;

    return {
      ...suite.creditOperationMarket(),
      chainId: this.sdk.chainId,
      creditAccount: ca.creditAccount,
      asset: this.sdk.tokensMeta.mustGetToken(
        this.#mainAsset(ca, market, unwrappedUnderlying),
      ),
      totalValue: {
        token,
        value: ca.totalValue,
        valueUsd: usdToNumber(ca.totalValueUSD),
      },
      repaymentAmount: {
        token,
        value: repaymentAmount,
        valueUsd: usd(repaymentAmount),
      },
      estimatedProfit: {
        token,
        value: estimatedProfit,
        valueUsd: usd(estimatedProfit),
      },
      isDelayed: ca.tokens.some(
        t => t.balance > DUST_THRESHOLD && this.#isWithdrawalPhantom(t.token),
      ),
      paused: suite.creditFacade.isPaused,
      rwa: market.rwa,
    };
  }

  // requires the compressor's withdrawable assets cache to be loaded
  // (by attach/hydrate); an SDK without a withdrawal compressor has none
  #isWithdrawalPhantom(token: Address): boolean {
    return !!this.sdk.withdrawalCompressor?.getWithdrawalSourceToken(token);
  }

  // the account's dominant collateral, reported as its source asset for
  // withdrawal phantom tokens
  #mainAsset(
    ca: CreditAccountData,
    market: MarketSuite,
    fallback: Address,
  ): Address {
    const asset = dominantCollateral(ca, market);
    if (!asset) {
      return fallback;
    }
    return (
      this.sdk.withdrawalCompressor?.getWithdrawalSourceToken(asset) ?? asset
    );
  }
}
