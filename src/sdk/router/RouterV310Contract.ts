import type { Address } from "viem";

import { iGearboxRouterV310Abi } from "../../abi/routerV310.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { Leftovers } from "./AbstractRouterContract.js";
import { AbstractRouterContract } from "./AbstractRouterContract.js";
import { assetsMap, balancesMap } from "./helpers.js";
import type {
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
      name: "RouterV300",
      abi,
    });
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
  async findOneTokenPath(props: FindOneTokenPathProps): Promise<RouterResult> {
    const { result } = await this.contract.simulate.routeOneToOne([
      props.creditAccount.creditAccount,
      props.tokenIn,
      props.amount,
      props.tokenOut,
      BigInt(props.slippage),
      4n, // TODO:? how many 4n or 0n for underlying
    ]);

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

    const tData = cm.collateralTokens.map(
      (token): TokenData => ({
        token,
        balance: expectedMap.get(token) ?? 0n,
        leftoverBalance: leftoverMap.get(token) ?? 0n,
        numSplits: 4n, // TODO:? how many 4n or 0n for underlying
      }),
    );

    const { result } = await this.contract.simulate.routeOpenManyToOne([
      cm.address,
      target,
      BigInt(slippage),
      tData,
    ]);
    return {
      balances: {}, // TODO:?
      minBalances: {}, // TODO:?
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
    const tData: TokenData[] = [];
    for (const token of cm.collateralTokens) {
      tData.push({
        token,
        balance: expectedBalances.get(token)?.balance || 0n,
        leftoverBalance: leftoverBalances.get(token)?.balance || 0n,
        numSplits: 4n, // TODO:? how many 4n or 0n for underlying
      });
    }
    const { result } = await this.contract.simulate.routeManyToOne([
      cm.address,
      ca.underlying,
      BigInt(slippage),
      tData,
    ]);
    return {
      underlyingBalance: 0n, // TODO:?
      amount: result.amount,
      minAmount: result.minAmount,
      calls: [...result.calls],
    };
  }

  public findAllSwaps(props: FindAllSwapsProps): Promise<RouterResult[]> {
    throw ERR_NOT_IMPLEMENTED;
  }

  public getAvailableConnectors(collateralTokens: Address[]): Address[] {
    throw ERR_NOT_IMPLEMENTED;
  }

  public getFindClosePathInput(
    ca: RouterCASlice,
    cm: RouterCMSlice,
    balances?: Leftovers,
  ): FindClosePathInput {
    throw ERR_NOT_IMPLEMENTED;
  }
}
