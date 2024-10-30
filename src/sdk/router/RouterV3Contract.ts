import { getConnectors } from "@gearbox-protocol/sdk-gov";
import type { Address } from "viem";

import { routerV3Abi } from "../abi";
import { BaseContract } from "../base";
import type { CreditAccountData } from "../base/types";
import type { GearboxSDK } from "../GearboxSDK";
import { AddressMap } from "../utils";
import type { IHooks } from "../utils/internal";
import { Hooks } from "../utils/internal";
import { PathOptionFactory } from "./PathOptionFactory";
import type {
  Asset,
  OpenStrategyResult,
  PathOptionSerie,
  RouterCloseResult,
  RouterResult,
  SwapOperation,
  SwapTask,
} from "./types";

const MAX_GAS_PER_ROUTE = 200_000_000n;
const GAS_PER_BLOCK = 400_000_000n;
const LOOPS_PER_TX = Number(GAS_PER_BLOCK / MAX_GAS_PER_ROUTE);

/**
 * Mapping to enums used by smart contract
 */
const SWAP_OPERATIONS: Record<SwapOperation, number> = {
  EXACT_INPUT: 0,
  EXACT_INPUT_ALL: 1,
  EXACT_OUTPUT: 2,
};

type abi = typeof routerV3Abi;

interface FindAllSwapsProps {
  creditAccount: CreditAccountDataSlice;
  creditManager: CreditManagerSlice;
  swapOperation: SwapOperation;
  tokenIn: Address;
  tokenOut: Address;
  amount: bigint;
  leftoverAmount: bigint;
  slippage: number | bigint;
}

interface FindOneTokenPathProps {
  creditAccount: CreditAccountDataSlice;
  creditManager: CreditManagerSlice;
  tokenIn: Address;
  tokenOut: Address;
  amount: bigint;
  slippage: number | bigint;
}

interface FindOpenStrategyPathProps {
  creditManager: CreditManagerSlice;
  expectedBalances: Asset[];
  leftoverBalances: Asset[];
  target: Address;
  slippage: number | bigint;
}

interface FindBestClosePathProps {
  creditAccount: CreditAccountDataSlice;
  creditManager: CreditManagerSlice;
  slippage: bigint | number;
  balances?: ClosePathBalances;
}

export interface FindClosePathInput {
  pathOptions: PathOptionSerie[];
  expected: Asset[];
  leftover: Asset[];
  connectors: Address[];
}

