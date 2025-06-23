import { type Address, encodeFunctionData, getContract } from "viem";

import { iRouterV300Abi, iSwapperV300Abi } from "../../abi/routerV300.js";
import { iCreditFacadeV300MulticallAbi } from "../../abi/v300.js";
import type { NetworkType } from "../chain/chains.js";
import { PERCENTAGE_FACTOR } from "../constants/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import { getConnectors, tokenDataByNetwork } from "../sdk-gov-legacy/index.js";
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
} from "./types.js";

interface SwapTask {
  swapOperation: number;
  creditAccount: Address;
  tokenIn: Address;
  tokenOut: Address;
  connectors: Array<Address>;
  amount: bigint;
  leftoverAmount: bigint;
}

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

  constructor(sdk: GearboxSDK, address: Address, version: number) {
    super(sdk, {
      addr: address,
      name: "RouterV300",
      abi: iRouterV300Abi,
      version,
    });
    this.#connectors = getConnectors(sdk.provider.networkType);
  }

  /**
   * Implements {@link IRouterContract.findAllSwaps}
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
   * Implements {@link IRouterContract.findOneTokenPath}
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
   * Implements {@link IRouterContract.findOpenStrategyPath}
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
   * Implements {@link IRouterContract.findBestClosePath}
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
              tokensToClaim: assetsMap(balances.tokensToClaim || []),
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

    // TODO: stkcvxRLUSDUSDC workaround
    // van0k.eth:
    // Full liquidations fail because there is no path for CRV to USDC
    // To fix liquidations, while rewards paths are not implemented, you can pass force = true in findBestClosePath. Then it will leave tokens that it cannot swap on the account simply
    const force = ca.tokens.some(
      b =>
        b.token.toLowerCase() ===
          tokenDataByNetwork.Mainnet.stkcvxRLUSDUSDC.toLowerCase() &&
        b.balance > 10n,
    );
    if (force) {
      this.logger?.warn("applying stkcvxRLUSDUSDC workaround");
    }

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
          force,
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
   * Implements {@link IRouterContract.getFindClosePathInput}
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
   * Implements {@link IRouterContract.getAvailableConnectors}
   */
  public getAvailableConnectors(
    collateralTokens: Array<Address>,
  ): Array<Address> {
    return collateralTokens.filter(t =>
      this.#connectors.includes(t.toLowerCase() as Address),
    );
  }

  /**
   * If token is PT token and PT token is already redeemable, we need to claim it manually, since old router can't do it.
   * This can work in old app only because you cannot swap pt_sUSDe into sUSde before maturity and when it is matured, override takes place.
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

    const PENDLE_ROUTER_BY_NETWORK: Record<NetworkType, Address> = {
      Mainnet: "0x888888888889758F76e7103c6CbF23ABbF58F946",
      Arbitrum: "0x0",
      Optimism: "0x0",
      Base: "0x0",
      Sonic: "0x0",
      // New networks
      MegaETH: "0x0",
      Monad: "0x0",
      Berachain: "0x0",
      Avalanche: "0x0",
      BNB: "0x0",
      WorldChain: "0x0",
      Etherlink: "0x0",
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
