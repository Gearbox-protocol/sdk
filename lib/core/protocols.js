"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.protocolData = exports.Protocols = void 0;
var Protocols;
(function (Protocols) {
    Protocols[Protocols["Uniswap"] = 0] = "Uniswap";
    Protocols[Protocols["Sushiswap"] = 1] = "Sushiswap";
    Protocols[Protocols["Curve"] = 2] = "Curve";
    Protocols[Protocols["Yearn"] = 3] = "Yearn";
    Protocols[Protocols["Convex"] = 4] = "Convex";
    Protocols[Protocols["Lido"] = 5] = "Lido";
})(Protocols = exports.Protocols || (exports.Protocols = {}));
exports.protocolData = (_a = {},
    _a[Protocols.Uniswap] = {
        name: "Uniswap",
        icon: "/protocols/uniswap.png"
    },
    _a[Protocols.Sushiswap] = {
        name: "Sushiswap",
        icon: "/protocols/sushi.svg"
    },
    _a[Protocols.Curve] = {
        name: "Curve",
        icon: "/protocols/curve.svg"
    },
    _a[Protocols.Yearn] = {
        name: "Yearn",
        icon: "/protocols/yearn.svg"
    },
    _a[Protocols.Convex] = {
        name: "Convex",
        icon: "/protocols/convex.svg"
    },
    _a[Protocols.Lido] = {
        name: "Lido",
        icon: "/protocols/lido.svg"
    },
    _a);
