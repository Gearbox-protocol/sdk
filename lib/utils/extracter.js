"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnderlyingToken = exports.getPoolTokens = void 0;
function getPoolTokens(pool) {
    var safePool = pool instanceof Error ? undefined : pool;
    var _a = safePool || {}, dieselToken = _a.dieselToken, underlyingToken = _a.underlyingToken;
    return {
        dieselToken: dieselToken,
        underlyingToken: underlyingToken
    };
}
exports.getPoolTokens = getPoolTokens;
function getUnderlyingToken(c) {
    if (!c || c instanceof Error) {
        return undefined;
    }
    return c.underlyingToken;
}
exports.getUnderlyingToken = getUnderlyingToken;
