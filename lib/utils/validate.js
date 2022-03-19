"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPositiveFloat = void 0;
function isPositiveFloat(val) {
    var floatRegex = /^\d+(?:[.,]\d*?)?$/;
    if (!floatRegex.test(val))
        return false;
    var valF = parseFloat(val);
    if (isNaN(valF))
        return false;
    return true;
}
exports.isPositiveFloat = isPositiveFloat;
