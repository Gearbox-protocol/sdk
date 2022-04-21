"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.priceFeedsByNetwork = void 0;
var ethers_1 = require("ethers");
var oracles_1 = require("../core/oracles");
var constants_1 = require("./constants");
exports.priceFeedsByNetwork = {
    "1INCH": {
        priceFeedETH: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0x72AFAECF99C9d9C8215fF44C77B94B99C28741e8"
        },
        priceFeedUSD: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0xc929ad75B72593967DE83E7F7Cda0493458261D9"
        }
    },
    AAVE: {
        priceFeedETH: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0x6Df09E975c830ECae5bd4eD9d90f3A95a4f88012"
        },
        priceFeedUSD: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0x547a514d5e3769680Ce22B2361c10Ea13619e8a9"
        }
    },
    COMP: {
        priceFeedETH: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0x1B39Ee86Ec5979ba5C322b826B3ECb8C79991699"
        },
        priceFeedUSD: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0xdbd020CAeF83eFd542f4De03e3cF0C28A4428bd5",
            kovan: "0xECF93D14d25E02bA2C13698eeDca9aA98348EFb6"
        }
    },
    CRV: {
        priceFeedETH: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0x8a12Be339B0cD1829b91Adc01977caa5E9ac121e"
        },
        priceFeedUSD: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0xcd627aa160a6fa45eb793d19ef54f5062f20f33f"
        }
    },
    DAI: {
        priceFeedETH: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0x773616E4d11A78F511299002da57A0a94577F1f4",
            kovan: "0x22B58f1EbEDfCA50feF632bD73368b2FdA96D541"
        },
        priceFeedUSD: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
            kovan: "0x777A68032a88E5A84678A77Af2CD65A7b3c0775a"
        }
    },
    DPI: {
        priceFeedETH: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0x029849bbc0b1d93b85a8b6190e979fd38F5760E2"
        },
        priceFeedUSD: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0xD2A593BF7594aCE1faD597adb697b5645d5edDB2"
        }
    },
    FEI: {
        priceFeedETH: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0x7f0d2c2838c6ac24443d13e23d99490017bde370"
        },
        priceFeedUSD: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0x31e0a88fecb6ec0a411dbe0e9e76391498296ee9"
        }
    },
    GUSD: {
        priceFeedUSD: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0xa89f5d2365ce98B3cD68012b6f503ab1416245Fc"
        }
    },
    LINK: {
        priceFeedETH: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0xDC530D9457755926550b59e8ECcdaE7624181557",
            kovan: "0x3Af8C569ab77af5230596Acf0E8c2F9351d24C38"
        },
        priceFeedUSD: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
            kovan: "0x396c5E36DD0a0F5a5D33dae44368D4193f69a1F0"
        }
    },
    SNX: {
        priceFeedETH: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0x79291A9d692Df95334B1a0B3B4AE6bC606782f8c",
            kovan: "0xF9A76ae7a1075Fe7d646b06fF05Bd48b9FA5582e"
        },
        priceFeedUSD: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0xDC3EA94CD0AC27d9A86C180091e7f78C683d3699",
            kovan: "0x31f93DA9823d737b7E44bdee0DF389Fe62Fd1AcD"
        }
    },
    SUSHI: {
        priceFeedETH: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0xe572CeF69f43c2E488b33924AF04BDacE19079cf"
        },
        priceFeedUSD: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0xcc70f09a6cc17553b2e31954cd36e4a2d89501f7"
        }
    },
    UNI: {
        priceFeedETH: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0xD6aA3D25116d8dA79Ea0246c4826EB951872e02e"
        },
        priceFeedUSD: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0x553303d460EE0afB37EdFf9bE42922D8FF63220e",
            kovan: "0xDA5904BdBfB4EF12a3955aEcA103F51dc87c7C39"
        }
    },
    USDC: {
        priceFeedETH: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0x986b5E1e1755e3C2440e960477f25201B0a8bbD4",
            kovan: "0x64EaC61A2DFda2c3Fa04eED49AA33D021AeC8838"
        },
        priceFeedUSD: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
            kovan: "0x9211c6b3BF41A10F78539810Cf5c64e1BB78Ec60"
        }
    },
    USDT: {
        priceFeedETH: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46",
            kovan: "0x0bF499444525a23E7Bb61997539725cA2e928138"
        },
        priceFeedUSD: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0x3e7d1eab13ad0104d2750b8863b489d65364e32d",
            kovan: "0x2ca5A90D34cA333661083F89D831f757A9A50148"
        }
    },
    WBTC: {
        priceFeedETH: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0xdeb288F737066589598e9214E782fa5A8eD689e8"
        },
        priceFeedUSD: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
            kovan: "0x6135b13325bfC4B00278B4abC5e20bbce2D6580e"
        }
    },
    WETH: {
        priceFeedUSD: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
            kovan: "0x9326BFA02ADD2366b30bacB125260Af641031331"
        }
    },
    YFI: {
        priceFeedETH: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0x7c5d4F8345e66f68099581Db340cd65B078C41f4"
        },
        priceFeedUSD: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0xA027702dbb89fbd58938e4324ac03B58d812b0E1"
        }
    },
    /// UPDATE
    STETH: {
        priceFeedETH: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0xcfe54b5cd566ab89272946f602d76ea879cab4a8"
        }
    },
    FTM: {
        priceFeedUSD: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0xf4766552d15ae4d256ad41b6cf2933482b0680dc"
        }
    },
    CVX: {
        priceFeedUSD: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0xd962fc30a72a84ce50161031391756bf2876af5d"
        }
    },
    FRAX: {
        priceFeedUSD: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0xb9e1e3a9feff48998e45fa90847ed4d467e8bcfd"
        }
    },
    LUSD: {
        priceFeedUSD: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0x3D7aE7E594f2f2091Ad8798313450130d0Aba3a0"
        }
    },
    sUSD: {
        priceFeedUSD: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0xad35bd71b9afe6e4bdc266b345c198eadef9ad94"
        }
    },
    FXS: {
        priceFeedUSD: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0x6ebc52c8c1089be9eb3945c4350b68b8e4c2233f"
        }
    },
    LDO: {
        priceFeedETH: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0x4e844125952d32acdf339be976c98e22f6f318db"
        }
    },
    LQTY: {
        priceFeedUSD: {
            type: oracles_1.OracleType.ZERO_ORACLE
        }
    },
    SPELL: {
        priceFeedUSD: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0x8c110b94c5f1d347facf5e1e938ab2db60e3c9a8"
        }
    },
    LUNA: {
        priceFeedETH: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0x91e9331556ed76c9393055719986409e11b56f73"
        },
        priceFeedUSD: {
            type: oracles_1.OracleType.CHAINLINK_ORACLE,
            address: "0xd660db62ac9dfafdb401f24268eb285120eb11ed"
        }
    },
    yvDAI: {
        priceFeedETH: {
            type: oracles_1.OracleType.YEARN_TOKEN_ORACLE,
            priceFeed: "0x773616E4d11A78F511299002da57A0a94577F1f4",
            lowerBound: constants_1.WAD.mul(1015).div(1000),
            upperBound: constants_1.WAD.mul(1030).div(1000)
        },
        priceFeedUSD: {
            type: oracles_1.OracleType.YEARN_TOKEN_ORACLE,
            priceFeed: "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
            lowerBound: constants_1.WAD.mul(1015).div(1000),
            upperBound: constants_1.WAD.mul(1030).div(1000)
        }
    },
    yvUSDC: {
        priceFeedETH: {
            type: oracles_1.OracleType.YEARN_TOKEN_ORACLE,
            priceFeed: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
            lowerBound: ethers_1.BigNumber.from(1000000),
            upperBound: ethers_1.BigNumber.from(1030000)
        },
        priceFeedUSD: {
            type: oracles_1.OracleType.YEARN_TOKEN_ORACLE,
            priceFeed: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
            lowerBound: ethers_1.BigNumber.from(1000000),
            upperBound: ethers_1.BigNumber.from(1030000)
        }
    },
    yvWETH: {
        priceFeedUSD: {
            type: oracles_1.OracleType.YEARN_TOKEN_ORACLE,
            priceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
            lowerBound: constants_1.WAD.mul(1008).div(1000),
            upperBound: constants_1.WAD.mul(1059).div(1000)
        }
    },
    yvWBTC: {
        priceFeedUSD: {
            type: oracles_1.OracleType.YEARN_TOKEN_ORACLE,
            priceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
            lowerBound: ethers_1.BigNumber.from("101780000"),
            upperBound: ethers_1.BigNumber.from("106870000")
        }
    },
    // CURVE LP TOKENS
    "3Crv": {
        priceFeedUSD: {
            type: oracles_1.OracleType.CURVE_LP_ORACLE,
            assets: ["DAI", "USDC", "USDT"]
        }
    },
    steCRV: {
        priceFeedUSD: {
            type: oracles_1.OracleType.CURVE_LP_ORACLE,
            assets: ["STETH", "WETH"]
        }
    },
    FRAX3CRV: {
        priceFeedUSD: {
            type: oracles_1.OracleType.CURVE_LP_ORACLE,
            assets: ["FRAX", "DAI", "USDC", "USDT"]
        }
    },
    LUSD3CRV: {
        priceFeedUSD: {
            type: oracles_1.OracleType.CURVE_LP_ORACLE,
            assets: ["LUSD", "DAI", "USDC", "USDT"]
        }
    },
    crvPlain3andSUSD: {
        priceFeedUSD: {
            type: oracles_1.OracleType.CURVE_LP_ORACLE,
            assets: ["DAI", "USDC", "USDT", "SUSD"]
        }
    },
    gusd3CRV: {
        priceFeedUSD: {
            type: oracles_1.OracleType.CURVE_LP_ORACLE,
            assets: ["GUSD", "DAI", "USDC", "USDT"]
        }
    },
    // YEARN- CURVE TOKENS
    yvCurve_stETH: {
        priceFeedUSD: {
            type: oracles_1.OracleType.YEARN_CURVE_LP_ORACLE,
            curveSymbol: "steCRV",
            lowerBound: ethers_1.BigNumber.from("1060263876405898945"),
            upperBound: ethers_1.BigNumber.from("1090263876405898945")
        }
    },
    yvCurve_FRAX: {
        priceFeedUSD: {
            type: oracles_1.OracleType.YEARN_CURVE_LP_ORACLE,
            curveSymbol: "FRAX3CRV",
            lowerBound: ethers_1.BigNumber.from("1102262133144500000"),
            upperBound: ethers_1.BigNumber.from("1108262133144500000")
        }
    },
    yvCurve_d3pool: {
        priceFeedUSD: {
            type: oracles_1.OracleType.YEARN_CURVE_LP_ORACLE,
            curveSymbol: "crvPlain3andSUSD",
            lowerBound: ethers_1.BigNumber.from("101780000"),
            upperBound: ethers_1.BigNumber.from("106870000")
        }
    },
    // CVX tokens
    cvx3Crv: {
        priceFeedUSD: {
            type: oracles_1.OracleType.LIKE_CURVE_LP_ORACLE,
            curveSymbol: "3Crv"
        }
    },
    cvxsteCRV: {
        priceFeedUSD: {
            type: oracles_1.OracleType.LIKE_CURVE_LP_ORACLE,
            curveSymbol: "steCRV"
        }
    },
    cvxFRAX3CRV: {
        priceFeedUSD: {
            type: oracles_1.OracleType.LIKE_CURVE_LP_ORACLE,
            curveSymbol: "FRAX3CRV"
        }
    },
    cvxcrvPlain3andSUSD: {
        priceFeedUSD: {
            type: oracles_1.OracleType.LIKE_CURVE_LP_ORACLE,
            curveSymbol: "crvPlain3andSUSD"
        }
    },
    cvxgusd3CRV: {
        priceFeedUSD: {
            type: oracles_1.OracleType.LIKE_CURVE_LP_ORACLE,
            curveSymbol: "gusd3CRV"
        }
    }
};
