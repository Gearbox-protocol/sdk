import { NetworkType } from "./constants";
import { TokenSavedData } from "./tokenData";

export const tokenDataByNetwork: Record<
  NetworkType,
  Record<string, TokenSavedData>
> = {
  //
  // MAINNET NETWORK
  // 1INCH  ETH  AAVE  BADGER  BAL  BTC  COMP  CREAM  CRV
  // DAI  DPI  GRT  LINK  SNX  SRM  SUSHI  UNI USDC
  // USDT  YFI  ZRX
  Mainnet: {
    "1INCH": {
      address: "0x111111111117dc0aa78b770fa6a738034120c302",
      type: "volatile",
    },

    AAVE: {
      address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
      type: "volatile",
    },

    COMP: {
      address: "0xc00e94cb662c3520282e6f5717214004a7f26888",
      type: "volatile",
    },

    CRV: {
      address: "0xD533a949740bb3306d119CC777fa900bA034cd52",
      type: "volatile",
    },

    DAI: {
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      type: "stable",
    },

    DPI: {
      address: "0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b",
      type: "volatile",
    },

    FEI: {
      address: "0x956F47F50A910163D8BF957Cf5846D573E7f87CA",
      type: "stable",
    },

    LINK: {
      address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
      type: "volatile",
    },

    SNX: {
      address: "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f",
      type: "volatile",
    },

    SUSHI: {
      address: "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2",
      type: "volatile",
    },

    UNI: {
      address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      type: "volatile",
    },

    USDC: {
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      type: "stable",
    },

    USDT: {
      address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      type: "stable",
    },

    WBTC: {
      address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      type: "core",
    },

    WETH: {
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      type: "core",
    },

    YFI: {
      address: "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",
      type: "volatile",
    },

    /// UPDATE
    STETH: {
      address: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
      type: "volatile",
    },

    FTM: {
      address: "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",
      type: "volatile",
    },

    CVX: {
      address: "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b",
      type: "volatile",
    },

    MIM: {
      address: "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3",

      type: "stable",
    },

    FRAX: {
      address: "0x853d955acef822db058eb8505911ed77f175b99e",
      type: "stable",
    },

    FXS: {
      address: "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0",
      type: "volatile",
    },

    LDO: {
      address: "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32",
      type: "volatile",
    },

    LQTY: {
      address: "0x6DEA81C8171D0bA574754EF6F8b412F2Ed88c54D",
      type: "volatile",
    },

    LUSD: {
      address: "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",
      type: "stable",
    },

    SPELL: {
      address: "0x090185f2135308BaD17527004364eBcC2D37e5F6",
      type: "volatile",
    }

    SUSD: {
      address: "0x57ab1e02fee23774580c119740129eac7081e9d3",
      type: "stable",
    },

    GUSD: {
      address: "0x056fd409e1d7a124bd7017459dfea2f387b6d5cd",
      type: "stable",
    },

    // YEARN TOKENS
    yvDAI: {
      address: "0xdA816459F1AB5631232FE5e97a05BBBb94970c95",
      type: "lp",
    },
    yvUSDC: {
      address: "0xa354f35829ae975e850e23e9615b11da1b3dc4de",
      type: "lp",
    },
    yvWETH: {
      address: "0xa258C4606Ca8206D8aA700cE2143D7db854D168c",
      type: "lp",
    },
    yvWBTC: {
      address: "0xA696a63cc78DfFa1a63E9E50587C197387FF6C7E",
      type: "lp",
    },

    // CURVE LP TOKENS

    3Crv: {
      address: "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",
      type: "lp",
    },

    steCRV: {
      address: "0x06325440d014e39736583c165c2963ba99faf14e",
      type: "lp",
    },
    FRAX3CRV: {
      address: "0xd632f22692fac7611d2aa1c0d552930d43caed3b",
      type: "lp",
    },
    MIM3LP3CRV: {
      address: "0x5a6a4d54456819380173272a5e8e9b9904bdf41b",
      type: "lp",
    },

    LUSD3CRV: {
      address: "0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA",
      type: "lp",
    },

    crvPlain3andSUSD: {
      address: "0xC25a3A3b969415c80451098fa907EC722572917F",
      type: "lp",
    },

    gusd3CRV: {
      address: "0xD2967f45c4f384DEEa880F807Be904762a3DeA07",
      type: "lp",
    },

    // CONVEX LP TOKENS

    cvx3Crv: {
      address: "0x30D9410ED1D5DA1F6C8391af5338C93ab8d4035C",
      type: "lp",
    },

    cvxsteCRV: {
      address: "0x9518c9063eB0262D791f38d8d6Eb0aca33c63ed0",
      type: "lp",
    },

    cvxFRAX3CRV: {
      address: "0xbE0F6478E0E4894CFb14f32855603A083A57c7dA",
      type: "lp",
    },

    cvxMIM3LP3CRV: {
      address: "0xabB54222c2b77158CC975a2b715a3d703c256F05",
      type: "lp",
    },

    cvxLUSD3CRV: {
      address: "0xFB9B2f06FDb404Fd3E2278E9A9edc8f252F273d0",
      type: "lp",
    },

    cvxcrvPlain3andSUSD: {
      address: "0x11D200ef1409cecA8D6d23e6496550f707772F11",
      type: "lp",
    },

    cvxgusd3CRV: {
      address: "0x15c2471ef46Fa721990730cfa526BcFb45574576",
      type: "lp",
    },

    // YEARN- CURVE TOKENS
    yvCurve_stETH: {
      address: "0xdCD90C7f6324cfa40d7169ef80b12031770B4325",
      type: "lp",
    },
    yvCurve_FRAX: {
      address: "0xB4AdA607B9d6b2c9Ee07A275e9616B84AC560139",
      type: "lp",
    },
    yvCurve_MIM: {
      address: "0x2DfB14E32e2F8156ec15a2c21c3A6c053af52Be8",
      type: "lp",
    },
    yvCurve_d3pool: {
      address: "0x16825039dfe2a5b01F3E1E6a2BBF9a576c6F95c4",
      type: "lp",
    },
  },

  //
  // KOVAN NETWORK
  // DAI  LINK  REP  SNX  USDC  WBTC  ZRX
  //
  Kovan: {
    DAI: {
      address: "0x9DC7B33C3B63fc00ed5472fBD7813eDDa6a64752",
      type: "stable",
    },

    LINK: {
      address: "0x6C994935826574E870549F09efF43BA8089A3D25",
      type: "volatile",
    },
    // REP: {
    //   address: "0x633317172c0D41451F62025D73CE59065A370a50",
    //   priceFeedETH: "0x3A7e6117F2979EFf81855de32819FBba48a63e9e",
    //   type: "volatile",
    // },
    SNX: {
      address: "0xB48891df9267EF65AABd32F497F6F2d1eB22A186",
      type: "volatile",
    },

    USDC: {
      address: "0x31EeB2d0F9B6fD8642914aB10F4dD473677D80df",
      type: "stable",
    },
    WBTC: {
      address: "0xE36bC5d8b689AD6d80e78c3e736670e80d4b329D",
      type: "core",
    },

    // ZRX: {
    //   address: "0xB730c1449c58f29C69df33ccD5bd9d3cA66b23C1",
    //   priceFeedETH: "0xBc3f28Ccc21E9b5856E81E6372aFf57307E2E883",
    //   type: "volatile",
    // },
  },
};
