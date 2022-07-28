"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadingProgress = exports.allLoaded = void 0;
var isLoaded = function (v) { return v !== undefined; };
function allLoaded(itemsToLoad) {
    return itemsToLoad.reduce(function (acc, item) { return acc && isLoaded(item); }, true);
}
exports.allLoaded = allLoaded;
function loadingProgress(itemsToLoad) {
    var loaded = itemsToLoad.reduce(function (acc, item) { return (isLoaded(item) ? acc + 1 : acc); }, 0);
    return Math.floor((loaded / itemsToLoad.length) * 100);
}
exports.loadingProgress = loadingProgress;
