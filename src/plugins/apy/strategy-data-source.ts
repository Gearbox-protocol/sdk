import type { Address } from "viem";

import type {
  StrategyCreditManagerView,
  StrategyDataSource,
  StrategyPoolView,
  StrategyTokenView,
} from "../../common-utils/utils/strategies/types.js";
import {
  ADDRESS_0X0,
  AP_WETH_TOKEN,
  NATIVE_ADDRESS,
  type OnchainSDK,
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  RAY,
} from "../../sdk/index.js";
import type { CreditSuite } from "../../sdk/market/credit/CreditSuite.js";
import type { MarketSuite } from "../../sdk/market/MarketSuite.js";
import type { PoolSuite } from "../../sdk/market/pool/PoolSuite.js";

const lc = (address: Address): Address => address.toLowerCase() as Address;

export class OnchainSdkStrategyDataSource
  implements StrategyDataSource<StrategyCreditManagerView>
{
  constructor(private readonly sdk: OnchainSDK) {}

  public hasToken(chainId: number, token: Address): boolean {
    return !!this.getToken(chainId, token);
  }

  public getToken(
    chainId: number,
    token: Address,
  ): StrategyTokenView | undefined {
    if (chainId !== this.sdk.chainId) return undefined;

    const meta = this.sdk.tokensMeta.get(token);
    if (!meta) return undefined;

    const address = lc(token);
    return { address, decimals: meta.decimals, symbol: meta.symbol };
  }

  public getPool(chainId: number, pool: Address): StrategyPoolView | undefined {
    if (chainId !== this.sdk.chainId) return undefined;

    const market = this.sdk.marketRegister.markets.find(
      m => lc(m.pool.pool.address) === lc(pool),
    );
    if (!market) return undefined;

    const linearModel = market.pool.linearModel;
    return {
      address: lc(market.pool.pool.address),
      totalDebtLimit: market.pool.pool.totalDebtLimit,
      totalBorrowed: market.pool.pool.totalBorrowed,
      expectedLiquidity: market.pool.pool.expectedLiquidity,
      availableLiquidity: market.pool.pool.availableLiquidity,
      interestModel: {
        interestModel: market.pool.interestRateModel.address,
        U_1: BigInt(linearModel.U1),
        U_2: BigInt(linearModel.U2),
        R_base: BigInt(linearModel.Rbase),
        R_slope1: BigInt(linearModel.Rslope1),
        R_slope2: BigInt(linearModel.Rslope2),
        R_slope3: BigInt(linearModel.Rslope3),
        version: Number(linearModel.version),
        isBorrowingMoreU2Forbidden: linearModel.isBorrowingMoreU2Forbidden,
      },
    };
  }

  public getCreditManager(
    chainId: number,
    creditManager: Address,
  ): StrategyCreditManagerView | undefined {
    if (chainId !== this.sdk.chainId) return undefined;

    try {
      const found = this.findCreditManager(creditManager);
      if (!found) return undefined;

      return this.toCreditManagerView(found.creditSuite, found.market.pool);
    } catch {
      return undefined;
    }
  }

  public getMarketPrices(
    chainId: number,
    pool: Address,
  ): Record<Address, bigint> {
    if (chainId !== this.sdk.chainId) return {};

    const market = this.sdk.marketRegister.markets.find(
      m => lc(m.pool.pool.address) === lc(pool),
    );
    if (!market) return {};

    const marketPrices = Object.fromEntries(
      market.priceOracle.mainPrices.entries().map(([token, mainPrice]) => {
        const tokenLc = lc(token);
        const reservePrice = market.priceOracle.reservePrices?.get(token);

        return [tokenLc, mainPrice?.price || reservePrice?.price || 0n];
      }),
    );

    const wrappedNativeToken = this.getWrappedNativeToken();
    const wrappedNativePrice = marketPrices[wrappedNativeToken || ADDRESS_0X0];
    if (wrappedNativePrice !== undefined) {
      marketPrices[lc(NATIVE_ADDRESS)] = wrappedNativePrice;
    }

    return marketPrices;
  }

  public getLastSyncTimestamp(chainId: number): number | undefined {
    return chainId === this.sdk.chainId
      ? Number(this.sdk.timestamp)
      : undefined;
  }

  private toCreditManagerView(
    cs: CreditSuite,
    pool: PoolSuite,
  ): StrategyCreditManagerView {
    const cm = cs.creditManager;
    const facade = cs.creditFacade;
    const debtParams = pool.pool.creditManagerDebtParams.get(cm.address);
    const liquidationThresholds: Record<Address, bigint> = {};
    const supportedTokens: Record<Address, true> = {};
    const forbiddenTokens: Record<Address, true> = {};
    const quotas: StrategyCreditManagerView["quotas"] = {};

    for (const [token, q] of pool.pqk.quotas.entries()) {
      const tokenLc = lc(token);
      quotas[tokenLc] = {
        token: tokenLc,
        rate: BigInt(q.rate) * PERCENTAGE_DECIMALS,
        quotaIncreaseFee: BigInt(q.quotaIncreaseFee),
        totalQuoted: q.totalQuoted,
        limit: q.limit,
        isActive: q.isActive,
      };
    }

    for (const token of cm.collateralTokens) {
      const tokenLc = lc(token);
      const lt = cm.liquidationThresholds.get(token);
      if (lt !== undefined) {
        liquidationThresholds[tokenLc] = BigInt(lt);
      }
      supportedTokens[tokenLc] = true;
    }

    const forbiddenMask = facade.forbiddenTokensMask;
    for (let i = 0; i < cm.collateralTokens.length; i++) {
      const tokenLc = lc(cm.collateralTokens[i]);
      if ((forbiddenMask & (1n << BigInt(i))) !== 0n) {
        forbiddenTokens[tokenLc] = true;
      }
    }

    const baseBorrowRate = debtParams
      ? Number(
          (pool.pool.baseInterestRate *
            (BigInt(cm.feeInterest) + PERCENTAGE_FACTOR) *
            PERCENTAGE_DECIMALS) /
            RAY,
        )
      : 0;

    return {
      address: lc(cm.address),
      underlyingToken: lc(cm.underlying),
      pool: lc(cm.pool),
      chainId: this.sdk.chainId,
      baseBorrowRate,
      feeInterest: cm.feeInterest,
      availableToBorrow: debtParams?.available ?? 0n,
      minDebt: facade.minDebt,
      maxDebt: facade.maxDebt,
      totalDebt: debtParams?.borrowed ?? 0n,
      totalDebtLimit: debtParams?.limit ?? 0n,
      isDegenMode: lc(facade.degenNFT) !== ADDRESS_0X0,
      degenNFT: lc(facade.degenNFT),
      liquidationThresholds,
      quotas,
      collateralTokens: cm.collateralTokens.map(lc),
      maxEnabledTokensLength: cm.maxEnabledTokens,
      version: Number(facade.version),
      isBorrowingForbidden: facade.maxDebtPerBlockMultiplier === 0,
      marketConfigurator: lc(cs.marketConfigurator),
      supportedTokens,
      forbiddenTokens,
      name: cs.name,
      isPaused: facade.isPaused,
      isQuoted: (token: Address) => quotas[token] !== undefined,
      isForbidden: (token: Address) => forbiddenTokens[token] === true,
    };
  }

  private findCreditManager(creditManager: Address):
    | {
        creditSuite: CreditSuite;
        market: { pool: PoolSuite };
      }
    | undefined {
    const marketRegister = this.sdk.marketRegister as {
      markets: MarketSuite[];
      findCreditManager?: (creditManager: Address) => CreditSuite;
      findByCreditManager?: (creditManager: Address) => MarketSuite;
    };

    if (
      marketRegister.findCreditManager &&
      marketRegister.findByCreditManager
    ) {
      const creditSuite = marketRegister.findCreditManager(creditManager);
      const market = marketRegister.findByCreditManager(
        creditSuite.creditManager.address,
      );
      return { creditSuite, market };
    }

    const cmLc = lc(creditManager);
    for (const market of marketRegister.markets) {
      const creditSuite = market.creditManagers.find(
        cs => lc(cs.creditManager.address) === cmLc,
      );
      if (creditSuite) return { creditSuite, market };
    }

    return undefined;
  }

  private getWrappedNativeToken(): Address | undefined {
    try {
      return this.sdk.addressProvider
        .getAddress(AP_WETH_TOKEN, 0)
        ?.toLowerCase() as Address | undefined;
    } catch {
      return undefined;
    }
  }
}
