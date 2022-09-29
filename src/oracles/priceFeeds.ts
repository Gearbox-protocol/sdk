import { SupportedToken } from "../tokens/token";
import { OracleType, TokenPriceFeedData } from "./oracles";

export const GAS_PRICE_FEED = "0x169e633a2d1e6c10dd91238ba11c4a708dfef37c";

export const priceFeedsByNetwork: Record<SupportedToken, TokenPriceFeedData> = {
  "1INCH": {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x72AFAECF99C9d9C8215fF44C77B94B99C28741e8",
        Goerli: "0x64BE27a921A70410dd08feE527A99a3787fba141",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xc929ad75B72593967DE83E7F7Cda0493458261D9",
        Goerli: "0x4813419C6783c36d10F97f08552310bf483fBD97",
      },
    },
  },

  AAVE: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x6Df09E975c830ECae5bd4eD9d90f3A95a4f88012",
        Goerli: "0x1a3B84888c0AA2a71ef1862cd83D00794Ba04661",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x547a514d5e3769680Ce22B2361c10Ea13619e8a9",
        Goerli: "0xEB24b7c2fB6497f28c937942439B4EAAE9535525",
      },
    },
  },

  COMP: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x1B39Ee86Ec5979ba5C322b826B3ECb8C79991699",
        Goerli: "0x492e6EE8B119Ba55c2BEdEDE3182501Bce19895b",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xdbd020CAeF83eFd542f4De03e3cF0C28A4428bd5",
        Goerli: "0xd31C7E8aa6871Fb09D5E01f17C54895F8237fB60",
      },
    },
  },

  CRV: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x8a12Be339B0cD1829b91Adc01977caa5E9ac121e",
        Goerli: "0x8ae7063D03213d4d90103c16f048b3F64de2d4D0",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xCd627aA160A6fA45Eb793D19Ef54f5062F20f33f",
        Goerli: "0x7f93084ECf52D4361A3E3E25F9Dafe005830C98C",
      },
    },
  },

  DAI: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x773616E4d11A78F511299002da57A0a94577F1f4",
        Goerli: "0x47f63253c8a3C25983A797d0f773ffBDdfB1BD8C",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
        Goerli: "0x1d34dd6780cC0B78aAfc8bC168e99ABEA147E85d",
      },
    },
  },

  DPI: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x029849bbc0b1d93b85a8b6190e979fd38F5760E2",
        Goerli: "0x465179d419d30E949bEc61d195f21E8AD3bC21E5",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xD2A593BF7594aCE1faD597adb697b5645d5edDB2",
        Goerli: "0xEA89a0168b9940b825B28CbF172B12c486a0FDf7",
      },
    },
  },

  FEI: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x7f0d2c2838c6ac24443d13e23d99490017bde370",
        Goerli: "0xFE51fd034723b74E1795dDEA69a2B5456F420B24",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x31e0a88fecB6eC0a411DBe0e9E76391498296EE9",
        Goerli: "0xAF884aF60E28214233039c243F5DF98a52355CFB",
      },
    },
  },

  GUSD: {
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xa89f5d2365ce98B3cD68012b6f503ab1416245Fc",
        Goerli: "0x2C799CE9f858c9Fe0825D87ddd68F4dB46A485BE",
      },
    },
  },

  LINK: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xDC530D9457755926550b59e8ECcdaE7624181557",
        Goerli: "0x2cAb9Ce8583Bb9ec3FFd8B7D0eCC09aa7b107bcc",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
        Goerli: "0xa6fD8da40eCC3fd22cA8c13eF90B95cDf1346bEC",
      },
    },
  },

  SNX: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x79291A9d692Df95334B1a0B3B4AE6bC606782f8c",
        Goerli: "0x6057e7eB76eAdA21c6Cbfe3B3ec3263A0292c40a",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xDC3EA94CD0AC27d9A86C180091e7f78C683d3699",
        Goerli: "0xe19591bD0a702D0E46407a512885d2ce81fc63C8",
      },
    },
  },

  UNI: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xD6aA3D25116d8dA79Ea0246c4826EB951872e02e",
        Goerli: "0x8416Af95675c4818A57fD103Cf30bbBda4ffF4f8",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x553303d460EE0afB37EdFf9bE42922D8FF63220e",
        Goerli: "0x9d5A93659c281dEBc71ADB719f19999BfdCD4177",
      },
    },
  },

  USDC: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x986b5E1e1755e3C2440e960477f25201B0a8bbD4",
        Goerli: "0x4587DE4a046fda765289b946b2151D91C3994820",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
        Goerli: "0xC24EC8bD3441da32f06BfEd3A4778133ad48a665",
      },
    },
  },

  USDT: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46",
        Goerli: "0x0D931b776100cD832d301e18cbb927dB67a62Ff3",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D",
        Goerli: "0x45a963a68848a850262Cb5aa1F5Be7dC4a6f0Abd",
      },
    },
  },

  WBTC: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xdeb288F737066589598e9214E782fa5A8eD689e8",
        Goerli: "0x5Eb94586361483c9E01cbD6B25bCeE207B7857Ca",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
        Goerli: "0x048F634279BE1CC4De3F17fD4c31101bAD0826c8",
      },
    },
  },

  WETH: {
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
        Goerli: "0x491741d9F426130d1bC27Aee82f8b4Bd4E6E5f5D",
      },
    },
  },

  YFI: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x7c5d4F8345e66f68099581Db340cd65B078C41f4",
        Goerli: "0x979A1C99604e1CFbb09cD9411e5d77A269f0aA14",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xA027702dbb89fbd58938e4324ac03B58d812b0E1",
        Goerli: "0x2d764833c4985A90Beb7DB43d4FFAD5Bb9675B9e",
      },
    },
  },

  /// UPDATE
  STETH: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xcfe54b5cd566ab89272946f602d76ea879cab4a8",
        Goerli: "0x0C539D95F202eF8b3981521782ABd3a12c5C4F95",
      },
    },
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xCfE54B5cD566aB89272946F602D76Ea879CAb4a8",
        Goerli: "0xf4f054C2E3269730c781dc7e1Fe2a3ca745784bd",
      },
    },
  },

  wstETH: {
    priceFeedUSD: {
      type: OracleType.WSTETH_ORACLE,
      token: "STETH",
    },
  },

  CVX: {
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xd962fC30A72A84cE50161031391756Bf2876Af5D",
        Goerli: "0xF958760fd9c0E019e355f31c3D69f0E5239597D0",
      },
    },
  },

  FRAX: {
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xB9E1E3A9feFf48998E45Fa90847ed4D467E8BcfD",
        Goerli: "0xC095CEa800dBAdcCc742124b68399Ac6ADF5d8eC",
      },
    },
  },
  LUSD: {
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x3D7aE7E594f2f2091Ad8798313450130d0Aba3a0",
        Goerli: "0xd6852347062aB885B6Fb9F7220BedCc5A39CE862",
      },
    },
  },
  sUSD: {
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0xad35Bd71b9aFE6e4bDc266B345c198eaDEf9Ad94",
        Goerli: "0x725F188BF87DaF7A7c3de39276ad78a2b8559793",
      },
    },
  },

  FXS: {
    priceFeedUSD: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x6Ebc52C8C1089be9eB3945C4350B68B8E4C2233f",
        Goerli: "0x2E49F1FbBdA0000E89376D3332A1d42dBeF3D205",
      },
    },
  },
  LDO: {
    priceFeedETH: {
      type: OracleType.CHAINLINK_ORACLE,
      address: {
        Mainnet: "0x4e844125952d32acdf339be976c98e22f6f318db",
        Goerli: "0x6569bae7114121aE82303F42f42b64012DcCbD7d",
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

  yvDAI: {
    priceFeedETH: {
      type: OracleType.YEARN_TOKEN_ORACLE,
      token: "DAI",
    },
    priceFeedUSD: {
      type: OracleType.YEARN_TOKEN_ORACLE,
      token: "DAI",
    },
  },
  yvUSDC: {
    priceFeedETH: {
      type: OracleType.YEARN_TOKEN_ORACLE,
      token: "USDC",
    },
    priceFeedUSD: {
      type: OracleType.YEARN_TOKEN_ORACLE,
      token: "USDC",
    },
  },
  yvWETH: {
    priceFeedUSD: {
      type: OracleType.YEARN_TOKEN_ORACLE,
      token: "WETH",
    },
  },
  yvWBTC: {
    priceFeedUSD: {
      type: OracleType.YEARN_TOKEN_ORACLE,
      token: "WBTC",
    },
  },

  // CURVE LP TOKENS

  "3Crv": {
    priceFeedUSD: {
      type: OracleType.CURVE_LP_TOKEN_ORACLE,
      assets: ["DAI", "USDC", "USDT"],
    },
  },

  crvFRAX: {
    priceFeedUSD: {
      type: OracleType.CURVE_LP_TOKEN_ORACLE,
      assets: ["FRAX", "USDC"],
    },
  },

  steCRV: {
    priceFeedUSD: {
      type: OracleType.CURVE_LP_TOKEN_ORACLE,
      assets: ["STETH", "WETH"],
    },
  },
  FRAX3CRV: {
    priceFeedUSD: {
      type: OracleType.CURVE_LP_TOKEN_ORACLE,
      assets: ["FRAX", "DAI", "USDC", "USDT"],
    },
  },

  LUSD3CRV: {
    priceFeedUSD: {
      type: OracleType.CURVE_LP_TOKEN_ORACLE,
      assets: ["LUSD", "DAI", "USDC", "USDT"],
    },
  },

  crvPlain3andSUSD: {
    priceFeedUSD: {
      type: OracleType.CURVE_LP_TOKEN_ORACLE,
      assets: ["DAI", "USDC", "USDT", "sUSD"],
    },
  },

  gusd3CRV: {
    priceFeedUSD: {
      type: OracleType.CURVE_LP_TOKEN_ORACLE,
      assets: ["GUSD", "DAI", "USDC", "USDT"],
    },
  },

  // YEARN- CURVE TOKENS

  yvCurve_stETH: {
    priceFeedUSD: {
      type: OracleType.YEARN_CURVE_LP_TOKEN_ORACLE,
      curveSymbol: "steCRV",
    },
  },
  yvCurve_FRAX: {
    priceFeedUSD: {
      type: OracleType.YEARN_CURVE_LP_TOKEN_ORACLE,
      curveSymbol: "FRAX3CRV",
    },
  },

  // CVX tokens
  cvx3Crv: {
    priceFeedUSD: {
      type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
      curveSymbol: "3Crv",
    },
  },
  cvxsteCRV: {
    priceFeedUSD: {
      type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
      curveSymbol: "steCRV",
    },
  },
  cvxFRAX3CRV: {
    priceFeedUSD: {
      type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
      curveSymbol: "FRAX3CRV",
    },
  },
  cvxLUSD3CRV: {
    priceFeedUSD: {
      type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
      curveSymbol: "LUSD3CRV",
    },
  },
  cvxcrvPlain3andSUSD: {
    priceFeedUSD: {
      type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
      curveSymbol: "crvPlain3andSUSD",
    },
  },
  cvxgusd3CRV: {
    priceFeedUSD: {
      type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
      curveSymbol: "gusd3CRV",
    },
  },
  // CVX tokens
  stkcvx3Crv: {
    priceFeedUSD: {
      type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
      curveSymbol: "3Crv",
    },
  },
  stkcvxsteCRV: {
    priceFeedUSD: {
      type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
      curveSymbol: "steCRV",
    },
  },
  stkcvxFRAX3CRV: {
    priceFeedUSD: {
      type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
      curveSymbol: "FRAX3CRV",
    },
  },
  stkcvxLUSD3CRV: {
    priceFeedUSD: {
      type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
      curveSymbol: "LUSD3CRV",
    },
  },
  stkcvxcrvPlain3andSUSD: {
    priceFeedUSD: {
      type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
      curveSymbol: "crvPlain3andSUSD",
    },
  },
  stkcvxgusd3CRV: {
    priceFeedUSD: {
      type: OracleType.LIKE_CURVE_LP_TOKEN_ORACLE,
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
