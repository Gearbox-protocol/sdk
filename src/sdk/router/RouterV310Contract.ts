import { type Address, getAddress } from "viem";

import { iGearboxRouterV310Abi } from "../../abi/routerV310.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import { BigIntMath } from "../sdk-legacy/index.js";
import { AddressMap } from "../utils/AddressMap.js";
import type { Leftovers } from "./AbstractRouterContract.js";
import { AbstractRouterContract } from "./AbstractRouterContract.js";
import { assetsMap, balancesMap } from "./helpers.js";
import type {
  Asset,
  FindAllSwapsProps,
  FindBestClosePathProps,
  FindClosePathInput,
  FindOneTokenPathProps,
  FindOpenStrategyPathProps,
  IRouterContract,
  OpenStrategyResult,
  RouterCASlice,
  RouterCloseResult,
  RouterCMSlice,
  RouterResult,
} from "./types.js";

const abi = iGearboxRouterV310Abi;
type abi = typeof abi;

const ERR_NOT_IMPLEMENTED = new Error("Not implemented in router v3.1");

interface TokenData {
  token: Address;
  balance: bigint;
  leftoverBalance: bigint;
  numSplits: bigint;
}

export class RouterV310Contract
  extends AbstractRouterContract<abi>
  implements IRouterContract
{
  constructor(sdk: GearboxSDK, address: Address) {
    super(sdk, {
      addr: address,
      name: "RouterV310",
      abi,
    });
  }

  /**
   * Implements {@link IRouterContract.findOneTokenPath}
   */
  async findOneTokenPath(props: FindOneTokenPathProps): Promise<RouterResult> {
    const {
      creditAccount,
      creditManager,
      amount,
      slippage,
      tokenIn,
      tokenOut,
    } = props;
    const numSplits = this.#numSplitsGetter(
      creditManager,
      creditAccount.tokens,
    )(tokenIn);
    this.logger?.debug(
      {
        creditAccount: creditAccount.creditAccount,
        creditManager: this.labelAddress(creditManager.address),
        tokenIn: this.labelAddress(tokenIn),
        target: this.labelAddress(tokenOut),
        amount,
        slippage,
        numSplits,
      },
      "calling routeOneToOne",
    );
    const { result } = await this.contract.simulate.routeOneToOne([
      creditAccount.creditAccount,
      tokenIn,
      amount,
      tokenOut,
      BigInt(slippage),
      numSplits,
    ]);

    return {
      amount: result.amount,
      minAmount: result.minAmount,
      calls: [...result.calls],
    };
  }

  /**
   * Implements {@link IRouterContract.findOpenStrategyPath}
   */
  public async findOpenStrategyPath(
    props: FindOpenStrategyPathProps,
  ): Promise<OpenStrategyResult> {
    const {
      creditManager: cm,
      expectedBalances,
      leftoverBalances,
      target,
      slippage,
    } = props;
    const [expectedMap, leftoverMap] = [
      balancesMap(expectedBalances),
      balancesMap(leftoverBalances),
    ];

    const getNumSplits = this.#numSplitsGetter(cm, expectedBalances);

    const tData = cm.collateralTokens.map(
      (token): TokenData => ({
        token,
        balance: expectedMap.get(token) ?? 0n,
        leftoverBalance: leftoverMap.get(token) ?? 0n,
        numSplits: getNumSplits(token),
      }),
    );
    this.logger?.debug(
      {
        creditManager: this.labelAddress(cm.address),
        target: this.labelAddress(target),
        slippage,
        tData: this.#debugTokenData(tData),
      },
      "calling routeOpenManyToOne",
    );

    const { result } = await this.contract.simulate.routeOpenManyToOne([
      cm.address,
      target,
      BigInt(slippage),
      tData,
    ]);
    return {
      balances: balancesAfterOpen(
        target,
        result.amount,
        expectedMap,
        leftoverMap,
      ),
      minBalances: balancesAfterOpen(
        target,
        result.minAmount,
        expectedMap,
        leftoverMap,
      ),
      amount: result.amount,
      minAmount: result.minAmount,
      calls: [...result.calls],
    };
  }

  /**
   * Implements {@link IRouterContract.findBestClosePath}
   */
  public async findBestClosePath(
    props: FindBestClosePathProps,
  ): Promise<RouterCloseResult> {
    const { creditAccount: ca, creditManager: cm, slippage, balances } = props;
    const { expectedBalances, leftoverBalances } = this.getExpectedAndLeftover(
      ca,
      cm,
      balances
        ? {
            expectedBalances: assetsMap(balances.expectedBalances),
            leftoverBalances: assetsMap(balances.leftoverBalances),
          }
        : undefined,
    );
    const getNumSplits = this.#numSplitsGetter(cm, expectedBalances.values());
    const tData: TokenData[] = [];
    for (const token of cm.collateralTokens) {
      tData.push({
        token,
        balance: expectedBalances.get(token)?.balance || 0n,
        leftoverBalance: leftoverBalances.get(token)?.balance || 0n,
        numSplits: getNumSplits(token),
      });
    }

    this.logger?.debug(
      {
        creditAccount: ca.creditAccount,
        creditManager: this.labelAddress(cm.address),
        target: this.labelAddress(ca.underlying),
        slippage,
        tData: this.#debugTokenData(tData),
      },
      "calling routeManyToOne",
    );

    const { result } = await this.contract.simulate.routeManyToOne([
      cm.address,
      ca.underlying,
      BigInt(slippage),
      tData,
    ]);
    const underlyingBalance =
      ca.tokens.find(t => t.token === ca.underlying)?.balance ?? 0n;
    return {
      underlyingBalance: underlyingBalance + result.minAmount,
      amount: result.amount,
      minAmount: result.minAmount,
      calls: [...result.calls],
    };
  }

  #numSplitsGetter(
    creditManager: RouterCMSlice,
    assets: Asset[] | readonly Asset[],
  ): (token: Address) => bigint {
    // General explanation of numSplits logic according to router author:
    //
    // numSplits does not depend on the specific action, rather it depends more on the value of tokens to be swapped.
    // If this is the main collateral on the account, I recommend 4-5. For the rest 1.
    // If sdk has token prices on hand when generating tokenData,
    // you can make a more general rule - for example, 1 split for every $200-300k in token (but minimum 1).
    // But it still depends on the liquidity of a particular token, actually, so it might be too complicated.
    const { priceOracle } = this.sdk.marketRegister.findByCreditManager(
      creditManager.address,
    );

    // Filter out dust, and sort by usd balance descending
    const inUSD = assets
      .filter(({ token, balance }) => {
        const decimals = this.sdk.tokensMeta.decimals(token);
        const minBalance = 10n ** BigInt(Math.max(8, decimals) - 8);
        return balance >= minBalance;
      })
      .map(({ token, balance }) => {
        return {
          token,
          balance: priceOracle.convertToUSD(token, balance),
        };
      })
      .sort((a, b) => {
        return b.balance > a.balance ? -1 : 1;
      });

    const map = new AddressMap<bigint>(
      inUSD.map(({ token }, i) => [token, i === 0 ? 4n : 1n]),
    );
    return (token: Address) => map.get(token) ?? 1n;
  }

  #debugTokenData(tData: TokenData[]): Record<string, any>[] {
    return tData.map(t => ({
      token: this.labelAddress(t.token),
      balance: this.sdk.tokensMeta.formatBN(t.token, t.balance),
      leftoverBalance: this.sdk.tokensMeta.formatBN(t.token, t.leftoverBalance),
      numSplits: t.numSplits,
    }));
  }

  /**
   * Implements {@link IRouterContract.findAllSwaps}
   * @deprecated v3.0 legacy method
   */
  public findAllSwaps(props: FindAllSwapsProps): Promise<RouterResult[]> {
    throw ERR_NOT_IMPLEMENTED;
  }

  /**
   * Implements {@link IRouterContract.getAvailableConnectors}
   * @deprecated v3.0 legacy method
   */
  public getAvailableConnectors(collateralTokens: Address[]): Address[] {
    throw ERR_NOT_IMPLEMENTED;
  }

  /**
   * Implements {@link IRouterContract.getFindClosePathInput}
   * @deprecated v3.0 legacy method
   */
  public getFindClosePathInput(
    ca: RouterCASlice,
    cm: RouterCMSlice,
    balances?: Leftovers,
  ): FindClosePathInput {
    throw ERR_NOT_IMPLEMENTED;
  }
}

