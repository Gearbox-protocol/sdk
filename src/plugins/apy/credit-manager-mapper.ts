import type { Address } from "viem";
import type {
  PoolSlice,
  QuotaSlice,
  TokenSlice,
} from "../../common-utils/utils/strategies/strategy-info/types.js";
import type { CreditManagerDataSlice } from "../../common-utils/utils/strategies/types.js";
import {
  ADDRESS_0X0,
  type NetworkType,
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  RAY,
} from "../../sdk/index.js";
import type { CreditSuite } from "../../sdk/market/credit/CreditSuite.js";
import type { PoolSuite } from "../../sdk/market/pool/PoolSuite.js";

const lc = (address: Address): Address => address.toLowerCase() as Address;

export function toCreditManagerDataSlice(
  cs: CreditSuite,
  pool: PoolSuite,
  network: NetworkType,
  chainId: number,
): CreditManagerDataSlice {
  const cm = cs.creditManager;
  const facade = cs.creditFacade;
  const debtParams = pool.pool.creditManagerDebtParams.get(cm.address);

  const liquidationThresholds: Record<Address, bigint> = {};
  const supportedTokens: Record<Address, true> = {};
  const forbiddenTokens: Record<Address, true> = {};
  const usableTokens: Record<Address, true> = {};
  const quotas: Record<Address, QuotaSlice> = {};

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

  for (const token of cm.collateralTokens) {
    const tokenLc = lc(token);
    const isForbidden = !!forbiddenTokens[tokenLc];
    const zeroLt = liquidationThresholds[tokenLc] === 0n;
    const quota = quotas[tokenLc];
    const quotaNotActive = quota?.isActive === false;

    if (!isForbidden && !zeroLt && !quotaNotActive) {
      usableTokens[tokenLc] = true;
    }
  }

  const adapters: Record<
    Address,
    {
      address: Address;
      contractType: string;
      version: number;
      name: string;
      targetContract: Address;
    }
  > = {};
  const contractsByAdapter: Record<Address, Address> = {};

  for (const [, adapter] of cm.adapters.entries()) {
    const adapterAddress = lc(adapter.address);
    const targetContract = lc(adapter.targetContract);

    adapters[targetContract] = {
      address: adapterAddress,
      contractType: adapter.contractType,
      version: adapter.version,
      name: adapter.name,
      targetContract,
    };
    contractsByAdapter[adapterAddress] = targetContract;
  }

  const baseBorrowRate = debtParams
    ? Number(
        (pool.pool.baseInterestRate *
          (BigInt(cm.feeInterest) + PERCENTAGE_FACTOR) *
          PERCENTAGE_DECIMALS) /
          RAY,
      )
    : 0;

  const result: CreditManagerDataSlice = {
    address: lc(cm.address),
    underlyingToken: lc(cm.underlying),
    pool: lc(cm.pool),
    chainId,
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

    network,
    creditFacade: lc(cm.creditFacade),
    creditConfigurator: lc(cm.creditConfigurator),
    version: Number(facade.version),
    isPaused: facade.isPaused,
    forbiddenTokenMask: facade.forbiddenTokensMask,
    isBorrowingForbidden: facade.maxDebtPerBlockMultiplier === 0,
    maxEnabledTokensLength: cm.maxEnabledTokens,
    name: cm.name,
    marketConfigurator: lc(cs.marketConfigurator),
    feeLiquidation: cm.feeLiquidation,
    liquidationDiscount: cm.liquidationDiscount,
    feeLiquidationExpired: cm.feeLiquidationExpired,
    liquidationDiscountExpired: cm.liquidationDiscountExpired,
    supportedTokens,
    usableTokens,
    forbiddenTokens,
    adapters,
    contractsByAdapter,

    isQuoted(token: Address) {
      return !!this.quotas[lc(token)]?.isActive;
    },
    isForbidden(token: Address) {
      return !!this.forbiddenTokens[lc(token)];
    },
  };

  return result;
}

export function toPoolSlice(pool: PoolSuite): PoolSlice {
  return {
    address: lc(pool.pool.address),
    totalDebtLimit: pool.pool.totalDebtLimit,
    totalBorrowed: pool.pool.totalBorrowed,
  };
}

export function buildTokenDataList(tokensMeta: {
  entries(): Iterable<[Address, { decimals: number }]>;
}): Record<Address, TokenSlice> {
  const tokenDataList: Record<Address, TokenSlice> = {};

  for (const [addr, meta] of tokensMeta.entries()) {
    const address = lc(addr);
    tokenDataList[address] = { address, decimals: meta.decimals };
  }

  return tokenDataList;
}
