"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OracleType = void 0;
var OracleType;
(function (OracleType) {
    OracleType[OracleType["CHAINLINK_ORACLE"] = 0] = "CHAINLINK_ORACLE";
    OracleType[OracleType["YEARN_TOKEN_ORACLE"] = 1] = "YEARN_TOKEN_ORACLE";
    OracleType[OracleType["CURVE_LP_ORACLE"] = 2] = "CURVE_LP_ORACLE";
    OracleType[OracleType["YEARN_CURVE_LP_ORACLE"] = 3] = "YEARN_CURVE_LP_ORACLE";
    OracleType[OracleType["ZERO_ORACLE"] = 4] = "ZERO_ORACLE";
    OracleType[OracleType["LIKE_CURVE_LP_ORACLE"] = 5] = "LIKE_CURVE_LP_ORACLE";
})(OracleType = exports.OracleType || (exports.OracleType = {}));
