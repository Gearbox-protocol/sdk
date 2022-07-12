"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdapterInterface = void 0;
var AdapterInterface;
(function (AdapterInterface) {
    AdapterInterface[AdapterInterface["NO_SWAP"] = 0] = "NO_SWAP";
    AdapterInterface[AdapterInterface["UNISWAP_V2_ROUTER"] = 1] = "UNISWAP_V2_ROUTER";
    AdapterInterface[AdapterInterface["UNISWAP_V3_ROUTER"] = 2] = "UNISWAP_V3_ROUTER";
    AdapterInterface[AdapterInterface["CURVE_V1_EXCHANGE_ONLY"] = 3] = "CURVE_V1_EXCHANGE_ONLY";
    AdapterInterface[AdapterInterface["YEARN_V2"] = 4] = "YEARN_V2";
    AdapterInterface[AdapterInterface["CURVE_V1_2ASSETS"] = 5] = "CURVE_V1_2ASSETS";
    AdapterInterface[AdapterInterface["CURVE_V1_3ASSETS"] = 6] = "CURVE_V1_3ASSETS";
    AdapterInterface[AdapterInterface["CURVE_V1_4ASSETS"] = 7] = "CURVE_V1_4ASSETS";
    AdapterInterface[AdapterInterface["CURVE_V1_STECRV_POOL"] = 8] = "CURVE_V1_STECRV_POOL";
    AdapterInterface[AdapterInterface["CURVE_V1_WRAPPER"] = 9] = "CURVE_V1_WRAPPER";
    AdapterInterface[AdapterInterface["CURVE_V1_GAUGE"] = 10] = "CURVE_V1_GAUGE";
    AdapterInterface[AdapterInterface["CURVE_V1_MINTER"] = 11] = "CURVE_V1_MINTER";
    AdapterInterface[AdapterInterface["CONVEX_V1_BASE_REWARD_POOL"] = 12] = "CONVEX_V1_BASE_REWARD_POOL";
    AdapterInterface[AdapterInterface["CONVEX_V1_BOOSTER"] = 13] = "CONVEX_V1_BOOSTER";
    AdapterInterface[AdapterInterface["CONVEX_V1_CLAIM_ZAP"] = 14] = "CONVEX_V1_CLAIM_ZAP";
    AdapterInterface[AdapterInterface["LIDO_V1"] = 15] = "LIDO_V1"; // 15
})(AdapterInterface = exports.AdapterInterface || (exports.AdapterInterface = {}));