/**
 * Calculates balances after opening Credit Account
 * @example
 * Expected balances: 1000 DAI, 1000 USDC, 1000 USDe, 10000 USDT (debt); leftover balances: 1000 USDC.
 * We want to swap everything into USDe after opening.
 *
 * Then, the path will swap:
 * 1000 DAI, 10000 USDT → 11000 USDe
 *
 * Now we need to build a balance list:
 * The entire leftover balances (1000 USDC) + expected 1000 USDe + from path 11000 USDe,
 * where instead of leftover we take min(expected[i], leftover[i]),
 * so, if the leftover balance is greater than expected balance, expected will be chosen, and vice versa.
 * @param target - target token (output of router)
 * @param targetAmount - amount of target token (output of router)
 * @param expected - expected balances (input of router)
 * @param leftover - leftover balances (input of router)
 * @returns balances after the action
 */
function balancesAfterOpen(
  target: Address,
  targetAmount: bigint,
  expected: AddressMap<bigint>,
  leftover: AddressMap<bigint>,
): Record<Address, bigint> {
  const result: Record<Address, bigint> = {};
  const targetAddr = getAddress(target);
  const tokens = new Set<Address>([
    ...expected.keys(),
    ...leftover.keys(),
    targetAddr,
  ]);
  for (const t of tokens) {
    if (t === targetAddr) {
      result[t] = expected.get(t) ?? 0n + targetAmount;
    } else {
      result[t] = BigIntMath.min(expected.get(t) ?? 0n, leftover.get(t) ?? 0n);
    }
  }
  return result;
}
