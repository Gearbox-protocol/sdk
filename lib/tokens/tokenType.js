"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenType = void 0;
var TokenType;
(function (TokenType) {
    TokenType[TokenType["CONNECTOR"] = 0] = "CONNECTOR";
    TokenType[TokenType["NORMAL_TOKEN"] = 1] = "NORMAL_TOKEN";
    TokenType[TokenType["CURVE_LP"] = 2] = "CURVE_LP";
    TokenType[TokenType["META_CURVE_LP"] = 3] = "META_CURVE_LP";
    TokenType[TokenType["YEARN_VAULT"] = 4] = "YEARN_VAULT";
    TokenType[TokenType["YEARN_VAULT_OF_CURVE_LP"] = 5] = "YEARN_VAULT_OF_CURVE_LP";
    TokenType[TokenType["YEARN_VAULT_OF_META_CURVE_LP"] = 6] = "YEARN_VAULT_OF_META_CURVE_LP";
    TokenType[TokenType["CONVEX_LP_TOKEN"] = 7] = "CONVEX_LP_TOKEN";
    TokenType[TokenType["CONVEX_STAKED_PHANTOM_TOKEN"] = 8] = "CONVEX_STAKED_PHANTOM_TOKEN";
    TokenType[TokenType["DIESEL_LP_TOKEN"] = 9] = "DIESEL_LP_TOKEN";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
