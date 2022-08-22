import { SupportedToken } from "../tokens/token";
import { OracleType, TokenPriceFeedData } from "./oracles";

export const priceFeedsByNetwork: Record<SupportedToken, TokenPriceFeedData> = {
  "1INCH": {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x72AFAECF99C9d9C8215fF44C77B94B99C28741e8",
        Goerli: "TODO: DEPLOY ME",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xc929ad75B72593967DE83E7F7Cda0493458261D9",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },

  AAVE: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x6Df09E975c830ECae5bd4eD9d90f3A95a4f88012",
        Goerli: "TODO: DEPLOY ME",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x547a514d5e3769680Ce22B2361c10Ea13619e8a9",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },

  COMP: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x1B39Ee86Ec5979ba5C322b826B3ECb8C79991699",
        Goerli: "TODO: DEPLOY ME",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xdbd020CAeF83eFd542f4De03e3cF0C28A4428bd5",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },

  CRV: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x8a12Be339B0cD1829b91Adc01977caa5E9ac121e",
        Goerli: "TODO: DEPLOY ME",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xcd627aa160a6fa45eb793d19ef54f5062f20f33f",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },

  DAI: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x773616E4d11A78F511299002da57A0a94577F1f4",
        Goerli: "TODO: DEPLOY ME",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },

  DPI: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x029849bbc0b1d93b85a8b6190e979fd38F5760E2",
        Goerli: "TODO: DEPLOY ME",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xD2A593BF7594aCE1faD597adb697b5645d5edDB2",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },

  FEI: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x7f0d2c2838c6ac24443d13e23d99490017bde370",
        Goerli: "TODO: DEPLOY ME",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x31e0a88fecb6ec0a411dbe0e9e76391498296ee9",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },

  GUSD: {
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xa89f5d2365ce98B3cD68012b6f503ab1416245Fc",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },

  LINK: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xDC530D9457755926550b59e8ECcdaE7624181557",
        Goerli: "TODO: DEPLOY ME",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },

  SNX: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x79291A9d692Df95334B1a0B3B4AE6bC606782f8c",
        Goerli: "TODO: DEPLOY ME",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xDC3EA94CD0AC27d9A86C180091e7f78C683d3699",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },

  SUSHI: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xe572CeF69f43c2E488b33924AF04BDacE19079cf",
        Goerli: "TODO: DEPLOY ME",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xcc70f09a6cc17553b2e31954cd36e4a2d89501f7",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },

  UNI: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xD6aA3D25116d8dA79Ea0246c4826EB951872e02e",
        Goerli: "TODO: DEPLOY ME",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x553303d460EE0afB37EdFf9bE42922D8FF63220e",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },

  USDC: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x986b5E1e1755e3C2440e960477f25201B0a8bbD4",
        Goerli: "TODO: DEPLOY ME",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },

  USDT: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46",
        Goerli: "TODO: DEPLOY ME",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x3e7d1eab13ad0104d2750b8863b489d65364e32d",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },

  WBTC: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xdeb288F737066589598e9214E782fa5A8eD689e8",
        Goerli: "TODO: DEPLOY ME",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },

  WETH: {
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },

  YFI: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x7c5d4F8345e66f68099581Db340cd65B078C41f4",
        Goerli: "TODO: DEPLOY ME",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xA027702dbb89fbd58938e4324ac03B58d812b0E1",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },

  /// UPDATE
  STETH: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xcfe54b5cd566ab89272946f602d76ea879cab4a8",
        Goerli: "TODO: DEPLOY ME",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xCfE54B5cD566aB89272946F602D76Ea879CAb4a8",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },

  FTM: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x2de7e4a9488488e0058b95854cc2f7955b35dc9b",
        Goerli: "TODO: DEPLOY ME",
      },
    },
    priceFeedUSD: {
      type: OracleType.ZERO_ORACLE,
    },
  },

  CVX: {
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xd962fc30a72a84ce50161031391756bf2876af5d",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },

  FRAX: {
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xb9e1e3a9feff48998e45fa90847ed4d467e8bcfd",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },
  LUSD: {
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x3D7aE7E594f2f2091Ad8798313450130d0Aba3a0",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },
  sUSD: {
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xad35bd71b9afe6e4bdc266b345c198eadef9ad94",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },

  FXS: {
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x6ebc52c8c1089be9eb3945c4350b68b8e4c2233f",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },
  LDO: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x4e844125952d32acdf339be976c98e22f6f318db",
        Goerli: "TODO: DEPLOY ME",
      },
    },
    priceFeedUSD: {
      type: OracleType.ZERO_ORACLE,
    },

    // ADD ETH-> DAI Oracle!
  },
  LQTY: {
    priceFeedUSD: {
      type: OracleType.ZERO_ORACLE,
    },
  },
  SPELL: {
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x8c110b94c5f1d347facf5e1e938ab2db60e3c9a8",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },
  LUNA: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x91e9331556ed76c9393055719986409e11b56f73",
        Goerli: "TODO: DEPLOY ME",
      },
    },
    priceFeedUSD: {
      type: OracleType.ZERO_ORACLE,
    },
  },

  yvDAI: {
    priceFeedETH: {
      type: OracleType.YEARN_TOKEN_ORACLE,
      token: "DAI",
      address: {
        Mainnet: "",
        Goerli: "TODO: DEPLOY ME",
      },
    },
    priceFeedUSD: {
      type: OracleType.YEARN_TOKEN_ORACLE,
      token: "DAI",
      address: {
        Mainnet: "",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },
  yvUSDC: {
    priceFeedETH: {
      type: OracleType.YEARN_TOKEN_ORACLE,
      token: "USDC",
      address: {
        Mainnet: "",
        Goerli: "TODO: DEPLOY ME",
      },
    },
    priceFeedUSD: {
      type: OracleType.YEARN_TOKEN_ORACLE,
      token: "USDC",
      address: {
        Mainnet: "",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },
  yvWETH: {
    priceFeedUSD: {
      type: OracleType.YEARN_TOKEN_ORACLE,
      token: "WETH",
      address: {
        Mainnet: "",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },
  yvWBTC: {
    priceFeedUSD: {
      type: OracleType.YEARN_TOKEN_ORACLE,
      token: "WBTC",
      address: {
        Mainnet: "",
        Goerli: "TODO: DEPLOY ME",
      },
    },
  },

  // CURVE LP TOKENS

  "3Crv": {
    priceFeedUSD: {
      type: OracleType.CURVE_LP_ORACLE,
      assets: ["DAI", "USDC", "USDT"],
    },
  },

  steCRV: {
    priceFeedUSD: {
      type: OracleType.CURVE_LP_ORACLE,
      assets: ["STETH", "WETH"],
    },
  },
  FRAX3CRV: {
    priceFeedUSD: {
      type: OracleType.CURVE_LP_ORACLE,
      assets: ["FRAX", "DAI", "USDC", "USDT"],
    },
  },

  LUSD3CRV: {
    priceFeedUSD: {
      type: OracleType.CURVE_LP_ORACLE,
      assets: ["LUSD", "DAI", "USDC", "USDT"],
    },
  },

  crvPlain3andSUSD: {
    priceFeedUSD: {
      type: OracleType.CURVE_LP_ORACLE,
      assets: ["DAI", "USDC", "USDT", "sUSD"],
    },
  },

  gusd3CRV: {
    priceFeedUSD: {
      type: OracleType.CURVE_LP_ORACLE,
      assets: ["GUSD", "DAI", "USDC", "USDT"],
    },
  },

  // YEARN- CURVE TOKENS

  yvCurve_stETH: {
    priceFeedUSD: {
      type: OracleType.YEARN_CURVE_LP_ORACLE,
      curveSymbol: "steCRV",
    },
  },
  yvCurve_FRAX: {
    priceFeedUSD: {
      type: OracleType.YEARN_CURVE_LP_ORACLE,
      curveSymbol: "FRAX3CRV",
    },
  },

  // CVX tokens
  cvx3Crv: {
    priceFeedUSD: {
      type: OracleType.LIKE_CURVE_LP_ORACLE,
      curveSymbol: "3Crv",
    },
  },
  cvxsteCRV: {
    priceFeedUSD: {
      type: OracleType.LIKE_CURVE_LP_ORACLE,
      curveSymbol: "steCRV",
    },
  },
  cvxFRAX3CRV: {
    priceFeedUSD: {
      type: OracleType.LIKE_CURVE_LP_ORACLE,
      curveSymbol: "FRAX3CRV",
    },
  },
  cvxLUSD3CRV: {
    priceFeedUSD: {
      type: OracleType.LIKE_CURVE_LP_ORACLE,
      curveSymbol: "LUSD3CRV",
    },
  },
  cvxcrvPlain3andSUSD: {
    priceFeedUSD: {
      type: OracleType.LIKE_CURVE_LP_ORACLE,
      curveSymbol: "crvPlain3andSUSD",
    },
  },
  cvxgusd3CRV: {
    priceFeedUSD: {
      type: OracleType.LIKE_CURVE_LP_ORACLE,
      curveSymbol: "gusd3CRV",
    },
  },
  // CVX tokens
  stkcvx3Crv: {
    priceFeedUSD: {
      type: OracleType.LIKE_CURVE_LP_ORACLE,
      curveSymbol: "3Crv",
    },
  },
  stkcvxsteCRV: {
    priceFeedUSD: {
      type: OracleType.LIKE_CURVE_LP_ORACLE,
      curveSymbol: "steCRV",
    },
  },
  stkcvxFRAX3CRV: {
    priceFeedUSD: {
      type: OracleType.LIKE_CURVE_LP_ORACLE,
      curveSymbol: "FRAX3CRV",
    },
  },
  stkcvxLUSD3CRV: {
    priceFeedUSD: {
      type: OracleType.LIKE_CURVE_LP_ORACLE,
      curveSymbol: "LUSD3CRV",
    },
  },
  stkcvxcrvPlain3andSUSD: {
    priceFeedUSD: {
      type: OracleType.LIKE_CURVE_LP_ORACLE,
      curveSymbol: "crvPlain3andSUSD",
    },
  },
  stkcvxgusd3CRV: {
    priceFeedUSD: {
      type: OracleType.LIKE_CURVE_LP_ORACLE,
      curveSymbol: "gusd3CRV",
    },
  },

  // GEARBOX
  dDAI: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: { Mainnet: "", Goerli: "" },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: { Mainnet: "", Goerli: "" },
    },
  },

  dUSDC: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: { Mainnet: "", Goerli: "" },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: { Mainnet: "", Goerli: "" },
    },
  },

  dWBTC: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: { Mainnet: "", Goerli: "" },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: { Mainnet: "", Goerli: "" },
    },
  },

  dWETH: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: { Mainnet: "", Goerli: "" },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: { Mainnet: "", Goerli: "" },
    },
  },

  GEAR: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: { Mainnet: "", Goerli: "" },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: { Mainnet: "", Goerli: "" },
    },
  },
};
