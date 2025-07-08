import { type Address, encodeFunctionData, getAddress } from "viem";

import { iGearboxRouterV310Abi } from "../../abi/routerV310.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import { BigIntMath } from "../sdk-legacy/index.js";
import { AddressMap } from "../utils/AddressMap.js";
import { formatBN } from "../utils/formatter.js";
import type { Leftovers } from "./AbstractRouterContract.js";
import { AbstractRouterContract } from "./AbstractRouterContract.js";
import { assetsMap, balancesMap } from "./helpers.js";
import type {
  Asset,
  FindAllSwapsProps,
  FindBestClosePathProps,
  FindClaimAllRewardsProps,
  FindClosePathInput,
  FindOneTokenPathProps,
  FindOpenStrategyPathProps,
  IRouterContract,
  OpenStrategyResult,
  RouterCASlice,
  RouterCloseResult,
  RouterCMSlice,
  RouterResult,
  RouterRewardsResult,
} from "./types.js";

const abi = iGearboxRouterV310Abi;
type abi = typeof abi;

const ERR_NOT_IMPLEMENTED = new Error("Not implemented in router v3.1");

interface TokenData {
  token: Address;
  balance: bigint;
  leftoverBalance: bigint;
  numSplits: bigint;
  claimRewards: boolean;
}

export class RouterV310Contract
  extends AbstractRouterContract<abi>
  implements IRouterContract
{
  #numSplits = new AddressMap<bigint>();
  #defaultNumSplits = 4n;

  constructor(sdk: GearboxSDK, address: Address, version: number) {
    super(sdk, {
      addr: address,
      name: "RouterV310",
      abi,
      version,
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
        claimRewards: false,
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
   * Implements {@link IRouterContract.findClaimAllRewards}
   */
  public async findClaimAllRewards(
    props: FindClaimAllRewardsProps,
  ): Promise<RouterRewardsResult> {
    const tData: Array<TokenData> = props.creditAccount.tokens.map(a => ({
      balance: 0n,
      claimRewards: true,
      leftoverBalance: 0n,
      numSplits: 1n,
      token: a.token,
    }));

    const { result } = await this.contract.simulate.processClaims([
      props.creditAccount.creditAccount,
      tData,
    ]);

    return {
      calls: [...result],
    };
  }

  /**
   * Implements {@link IRouterContract.findBestClosePath}
   */
  public async findBestClosePath(
    props: FindBestClosePathProps,
  ): Promise<RouterCloseResult> {
    const { creditAccount: ca, creditManager: cm, slippage, balances } = props;
    const { expectedBalances, leftoverBalances, tokensToClaim } =
      this.getExpectedAndLeftover(
        ca,
        cm,
        balances
          ? {
              expectedBalances: assetsMap(balances.expectedBalances),
              leftoverBalances: assetsMap(balances.leftoverBalances),
              tokensToClaim: assetsMap(balances.tokensToClaim || []),
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
        claimRewards: !!tokensToClaim.get(token),
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

    const targetToken = ca.underlying;

    const filtered = tData.filter(b => {
      return (
        (b.balance > 10 && b.balance - b.leftoverBalance > 1) ||
        !!b.claimRewards
      );
    });
    // if swap task is empty or input token === target token - return hardcoded empty result
    const skipSwap =
      filtered.length === 0 ||
      (filtered.length === 1 &&
        filtered[0].token.toLowerCase() === targetToken.toLowerCase());

    const { result } = await (skipSwap
      ? {
          result: {
            amount: 0n,
            minAmount: 0n,
            calls: [],
          },
        }
      : this.contract.simulate.routeManyToOne([
          ca.creditAccount,
          targetToken,
          BigInt(slippage),
          tData,
        ]));

    const underlyingBalance =
      ca.tokens.find(t => t.token === ca.underlying)?.balance ?? 0n;

    return {
      underlyingBalance: underlyingBalance + result.minAmount,
      amount: result.amount,
      minAmount: result.minAmount,
      calls: [...result.calls],
    };
  }

  /**
   * v310-specific method to set explicitly number of splits for a token
   * @param token
   * @param numSplits
   */
  public setNumSplits(token: Address, numSplits: bigint): void {
    this.#numSplits.upsert(token, numSplits);
  }

  /**
   * v310-specific method to set default number of splits for a token
   * @param numSplits
   */
  public setDefaultNumSplits(numSplits: bigint): void {
    this.#defaultNumSplits = numSplits;
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
        return a.balance > b.balance ? -1 : 1;
      });

    this.logger?.debug(
      inUSD.map(v => ({
        token: this.labelAddress(v.token),
        balance: `${formatBN(v.balance, 8)} (${v.balance})`,
      })),
      "balances in usd",
    );

    const map = new AddressMap<bigint>(
      inUSD.map(({ token }, i) => [
        token,
        i === 0 ? this.#defaultNumSplits : 1n,
      ]),
    );
    // override with explicitly set numSplits
    for (const [token, numSplits] of this.#numSplits.entries()) {
      map.upsert(token, numSplits);
    }
    return (token: Address) => map.get(token) ?? 1n;
  }

  #debugTokenData(tData: TokenData[]): Record<string, any>[] {
    return tData.map(t => ({
      token: this.labelAddress(t.token),
      balance: `${this.sdk.tokensMeta.formatBN(t.token, t.balance)} (${
        t.balance
      })`,
      leftoverBalance:
        this.sdk.tokensMeta.formatBN(t.token, t.leftoverBalance) +
        ` (${t.leftoverBalance})`,
      numSplits: t.numSplits,
      claimRewards: t.claimRewards,
    }));
  }

  /**
   * Implements {@link IRouterContract.findAllSwaps}
   * @deprecated v3.0 legacy method
   */
  public findAllSwaps(_: FindAllSwapsProps): Promise<RouterResult[]> {
    throw ERR_NOT_IMPLEMENTED;
  }

  /**
   * Implements {@link IRouterContract.getAvailableConnectors}
   * @deprecated v3.0 legacy method
   */
  public getAvailableConnectors(_: Address[]): Address[] {
    throw ERR_NOT_IMPLEMENTED;
  }

  /**
   * Implements {@link IRouterContract.getFindClosePathInput}
   * @deprecated v3.0 legacy method
   */
  public getFindClosePathInput(
    _: RouterCASlice,
    __: RouterCMSlice,
    ___?: Leftovers,
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
      result[t] = (expected.get(t) ?? 0n) + targetAmount;
    } else {
      result[t] = BigIntMath.min(expected.get(t) ?? 0n, leftover.get(t) ?? 0n);
    }
  }
  return result;
}
