import { NOT_DEPLOYED } from "../core/constants";
import { SupportedToken } from "../tokens/token";
import { OracleType, PriceFeedData } from "./oracles";

export const GAS_PRICE_FEED = "0x169e633a2d1e6c10dd91238ba11c4a708dfef37c";

export const priceFeedsByNetwork: Record<SupportedToken, PriceFeedData> = {
  "1INCH": {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0xc929ad75B72593967DE83E7F7Cda0493458261D9",
      Arbitrum: "0x4813419C6783c36d10F97f08552310bf483fBD97",
    },
  },

  AAVE: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0x547a514d5e3769680Ce22B2361c10Ea13619e8a9",
      Arbitrum: "0xEB24b7c2fB6497f28c937942439B4EAAE9535525",
    },
  },

  COMP: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0xdbd020CAeF83eFd542f4De03e3cF0C28A4428bd5",
      Arbitrum: "0xd31C7E8aa6871Fb09D5E01f17C54895F8237fB60",
    },
  },

  CRV: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0xCd627aA160A6fA45Eb793D19Ef54f5062F20f33f",
      Arbitrum: "0x7f93084ECf52D4361A3E3E25F9Dafe005830C98C",
    },
  },

  DAI: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
      Arbitrum: "0x1d34dd6780cC0B78aAfc8bC168e99ABEA147E85d",
    },
  },

  DPI: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0xD2A593BF7594aCE1faD597adb697b5645d5edDB2",
      Arbitrum: "0xEA89a0168b9940b825B28CbF172B12c486a0FDf7",
    },
  },

  FEI: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0x31e0a88fecB6eC0a411DBe0e9E76391498296EE9",
      Arbitrum: "0xAF884aF60E28214233039c243F5DF98a52355CFB",
    },
  },

  GUSD: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0xa89f5d2365ce98B3cD68012b6f503ab1416245Fc",
      Arbitrum: "0x2C799CE9f858c9Fe0825D87ddd68F4dB46A485BE",
    },
  },

  LINK: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
      Arbitrum: "0xa6fD8da40eCC3fd22cA8c13eF90B95cDf1346bEC",
    },
  },

  SNX: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0xDC3EA94CD0AC27d9A86C180091e7f78C683d3699",
      Arbitrum: "0xe19591bD0a702D0E46407a512885d2ce81fc63C8",
    },
  },

  UNI: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0x553303d460EE0afB37EdFf9bE42922D8FF63220e",
      Arbitrum: "0x9d5A93659c281dEBc71ADB719f19999BfdCD4177",
    },
  },

  USDC: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
      Arbitrum: "0xC24EC8bD3441da32f06BfEd3A4778133ad48a665",
    },
  },

  USDT: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D",
      Arbitrum: "0x45a963a68848a850262Cb5aa1F5Be7dC4a6f0Abd",
    },
  },

  WBTC: {
    type: OracleType.COMPOSITE_ORACLE,
    targetToBasePriceFeed: {
      Mainnet: "0xfdFD9C85aD200c506Cf9e21F1FD8dd01932FBB23",
      Arbitrum: "",
    },
    baseToUsdPriceFeed: {
      Mainnet: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
      Arbitrum: "0x048F634279BE1CC4De3F17fD4c31101bAD0826c8",
    },
  },

  WETH: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      Arbitrum: "0x491741d9F426130d1bC27Aee82f8b4Bd4E6E5f5D",
    },
  },

  YFI: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0xA027702dbb89fbd58938e4324ac03B58d812b0E1",
      Arbitrum: "0x2d764833c4985A90Beb7DB43d4FFAD5Bb9675B9e",
    },
  },

  /// UPDATE
  STETH: {
    type: OracleType.COMPOSITE_ORACLE,

    targetToBasePriceFeed: {
      Mainnet: "0x86392dC19c0b719886221c78AB11eb8Cf5c52812",
      Arbitrum: "0x78622A939324C5dC1B646D113358f54f0BA4353B",
    },
    baseToUsdPriceFeed: {
      Mainnet: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      Arbitrum: "0x491741d9F426130d1bC27Aee82f8b4Bd4E6E5f5D",
    },
  },

  wstETH: {
    type: OracleType.WSTETH_ORACLE,
    token: "STETH",
  },

  CVX: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0xd962fC30A72A84cE50161031391756Bf2876Af5D",
      Arbitrum: "0xF958760fd9c0E019e355f31c3D69f0E5239597D0",
    },
  },

  FRAX: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0xB9E1E3A9feFf48998E45Fa90847ed4D467E8BcfD",
      Arbitrum: "0xC095CEa800dBAdcCc742124b68399Ac6ADF5d8eC",
    },
  },
  LUSD: {
    type: OracleType.BOUNDED_ORACLE,
    targetPriceFeed: {
      Mainnet: "0x3D7aE7E594f2f2091Ad8798313450130d0Aba3a0",
      Arbitrum: "0xd6852347062aB885B6Fb9F7220BedCc5A39CE862",
    },
    upperBound: (BigInt(1e8) * 11n) / 10n,
  },
  sUSD: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0xad35Bd71b9aFE6e4bDc266B345c198eaDEf9Ad94",
      Arbitrum: "0x725F188BF87DaF7A7c3de39276ad78a2b8559793",
    },
  },

  FXS: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0x6Ebc52C8C1089be9eB3945C4350B68B8E4C2233f",
      Arbitrum: "0x2E49F1FbBdA0000E89376D3332A1d42dBeF3D205",
    },
  },
  LDO: {
    type: OracleType.COMPOSITE_ORACLE,

    targetToBasePriceFeed: {
      Mainnet: "0x4e844125952D32AcdF339BE976c98E22F6F318dB",
      Arbitrum: "0x6569bae7114121aE82303F42f42b64012DcCbD7d",
    },
    baseToUsdPriceFeed: {
      Mainnet: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      Arbitrum: "0x491741d9F426130d1bC27Aee82f8b4Bd4E6E5f5D",
    },

    // ADD ETH-> DAI Oracle!
  },
  LQTY: {
    type: OracleType.ZERO_ORACLE,
  },

  OHM: {
    type: OracleType.COMPOSITE_ORACLE,

    targetToBasePriceFeed: {
      Mainnet: "0x9a72298ae3886221820B1c878d12D872087D3a23",
      Arbitrum: NOT_DEPLOYED,
    },
    baseToUsdPriceFeed: {
      Mainnet: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      Arbitrum: "0x491741d9F426130d1bC27Aee82f8b4Bd4E6E5f5D",
    },
  },

  MIM: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0x7A364e8770418566e3eb2001A96116E6138Eb32F",
      Arbitrum: NOT_DEPLOYED,
    },
  },

  SPELL: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0x8c110B94C5f1d347fAcF5E1E938AB2db60E3c9a8",
      Arbitrum: NOT_DEPLOYED,
    },
  },

  yvDAI: {
    type: OracleType.YEARN_ORACLE,
    token: "DAI",
  },
  yvUSDC: {
    type: OracleType.YEARN_ORACLE,
    token: "USDC",
  },
  yvWETH: {
    type: OracleType.YEARN_ORACLE,
    token: "WETH",
  },
  yvWBTC: {
    type: OracleType.YEARN_ORACLE,
    token: "WBTC",
  },

  // CURVE LP TOKENS

  "3Crv": {
    type: OracleType.CURVE_3LP_ORACLE,
    assets: ["DAI", "USDC", "USDT"],
  },

  crvFRAX: {
    type: OracleType.CURVE_2LP_ORACLE,
    assets: ["FRAX", "USDC"],
  },

  steCRV: {
    type: OracleType.CURVE_2LP_ORACLE,
    assets: ["STETH", "WETH"],
  },
  FRAX3CRV: {
    type: OracleType.CURVE_4LP_ORACLE,
    assets: ["FRAX", "DAI", "USDC", "USDT"],
  },

  LUSD3CRV: {
    type: OracleType.CURVE_4LP_ORACLE,
    assets: ["LUSD", "DAI", "USDC", "USDT"],
  },

  crvPlain3andSUSD: {
    type: OracleType.CURVE_4LP_ORACLE,
    assets: ["DAI", "USDC", "USDT", "sUSD"],
  },

  gusd3CRV: {
    type: OracleType.CURVE_4LP_ORACLE,
    assets: ["GUSD", "DAI", "USDC", "USDT"],
  },

  MIM_3LP3CRV: {
    type: OracleType.CURVE_4LP_ORACLE,
    assets: ["MIM", "DAI", "USDC", "USDT"],
  },

  OHMFRAXBP: {
    type: OracleType.CURVE_CRYPTO_ORACLE,
    assets: ["OHM", "crvFRAX"],
  },

  crvCRVETH: {
    type: OracleType.CURVE_CRYPTO_ORACLE,
    assets: ["WETH", "CRV"],
  },

  crvCVXETH: {
    type: OracleType.CURVE_CRYPTO_ORACLE,
    assets: ["WETH", "CVX"],
  },

  crvUSDTWBTCWETH: {
    type: OracleType.CURVE_CRYPTO_ORACLE,
    assets: ["USDT", "WBTC", "WETH"],
  },

  LDOETH: {
    type: OracleType.CURVE_CRYPTO_ORACLE,
    assets: ["LDO", "WETH"],
  },

  // YEARN- CURVE TOKENS

  yvCurve_stETH: {
    type: OracleType.YEARN_ORACLE,
    token: "steCRV",
  },
  yvCurve_FRAX: {
    type: OracleType.YEARN_ORACLE,
    token: "FRAX3CRV",
  },

  // CVX tokens
  cvx3Crv: {
    type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
    curveSymbol: "3Crv",
  },
  cvxcrvFRAX: {
    type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
    curveSymbol: "crvFRAX",
  },
  cvxsteCRV: {
    type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
    curveSymbol: "steCRV",
  },
  cvxFRAX3CRV: {
    type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
    curveSymbol: "FRAX3CRV",
  },
  cvxLUSD3CRV: {
    type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
    curveSymbol: "LUSD3CRV",
  },
  cvxcrvPlain3andSUSD: {
    type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
    curveSymbol: "crvPlain3andSUSD",
  },
  cvxgusd3CRV: {
    type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
    curveSymbol: "gusd3CRV",
  },
  cvxOHMFRAXBP: {
    type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
    curveSymbol: "OHMFRAXBP",
  },
  cvxMIM_3LP3CRV: {
    type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
    curveSymbol: "MIM_3LP3CRV",
  },

  cvxcrvCRVETH: {
    type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
    curveSymbol: "crvCRVETH",
  },
  cvxcrvCVXETH: {
    type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
    curveSymbol: "crvCVXETH",
  },
  cvxcrvUSDTWBTCWETH: {
    type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
    curveSymbol: "crvUSDTWBTCWETH",
  },

  cvxLDOETH: {
    type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
    curveSymbol: "LDOETH",
  },

  // CVX tokens
  stkcvx3Crv: {
    type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
    curveSymbol: "3Crv",
  },
  stkcvxcrvFRAX: {
    type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
    curveSymbol: "crvFRAX",
  },
  stkcvxsteCRV: {
    type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
    curveSymbol: "steCRV",
  },
  stkcvxFRAX3CRV: {
    type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
    curveSymbol: "FRAX3CRV",
  },
  stkcvxLUSD3CRV: {
    type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
    curveSymbol: "LUSD3CRV",
  },
  stkcvxcrvPlain3andSUSD: {
    type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
    curveSymbol: "crvPlain3andSUSD",
  },
  stkcvxgusd3CRV: {
    type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
    curveSymbol: "gusd3CRV",
  },
  stkcvxOHMFRAXBP: {
    type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
    curveSymbol: "OHMFRAXBP",
  },
  stkcvxMIM_3LP3CRV: {
    type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
    curveSymbol: "MIM_3LP3CRV",
  },
  stkcvxcrvCRVETH: {
    type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
    curveSymbol: "crvCRVETH",
  },
  stkcvxcrvCVXETH: {
    type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
    curveSymbol: "crvCVXETH",
  },
  stkcvxcrvUSDTWBTCWETH: {
    type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
    curveSymbol: "crvUSDTWBTCWETH",
  },
  stkcvxLDOETH: {
    type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
    curveSymbol: "LDOETH",
  },
  "50OHM_50DAI": {
    type: OracleType.BALANCER_WEIGHTED_LP_ORACLE,
    assets: ["OHM", "DAI"],
  },
  "50OHM_50WETH": {
    type: OracleType.BALANCER_WEIGHTED_LP_ORACLE,
    assets: ["OHM", "WETH"],
  },
  OHM_wstETH: {
    type: OracleType.BALANCER_WEIGHTED_LP_ORACLE,
    assets: ["OHM", "wstETH"],
  },

  // GEARBOX
  dDAI: {
    type: OracleType.CHAINLINK_ORACLE,
    address: { Mainnet: "", Arbitrum: "" },
  },

  dUSDC: {
    type: OracleType.CHAINLINK_ORACLE,
    address: { Mainnet: "", Arbitrum: "" },
  },

  dWBTC: {
    type: OracleType.CHAINLINK_ORACLE,
    address: { Mainnet: "", Arbitrum: "" },
  },

  dWETH: {
    type: OracleType.CHAINLINK_ORACLE,
    address: { Mainnet: "", Arbitrum: "" },
  },

  dwstETH: {
    type: OracleType.CHAINLINK_ORACLE,
    address: { Mainnet: "", Arbitrum: "" },
  },

  dFRAX: {
    type: OracleType.CHAINLINK_ORACLE,
    address: { Mainnet: "", Arbitrum: "" },
  },

  GEAR: {
    type: OracleType.CHAINLINK_ORACLE,
    address: { Mainnet: "", Arbitrum: "" },
  },
};
