import { BigNumber } from "ethers";
import { TokenDataPayload } from "../payload/token";
import { STATIC_TOKEN } from "../config";
import { NetworkType } from "./constants";

export class TokenData {
  public readonly id: string;
  // public readonly name: string;
  public readonly symbol: string;
  public readonly address: string;
  public readonly decimals: number;
  public readonly icon?: string;

  constructor(payload: TokenDataPayload) {
    this.id = payload.addr;
    this.address = payload.addr;
    // this.name = payload.name;
    this.symbol = payload.symbol;
    if (this.symbol === "WETH" || this.symbol === "dWETH") {
      this.symbol = this.symbol.replace("WETH", "ETH");
    }
    this.decimals = payload.decimals;
    this.icon = `${STATIC_TOKEN}${payload.symbol?.toLowerCase()}.svg`;
  }

  compareBySymbol(b: TokenData): number {
    return this.symbol > b.symbol ? 1 : -1;
  }
}

export interface TokenBalance {
  id: string;
  balance: BigNumber;
}

export interface TokenAllowance {
  id: string;
  allowance: BigNumber;
}

export type TokenType = "core" | "stable" | "volatile";

export interface TokenPriceFeedData {
  address: string;
  priceFeedETH: string;
  type: TokenType;
}

export const WETHToken: Record<NetworkType, string> = {
  Mainnet: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  Kovan: "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
};

export const connectors: Record<NetworkType, Array<string>> = {
  Mainnet: [
    "WETH",
    "1INCH",
    "DAI",
    "USDC",
    // "USDT",
    "WBTC",
    // "stETH",
    // "PAX",
    // "TUSD",
    // "BNT",
    // "BAL",
    // "sUSD",
  ],
  Kovan: ["WETH", "DAI", "USDC", "WBTC"],
};

