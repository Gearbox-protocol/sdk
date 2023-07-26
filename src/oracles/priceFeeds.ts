import { NOT_DEPLOYED } from "../core/constants";
import { SupportedToken } from "../tokens/token";
import { OracleType, PriceFeedData } from "./oracles";

export const GAS_PRICE_FEED = "0x169e633a2d1e6c10dd91238ba11c4a708dfef37c";

export const priceFeedsByNetwork: Record<SupportedToken, PriceFeedData> = {
  "1INCH": {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0xc929ad75B72593967DE83E7F7Cda0493458261D9",
      Arbitrum: "0x4bc735ef24bf286983024cad5d03f0738865aaef",
    },
  },

  AAVE: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0x547a514d5e3769680Ce22B2361c10Ea13619e8a9",
      Arbitrum: "0xad1d5344aade45f43e596773bcc4c423eabdd034",
    },
  },

  COMP: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0xdbd020CAeF83eFd542f4De03e3cF0C28A4428bd5",
      Arbitrum: "0xe7c53ffd03eb6cef7d208bc4c13446c76d1e5884",
    },
  },

  CRV: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0xCd627aA160A6fA45Eb793D19Ef54f5062F20f33f",
      Arbitrum: "0xaebda2c976cfd1ee1977eac079b4382acb849325",
    },
  },

  DAI: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
      Arbitrum: "0xc5c8e77b397e531b8ec06bfb0048328b30e9ecfb",
    },
  },

  DPI: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0xD2A593BF7594aCE1faD597adb697b5645d5edDB2",
      Arbitrum: NOT_DEPLOYED,
    },
  },

  FEI: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0x31e0a88fecB6eC0a411DBe0e9E76391498296EE9",
      Arbitrum: NOT_DEPLOYED,
    },
  },

  GUSD: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0xa89f5d2365ce98B3cD68012b6f503ab1416245Fc",
      Arbitrum: NOT_DEPLOYED,
    },
  },

  LINK: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
      Arbitrum: "0x86e53cf1b870786351da77a57575e79cb55812cb",
    },
  },

  SNX: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0xDC3EA94CD0AC27d9A86C180091e7f78C683d3699",
      Arbitrum: "0x054296f0d036b95531b4e14afb578b80cfb41252",
    },
  },

  UNI: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0x553303d460EE0afB37EdFf9bE42922D8FF63220e",
      Arbitrum: "0x9c917083fdb403ab5adbec26ee294f6ecada2720",
    },
  },

  USDC: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
      Arbitrum: "0x50834f3163758fcc1df9973b6e91f0f0f0434ad3",
    },
  },

  USDT: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D",
      Arbitrum: "0x3f3f5df88dc9f13eac63df89ec16ef6e7e25dde7",
    },
  },

  WBTC: {
    type: OracleType.COMPOSITE_ORACLE,
    targetToBasePriceFeed: {
      Mainnet: "0xfdFD9C85aD200c506Cf9e21F1FD8dd01932FBB23",
      Arbitrum: "0x0017abac5b6f291f9164e35b1234ca1d697f9cf4",
    },
    baseToUsdPriceFeed: {
      Mainnet: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
      Arbitrum: "0x6ce185860a4963106506c203335a2910413708e9",
    },
  },

  WETH: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      Arbitrum: "0x639fe6ab55c921f74e7fac1ee960c0b6293ba612",
    },
  },

  YFI: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0xA027702dbb89fbd58938e4324ac03B58d812b0E1",
      Arbitrum: "0x745ab5b69e01e2be1104ca84937bb71f96f5fb21",
    },
  },

  /// UPDATE
  STETH: {
    type: OracleType.COMPOSITE_ORACLE,

    targetToBasePriceFeed: {
      Mainnet: "0x86392dC19c0b719886221c78AB11eb8Cf5c52812",
      Arbitrum: "0xded2c52b75b24732e9107377b7ba93ec1ffa4baf",
    },
    baseToUsdPriceFeed: {
      Mainnet: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      Arbitrum: "0x639fe6ab55c921f74e7fac1ee960c0b6293ba612",
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
      Arbitrum: "0x851175a919f36c8e30197c09a9a49da932c2cc00",
    },
  },

  FRAX: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0xB9E1E3A9feFf48998E45Fa90847ed4D467E8BcfD",
      Arbitrum: "0x0809e3d38d1b4214958faf06d8b1b1a2b73f2ab8",
    },
  },
  LUSD: {
    type: OracleType.BOUNDED_ORACLE,
    targetPriceFeed: {
      Mainnet: "0x3D7aE7E594f2f2091Ad8798313450130d0Aba3a0",
      Arbitrum: "0x0411d28c94d85a36bc72cb0f875dfa8371d8ffff",
    },
    upperBound: (BigInt(1e8) * 11n) / 10n,
  },
  sUSD: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0xad35Bd71b9aFE6e4bDc266B345c198eaDEf9Ad94",
      Arbitrum: NOT_DEPLOYED,
    },
  },

  FXS: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0x6Ebc52C8C1089be9eB3945C4350B68B8E4C2233f",
      Arbitrum: "0x36a121448d74fa81450c992a1a44b9b7377cd3a5",
    },
  },
  LDO: {
    type: OracleType.COMPOSITE_ORACLE,

    targetToBasePriceFeed: {
      Mainnet: "0x4e844125952D32AcdF339BE976c98E22F6F318dB",
      Arbitrum: NOT_DEPLOYED,
    },
    baseToUsdPriceFeed: {
      Mainnet: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      Arbitrum: "0x639fe6ab55c921f74e7fac1ee960c0b6293ba612",
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
      Arbitrum: "0x639fe6ab55c921f74e7fac1ee960c0b6293ba612",
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
      Arbitrum: "0x383b3624478124697bef675f07ca37570b73992f",
    },
  },

  GMX: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: NOT_DEPLOYED,
      Arbitrum: "0xdb98056fecfff59d032ab628337a4887110df3db",
    },
  },

  ARB: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: NOT_DEPLOYED,
      Arbitrum: "0xb2a824043730fe05f3da2efafa1cbbe83fa548d6",
    },
  },

  SHIB: {
    type: OracleType.REDSTONE_ORACLE,
    dataId: "redstone-main-demo",
    signers: ["0x0C39486f770B26F5527BBBf942726537986Cd7eb"],
    signersThreshold: 1,
  },

  RDNT: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: NOT_DEPLOYED,
      Arbitrum: "0x20d0fcab0ecfd078b036b6caf1fac69a6453b352",
    },
  },

  BAL: {
    type: OracleType.CHAINLINK_ORACLE,
    address: {
      Mainnet: "0xdf2917806e30300537aeb49a7663062f4d1f2b5f",
      Arbitrum: "0xbe5ea816870d11239c543f84b71439511d70b94f",
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
    type: OracleType.THE_SAME_AS,
    token: "3Crv",
  },
  cvxcrvFRAX: {
    type: OracleType.THE_SAME_AS,
    token: "crvFRAX",
  },
  cvxsteCRV: {
    type: OracleType.THE_SAME_AS,
    token: "steCRV",
  },
  cvxFRAX3CRV: {
    type: OracleType.THE_SAME_AS,
    token: "FRAX3CRV",
  },
  cvxLUSD3CRV: {
    type: OracleType.THE_SAME_AS,
    token: "LUSD3CRV",
  },
  cvxcrvPlain3andSUSD: {
    type: OracleType.THE_SAME_AS,
    token: "crvPlain3andSUSD",
  },
  cvxgusd3CRV: {
    type: OracleType.THE_SAME_AS,
    token: "gusd3CRV",
  },
  cvxOHMFRAXBP: {
    type: OracleType.THE_SAME_AS,
    token: "OHMFRAXBP",
  },
  cvxMIM_3LP3CRV: {
    type: OracleType.THE_SAME_AS,
    token: "MIM_3LP3CRV",
  },

  cvxcrvCRVETH: {
    type: OracleType.THE_SAME_AS,
    token: "crvCRVETH",
  },
  cvxcrvCVXETH: {
    type: OracleType.THE_SAME_AS,
    token: "crvCVXETH",
  },
  cvxcrvUSDTWBTCWETH: {
    type: OracleType.THE_SAME_AS,
    token: "crvUSDTWBTCWETH",
  },

  cvxLDOETH: {
    type: OracleType.THE_SAME_AS,
    token: "LDOETH",
  },

  // CVX tokens
  stkcvx3Crv: {
    type: OracleType.THE_SAME_AS,
    token: "3Crv",
  },
  stkcvxcrvFRAX: {
    type: OracleType.THE_SAME_AS,
    token: "crvFRAX",
  },
  stkcvxsteCRV: {
    type: OracleType.THE_SAME_AS,
    token: "steCRV",
  },
  stkcvxFRAX3CRV: {
    type: OracleType.THE_SAME_AS,
    token: "FRAX3CRV",
  },
  stkcvxLUSD3CRV: {
    type: OracleType.THE_SAME_AS,
    token: "LUSD3CRV",
  },
  stkcvxcrvPlain3andSUSD: {
    type: OracleType.THE_SAME_AS,
    token: "crvPlain3andSUSD",
  },
  stkcvxgusd3CRV: {
    type: OracleType.THE_SAME_AS,
    token: "gusd3CRV",
  },
  stkcvxOHMFRAXBP: {
    type: OracleType.THE_SAME_AS,
    token: "OHMFRAXBP",
  },
  stkcvxMIM_3LP3CRV: {
    type: OracleType.THE_SAME_AS,
    token: "MIM_3LP3CRV",
  },
  stkcvxcrvCRVETH: {
    type: OracleType.THE_SAME_AS,
    token: "crvCRVETH",
  },
  stkcvxcrvCVXETH: {
    type: OracleType.THE_SAME_AS,
    token: "crvCVXETH",
  },
  stkcvxcrvUSDTWBTCWETH: {
    type: OracleType.THE_SAME_AS,
    token: "crvUSDTWBTCWETH",
  },
  stkcvxLDOETH: {
    type: OracleType.THE_SAME_AS,
    token: "LDOETH",
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
  aDAI: {
    type: OracleType.THE_SAME_AS,
    token: "DAI",
  },
  aUSDC: {
    type: OracleType.THE_SAME_AS,
    token: "USDC",
  },
  aUSDT: {
    type: OracleType.THE_SAME_AS,
    token: "USDT",
  },
  aWETH: {
    type: OracleType.THE_SAME_AS,
    token: "WETH",
  },
  waDAI: {
    type: OracleType.WRAPPED_AAVE_V2_ORACLE,
    underlying: "aDAI",
  },
  waUSDC: {
    type: OracleType.WRAPPED_AAVE_V2_ORACLE,
    underlying: "aUSDC",
  },
  waUSDT: {
    type: OracleType.WRAPPED_AAVE_V2_ORACLE,
    underlying: "aUSDT",
  },
  waWETH: {
    type: OracleType.WRAPPED_AAVE_V2_ORACLE,
    underlying: "aWETH",
  },
  cDAI: {
    type: OracleType.COMPOUND_V2_ORACLE,
    underlying: "DAI",
  },
  cUSDC: {
    type: OracleType.COMPOUND_V2_ORACLE,
    underlying: "USDC",
  },
  cUSDT: {
    type: OracleType.COMPOUND_V2_ORACLE,
    underlying: "USDT",
  },
  cWETH: {
    type: OracleType.COMPOUND_V2_ORACLE,
    underlying: "WETH",
  },
};
