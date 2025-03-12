import { type Address, encodeFunctionData, getContract } from "viem";

import { iRouterV300Abi, iSwapperV300Abi } from "../../abi/routerV300.js";
import { iCreditFacadeV300MulticallAbi } from "../../abi/v300.js";
import { PERCENTAGE_FACTOR } from "../constants/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import { getConnectors } from "../sdk-gov-legacy/index.js";
import type { Leftovers } from "./AbstractRouterContract.js";
import { AbstractRouterContract } from "./AbstractRouterContract.js";
import { assetsMap, balancesMap, compareRouterResults } from "./helpers.js";
import { PathOptionFactory } from "./PathOptionFactory.js";
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
  SwapOperation,
  SwapTask,
} from "./types.js";

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

type abi = typeof iRouterV300Abi;

const PT_IN = {
  ["0xEe9085fC268F6727d5D4293dBABccF901ffDCC29".toLowerCase()]:
    "PT_sUSDe_26DEC2024",
  ["0xE00bd3Df25fb187d6ABBB620b3dfd19839947b81".toLowerCase()]:
    "PT_sUSDe_27MAR20251",
  ["0xE00bd3Df25fb187d6ABBB620b3dfd19839947b81".toLowerCase()]:
    "PT_sUSDe_29MAY2025",
};

const OUT = {
  ["0x9D39A5DE30e57443BfF2A8307A4256c8797A3497".toLowerCase()]: "sUSDe",
};

