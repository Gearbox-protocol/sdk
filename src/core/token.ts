import { NetworkType } from "./constants";
import { TokenPriceFeedData } from "./tokenData";

export const tokenDataByNetwork: Record<
  NetworkType,
  Record<string, TokenPriceFeedData>
> = {
  //
  // MAINNET NETWORK
  // 1INCH  ETH  AAVE  BADGER  BAL  BTC  COMP  CREAM  CRV
  // DAI  DPI  GRT  LINK  SNX  SRM  SUSHI  UNI USDC
  // USDT  YFI  ZRX
  Mainnet: {
    "1INCH": {
      address: "0x111111111117dc0aa78b770fa6a738034120c302",
      priceFeedETH: "0x72AFAECF99C9d9C8215fF44C77B94B99C28741e8",
      priceFeedUSD: "0xc929ad75B72593967DE83E7F7Cda0493458261D9",
      type: "volatile",
    },

    AAVE: {
      address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
      priceFeedETH: "0x6Df09E975c830ECae5bd4eD9d90f3A95a4f88012",
      priceFeedUSD: "0x547a514d5e3769680Ce22B2361c10Ea13619e8a9",
      type: "volatile",
    },

    COMP: {
      address: "0xc00e94cb662c3520282e6f5717214004a7f26888",
      priceFeedETH: "0x1B39Ee86Ec5979ba5C322b826B3ECb8C79991699",
      priceFeedUSD: "0xdbd020CAeF83eFd542f4De03e3cF0C28A4428bd5",
      type: "volatile",
    },

    CRV: {
      address: "0xD533a949740bb3306d119CC777fa900bA034cd52",
      priceFeedETH: "0x8a12Be339B0cD1829b91Adc01977caa5E9ac121e",
      priceFeedUSD: "0xcd627aa160a6fa45eb793d19ef54f5062f20f33f",
      type: "volatile",
    },

    DAI: {
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      priceFeedETH: "0x773616E4d11A78F511299002da57A0a94577F1f4",
      priceFeedUSD: "0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9",
      type: "stable",
    },

    DPI: {
      address: "0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b",
      priceFeedETH: "0x029849bbc0b1d93b85a8b6190e979fd38F5760E2",
      priceFeedUSD: "0xD2A593BF7594aCE1faD597adb697b5645d5edDB2",
      type: "volatile",
    },

    LINK: {
      address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
      priceFeedETH: "0xDC530D9457755926550b59e8ECcdaE7624181557",
      priceFeedUSD: "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c",
      type: "volatile",
    },

    SNX: {
      address: "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f",
      priceFeedETH: "0x79291A9d692Df95334B1a0B3B4AE6bC606782f8c",
      priceFeedUSD: "0xDC3EA94CD0AC27d9A86C180091e7f78C683d3699",
      type: "volatile",
    },

    SUSHI: {
      address: "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2",
      priceFeedETH: "0xe572CeF69f43c2E488b33924AF04BDacE19079cf",
      priceFeedUSD: "0xcc70f09a6cc17553b2e31954cd36e4a2d89501f7",
      type: "volatile",
    },

    UNI: {
      address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      priceFeedETH: "0xD6aA3D25116d8dA79Ea0246c4826EB951872e02e",
      priceFeedUSD: "0x553303d460EE0afB37EdFf9bE42922D8FF63220e",
      type: "volatile",
    },

    USDC: {
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      priceFeedETH: "0x986b5E1e1755e3C2440e960477f25201B0a8bbD4",
      priceFeedUSD: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
      type: "stable",
    },

    // USDT: {
    //   address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    //   priceFeedETH: "0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46",
    //   type: "stable",
    // },

    WBTC: {
      address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      priceFeedETH: "0xdeb288F737066589598e9214E782fa5A8eD689e8",
      priceFeedUSD: "0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c",
      type: "core",
    },

    WETH: {
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      priceFeedUSD: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
      type: "core",
    },

    YFI: {
      address: "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",
      priceFeedETH: "0x7c5d4F8345e66f68099581Db340cd65B078C41f4",
      priceFeedUSD: "0xA027702dbb89fbd58938e4324ac03B58d812b0E1",
      type: "volatile",
    },

    /// UPDATE
    STETH: {
      address: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
      priceFeedUSD: "0xcfe54b5cd566ab89272946f602d76ea879cab4a8",
      type: "volatile",
    },
    // AVAX: {
    //   address: "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",
    //   priceFeedETH: "0x7c5d4F8345e66f68099581Db340cd65B078C41f4",
    //   type: "volatile",
    // },
    FTM: {
      address: "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",
      priceFeedUSD: "0xf4766552d15ae4d256ad41b6cf2933482b0680dc",
      type: "volatile",
    },

    CVX: {
      address: "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b",
      priceFeedUSD: "0xd962fc30a72a84ce50161031391756bf2876af5d",
      type: "volatile",
    },
    // NEAR: {
    //   address: "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",
    //   priceFeedETH: "0x7c5d4F8345e66f68099581Db340cd65B078C41f4",
    //   type: "volatile",
    // },
    MIM: {
      address: "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3",
      priceFeedUSD: "0x7A364e8770418566e3eb2001A96116E6138Eb32F",
      type: "volatile",
    },
    FRAX: {
      address: "0x853d955acef822db058eb8505911ed77f175b99e",
      priceFeedUSD: "0xb9e1e3a9feff48998e45fa90847ed4d467e8bcfd",
      type: "volatile",
    },
    LUSD: {
      address: "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",
      priceFeedUSD: "0x3D7aE7E594f2f2091Ad8798313450130d0Aba3a0",
      type: "volatile",
    },
    SUSD: {
      address: "0x57ab1e02fee23774580c119740129eac7081e9d3",
      priceFeedUSD: "0xad35bd71b9afe6e4bdc266b345c198eadef9ad94",
      type: "volatile",
    },
    GUSD: {
      address: "0x056fd409e1d7a124bd7017459dfea2f387b6d5cd",
      priceFeedUSD: "0x056fd409e1d7a124bd7017459dfea2f387b6d5cd",
      type: "volatile",
    },
  },

  //
  // KOVAN NETWORK
  // DAI  LINK  REP  SNX  USDC  WBTC  ZRX
  //
  Kovan: {
    DAI: {
      address: "0x9DC7B33C3B63fc00ed5472fBD7813eDDa6a64752",
      priceFeedETH: "0x22B58f1EbEDfCA50feF632bD73368b2FdA96D541",
      priceFeedUSD: "0x777A68032a88E5A84678A77Af2CD65A7b3c0775a",
      type: "stable",
    },

    LINK: {
      address: "0x6C994935826574E870549F09efF43BA8089A3D25",
      priceFeedETH: "0x3Af8C569ab77af5230596Acf0E8c2F9351d24C38",
      priceFeedUSD: "0x396c5E36DD0a0F5a5D33dae44368D4193f69a1F0",
      type: "volatile",
    },
    // REP: {
    //   address: "0x633317172c0D41451F62025D73CE59065A370a50",
    //   priceFeedETH: "0x3A7e6117F2979EFf81855de32819FBba48a63e9e",
    //   type: "volatile",
    // },
    SNX: {
      address: "0xB48891df9267EF65AABd32F497F6F2d1eB22A186",
      priceFeedETH: "0xF9A76ae7a1075Fe7d646b06fF05Bd48b9FA5582e",
      priceFeedUSD: "0x31f93DA9823d737b7E44bdee0DF389Fe62Fd1AcD",
      type: "volatile",
    },

    USDC: {
      address: "0x31EeB2d0F9B6fD8642914aB10F4dD473677D80df",
      priceFeedETH: "0x64EaC61A2DFda2c3Fa04eED49AA33D021AeC8838",
      priceFeedUSD: "0x9211c6b3BF41A10F78539810Cf5c64e1BB78Ec60",
      type: "stable",
    },
    WBTC: {
      address: "0xE36bC5d8b689AD6d80e78c3e736670e80d4b329D",
      priceFeedETH: "0xF7904a295A029a3aBDFFB6F12755974a958C7C25",
      priceFeedUSD: "0x6135b13325bfC4B00278B4abC5e20bbce2D6580e",
      type: "core",
    },

    // ZRX: {
    //   address: "0xB730c1449c58f29C69df33ccD5bd9d3cA66b23C1",
    //   priceFeedETH: "0xBc3f28Ccc21E9b5856E81E6372aFf57307E2E883",
    //   type: "volatile",
    // },
  },
};
