import { OracleType, TokenPriceFeedData } from "../core/oracles";
import { SupportedTokens } from "./token";

export const priceFeedsByNetwork: Record<SupportedTokens, TokenPriceFeedData> =
  {
    "1INCH": {
      priceFeedETH: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0x72AFAECF99C9d9C8215fF44C77B94B99C28741e8",
        kovan: "0x5b65757C2d37c4FDc3c029ECb8F2C7AD3FD361C9"
      },
      priceFeedUSD: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0xc929ad75B72593967DE83E7F7Cda0493458261D9",
        kovan: "0xb32946c38C4F2e3e44Ce2aB059BfFec163816A4E"
      }
    },

    AAVE: {
      priceFeedETH: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0x6Df09E975c830ECae5bd4eD9d90f3A95a4f88012",
        kovan: "0x3e12e9aE09F4ce9D5809E4b863bF4eef16f9949C"
      },
      priceFeedUSD: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0x547a514d5e3769680Ce22B2361c10Ea13619e8a9",
        kovan: "0xF1594a023a3e061765c11af09EC6B7c63e2e9Ab5"
      }
    },

    COMP: {
      priceFeedETH: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0x1B39Ee86Ec5979ba5C322b826B3ECb8C79991699",
        kovan: "0x2d2fAc1CBf67b24d3643ce084f3758115b1dCFe0"
      },
      priceFeedUSD: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0xdbd020CAeF83eFd542f4De03e3cF0C28A4428bd5",
        kovan: "0xECF93D14d25E02bA2C13698eeDca9aA98348EFb6"
      }
    },

    CRV: {
      priceFeedETH: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0x8a12Be339B0cD1829b91Adc01977caa5E9ac121e",
        kovan: "0x57F80b54722B294F0C1942AA70468Bb46437AD19"
      },
      priceFeedUSD: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0xcd627aa160a6fa45eb793d19ef54f5062f20f33f",
        kovan: "0x55fe324Ece17b6902c2b3776c1baB1095Eb5deB0"
      }
    },

    DAI: {
      priceFeedETH: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0x773616E4d11A78F511299002da57A0a94577F1f4",
        kovan: "0x22B58f1EbEDfCA50feF632bD73368b2FdA96D541"
      },
      priceFeedUSD: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
        kovan: "0x777A68032a88E5A84678A77Af2CD65A7b3c0775a"
      }
    },

    DPI: {
      priceFeedETH: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0x029849bbc0b1d93b85a8b6190e979fd38F5760E2",
        kovan: "0x4c1b676445935dA58a48b6dA8B2564684d80fAEE"
      },
      priceFeedUSD: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0xD2A593BF7594aCE1faD597adb697b5645d5edDB2",
        kovan: "0x39EcBDd1069C795e65Aa3355cC42F3acD29797d8"
      }
    },

    FEI: {
      priceFeedETH: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0x7f0d2c2838c6ac24443d13e23d99490017bde370",
        kovan: "0x1E13BFc6e358410f4F94EAC84C1008A138FB115B"
      },
      priceFeedUSD: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0x31e0a88fecb6ec0a411dbe0e9e76391498296ee9",
        kovan: "0x9FE550626246234EF48a1176e8e2452A14CbbA24"
      }
    },

    GUSD: {
      priceFeedUSD: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0xa89f5d2365ce98B3cD68012b6f503ab1416245Fc",
        kovan: "0x36AD5755A58c5faB253D5e40e7F0f86293d6A5f9"
      }
    },

    LINK: {
      priceFeedETH: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0xDC530D9457755926550b59e8ECcdaE7624181557",
        kovan: "0x3Af8C569ab77af5230596Acf0E8c2F9351d24C38"
      },
      priceFeedUSD: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
        kovan: "0x396c5E36DD0a0F5a5D33dae44368D4193f69a1F0"
      }
    },

    SNX: {
      priceFeedETH: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0x79291A9d692Df95334B1a0B3B4AE6bC606782f8c",
        kovan: "0xF9A76ae7a1075Fe7d646b06fF05Bd48b9FA5582e"
      },
      priceFeedUSD: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0xDC3EA94CD0AC27d9A86C180091e7f78C683d3699",
        kovan: "0x31f93DA9823d737b7E44bdee0DF389Fe62Fd1AcD"
      }
    },

    SUSHI: {
      priceFeedETH: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0xe572CeF69f43c2E488b33924AF04BDacE19079cf",
        kovan: "0x6A8b2Aae8bf973EdA172C1f0e450c9D4e3C2E360"
      },
      priceFeedUSD: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0xcc70f09a6cc17553b2e31954cd36e4a2d89501f7",
        kovan: "0x40D447115370C4B65A0d8C63275033C54A3ed61F"
      }
    },

    UNI: {
      priceFeedETH: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0xD6aA3D25116d8dA79Ea0246c4826EB951872e02e",
        kovan: "0x006A9A6c0A6b5230d89f05eb1e4603AA6B1508BE"
      },
      priceFeedUSD: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0x553303d460EE0afB37EdFf9bE42922D8FF63220e",
        kovan: "0xDA5904BdBfB4EF12a3955aEcA103F51dc87c7C39"
      }
    },

    USDC: {
      priceFeedETH: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0x986b5E1e1755e3C2440e960477f25201B0a8bbD4",
        kovan: "0x64EaC61A2DFda2c3Fa04eED49AA33D021AeC8838"
      },
      priceFeedUSD: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
        kovan: "0x9211c6b3BF41A10F78539810Cf5c64e1BB78Ec60"
      }
    },

    USDT: {
      priceFeedETH: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46",
        kovan: "0x0bF499444525a23E7Bb61997539725cA2e928138"
      },
      priceFeedUSD: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0x3e7d1eab13ad0104d2750b8863b489d65364e32d",
        kovan: "0x2ca5A90D34cA333661083F89D831f757A9A50148"
      }
    },

    WBTC: {
      priceFeedETH: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0xdeb288F737066589598e9214E782fa5A8eD689e8",
        kovan: "0xB4F231198CAA3446fd4623e59f2EF27e7A58A54b"
      },
      priceFeedUSD: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
        kovan: "0x6135b13325bfC4B00278B4abC5e20bbce2D6580e"
      }
    },

    WETH: {
      priceFeedUSD: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
        kovan: "0x9326BFA02ADD2366b30bacB125260Af641031331"
      }
    },

    YFI: {
      priceFeedETH: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0x7c5d4F8345e66f68099581Db340cd65B078C41f4",
        kovan: "0x29d651D233ffFdec4Df5244a9cE842FB253fAA09"
      },
      priceFeedUSD: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0xA027702dbb89fbd58938e4324ac03B58d812b0E1",
        kovan: "0x7f6a535B75E2c815f8865CF39Ad847971AcCC3bE"
      }
    },

    /// UPDATE
    STETH: {
      priceFeedETH: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0xcfe54b5cd566ab89272946f602d76ea879cab4a8",
        kovan: "0x087154969f935218e10f621D81e523C8f46C6dF9"
      },
      priceFeedUSD: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0xCfE54B5cD566aB89272946F602D76Ea879CAb4a8",
        kovan: "0x94dd77F85E0B1e6942B044E604EBA4869369453c"
      }
    },

    FTM: {
      priceFeedETH: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0x2de7e4a9488488e0058b95854cc2f7955b35dc9b",
        kovan: "0xdCd1eB60388F340d7bF6584aa4295D95b355686c"
      }
    },

    CVX: {
      priceFeedUSD: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0xd962fc30a72a84ce50161031391756bf2876af5d",
        kovan: "0xa6CeAbA9326C3a7Ed6A03A1cb0809A397ed286ae"
      }
    },

    FRAX: {
      priceFeedUSD: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0xb9e1e3a9feff48998e45fa90847ed4d467e8bcfd",
        kovan: "0xD696fF0750F753A605236Ab499E5432e0FdeCd72"
      }
    },
    LUSD: {
      priceFeedUSD: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0x3D7aE7E594f2f2091Ad8798313450130d0Aba3a0",
        kovan: "0xc17F8AE0c6C060F76303Be13f5f059144b38e75e"
      }
    },
    sUSD: {
      priceFeedUSD: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0xad35bd71b9afe6e4bdc266b345c198eadef9ad94",
        kovan: "0xe45b2D1e60d94209ef36e2E66a232daefc418de2"
      }
    },

    FXS: {
      priceFeedUSD: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0x6ebc52c8c1089be9eb3945c4350b68b8e4c2233f",
        kovan: "0xC6f5343637279AF7e2a4e12066Fb5ae567275E5F"
      }
    },
    LDO: {
      priceFeedETH: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0x4e844125952d32acdf339be976c98e22f6f318db",
        kovan: "0x6204148EF888786A2988E7b09c8e0A67e32cb387"
      }

      // ADD ETH-> DAI Oracle!
    },
    LQTY: {
      priceFeedUSD: {
        type: OracleType.ZERO_ORACLE
      }
    },
    SPELL: {
      priceFeedUSD: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0x8c110b94c5f1d347facf5e1e938ab2db60e3c9a8",
        kovan: "0x68da666AcD151A3edB62c1ad1b748cCcFca026d7"
      }
    },
    LUNA: {
      priceFeedETH: {
        type: OracleType.CHAINLINK_ORACLE,
        address: "0x91e9331556ed76c9393055719986409e11b56f73",
        kovan: "0xEfAe1275132C3D2EE009148748e3e3e384095E5f"
      }
    },

    yvDAI: {
      priceFeedETH: {
        type: OracleType.YEARN_TOKEN_ORACLE,
        token: "DAI",
        deployedKovan: ""
      },
      priceFeedUSD: {
        type: OracleType.YEARN_TOKEN_ORACLE,
        token: "DAI"
      }
    },
    yvUSDC: {
      priceFeedETH: {
        type: OracleType.YEARN_TOKEN_ORACLE,
        token: "USDC",
        deployedKovan: ""
      },
      priceFeedUSD: {
        type: OracleType.YEARN_TOKEN_ORACLE,
        token: "USDC"
      }
    },
    yvWETH: {
      priceFeedUSD: {
        type: OracleType.YEARN_TOKEN_ORACLE,
        token: "WETH"
      }
    },
    yvWBTC: {
      priceFeedUSD: {
        type: OracleType.YEARN_TOKEN_ORACLE,
        token: "WBTC"
      }
    },

    // CURVE LP TOKENS

    "3Crv": {
      priceFeedUSD: {
        type: OracleType.CURVE_LP_ORACLE,
        assets: ["DAI", "USDC", "USDT"]
      }
    },

    steCRV: {
      priceFeedUSD: {
        type: OracleType.CURVE_LP_ORACLE,
        assets: ["STETH", "WETH"]
      }
    },
    FRAX3CRV: {
      priceFeedUSD: {
        type: OracleType.CURVE_LP_ORACLE,
        assets: ["FRAX", "DAI", "USDC", "USDT"]
      }
    },

    LUSD3CRV: {
      priceFeedUSD: {
        type: OracleType.CURVE_LP_ORACLE,
        assets: ["LUSD", "DAI", "USDC", "USDT"]
      }
    },

    crvPlain3andSUSD: {
      priceFeedUSD: {
        type: OracleType.CURVE_LP_ORACLE,
        assets: ["DAI", "USDC", "USDT", "sUSD"]
      }
    },

    gusd3CRV: {
      priceFeedUSD: {
        type: OracleType.CURVE_LP_ORACLE,
        assets: ["GUSD", "DAI", "USDC", "USDT"]
      }
    },

    // YEARN- CURVE TOKENS

    yvCurve_stETH: {
      priceFeedUSD: {
        type: OracleType.YEARN_CURVE_LP_ORACLE,
        curveSymbol: "steCRV"
      }
    },
    yvCurve_FRAX: {
      priceFeedUSD: {
        type: OracleType.YEARN_CURVE_LP_ORACLE,
        curveSymbol: "FRAX3CRV"
      }
    },

    // CVX tokens
    cvx3Crv: {
      priceFeedUSD: {
        type: OracleType.LIKE_CURVE_LP_ORACLE,
        curveSymbol: "3Crv"
      }
    },
    cvxsteCRV: {
      priceFeedUSD: {
        type: OracleType.LIKE_CURVE_LP_ORACLE,
        curveSymbol: "steCRV"
      }
    },
    cvxFRAX3CRV: {
      priceFeedUSD: {
        type: OracleType.LIKE_CURVE_LP_ORACLE,
        curveSymbol: "FRAX3CRV"
      }
    },
    cvxcrvPlain3andSUSD: {
      priceFeedUSD: {
        type: OracleType.LIKE_CURVE_LP_ORACLE,
        curveSymbol: "crvPlain3andSUSD"
      }
    },
    cvxgusd3CRV: {
      priceFeedUSD: {
        type: OracleType.LIKE_CURVE_LP_ORACLE,
        curveSymbol: "gusd3CRV"
      }
    }
  };
