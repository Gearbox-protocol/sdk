"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.priority = void 0;
var tokenType_1 = require("../tokens/tokenType");
exports.priority = (_a = {},
    _a[tokenType_1.TokenType.CONNECTOR] = 1,
    _a[tokenType_1.TokenType.NORMAL_TOKEN] = 2,
    _a[tokenType_1.TokenType.CURVE_LP] = 3,
    _a[tokenType_1.TokenType.YEARN_VAULT] = 3,
    _a[tokenType_1.TokenType.META_CURVE_LP] = 4,
    _a[tokenType_1.TokenType.YEARN_VAULT_OF_CURVE_LP] = 4,
    _a[tokenType_1.TokenType.CONVEX_LP_TOKEN] = 5,
    _a[tokenType_1.TokenType.YEARN_VAULT_OF_META_CURVE_LP] = 5,
    _a[tokenType_1.TokenType.CONVEX_STAKED_PHANTOM_TOKEN] = 5,
    _a[tokenType_1.TokenType.DIESEL_LP_TOKEN] = 6,
    _a);
