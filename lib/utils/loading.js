"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadingProgress = void 0;
function loadingProgress() {
    var params = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        params[_i] = arguments[_i];
    }
    var isLoaded = 0;
    for (var _a = 0, params_1 = params; _a < params_1.length; _a++) {
        var item = params_1[_a];
        if (item !== undefined)
            isLoaded++;
    }
    return Math.floor((isLoaded / params.length) * 100);
}
exports.loadingProgress = loadingProgress;
