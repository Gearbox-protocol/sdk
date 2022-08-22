import { NetworkType } from "../core/constants";
import {
  filterEmptyKeys,
  keyToLowercase,
  objectEntries,
  swapKeyValue,
} from "../utils/mappers";
import {
  ConvexLPToken,
  ConvexLPTokenData,
  ConvexPhantomTokenData,
  ConvexStakedPhantomToken,
  convexTokens,
} from "./convex";
import {
  CurveLPToken,
  CurveLPTokenData,
  curveTokens,
  MetaCurveLPTokenData,
} from "./curveLP";
import {
  DieselTokenData,
  DieselTokenTypes,
  GearboxToken,
  GearboxTokenData,
  gearTokens,
} from "./gear";
import { NormalToken, NormalTokenData, normalTokens } from "./normal";
import {
  YearnLPToken,
  yearnTokens,
  YearnVaultOfCurveLPTokenData,
  YearnVaultOfMetaCurveLPTokenData,
  YearnVaultTokenData,
} from "./yearn";

export type LPTokens =
  | YearnLPToken
  | CurveLPToken
  | ConvexLPToken
  | ConvexStakedPhantomToken;

export type SupportedToken =
  | NormalToken
  | LPTokens
  | DieselTokenTypes
  | GearboxToken;

export interface TokenBase {
  name: string;
  symbol: string;
  decimals: number;
}

export type LPTokenDataI =
  | CurveLPTokenData
  | MetaCurveLPTokenData
  | YearnVaultTokenData
  | YearnVaultOfCurveLPTokenData
  | YearnVaultOfMetaCurveLPTokenData
  | ConvexLPTokenData
  | ConvexPhantomTokenData;

export type TokenDataI =
  | NormalTokenData
  | LPTokenDataI
  | DieselTokenData
  | GearboxTokenData;

export const lpTokens: Record<LPTokens, LPTokenDataI> = {
  ...curveTokens,
  ...convexTokens,
  ...yearnTokens,
};

export const supportedTokens: Record<SupportedToken, TokenDataI> = {
  ...normalTokens,
  ...curveTokens,
  ...convexTokens,
  ...yearnTokens,
  ...gearTokens,
};

export const tokenDataByNetwork: Record<
  NetworkType,
  Record<SupportedToken, string>