export interface ClosePathBalances {
  expectedBalances: Array<Asset>;
  leftoverBalances: Array<Asset>;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type RouterHooks = {
  /**
   * Internal router event
   */
  foundPathOptions: [{ creditAccount: Address } & FindClosePathInput];
};

/**
 * Slice of credit manager data required for router operations
 */
interface CreditManagerSlice {
  address: Address;
  collateralTokens: Address[];
}

export type CreditAccountDataSlice = Pick<
  CreditAccountData,
  | "tokens"
  | "enabledTokensMask"
  | "underlying"
  | "creditAccount"
  | "creditFacade"
  | "debt"
  | "creditManager"
>;

export class RouterV3Contract
  extends BaseContract<abi>
  implements IHooks<RouterHooks>
{
  readonly #connectors: Address[];
  readonly #hooks = new Hooks<RouterHooks>();

  constructor(sdk: GearboxSDK, address: Address) {
    super(sdk, {
      addr: address,
      name: "RouterV3",
      abi: routerV3Abi,
    });
    this.#connectors = getConnectors(sdk.provider.networkType);
  }

  public addHook = this.#hooks.addHook.bind(this.#hooks);
  public removeHook = this.#hooks.removeHook.bind(this.#hooks);

  /**
   * Finds all available swaps for NORMAL tokens
   * @param ca
   * @param cm
   * @param swapOperation
   * @param tokenIn
   * @param tokenOut
   * @param amount
   * @param leftoverAmount
   * @param slippage
   * @returns
   */
  public async findAllSwaps({
    creditAccount: ca,
    creditManager: cm,
    swapOperation,
    tokenIn,
    tokenOut,
    amount,
    leftoverAmount,
    slippage,
  }: FindAllSwapsProps): Promise<RouterResult[]> {
    const connectors = this.getAvailableConnectors(cm.collateralTokens);

    const swapTask: SwapTask = {
      swapOperation: SWAP_OPERATIONS[swapOperation],
      creditAccount: ca.creditAccount as Address,
      tokenIn,
      tokenOut,
      connectors,
      amount,
      leftoverAmount,
    };

    const { result } = await this.contract.simulate.findAllSwaps(
      [swapTask, BigInt(slippage)],
      {
        gas: GAS_PER_BLOCK,
      },
    );

    const unique: Record<string, RouterResult> = {};

    result.forEach(r => {
      const key = `${r.minAmount.toString()}${r.calls
        .map(c => `${c.target.toLowerCase()}${c.callData}`)
        .join("-")}`;

      unique[key] = {
        amount: r.amount,
        minAmount: r.minAmount,
        calls: [...r.calls],
      };
    });

    return Object.values(unique);
  }

  /**
   * Finds best path to swap all Normal tokens and tokens "on the way" to target one and vice versa
   * @param creditAccount
   * @param creditManager
   * @param tokenIn
   * @param tokenOut
   * @param amount
   * @param slippage
   * @returns
   */
  public async findOneTokenPath({
    creditAccount: ca,
    creditManager: cm,
    tokenIn,
    tokenOut,
    amount,
    slippage,
  }: FindOneTokenPathProps): Promise<RouterResult> {
    const connectors = this.getAvailableConnectors(cm.collateralTokens);

    const { result } = await this.contract.simulate.findOneTokenPath(
      [
        tokenIn,
        amount,
        tokenOut,
        ca.creditAccount as Address,
        connectors,
        BigInt(slippage),
      ],
      {
        gas: GAS_PER_BLOCK,
      },
    );

    return {
      amount: result.amount,
      minAmount: result.minAmount,
      calls: [...result.calls],
    };
  }

  /**
   * @dev Finds the best path for opening Credit Account and converting all NORMAL tokens and LP token in the way to TARGET
   * @param creditManager CreditManagerData which represents credit manager you want to use to open Credit Account
   * @param expectedBalances Expected balances which would be on account accounting also debt. For example,
   *    if you open an USDC Credit Account, borrow 50_000 USDC and provide 10 WETH and 10_USDC as collateral
   *    from your own funds, expectedBalances should be: { "USDC": 60_000 * (10**6), "<address of WETH>": WAD.mul(10) }
   * @param leftoverBalances Balances to keep on account after opening
   * @param target Address of symbol of desired token
   * @param slippage Slippage in PERCENTAGE_FORMAT (100% = 10_000) per operation
   * @returns PathFinderOpenStrategyResult which
   */
  public async findOpenStrategyPath({
    creditManager: cm,
    expectedBalances,
    leftoverBalances,
    target,
    slippage,
  }: FindOpenStrategyPathProps): Promise<OpenStrategyResult> {
    const [expectedMap, leftoverMap] = [
      balancesMap(expectedBalances),
      balancesMap(leftoverBalances),
    ];
    const input: Asset[] = cm.collateralTokens.map(token => ({
      token,
      balance: expectedMap.get(token) ?? 0n,
    }));

    const leftover: Asset[] = cm.collateralTokens.map(token => ({
      token,
      balance: leftoverMap.get(token) ?? 0n,
    }));

    const connectors = this.getAvailableConnectors(cm.collateralTokens);

    const {
      result: [outBalances, result],
    } = await this.contract.simulate.findOpenStrategyPath(
      [cm.address, input, leftover, target, connectors, BigInt(slippage)],
      {
        gas: GAS_PER_BLOCK,
      },
    );

    const balancesAfter = Object.fromEntries(
      outBalances.map(b => [b.token.toLowerCase(), b.balance]),
    );

    return {
      balances: {
        ...balancesAfter,
        [target]: (expectedMap.get(target) ?? 0n) + result.amount,
      },
      minBalances: {
        ...balancesAfter,
        [target]: (expectedMap.get(target) ?? 0n) + result.minAmount,
      },
      amount: result.amount,
      minAmount: result.minAmount,
      calls: [...result.calls],
    };
  }

  /**
   * @dev Finds the path to swap / withdraw all assets from CreditAccount into underlying asset
   *   Can bu used for closing Credit Account and for liquidations as well.
   * @param creditAccount CreditAccountStruct object used for close path computation
   * @param creditManager CreditManagerSlice for corresponding credit manager
   * @param slippage Slippage in PERCENTAGE_FORMAT (100% = 10_000) per operation
   * @return The best option in PathFinderCloseResult format, which
   *          - underlyingBalance - total balance of underlying token
   *          - calls - list of calls which should be done to swap & unwrap everything to underlying token
   */
  public async findBestClosePath({
    creditAccount: ca,
    creditManager: cm,
    slippage,
    balances,
  }: FindBestClosePathProps): Promise<RouterCloseResult> {
    const { pathOptions, expected, leftover, connectors } =
      this.getFindClosePathInput(
        ca,
        cm,
        balances
          ? {
              expectedBalances: assetsMap(balances.expectedBalances),
              leftoverBalances: assetsMap(balances.leftoverBalances),
            }
          : undefined,
      );
    await this.#hooks.triggerHooks("foundPathOptions", {
      creditAccount: ca.creditAccount,
      pathOptions,
      expected,
      leftover,
      connectors,
    });