export class RouterV300Contract
  extends AbstractRouterContract<abi>
  implements IRouterContract
{
  readonly #connectors: Array<Address>;

  constructor(sdk: GearboxSDK, address: Address) {
    super(sdk, {
      addr: address,
      name: "RouterV300",
      abi: iRouterV300Abi,
    });
    this.#connectors = getConnectors(sdk.provider.networkType);
  }

  /**
   * Finds all available swaps for given tokens; technically should be avoided to use, since doesn't have any advantage over findOneTokenPath.
   * Deduplicates results by minAmount + strigified call path and returns only unique ones.
   * @param {RouterCASlice} creditAccount - minimal credit account data {@link RouterCASlice} on which operation is performed
   * @param {RouterCMSlice} creditManager - minimal credit manager data {@link RouterCMSlice} on which operation is performed
   * @param {SwapOperation} swapOperation - {@link SwapOperation} = "EXACT_INPUT" | "EXACT_INPUT_ALL" | "EXACT_OUTPUT"; however router stopped to support EXACT_OUTPUT
   * @param {Address} tokenIn - address of input token
   * @param {Address} tokenOut - address of output token
   * @param {number | bigint} slippage  - Slippage in PERCENTAGE_FORMAT (100% = 10_000) per operation
   * @param {bigint} amount - amount of token in to swap
   * @param {bigint} leftoverAmount - amount that should be left on account after swap; technically equals to 0 in the most of the cases
   * @returns Array of {@link RouterResult}
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
  }: FindAllSwapsProps): Promise<Array<RouterResult>> {
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
   * Find the best path to swap token A to token B.
   *  - Connectors - list of tokens which can be used as a token to align path through, for ex. when swapping sUSDe it is good to check swaps through USDe.
   *  - #overridePTRedeem - if token is PT token and PT token is already redeemable, we need to claim it manually, since old router can't do it. This can work in old app only because you cannot swap pt_sUSDe into sUSde before maturity and when it is matured, override takes place.
   * @param {RouterCASlice} creditAccount - minimal credit account data {@link RouterCASlice} on which operation is performed
   * @param {RouterCMSlice} creditManager - minimal credit manager data {@link RouterCMSlice} on which operation is performed
   * @param {Address} tokenIn - address of input token
   * @param {Address} tokenOut - address of output token
   * @param {number | bigint} slippage  - Slippage in PERCENTAGE_FORMAT (100% = 10_000) per operation
   * @param {bigint} amount - amount of token in to swap
   * @returns minAmount, avgAmount found and array of calls to execute swap
   */
  async findOneTokenPath(props: FindOneTokenPathProps): Promise<RouterResult> {
    const {
      creditAccount,
      creditManager,
      tokenIn,
      tokenOut,
      amount,
      slippage,
    } = props;

    const connectors = this.getAvailableConnectors(
      creditManager.collateralTokens,
    );

    const isPTOverrideRedeem =
      PT_IN[tokenIn.toLowerCase()] && OUT[tokenOut.toLowerCase()];

    const { result } = await (isPTOverrideRedeem
      ? this.#overridePTRedeem(props)
      : this.contract.simulate.findOneTokenPath(
          [
            tokenIn,
            amount,
            tokenOut,
            creditAccount.creditAccount,
            connectors,
            BigInt(slippage),
          ],
          {
            gas: GAS_PER_BLOCK,
          },
        ));

    return {
      amount: result.amount,
      minAmount: result.minAmount,
      calls: [...result.calls],
    };
  }

  /**
   * @dev Finds the best path for opening Credit Account; converts all expectedBalances besides leftoverBalances into target token
   * @param {RouterCMSlice} creditManager - minimal credit manager data {@link RouterCMSlice} on which operation is performed
   * @param {Array<Asset>} expectedBalances - Collateral assets + debt asset, nominated in ther respective tokens.
   * For example, if you open an USDC Credit Account, borrow 50_000 USDC and provide 10 WETH and 10_000 DAI as collateral
   * from your own funds, expectedBalances should be: [{amount: 10*10**wethDecimals}, {amount: 10000*10**daiDecimals}, {amount: 10000*10**usdcDecimals}]
   * @param leftoverBalances - balances to keep on account after opening.
   * For example if don't want to swap WETH in the example above, leftoverBalances should be: [{amount: 10*10**wethDecimals}]
   * @param target - Address of desired token to swap into
   * @param slippage - Slippage in PERCENTAGE_FORMAT (100% = 10_000) per operation
   * @returns Router return list of all balances (including 0 balances) after operation, but it doesn't include original balance
   * - For example you had 5k sUSDS  and 5k DAI as collateral, debt is 20k DAI, router will return 25k sUDS and all other token allowed on CM will be 0n or 1n
   * Since FE is interested in FULL balances structure, we override target balance in the following way:
   * min = record[sUSDS] = 5k from collateral + 25k of minAmount; avg = record[sUSDS] = 5k from collateral + 25.5k of avgAmount
   * - minAmount
   * - avgAmount
   * - array of calls to execute swap
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
    const input: Array<Asset> = cm.collateralTokens.map(token => ({
      token,
      balance: expectedMap.get(token) ?? 0n,
    }));

    const leftover: Array<Asset> = cm.collateralTokens.map(token => ({
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
        [target.toLowerCase()]: (expectedMap.get(target) ?? 0n) + result.amount,
      },
      minBalances: {
        ...balancesAfter,
        [target.toLowerCase()]:
          (expectedMap.get(target) ?? 0n) + result.minAmount,
      },
      amount: result.amount,
      minAmount: result.minAmount,
      calls: [...result.calls],
    };
  }

  /**
   * @dev Finds the path to swap / withdraw all assets from CreditAccount into underlying asset
   *   Can bu used for closing Credit Account and for liquidations as well.
   * @param {RouterCASlice} creditAccount - minimal credit account data {@link RouterCASlice} on which operation is performed
   * @param {RouterCMSlice} creditManager - minimal credit manager data {@link RouterCMSlice} on which operation is performed
   * @param {number | bigint} slippage - Slippage in PERCENTAGE_FORMAT (100% = 10_000) per operation
   * @param {ClosePathBalances | undefined} balances - Balances {@link ClosePathBalances} to close account with, if not provided, all assets will be swapped according to inner logic.
   * Consists of:
   * @param {Array<Asset>} expectedBalances - list of all credit account balances nominated in their respective tokens.
   *     For example: [{amount: 10x10^wethDecimals}, {amount: 10000x10^daiDecimals}]
   * @param {Array<Asset>} leftoverBalances - list of all credit account balances that shouldn't be swapped nominated in their respective tokens.
   *     Used for credit account repaying; in this mode leftover assets list should include all assets besides underlying token.
   *     For example considering account above is on DAI CM: [{amount: 10x10^wethDecimals}]
   * @return The best option in PathFinderCloseResult format, which
   *  - underlyingBalance -  since this method swaps only tokens different from underlying,
   *   we are more interested in TOTAL balance of underlying token after all swaps are done
   *   for this reason we sum up underlying token that was on account before swap
   *   with underlying token amount found during swap and call it underlyingBalance
   *  - calls - list of calls which should be done to swap & unwrap everything to underlying token
   *  - amount
   *  - minAmount
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
    await this.hooks.triggerHooks("foundPathOptions", {
      creditAccount: ca.creditAccount,
      pathOptions,
      expected,
      leftover,
      connectors,
    });

    let results: Array<RouterResult> = [];
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
   * Is used by batch liquidator
   * @param ca
   * @param cm
   * @returns
   */
  public getFindClosePathInput(
    ca: RouterCASlice,
    cm: RouterCMSlice,
    balances?: Leftovers,
  ): FindClosePathInput {
    const { expectedBalances, leftoverBalances } = this.getExpectedAndLeftover(
      ca,
      cm,
      balances,
    );

    // TODO: PathOptionFactory deals with token data from SDK
    // it needs to accept market data
    const pathOptions = PathOptionFactory.generatePathOptions(
      ca.tokens,
      this.provider.networkType,
      LOOPS_PER_TX,
    );

    const connectors = this.getAvailableConnectors(cm.collateralTokens);
    return {
      expected: expectedBalances.values(),
      leftover: leftoverBalances.values(),
      connectors,
      pathOptions,
    };
  }

  /**
   * Connectors - list of tokens which can be used as a token to align path through, for ex. when swapping sUSDe it is good to check swaps through USDe.
   */
  public getAvailableConnectors(
    collateralTokens: Array<Address>,
  ): Array<Address> {
    return collateralTokens.filter(t =>
      this.#connectors.includes(t.toLowerCase() as Address),
    );
  }

  /**
   * if token is PT token and PT token is already redeemable, we need to claim it manually, since old router can't do it. 
      This can work in old app only because you cannot swap pt_sUSDe into sUSde before maturity and when it is matured, override takes place.
  */
  async #overridePTRedeem({
    creditAccount,
    creditManager,
    tokenIn,
    tokenOut,
    amount,
    slippage,
  }: FindOneTokenPathProps) {
    const pendleSwapperAddress = await this.contract.read.componentAddressById([
      37,
    ]);
    const cm = this.sdk.marketRegister.findCreditManager(creditManager.address);

    const PENDLE_ROUTER_BY_NETWORK = {
      Mainnet: "0x888888888889758F76e7103c6CbF23ABbF58F946",
      Arbitrum: "0x0",
      Optimism: "0x0",
      Base: "0x0",
      Sonic: "0x0",
    } as const;

    const pendleRouter =
      PENDLE_ROUTER_BY_NETWORK[this.sdk.provider.networkType];
    const pendleAdapter = cm.creditManager.adapters.mustGet(pendleRouter);

    const pendleSwapper = getContract({
      address: pendleSwapperAddress,
      abi: iSwapperV300Abi,
      client: this.sdk.provider.publicClient,
    });

    const result = await pendleSwapper.simulate.getBestDirectPairSwap([
      {
        swapOperation: 1,
        creditAccount: creditAccount.creditAccount,
        tokenIn: tokenIn,
        tokenOut: tokenOut,
        connectors: [],
        amount,
        leftoverAmount: 0n,
      },
      pendleAdapter.address,
    ]);

    const minAmount =
      (result.result.amount * (PERCENTAGE_FACTOR - BigInt(slippage))) /
      PERCENTAGE_FACTOR;

    const storeExpectedBalances = {
      target: creditManager.creditFacade,
      callData: encodeFunctionData({
        abi: iCreditFacadeV300MulticallAbi,
        functionName: "storeExpectedBalances",
        args: [[{ token: tokenOut, amount: minAmount }]],
      }),
    };

    const compareBalances = {
      target: creditManager.creditFacade,
      callData: encodeFunctionData({
        abi: iCreditFacadeV300MulticallAbi,
        functionName: "compareBalances",
        args: [],
      }),
    };

    return {
      result: {
        amount: result.result.amount,
        minAmount,
        calls: [
          storeExpectedBalances,
          result.result.multiCall,
          compareBalances,
        ],
      },
    };
  }
}
