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
import { decimals } from "./decimals";
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
  ...lpTokens,
  ...gearTokens,
};

export const tokenDataByNetwork: Record<
  NetworkType,
  Record<SupportedToken, string>
> = {
  //
  // MAINNET NETWORK
  Mainnet: {
    "1INCH": "0x111111111117dC0aa78b770fA6A738034120C302",
    AAVE: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
    COMP: "0xc00e94Cb662C3520282E6f5717214004A7f26888",
    CRV: "0xD533a949740bb3306d119CC777fa900bA034cd52",
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    DPI: "0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b",
    FEI: "0x956F47F50A910163D8BF957Cf5846D573E7f87CA",
    LINK: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    SNX: "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
    UNI: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    YFI: "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e",

    /// UPDATE
    STETH: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
    wstETH: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
    CVX: "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B",
    FRAX: "0x853d955aCEf822Db058eb8505911ED77F175b99e",
    FXS: "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0",
    LDO: "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32",
    LUSD: "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0",
    sUSD: "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51",
    GUSD: "0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd",
    LQTY: "0x6DEA81C8171D0bA574754EF6F8b412F2Ed88c54D",

    // CURVE LP TOKENS
    "3Crv": "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",
    crvFRAX: "0x3175Df0976dFA876431C2E9eE6Bc45b65d3473CC",
    steCRV: "0x06325440D014e39736583c165C2963BA99fAf14E",
    FRAX3CRV: "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B",
    LUSD3CRV: "0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA",
    crvPlain3andSUSD: "0xC25a3A3b969415c80451098fa907EC722572917F",
    gusd3CRV: "0xD2967f45c4f384DEEa880F807Be904762a3DeA07",

    // CONVEX LP TOKENS
    cvx3Crv: "0x30D9410ED1D5DA1F6C8391af5338C93ab8d4035C",
    cvxcrvFRAX: "0x117A0bab81F25e60900787d98061cCFae023560c",
    cvxsteCRV: "0x9518c9063eB0262D791f38d8d6Eb0aca33c63ed0",
    cvxFRAX3CRV: "0xbE0F6478E0E4894CFb14f32855603A083A57c7dA",
    cvxLUSD3CRV: "0xFB9B2f06FDb404Fd3E2278E9A9edc8f252F273d0",
    cvxcrvPlain3andSUSD: "0x11D200ef1409cecA8D6d23e6496550f707772F11",
    cvxgusd3CRV: "0x15c2471ef46Fa721990730cfa526BcFb45574576",

    // CONVEX PHANTOM TOKEN ADDRESSES
    stkcvx3Crv: "0xbAc7a431146aeAf3F57A16b9954f332Fd292F270",
    stkcvxFRAX3CRV: "0xaF314b088B53835d5cF4e4CB81beABa5934a61fe",
    stkcvxgusd3CRV: "0x34fB99abBAFb4e87e256960D572664c6ADc301B8",
    stkcvxsteCRV: "0xe15B7D80a51e1fe54aC355CaBE848Efce5289BDB",
    stkcvxcrvPlain3andSUSD: "0x7e1992A7F28dAA5f6a2d34e2cd40f962f37B172C",
    stkcvxLUSD3CRV: "0x0A1D4A25d0390899b90bCD22E1Ef155003EA76d7",
    stkcvxcrvFRAX: "0x276187f24D41745513cbE2Bd5dFC33a4d8CDc9ed",

    // YEARN TOKENS
    yvDAI: "0xdA816459F1AB5631232FE5e97a05BBBb94970c95",
    yvUSDC: "0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE",
    yvWETH: "0xa258C4606Ca8206D8aA700cE2143D7db854D168c",
    yvWBTC: "0xA696a63cc78DfFa1a63E9E50587C197387FF6C7E",
    yvCurve_stETH: "0xdCD90C7f6324cfa40d7169ef80b12031770B4325",
    yvCurve_FRAX: "0xB4AdA607B9d6b2c9Ee07A275e9616B84AC560139",

    // GEARBOX
    dDAI: "0x6CFaF95457d7688022FC53e7AbE052ef8DFBbdBA",
    dUSDC: "0xc411dB5f5Eb3f7d552F9B8454B2D74097ccdE6E3",
    dWBTC: "0xe753260F1955e8678DCeA8887759e07aa57E8c54",
    dWETH: "0xF21fc650C1B34eb0FDE786D52d23dA99Db3D6278",
    dwstETH: "0x2158034dB06f06dcB9A786D2F1F8c38781bA779d",

    GEAR: "0xBa3335588D9403515223F109EdC4eB7269a9Ab5D",
  },

  ///
  ///
  /// G Ö E R L I    N E T W O R K
  ///
  ///
  Goerli: {
    "1INCH": "0xC69D4e2940950bf26977b421BDB9a06F40D37db4",
    AAVE: "0xc28667333f193e0cfD69E8fbC60CC6cB875414fA",
    COMP: "0xaDa57f2C1Ba941509ffF0eEb7e846C95A5933951",
    CRV: "0x976d27eC7ebb1136cd7770F5e06aC917Aa9C672b",
    DAI: "0x55a309598ABf543bF76FbB22859938ba2F29C2eA",
    DPI: "0x130874718AfcC298894e0a60a1b87c9C2989C2E6",
    FEI: "0x49FCC2B5978839FAB2E0364C8ed4be222689f1aF",
    LINK: "0x609CeB4781A3A37C81122FD69b20dc5155dABe0B",
    SNX: "0x293177E8F7DEA75e44C6799e975A42222cBB326B",
    UNI: "0xd354fEF0E34ef0ee467d61eee5Af8336fd36Cb7D",
    USDT: "0xc81c248c44e96D85a0eCddc104843cE55B1ff35c",
    USDC: "0x1F2cd0D7E5a7d8fE41f886063E9F11A05dE217Fa",
    WBTC: "0x34852e54D9B4Ec4325C7344C28b584Ce972e5E62",
    WETH: "0x595DFFf822767c2E14CFB7D5e0b5a5e23eCfACdd", // SafeWETH
    YFI: "0xCad5D7701e0A85fe50B3aCaBDcdF7e75672F326e",

    /// UPDATE
    STETH: "0xd628baa42b3080593a231016bF3F229161C9F745",
    wstETH: "0x5E590e6c887A84098F3fa465267a44AaE058eBbb",
    CVX: "0x6D75eb70402CF06a0cB5B8fdc1836dAe29702B17",
    FRAX: "0x92d43093959C7DDa89896418bCE9DE0B87879646",
    FXS: "0x34C035818Dd308f3aC20e68bC03C3E4FC8924d9d",
    LDO: "0x13781b54cd88cC115a17Db53b058706B29FaD341",
    LUSD: "0xF1D178615E7BB6a7331EE73F84D5Ac6c95d8BC91",
    sUSD: "0x4F02e25531520709114e470f45A1Fb50862e3147",
    GUSD: "0x50688e51B3941BFdf6a878F810dAF85bFc0657cf",
    LQTY: "0x7f5E8e47d982052bD6A1CA26551b80821802847d",

    // YEARN TOKENS
    yvDAI: "0xAAC67551F8d1D052E375BaCf774b494850BBca87",
    yvUSDC: "0x05724F02a0270F08E525F2681afA9173957c505e",
    yvWETH: "0xEe8Adf657c5EF8e10622b6B47014D2C6f6993E5E",
    yvWBTC: "0x683fcBf347b90C652b4B07648180C0b54c258815",
    yvCurve_stETH: "0x2681AFa48aCFC2Ae5308bf6127d2fb563763f13E",
    yvCurve_FRAX: "0x43d45AEf2BAb5fa79e3bBDb2dB7E4443B8123C8f",

    // CURVE LP TOKENS
    "3Crv": "0xb2f394A64966a8892a43CcfBBD48D28bC58Aeb67",
    crvFRAX: "0xBE72A443c81Ca75B96039C68B335F1f8c6bA48E9",
    steCRV: "0xf5c5e39F56fF90C0F63a97F3c77779eF495c1faD",
    crvPlain3andSUSD: "0xC3d328CCA12347A31126d891D16fe8C5466625a5",
    gusd3CRV: "0xbD919fcC47ae2b5Cc2fe646971aCcB1e88843DC5",
    FRAX3CRV: "0x12Ad3125C67eC5325Cc94AFdA8B26cd12BCe1E9b",
    LUSD3CRV: "0x348B1846b87cA12D23A9A4E73B1CfAc2Aad49cf4",

    // CONVEX LP TOKENS
    cvx3Crv: "0xe12bFD868a81D1AD147731D0eC164d9C4A397FCd",
    cvxcrvFRAX: "0x68345E6C192f97A7334a96ceda94e2486c08Fa0c",
    cvxsteCRV: "0xF0258e3527726f641056a2F7DA08637a1d67422E",
    cvxcrvPlain3andSUSD: "0xaB54a40e7Fd2aD82c07958BF6AA3395CEAb078b5",
    cvxFRAX3CRV: "0x17181501B6986CE1e4efD9A9Df9975aD24b0c543",
    cvxLUSD3CRV: "0xD944F38aa81804313db028924Cf0695B26B67e6E",
    cvxgusd3CRV: "0xBA9e6B05b0F2C5B41Df2d56c0b1ddaFa03d53fed",

    // CONVEX PHANTOM TOKEN ADDRESSES
    stkcvx3Crv: "0xEB763389772eA09eddFcfed3EC571Bb20c187763",
    stkcvxcrvFRAX: "0x6784ED28285ECd58F76f3A85F39A293E15080964",
    stkcvxFRAX3CRV: "0x6fd7C6c0362E836eab644fD1E1D09a9e3836e62C",
    stkcvxgusd3CRV: "0x6Ca199719B8d6b8406387DC18a29eC13dD725Ed6",
    stkcvxsteCRV: "0x3AE88c07D9A9b48706d7ea197aD53d30578ACdA1",
    stkcvxcrvPlain3andSUSD: "0x49416516604eF33383Bd9F3a94fEcd4ee36E2d88",
    stkcvxLUSD3CRV: "0x84c04976BA15AE880B8D6daC9CE1075D0eFD0d4D",

    // GEARBOX
    dDAI: "0x1726d8a1d3193D7C5A301Bb64b025cBD91BA791c", // DieselToken.sol
    dUSDC: "0x5bBDBDa8cE49B152ae48FB37F2397A5EBF35d59C", // DieselToken.sol
    dWBTC: "0xd7f208de8d5b5301e7018dcc6D312A4305382330", // DieselToken.sol
    dWETH: "0xfb906E19E71ED61bcb5eA0E11d77941A058eafBD", // DieselToken.sol
    dwstETH: "0xAB20D04aF0f79aB21cC66431F6BAc03b74003d4d",

    GEAR: "0x52555B61b8c1243C63682F75eB28214d7A62F221",
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
  typeof t === "string" && !!lpTokens[t as LPTokens];

export function getDecimals(token: SupportedToken | string): number {
  let dec = decimals[token as SupportedToken];
  if (dec) return dec;

  dec = decimals[tokenSymbolByAddress[token.toLowerCase()]];
  if (!dec) {
    throw new Error(`Decimals for ${token} not found`);
  }
  return dec;
}

export function extractTokenData(
  tokenAddress: string,
): [SupportedToken | undefined, number | undefined] {
  const underlyingSymbol = tokenSymbolByAddress[tokenAddress.toLowerCase()];
  const underlyingDecimals = decimals[underlyingSymbol || ""];

  return [underlyingSymbol, underlyingDecimals];
}
