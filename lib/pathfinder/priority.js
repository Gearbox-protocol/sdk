"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.priority = void 0;
var token_1 = require("../tokens/token");
exports.priority = (_a = {},
    _a[token_1.TokenType.CONNECTOR] = 1,
    _a[token_1.TokenType.NORMAL_TOKEN] = 2,
    _a[token_1.TokenType.CURVE_LP] = 3,
    _a[token_1.TokenType.YEARN_VAULT] = 3,
    _a[token_1.TokenType.META_CURVE_LP] = 4,
    _a[token_1.TokenType.YEARN_VAULT_OF_CURVE_LP] = 4,
    _a[token_1.TokenType.CONVEX_LP_TOKEN] = 5,
    _a[token_1.TokenType.YEARN_VAULT_OF_META_CURVE_LP] = 5,
    _a[token_1.TokenType.CONVEX_STAKED_PHANTOM_TOKEN] = 5,
    _a[token_1.TokenType.DIESEL_LP_TOKEN] = 6,
    _a);
