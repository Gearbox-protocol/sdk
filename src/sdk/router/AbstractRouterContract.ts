import type { Abi, Address } from "viem";

import { BaseContract } from "../base/index.js";
import { PERCENTAGE_FACTOR } from "../constants/math.js";
import type { IPriceOracleContract } from "../market/index.js";
import { AddressMap, AddressSet, formatBN, isDust } from "../utils/index.js";
import type { IHooks } from "../utils/internal/index.js";
import { Hooks } from "../utils/internal/index.js";
import { limitLeftover } from "./helpers.js";
import type {
  Asset,
  ExpectedAndLeftoverOptions,
  RouterCASlice,
  RouterCMSlice,
  RouterHooks,
} from "./types.js";

export interface Leftovers {
  expectedBalances: AddressMap<Asset>;
  leftoverBalances: AddressMap<Asset>;
  tokensToClaim: AddressMap<Asset>;
}

export abstract class AbstractRouterContract<
    abi extends Abi | readonly unknown[],
  >
  extends BaseContract<abi>
  implements IHooks<RouterHooks>
{
  protected readonly hooks = new Hooks<RouterHooks>();

  public readonly addHook = this.hooks.addHook.bind(this.hooks);
  public readonly removeHook = this.hooks.removeHook.bind(this.hooks);

  protected getExpectedAndLeftover(
    ca: RouterCASlice,
    cm: RouterCMSlice,
    options: ExpectedAndLeftoverOptions = {},
  ): Leftovers {
    const b = options.balances
      ? options.balances
      : this.getDefaultExpectedAndLeftover(
          ca,
          options.keepAssets,
          options.debtOnly,
        );
    const { leftoverBalances, expectedBalances, tokensToClaim } = b;

    const expected: AddressMap<Asset> = new AddressMap<Asset>();
    const leftover: AddressMap<Asset> = new AddressMap<Asset>();

    for (const token of cm.collateralTokens) {
      // When we pass expected balances explicitly, we need to mimic router behaviour by filtering out leftover tokens
      // for example, we can have stETH balance of 2, because 1 transforms to 2 because of rebasing
      // https://github.com/Gearbox-protocol/router-v3/blob/c230a3aa568bb432e50463cfddc877fec8940cf5/contracts/RouterV3.sol#L222
      const actual = expectedBalances.get(token)?.balance || 0n;
      expected.upsert(token, { token, balance: actual > 10n ? actual : 0n });
      leftover.upsert(token, {
        token,
        balance:
          limitLeftover(leftoverBalances.get(token)?.balance || 1n, token) ??
          1n,
      });
    }

    return {
      expectedBalances: expected,
      leftoverBalances: leftover,
      tokensToClaim,
    };
  }

  protected getDefaultExpectedAndLeftover(
    ca: RouterCASlice,
    keepAssets?: Address[],
    debtOnly?: boolean,
  ): Leftovers {
    const expectedBalances = new AddressMap<Asset>();
    const leftoverBalances = new AddressMap<Asset>();
    const keepAssetsSet = new AddressSet(keepAssets);

    if (debtOnly) {
      const result = this.getLeftoversAfterBuyingDebt(ca, keepAssetsSet);
      if (result) {
        return result;
      } else {
        this.logger?.warn("no token found to cover debt");
      }
    }

    for (const { token, balance, mask } of ca.tokens) {
      const isEnabled = (mask & ca.enabledTokensMask) !== 0n;
      expectedBalances.upsert(token, { token, balance });
      // filter out dust, we don't want to swap it
      // also: gearbox liquidator does not need to swap disabled tokens. third-party liquidators might want to do it
      if (
        keepAssetsSet.has(token) ||
        !isEnabled ||
        isDust({
          sdk: this.sdk,
          token,
          balance,
          creditManager: ca.creditManager,
        })
      ) {
        leftoverBalances.upsert(token, {
          token,
          balance: limitLeftover(balance, token) ?? balance,
        });
      }
    }

    return {
      expectedBalances,
      leftoverBalances,
      tokensToClaim: new AddressMap<Asset>(),
    };
  }

  /**
   * Tries to sell just enought of most valuable token to cover debt
   * @param ca
   * @param keepAssets
   * @returns
   */
  protected getLeftoversAfterBuyingDebt(
    ca: RouterCASlice,
    keepAssets: AddressSet,
  ): Leftovers | undefined {
    const { priceOracle } = this.sdk.marketRegister.findByCreditManager(
      ca.creditManager,
    );

    const expectedBalances = new AddressMap<Asset>();
    const leftoverBalances = new AddressMap<Asset>();
    const usdBalances: Asset[] = [];

    for (const { token, balance, mask } of ca.tokens) {
      const isEnabled = (mask & ca.enabledTokensMask) !== 0n;
      expectedBalances.upsert(token, { token, balance });
      leftoverBalances.upsert(token, {
        token,
        balance: limitLeftover(balance, token) ?? balance,
      });
      if (isEnabled && !keepAssets.has(token)) {
        usdBalances.push({
          token,
          balance: this.safeConvertToUSD(priceOracle, token, balance),
        });
      }
    }

    usdBalances.sort((a, b) => {
      if (a.balance > b.balance) return -1;
      if (a.balance < b.balance) return 1;
      return 0;
    });

    if (usdBalances.length === 0) {
      return undefined;
    }

    // found token with highest balance in USD which is not in keepAssets and is enabled
    const highestToken = usdBalances[0];
    const lt = this.sdk.marketRegister
      .findCreditManager(ca.creditManager)
      .creditManager.liquidationThresholds.mustGet(highestToken.token);
    const requiredDebtUSD = (ca.totalDebtUSD * PERCENTAGE_FACTOR) / BigInt(lt);

    if (highestToken.balance < requiredDebtUSD) {
      return undefined;
    }
    const tokenAmount = this.safeConvertFromUSD(
      priceOracle,
      highestToken.token,
      requiredDebtUSD,
    );
    if (tokenAmount === 0n) {
      return undefined;
    }
    let leftoverBalance =
      leftoverBalances.get(highestToken.token)?.balance ?? 0n;
    leftoverBalance -= tokenAmount;
    if (leftoverBalance < 0n) {
      return undefined;
    }
    leftoverBalances.upsert(highestToken.token, {
      token: highestToken.token,
      balance: leftoverBalance,
    });
    const tokenAmountStr = this.sdk.tokensMeta.formatBN(
      highestToken.token,
      tokenAmount,
      { symbol: true },
    );
    const totalDebtUSDStr = formatBN(ca.totalDebtUSD, 8);
    this.logger?.debug(
      `will sell ${tokenAmountStr} (LT=${lt}) to cover debt of ${totalDebtUSDStr} USD`,
    );

    return {
      expectedBalances,
      leftoverBalances,
      tokensToClaim: new AddressMap<Asset>(),
    };
  }

  protected safeConvertToUSD(
    priceOracle: IPriceOracleContract,
    token: Address,
    balance: bigint,
  ): bigint {
    try {
      return priceOracle.convertToUSD(token, balance);
    } catch {
      try {
        return priceOracle.convertToUSD(token, balance, true);
      } catch {
        return 0n;
      }
    }
  }

  protected safeConvertFromUSD(
    priceOracle: IPriceOracleContract,
    token: Address,
    balance: bigint,
  ): bigint {
    try {
      return priceOracle.convertFromUSD(token, balance);
    } catch {
      try {
        return priceOracle.convertFromUSD(token, balance, true);
      } catch {
        return 0n;
      }
    }
  }
}
