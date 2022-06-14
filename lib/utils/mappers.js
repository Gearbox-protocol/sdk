"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterEmptyKeys = exports.keyToLowercase = exports.swapKeyValue = exports.objectEntries = void 0;
var objectEntries = function (o) { return Object.entries(o); };
exports.objectEntries = objectEntries;
var swapKeyValue = function (o) {
    return objectEntries(o).reduce(function (acc, _a) {
        var _b;
        var key = _a[0], value = _a[1];
        return __assign(__assign({}, acc), (_b = {}, _b[value] = key, _b));
    }, {});
};
exports.swapKeyValue = swapKeyValue;
var keyToLowercase = function (o) {
    return objectEntries(o).reduce(function (acc, _a) {
        var _b;
        var key = _a[0], value = _a[1];
        var keyTransformed = typeof key === "string" ? key.toLowerCase() : key;
        return __assign(__assign({}, acc), (_b = {}, _b[keyTransformed] = value, _b));
    }, {});
};
exports.keyToLowercase = keyToLowercase;
var filterEmptyKeys = function (o) {
    return objectEntries(o).reduce(function (acc, _a) {
        var _b;
        var key = _a[0], value = _a[1];
        return !!key ? __assign(__assign({}, acc), (_b = {}, _b[key] = value, _b)) : acc;
    }, {});
};
exports.filterEmptyKeys = filterEmptyKeys;