export function getConnectors(networkType: NetworkType) {
  return connectors[networkType].map((e) => {
    const result =
      e === "WETH"
        ? WETHToken[networkType]
        : tokenDataByNetwork[networkType][e]?.address;

    if (!result) {
      throw new Error(`connector token ${e} not found`);
    }
    return result;
  });
}

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
    AMPL: {
      address: "0xd46ba6d942050d489dbd938a2c909a5d5039a161",
      priceFeedETH: "0x492575FDD11a0fCf2C6C719867890a7648d526eB",
      type: "volatile",
    },
    BAT: {
      address: "0x0d8775f648430679a709e98d2b0cb6250d2887ef",
      priceFeedETH: "0x0d16d4528239e9ee52fa531af613AcdB23D88c94",
      type: "volatile",
    },
    BZRX: {
      address: "0x56d811088235f11c8920698a204a5010a788f4b3",
      priceFeedETH: "0x8f7C7181Ed1a2BA41cfC3f5d064eF91b67daef66",
      type: "volatile",
    },
    ENJ: {
      address: "0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c",
      priceFeedETH: "0x24D9aB51950F3d62E9144fdC2f3135DAA6Ce8D1B",
      type: "volatile",
    },

    MANA: {
      address: "0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c",
      priceFeedETH: "0x82A44D92D6c329826dc557c5E1Be6ebeC5D5FeB9",
      type: "volatile",
    },
    // MKR: {
    //   address: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
    //   priceFeed: "0x24551a8Fb2A7211A25a17B1481f043A8a8adC7f2",
    // },

    REP: {
      address: "0x221657776846890989a759ba2973e427dff5c9bb",
      priceFeedETH: "0xD4CE430C3b67b3E2F7026D86E7128588629e2455",
      type: "volatile",
    },

    WBTC: {
      address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      priceFeedETH: "0xdeb288F737066589598e9214E782fa5A8eD689e8",
      type: "core",
    },
    "1INCH": {
      address: "0x111111111117dc0aa78b770fa6a738034120c302",
      priceFeedETH: "0x72AFAECF99C9d9C8215fF44C77B94B99C28741e8",
      type: "volatile",
    },

    AAVE: {
      address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
      priceFeedETH: "0x6Df09E975c830ECae5bd4eD9d90f3A95a4f88012",
      type: "volatile",
    },

    BADGER: {
      address: "0x3472a5a71965499acd81997a54bba8d852c6e53d",
      priceFeedETH: "0x58921Ac140522867bf50b9E009599Da0CA4A2379",
      type: "volatile",
    },

    BAL: {
      address: "0xba100000625a3754423978a60c9317c58a424e3D",
      priceFeedETH: "0xC1438AA3823A6Ba0C159CfA8D98dF5A994bA120b",
      type: "volatile",
    },

    COMP: {
      address: "0xc00e94cb662c3520282e6f5717214004a7f26888",
      priceFeedETH: "0x1B39Ee86Ec5979ba5C322b826B3ECb8C79991699",
      type: "volatile",
    },

    CREAM: {
      address: "0x2ba592F78dB6436527729929AAf6c908497cB200",
      priceFeedETH: "0x82597CFE6af8baad7c0d441AA82cbC3b51759607",
      type: "volatile",
    },

    CRV: {
      address: "0xD533a949740bb3306d119CC777fa900bA034cd52",
      priceFeedETH: "0x8a12Be339B0cD1829b91Adc01977caa5E9ac121e",
      type: "volatile",
    },

    DAI: {
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      priceFeedETH: "0x773616E4d11A78F511299002da57A0a94577F1f4",
      type: "stable",
    },

    DPI: {
      address: "0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b",
      priceFeedETH: "0x029849bbc0b1d93b85a8b6190e979fd38F5760E2",
      type: "volatile",
    },

    GRT: {
      address: "0xc944e90c64b2c07662a292be6244bdf05cda44a7",
      priceFeedETH: "0x17D054eCac33D91F7340645341eFB5DE9009F1C1",
      type: "volatile",
    },

    LINK: {
      address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
      priceFeedETH: "0xDC530D9457755926550b59e8ECcdaE7624181557",
      type: "volatile",
    },

    LRC: {
      address: "0xbbbbca6a901c926f240b89eacb641d8aec7aeafd",
      priceFeedETH: "0x160AC928A16C93eD4895C2De6f81ECcE9a7eB7b4",
      type: "volatile",
    },

    SNX: {
      address: "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f",
      priceFeedETH: "0x79291A9d692Df95334B1a0B3B4AE6bC606782f8c",
      type: "volatile",
    },

    SRM: {
      address: "0x476c5e26a75bd202a9683ffd34359c0cc15be0ff",
      priceFeedETH: "0x050c048c9a0CD0e76f166E2539F87ef2acCEC58f",
      type: "volatile",
    },

    SUSHI: {
      address: "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2",
      priceFeedETH: "0xe572CeF69f43c2E488b33924AF04BDacE19079cf",
      type: "volatile",
    },

    UNI: {
      address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      priceFeedETH: "0xD6aA3D25116d8dA79Ea0246c4826EB951872e02e",
      type: "volatile",
    },

    USDC: {
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      priceFeedETH: "0x986b5E1e1755e3C2440e960477f25201B0a8bbD4",
      type: "stable",
    },

    USDT: {
      address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      priceFeedETH: "0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46",
      type: "stable",
    },

    YFI: {
      address: "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",
      priceFeedETH: "0x7c5d4F8345e66f68099581Db340cd65B078C41f4",
      type: "volatile",
    },

    ZRX: {
      address: "0xe41d2489571d322189246dafa5ebde1f4699f498",
      priceFeedETH: "0x2Da4983a622a8498bb1a21FaE9D8F6C664939962",
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
      type: "stable",
    },

    LINK: {
      address: "0x6C994935826574E870549F09efF43BA8089A3D25",
      priceFeedETH: "0x3Af8C569ab77af5230596Acf0E8c2F9351d24C38",
      type: "volatile",
    },
    REP: {
      address: "0x633317172c0D41451F62025D73CE59065A370a50",
      priceFeedETH: "0x3A7e6117F2979EFf81855de32819FBba48a63e9e",
      type: "volatile",
    },
    SNX: {
      address: "0xB48891df9267EF65AABd32F497F6F2d1eB22A186",
      priceFeedETH: "0xF9A76ae7a1075Fe7d646b06fF05Bd48b9FA5582e",
      type: "volatile",
    },

    USDC: {
      address: "0x31EeB2d0F9B6fD8642914aB10F4dD473677D80df",
      priceFeedETH: "0x64EaC61A2DFda2c3Fa04eED49AA33D021AeC8838",
      type: "stable",
    },
    WBTC: {
      address: "0xE36bC5d8b689AD6d80e78c3e736670e80d4b329D",
      priceFeedETH: "0xF7904a295A029a3aBDFFB6F12755974a958C7C25",
      type: "core",
    },

    ZRX: {
      address: "0xB730c1449c58f29C69df33ccD5bd9d3cA66b23C1",
      priceFeedETH: "0xBc3f28Ccc21E9b5856E81E6372aFf57307E2E883",
      type: "volatile",
    },
  },
};
