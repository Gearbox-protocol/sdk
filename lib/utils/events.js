"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typedEventsComparator = void 0;
var typedEventsComparator = function (a, b) {
    return a.blockNumber === b.blockNumber
        ? a.logIndex > b.logIndex
            ? 1
            : -1
        : a.blockNumber > b.blockNumber
            ? 1
            : -1;
};
exports.typedEventsComparator = typedEventsComparator;