> = {
  //
  // MAINNET NETWORK
  Mainnet: {
    "1INCH": "0x111111111117dc0aa78b770fa6a738034120c302",
    AAVE: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
    COMP: "0xc00e94cb662c3520282e6f5717214004a7f26888",
    CRV: "0xD533a949740bb3306d119CC777fa900bA034cd52",
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    DPI: "0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b",
    FEI: "0x956F47F50A910163D8BF957Cf5846D573E7f87CA",
    LINK: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    SNX: "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f",
    SUSHI: "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2",
    UNI: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    WBTC: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    YFI: "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e",

    /// UPDATE
    STETH: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
    FTM: "0x4E15361FD6b4BB609Fa63C81A2be19d873717870",
    CVX: "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b",
    FRAX: "0x853d955acef822db058eb8505911ed77f175b99e",
    FXS: "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0",
    LDO: "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32",
    SPELL: "0x090185f2135308BaD17527004364eBcC2D37e5F6",
    LUSD: "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0",
    sUSD: "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51",
    GUSD: "0x056fd409e1d7a124bd7017459dfea2f387b6d5cd",
    LUNA: "0xd2877702675e6ceb975b4a1dff9fb7baf4c91ea9",
    LQTY: "0x6DEA81C8171D0bA574754EF6F8b412F2Ed88c54D",

    // CURVE LP TOKENS
    "3Crv": "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",
    steCRV: "0x06325440d014e39736583c165c2963ba99faf14e",
    FRAX3CRV: "0xd632f22692fac7611d2aa1c0d552930d43caed3b",
    LUSD3CRV: "0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA",
    crvPlain3andSUSD: "0xC25a3A3b969415c80451098fa907EC722572917F",
    gusd3CRV: "0xD2967f45c4f384DEEa880F807Be904762a3DeA07",

    // CONVEX LP TOKENS
    cvx3Crv: "0x30D9410ED1D5DA1F6C8391af5338C93ab8d4035C",
    cvxsteCRV: "0x9518c9063eB0262D791f38d8d6Eb0aca33c63ed0",
    cvxFRAX3CRV: "0xbE0F6478E0E4894CFb14f32855603A083A57c7dA",
    cvxLUSD3CRV: "0xFB9B2f06FDb404Fd3E2278E9A9edc8f252F273d0",
    cvxcrvPlain3andSUSD: "0x11D200ef1409cecA8D6d23e6496550f707772F11",
    cvxgusd3CRV: "0x15c2471ef46Fa721990730cfa526BcFb45574576",

    // CONVEX PHANTOM TOKEN ADDRESSES
    stkcvx3Crv: "0x2eD0f32d7C8b0f7EA7E40277C62Fb9C5DE092003",
    stkcvxsteCRV: "0x2210aa245Bf766eE99325c607807A08e636B5173",
    stkcvxFRAX3CRV: "0x2AF29502110080081FDF726dfBf61ABE3bA9Ef3C",
    stkcvxLUSD3CRV: "",
    stkcvxcrvPlain3andSUSD: "0xd622AD90386BBf0310668175f76eD958030E3635",
    stkcvxgusd3CRV: "0x074f66aE6e28f7e01DFe598ECbfbd3034cf3De47",

    // YEARN TOKENS
    yvDAI: "0xdA816459F1AB5631232FE5e97a05BBBb94970c95",
    yvUSDC: "0xa354f35829ae975e850e23e9615b11da1b3dc4de",
    yvWETH: "0xa258C4606Ca8206D8aA700cE2143D7db854D168c",
    yvWBTC: "0xA696a63cc78DfFa1a63E9E50587C197387FF6C7E",
    yvCurve_stETH: "0xdCD90C7f6324cfa40d7169ef80b12031770B4325",
    yvCurve_FRAX: "0xB4AdA607B9d6b2c9Ee07A275e9616B84AC560139",

    // GEARBOX
    dDAI: "0x6CFaF95457d7688022FC53e7AbE052ef8DFBbdBA",
    dUSDC: "0xc411dB5f5Eb3f7d552F9B8454B2D74097ccdE6E3",
    dWBTC: "0xe753260F1955e8678DCeA8887759e07aa57E8c54",
    dWETH: "0xF21fc650C1B34eb0FDE786D52d23dA99Db3D6278",

    GEAR: "0xBa3335588D9403515223F109EdC4eB7269a9Ab5D",
  },

  ///
  ///
  /// GOERLI NETWORK
  ///
  ///
  Goerli: {
    "1INCH": "TODO: DEPLOY ME",
    AAVE: "TODO: DEPLOY ME",
    COMP: "TODO: DEPLOY ME",
    CRV: "TODO: DEPLOY ME",
    DAI: "TODO: DEPLOY ME",
    DPI: "TODO: DEPLOY ME",
    FEI: "TODO: DEPLOY ME",
    LINK: "TODO: DEPLOY ME",
    SNX: "TODO: DEPLOY ME",
    SUSHI: "TODO: DEPLOY ME",
    UNI: "TODO: DEPLOY ME",
    USDT: "TODO: DEPLOY ME",
    USDC: "TODO: DEPLOY ME",
    WBTC: "TODO: DEPLOY ME",
    WETH: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6", // Well-known
    YFI: "TODO: DEPLOY ME", // TODO: DEPLOY ME

    /// UPDATE
    STETH: "TODO: DEPLOY ME",
    FTM: "TODO: DEPLOY ME",
    CVX: "TODO: DEPLOY ME",
    FRAX: "TODO: DEPLOY ME",
    FXS: "TODO: DEPLOY ME",
    LDO: "TODO: DEPLOY ME",
    SPELL: "TODO: DEPLOY ME",
    LUSD: "TODO: DEPLOY ME",
    sUSD: "TODO: DEPLOY ME",
    GUSD: "TODO: DEPLOY ME",
    LUNA: "TODO: DEPLOY ME",
    LQTY: "TODO: DEPLOY ME",

    // YEARN TOKENS
    yvDAI: "TODO: DEPLOY ME",
    yvUSDC: "TODO: DEPLOY ME",
    yvWETH: "TODO: DEPLOY ME",
    yvWBTC: "TODO: DEPLOY ME",
    yvCurve_stETH: "TODO: DEPLOY ME",
    yvCurve_FRAX: "TODO: DEPLOY ME",

    // CURVE LP TOKENS
    "3Crv": "TODO: DEPLOY ME",
    steCRV: "TODO: DEPLOY ME",
    crvPlain3andSUSD: "TODO: DEPLOY ME",
    gusd3CRV: "TODO: DEPLOY ME",
    FRAX3CRV: "TODO: DEPLOY ME",
    LUSD3CRV: "TODO: DEPLOY ME",

    // CONVEX LP TOKENS
    cvx3Crv: "TODO: DEPLOY ME",
    cvxsteCRV: "TODO: DEPLOY ME",
    cvxcrvPlain3andSUSD: "TODO: DEPLOY ME",
    cvxFRAX3CRV: "TODO: DEPLOY ME",
    cvxLUSD3CRV: "TODO: DEPLOY ME",
    cvxgusd3CRV: "TODO: DEPLOY ME",

    // CONVEX PHANTOM TOKEN ADDRESSES
    stkcvx3Crv: "TODO: DEPLOY ME", // ConvexV1_StakedPositionToken.sol
    stkcvxFRAX3CRV: "TODO: DEPLOY ME", // ConvexV1_StakedPositionToken.sol
    stkcvxLUSD3CRV: "TODO: DEPLOY ME", // ConvexV1_StakedPositionToken.sol
    stkcvxgusd3CRV: "TODO: DEPLOY ME", // ConvexV1_StakedPositionToken.sol
    stkcvxsteCRV: "TODO: DEPLOY ME", // ConvexV1_StakedPositionToken.sol
    stkcvxcrvPlain3andSUSD: "TODO: DEPLOY ME", // ConvexV1_StakedPositionToken.sol

    // GEARBOX
    dDAI: "TODO: DEPLOY ME", // DieselToken.sol
    dUSDC: "TODO: DEPLOY ME", // DieselToken.sol
    dWBTC: "TODO: DEPLOY ME", // DieselToken.sol
    dWETH: "TODO: DEPLOY ME", // DieselToken.sol

    GEAR: "TODO: DEPLOY ME",
  },
};

export const tokenSymbolByAddress = objectEntries(tokenDataByNetwork).reduce<
  Record<string, SupportedToken>
>(
  (acc, [, tokens]) => ({
    ...acc,
    ...filterEmptyKeys(keyToLowercase(swapKeyValue(tokens))),
  }),
  {},
);

export const isSupportedToken = (t: unknown): t is SupportedToken =>
  typeof t === "string" && !!supportedTokens[t as SupportedToken];

export const isLPToken = (t: unknown): t is LPTokens =>
  typeof t === "string" && !!supportedTokens[t as LPTokens];
