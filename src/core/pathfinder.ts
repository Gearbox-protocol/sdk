import { BigNumber } from "ethers";
import { CreditManagerData } from "./creditManager";
import { MultiCall } from "./multicall";
import { SupportedTokens } from "./token";

// const path = new Path({gasUsed:0, balances: creditAccount.balances, })
// const closurePath = await path.getBestPath();
// closurePath.calls -> multicalls (!)
// closurePath.balances[path.pool] = (X)
// closurePath.balances[!path.pool] = 0 / 1;

//
// [0,0,0, 100]
// [ 12, 12, 12, 0]

export class Path {
  public readonly calls: Array<MultiCall> = [];
  public readonly balances: Record<SupportedTokens, BigNumber>;
  //   usedTokens: Array<SupportedTokens>;
  protected _gasUsed: number;
  public readonly pool: SupportedTokens;
  public readonly creditManager: CreditManagerData;

  constructor(opts: {
    gasUsed: number;
    balances: Record<SupportedTokens, BigNumber>;
    pool: SupportedTokens;
    creditManager: CreditManagerData;
  }) {
    this._gasUsed = opts.gasUsed;
    this.balances = opts.balances;
    this.pool = opts.pool;
    this.creditManager = opts.creditManager;
  }

  async getBestPath(): Promise<Path> {
    //  const nextToken = Object.entries(this.balances).filter(([token, balance]) => balance.gt(1) ) //.sort((a,b) => {})
    //  if (nextToken.length ===1 ) {

    //  }

    // Get balances and keep non-zero only
    // Find token with highest priority
    // Get token type of this token
    // switch (type) {
    //  case TokenType.YearnValut:
    //     const assetPathClass = new YearnPathAsset();
    //     return assetPathClass.getBestPath(this);
    //     ...

    //}
    throw new Error("Not implmented");
  }
}

export interface PathAsset {
  getBestPath(p: Path): Promise<Path>;
}

export class ConnectorPathAsset implements PathAsset {
  getBestPath(p: Path): Promise<Path> {
    console.log(p);
    // How to unwrap
    // set balance of current token to 0
    // add balnace what we get
    // add call
    // create new Paths

    // 3CRV:
    // coinst balance3crv = p.balance["3rcv"];
    // const p.balance["3rcv"] = 0;
    // DAI
    // const daiPath = {...p};
    // const daiPath["Dai"] = await curve.getAmount(t balance3crv);

    // const pathDai = new Path(daiPath)
    // ...
    // const bestPath = pathDai.balance[0] > pathUSDC.balance(0) ? pathDai : pathUsdc;

    //   --- DAI
    // --|
    //   --- USDC
    //
    // NORMAL TOKEN
    // ============
    //
    // - NORMAL -> POOL (1 pair) => #1
    // for(let conn of connectors) {
    //   const result = getAmount([NORMAL, conn, pool])
    // }
    // => best Path to get max Pool tokens
    // const resultInConnector = getAmount([NORMAL, conn]);
    // calls.push("Uniswap.swap(NORMAL, conn)");

    // CRV => CRV -> USDC -> DAI
    // LINK => LINK -> USDC -> DAI
    //
    // [UniV2.swap("CRV", "USDC"),
    //  UniV3.swap("LINK", "USDC"),
    //  Curve.exchange("USDC", "DAI")]
    //
    // Below is not optimal:
    // [ UniV2.swap("CRV -> USDC -> DAI"),
    // UniV2.swap("LINK -> USDC -> DAI")]
    //
    //
    // [ UniV2.swap("CRV -> USDC")
    // UniV2.swap("USDC -> DAI"),
    // UniV2.swap("LINK -> USDC"),
    // UniV2.swap("USDC -> DAI") ]

    // return maxValuable(new Paths.getBestPath())
    throw new Error("Method not implemented.");
  }
}
