"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorPathAsset = void 0;
var ConnectorPathAsset = /** @class */ (function () {
    function ConnectorPathAsset() {
    }
    ConnectorPathAsset.prototype.getBestPath = function (p) {
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
    };
    return ConnectorPathAsset;
}());
exports.ConnectorPathAsset = ConnectorPathAsset;
