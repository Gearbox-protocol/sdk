"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContractName = exports.deployedContracts = void 0;
var contracts_1 = require("./contracts");
exports.deployedContracts = (_a = {
        // MAINNET
        "0x24946bCbBd028D5ABb62ad9B635EB1b1a67AF668": "DAI",
        "0x777E23A2AcB2fCbB35f6ccF98272d03C722Ba6EB": "DAI",
        "0x86130bDD69143D8a4E5fc50bf4323D48049E98E4": "USDC",
        "0x2664cc24CBAd28749B3Dd6fC97A6B402484De527": "USDC",
        "0xB03670c20F87f2169A7c4eBE35746007e9575901": "WETH",
        "0x968f9a68a98819E2e6Bb910466e191A7b6cf02F0": "WETH",
        "0xB2A015c71c17bCAC6af36645DEad8c572bA08A08": "WBTC",
        "0xC38478B0A4bAFE964C3526EEFF534d70E1E09017": "WBTC"
    },
    _a[contracts_1.UNISWAP_V2_ROUTER] = "Uniswap V2",
    _a[contracts_1.UNISWAP_V3_ROUTER] = "Uniswap V3",
    _a[contracts_1.CURVE_3POOL_ADDRESS] = "Curve 3Pool",
    _a[contracts_1.SUSHISWAP_MAINNET] = "Sushiswap",
    _a[contracts_1.YEARN_DAI_ADDRESS] = "Yearn DAI",
    _a[contracts_1.YEARN_USDC_ADDRESS] = "Yearn USDC",
    // KOVAN
    _a["0xc40B71BCcb749D91923654571f715Bf1FC464E66"] = "DAI",
    _a["0x1b0c9312FB74d08e57F49Ee5e4601a1846dc2207"] = "USDC",
    _a["0x4b20dD834B8898caC2c1B2C94163f14FA866AadC"] = "WETH",
    _a["0x2c52bc97485bcb3BeA763Fb5793eF15BA388D140"] = "WBTC",
    _a["0xe04b4db67127d1930D36f16B51653120C4285708"] = "WBTC",
    _a["0x600073357c29d169aAF3E543A4519749830553F1"] = "WETH",
    _a["0xdBAd1361d9A03B81Be8D3a54Ef0dc9e39a1bA5b3"] = "USDC",
    _a["0x50d1fA47b0D88BA0D108148B8481b4A762eFB99e"] = "DAI",
    _a[contracts_1.YEARN_DAI_KOVAN_MOCK] = "Yearn DAI",
    _a[contracts_1.YEARN_USDC_KOVAN_MOCK] = "Yearn USDC",
    _a[contracts_1.SUSHISWAP_KOVAN] = "Sushiswap",
    _a);
function getContractName(address) {
    Object.entries(exports.deployedContracts).forEach(function (_a) {
        var addr = _a[0], name = _a[1];
        exports.deployedContracts[addr.toLowerCase()] = name;
    });
    return exports.deployedContracts[address.toLowerCase()] || address;
}
exports.getContractName = getContractName;