    let results: RouterResult[] = [];
    for (const po of pathOptions) {
      // TODO: maybe Promise.all?
      const { result } = await this.contract.simulate.findBestClosePath(
        [
          ca.creditAccount as Address,
          expected,
          leftover,
          connectors,
          BigInt(slippage),
          po,
          BigInt(LOOPS_PER_TX),
          false,
        ],
        {
          gas: GAS_PER_BLOCK,
        },
      );
      results.push({
        ...result,
        calls: [...result.calls],
      });
    }

    const bestResult = results.reduce(compareRouterResults, {
      amount: 0n,
      minAmount: 0n,
      calls: [],
    });
    const underlyingBalance =
      ca.tokens.find(t => t.token === ca.underlying)?.balance ?? 0n;

    const result = {
      amount: bestResult.amount,
      minAmount: bestResult.minAmount,
      calls: bestResult.calls.map(c => ({
        callData: c.callData,
        target: c.target,
      })),
      underlyingBalance: underlyingBalance + bestResult.minAmount,
    };
    return result;
  }

  /**
   * Finds input to be used with findBestClosePath
   * @param ca
   * @param cm
   * @returns
   */
  public getFindClosePathInput(
    ca: CreditAccountDataSlice,
    cm: CreditManagerSlice,
    balances?: ReturnType<RouterV3Contract["getDefaultExpectedAndLeftover"]>,
  ): FindClosePathInput {
    const b = balances || this.getDefaultExpectedAndLeftover(ca);
    const { leftoverBalances, expectedBalances } = b;

    // TODO: PathOptionFactory deals with token data from SDK
    // it needs to accept market data
    const pathOptions = PathOptionFactory.generatePathOptions(
      ca.tokens as readonly Asset[],
      this.provider.networkType,
      LOOPS_PER_TX,
    );

    const expected: Asset[] = cm.collateralTokens.map(token => {
      // When we pass expected balances explicitly, we need to mimic router behaviour by filtering out leftover tokens
      // for example, we can have stETH balance of 2, because 1 transforms to 2 because of rebasing
      // https://github.com/Gearbox-protocol/router-v3/blob/c230a3aa568bb432e50463cfddc877fec8940cf5/contracts/RouterV3.sol#L222
      const actual = expectedBalances.get(token)?.balance || 0n;
      return {
        token,
        balance: actual > 10n ? actual : 0n,
      };
    });

    const leftover: Asset[] = cm.collateralTokens.map(token => ({
      token: token,
      balance: leftoverBalances.get(token)?.balance || 1n,
    }));

    const connectors = this.getAvailableConnectors(cm.collateralTokens);
    return { expected, leftover, connectors, pathOptions };
  }

  public getDefaultExpectedAndLeftover(ca: CreditAccountDataSlice) {
    const expectedBalances = new AddressMap<Asset>();
    const leftoverBalances = new AddressMap<Asset>();
    for (const { token: t, balance, mask } of ca.tokens) {
      const token = t as Address;
      const isEnabled = (mask & ca.enabledTokensMask) !== 0n;
      expectedBalances.upsert(token, { token, balance });
      const decimals = this.sdk.tokensMeta.decimals(token);
      // filter out dust, we don't want to swap it
      const minBalance = 10n ** BigInt(Math.max(8, decimals) - 8);
      // also: gearbox liquidator does not need to swap disabled tokens. third-party liquidators might want to do it
      if (balance < minBalance || !isEnabled) {
        leftoverBalances.upsert(token, { token, balance });
      }
    }

    return { expectedBalances, leftoverBalances };
  }

  public getAvailableConnectors(collateralTokens: Address[]): Address[] {
    return collateralTokens.filter(t =>
      this.#connectors.includes(t.toLowerCase() as Address),
    );
  }
}

function compareRouterResults(a: RouterResult, b: RouterResult): RouterResult {
  return a.amount > b.amount ? a : b;
}

export function balancesMap(assets: Asset[]): AddressMap<bigint> {
  return new AddressMap(assets.map(({ token, balance }) => [token, balance]));
}

export function assetsMap(assets: Asset[]): AddressMap<Asset> {
  return new AddressMap(assets.map(a => [a.token, a]));
}
