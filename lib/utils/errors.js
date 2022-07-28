"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMetamaskError = void 0;
var isMetamaskError = function (e) {
    if (!e)
        return false;
    if (typeof e !== "object")
        return false;
    if (typeof e.code !== "number" || typeof e.message !== "string")
        return false;
    return true;
};
exports.isMetamaskError = isMetamaskError;
