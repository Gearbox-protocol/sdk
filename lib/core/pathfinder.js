"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorPathAsset = exports.Path = void 0;
// const path = new Path({gasUsed:0, balances: creditAccount.balances, })
// const closurePath = await path.getBestPath();
// closurePath.calls -> multicalls (!)
// closurePath.balances[path.pool] = (X)
// closurePath.balances[!path.pool] = 0 / 1;
//
// [0,0,0, 100]
// [ 12, 12, 12, 0]
var Path = /** @class */ (function () {
    function Path(opts) {
        this.calls = [];
        this._gasUsed = opts.gasUsed;
        this.balances = opts.balances;
        this.pool = opts.pool;
        this.creditManager = opts.creditManager;
    }
    Path.prototype.getBestPath = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
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
            });
        });
    };
    return Path;
}());
exports.Path = Path;
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
