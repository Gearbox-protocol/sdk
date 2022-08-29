import { BigNumber, ethers } from "ethers";

import { NetworkType } from "../core/constants";
import { CreditAccountData } from "../core/creditAccount";
import { CreditManagerData } from "../core/creditManager";
import { MultiCall } from "../core/multicall";
import { CurveLPToken } from "../tokens/curveLP";
import {
  SupportedToken,
  supportedTokens,
  tokenSymbolByAddress,
} from "../tokens/token";
import { TokenType } from "../tokens/tokenType";
import { YearnLPToken } from "../tokens/yearn";
import { ISwapPathFinder__factory } from "../types";
import { detectNetwork } from "../utils/network";
import { PartialRecord } from "../utils/types";
import { pathFindersByNetwork } from "./contracts";
import { ConvexLPPathFinder } from "./convexLP";
import { CurvePathFinder } from "./curveLP";
import { priority } from "./priority";
import { YearnVaultPathFinder } from "./yVault";

export class Path {
  public readonly calls: Array<MultiCall> = [];

  public readonly balances: PartialRecord<SupportedToken, BigNumber>;

  public readonly underlying: SupportedToken;

  public readonly creditManager: CreditManagerData;

  public readonly creditAccount: CreditAccountData;

  public readonly networkType: NetworkType;

  public readonly provider: ethers.providers.Provider;

  public totalGasLimit: number;

  constructor(opts: {
    balances: PartialRecord<SupportedToken, BigNumber>;
    underlying: SupportedToken;
    creditManager: CreditManagerData;
    creditAccount: CreditAccountData;
    networkType: NetworkType;
    provider: ethers.providers.Provider;
    totalGasLimit: number;
  }) {
    this.balances = opts.balances;
    this.underlying = opts.underlying;
    this.creditManager = opts.creditManager;
    this.creditAccount = opts.creditAccount;
    this.networkType = opts.networkType;
    this.provider = opts.provider;
    this.totalGasLimit = opts.totalGasLimit;
  }

  public popBalance(token: SupportedToken): BigNumber {
    const currentBalance = this.balances[token];

    if (currentBalance === undefined || currentBalance.gt(1))
      return BigNumber.from(0);

    this.balances[token] = BigNumber.from(1);
    return currentBalance.sub(1);
  }

  private static comparedByPriority(
    [tokenA]: [string, BigNumber],
    [tokenB]: [string, BigNumber],
  ): number {
    const priorityTokenA =
      priority[supportedTokens[tokenA as SupportedToken].type];
    const priorityTokenB =
      priority[supportedTokens[tokenB as SupportedToken].type];

    if (priorityTokenA > priorityTokenB) {
      return -1;
    }
    if (priorityTokenA < priorityTokenB) {
      return 1;
    }
    return 0;
  }

  static async findBestPath(
    creditAccount: CreditAccountData,
    creditManager: CreditManagerData,
    provider: ethers.providers.Provider,
  ) {
    const networkType = await detectNetwork(provider);

    const balances = Object.entries(creditAccount.balances)
      .map(([address, balance]) => ({
        token: tokenSymbolByAddress[address.toLowerCase()],
        balance,
      }))
      .filter(t => t.balance.gt(1))
      .reduce(
        (obj, curValue) => ({ ...obj, [curValue.token]: curValue.balance }),
        {},
      );

    const initialPath = new Path({
      balances,
      creditAccount,
      creditManager,
      networkType,
      provider,
      underlying: "DAI", // creditManager.underlyingToken
      totalGasLimit: 0,
    });

    const lpPaths = await initialPath.withdrawTokens();
    const pathFinder = ISwapPathFinder__factory.connect(
      pathFindersByNetwork[networkType].PATH_FINDER,
      provider,
    );

    console.debug(lpPaths);
    console.debug(pathFinder);
    // const bestPath = await pathFinder.bestPath();
  }

  async withdrawTokens(): Promise<Array<Path>> {
    const existingTokens = Object.entries(this.balances)
      .filter(([, balance]) => balance.gt(1))
      .sort(Path.comparedByPriority);

    // TODO: Add checks for lenght
    if (existingTokens.length === 0)
      throw new Error("No tokens with balance >1");

    const nextToken = existingTokens[0][0] as SupportedToken;
    let lpPathFinder: LPWithdrawPathFinder;
    // Get balances and keep non-zero only
    // Find token with highest priority
    // Get token type of this token
    switch (supportedTokens[nextToken].type) {
      case TokenType.NORMAL_TOKEN:
      case TokenType.CONNECTOR:
        return [this];

      case TokenType.YEARN_VAULT_OF_CURVE_LP:
      case TokenType.YEARN_VAULT_OF_META_CURVE_LP:
      case TokenType.YEARN_VAULT:
        lpPathFinder = new YearnVaultPathFinder(nextToken as YearnLPToken);
        break;

      case TokenType.CONVEX_LP_TOKEN:
        lpPathFinder = new ConvexLPPathFinder();
        break;

      case TokenType.META_CURVE_LP:
      case TokenType.CURVE_LP:
        lpPathFinder = new CurvePathFinder(nextToken as CurveLPToken);
        break;

      default:
        throw new Error("Token type not supported yet");
    }

    return lpPathFinder.findWithdrawPaths(this);
  }

  clone(): Path {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
}

export interface LPWithdrawPathFinder {
  findWithdrawPaths: (p: Path) => Promise<Array<Path>>;
}
