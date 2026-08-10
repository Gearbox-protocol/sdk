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
import { ADDRESS_0X0, PERCENTAGE_FACTOR, WAD } from "../../constants/index.js";
import type {
  CreditSuite,
  IPriceOracleContract,
  MarketSuite,
} from "../../market/index.js";
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
import { AddressSet, bytes32ToString, hexEq } from "../../utils/index.js";
import type { WithdrawalOutput } from "../withdrawal-compressor/index.js";
import {
  DUST_THRESHOLD,
  LIQUIDATION_APPROVAL_BUFFER,
  LIQUIDATION_COMPRESSOR_V313_ADDRESS,
} from "./constants.js";
import type {
  BuildLiquidationTxProps,
  GetLiquidatableAccountsProps,
  GetLiquidationDetailsProps,
  GetLiquidationPositionsProps,
  OnchainLiquidationData,
  OnchainLiquidationOutput,
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
   * Accounts whose collateral computation failed are excluded.
   **/
  public async getLiquidatableAccounts(
    props?: GetLiquidatableAccountsProps,
  ): Promise<LiquidatableAccount[]> {
    await this.sdk.withdrawalCompressor?.loadWithdrawableAssets();

    const unhealthy = await this.sdk.accounts.getCreditAccounts({
      maxHealthFactor: WAD - 1n,
      includeZeroDebt: false,
    });
    const seen = new AddressSet(unhealthy.map(ca => ca.creditAccount));
    let expired = await this.#getExpiredCreditAccounts();
    expired = expired.filter(ca => !seen.has(ca.creditAccount));

    return [...unhealthy, ...expired]
      .flatMap(ca => {
        // collateral computation reverted (e.g. dead price feed) — amounts
        // cannot be computed, such accounts are excluded from the list
        if (!ca.success) {
          this.logger?.warn(
            `cannot compute liquidation details for ${ca.creditAccount}: collateral computation failed`,
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
    const { creditAccount, liquidator, ignoreReservePrices } = props;
    const ca = await this.#getCreditAccountData(creditAccount);
    const suite = this.sdk.marketRegister.findCreditManager(ca.creditManager);
    const { priceOracle } = suite.market;

    await this.sdk.withdrawalCompressor?.loadWithdrawableAssets();
    const account = this.#buildAccount(ca, suite);
    const data = await this.#getLiquidationData(
      ca,
      liquidator,
      ignoreReservePrices,
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
    const { creditAccount, liquidator, ignoreReservePrices } = props;
    const ca = await this.#getCreditAccountData(creditAccount);
    const { liquidationCall } = await this.#getLiquidationData(
      ca,
      liquidator,
      ignoreReservePrices,
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
    await compressor.loadWithdrawableAssets();
    // the same phantom token can be configured in several credit managers;
    // duplicates would double-count redeemers in the compressor's loop
    const phantomTokens = new AddressSet(
      compressor.getWithdrawableAssets().map(a => a.withdrawalPhantomToken),
    );
    const { claimable, pending } =
      await compressor.getExternalAccountCurrentWithdrawals(
        props.liquidator,
        ...phantomTokens.asArray(),
      );
    const chainId = this.sdk.chainId;

    return [
      ...claimable.map(w => ({
        kind: "liquidation" as const,
        chainId,
        sourceToken: this.sdk.tokensMeta.mustGetToken(w.token),
        output: this.#withdrawalOutput(w.outputs, w.token),
        claimTx: this.#claimTx(w.claimCalls, w.token),
        redeemer: w.redeemer,
      })),
      ...pending.map(w => ({
        kind: "liquidation" as const,
        chainId,
        sourceToken: this.sdk.tokensMeta.mustGetToken(w.token),
        output: this.#withdrawalOutput(w.expectedOutputs, w.token),
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
  public async loadRWALiquidators(): Promise<void> {
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
  // token no oracle prices is reported without a USD value, the same
  // degradation `safeUsdValue` applies to a dead feed
  #anyMarketTokenAmount(token: Address, value: bigint): TokenAmount {
    const meta = this.sdk.tokensMeta.mustGetToken(token);
    for (const market of this.sdk.marketRegister.markets) {
      const valueUsd = market.priceOracle.safeUsdValue(token, value);
      if (valueUsd !== null) {
        return { token: meta, value, valueUsd };
      }
    }
    return { token: meta, value, valueUsd: null };
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
    return {
      spender,
      ...priceOracle.toTokenAmount(
        requiredToken,
        (requiredAmount * (PERCENTAGE_FACTOR + LIQUIDATION_APPROVAL_BUFFER)) /
          PERCENTAGE_FACTOR,
      ),
    };
  }

  async #getCreditAccountData(
    creditAccount: Address,
  ): Promise<CreditAccountData> {
    const ca = await this.sdk.accounts.getCreditAccountData(creditAccount);
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
    });
    return result;
  }

  // accounts of expired credit managers with outstanding debt are liquidatable
  // regardless of their health factor
  async #getExpiredCreditAccounts(): Promise<CreditAccountData[]> {
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
        this.sdk.accounts.getCreditAccounts({
          creditManager,
          includeZeroDebt: false,
        }),
      ),
    );
    return accounts.flat();
  }

  // requires the compressor's withdrawable assets cache to be loaded
  // (see `loadWithdrawableAssets`) so that phantom token lookups are sync
  #buildAccount(
    ca: CreditAccountData,
    suite = this.sdk.marketRegister.findCreditManager(ca.creditManager),
  ): LiquidatableAccount {
    const market = suite.market;

    // for RWA markets, values are denominated in the unwrapped asset
    // (e.g. USDC instead of dcUSDC); the wrapped underlying converts 1:1
    const unwrappedUnderlying = this.sdk.tokensMeta.unwrapRWA(suite.underlying);
    const liquidationDiscount = suite.isExpired
      ? suite.creditManager.liquidationDiscountExpired
      : suite.creditManager.liquidationDiscount;

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
      chainId: this.sdk.chainId,
      creditAccount: ca.creditAccount,
      creditManager: ca.creditManager,
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
        t =>
          t.balance > DUST_THRESHOLD &&
          !!this.sdk.withdrawalCompressor?.getWithdrawalSourceToken(t.token),
      ),
      paused: suite.creditFacade.isPaused,
      rwa: market.rwa,
    };
  }

  // the most valuable enabled non-underlying collateral above dust, reported
  // as its source asset for withdrawal phantom tokens
  #mainAsset(
    ca: CreditAccountData,
    market: MarketSuite,
    fallback: Address,
  ): Address {
    let bestValue = 0;
    let asset: Address | undefined;
    for (const t of ca.tokens) {
      if (
        hexEq(t.token, ca.underlying) ||
        (t.mask & ca.enabledTokensMask) === 0n ||
        t.balance <= DUST_THRESHOLD
      ) {
        continue;
      }
      // a token the oracle cannot price does not win the comparison
      const value = market.priceOracle.safeUsdValue(t.token, t.balance) ?? 0;
      if (value > bestValue) {
        bestValue = value;
        asset = t.token;
      }
    }
    if (!asset) {
      return fallback;
    }
    return (
      this.sdk.withdrawalCompressor?.getWithdrawalSourceToken(asset) ?? asset
    );
  }
}
