import { NetworkType } from "../core/chains";
import { NOT_DEPLOYED } from "../core/constants";
import { TypedObjectUtils } from "../utils/mappers";
import {
  AaveV2LPToken,
  AaveV2PoolTokenData,
  aaveV2Tokens,
  WrappedAaveV2LPToken,
  WrappedAaveV2PoolTokenData,
  wrappedAaveV2Tokens,
} from "./aave";
import {
  BalancerLPToken,
  BalancerLpTokenData,
  balancerLpTokens,
} from "./balancer";
import {
  CompoundV2LPToken,
  CompoundV2PoolTokenData,
  compoundV2Tokens,
} from "./compound";
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
  | ConvexStakedPhantomToken
  | BalancerLPToken
  | AaveV2LPToken
  | WrappedAaveV2LPToken
  | CompoundV2LPToken;

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
  | ConvexPhantomTokenData
  | BalancerLpTokenData
  | AaveV2PoolTokenData
  | WrappedAaveV2PoolTokenData
  | CompoundV2PoolTokenData;

export type TokenDataI =
  | NormalTokenData
  | LPTokenDataI
  | DieselTokenData
  | GearboxTokenData;

export const lpTokens: Record<LPTokens, LPTokenDataI> = {
  ...curveTokens,
  ...convexTokens,
  ...yearnTokens,
  ...balancerLpTokens,
  ...aaveV2Tokens,
  ...wrappedAaveV2Tokens,
  ...compoundV2Tokens,
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
    OHM: "0x64aa3364F17a4D01c6f1751Fd97C2BD3D7e7f1D5",
    MIM: "0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3",
    SPELL: "0x090185f2135308BaD17527004364eBcC2D37e5F6",
    GMX: NOT_DEPLOYED,
    ARB: "0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1",
    RDNT: NOT_DEPLOYED,
    BAL: "0xba100000625a3754423978a60c9317c58a424e3D",
    SHIB: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",

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
    OHMFRAXBP: "0x5271045F7B73c17825A7A7aee6917eE46b0B7520",
    MIM_3LP3CRV: "0x5a6A4D54456819380173272A5E8E9B9904BdF41B",
    crvCRVETH: "0xEd4064f376cB8d68F770FB1Ff088a3d0F3FF5c4d",
    crvCVXETH: "0x3A283D9c08E8b55966afb64C515f5143cf907611",
    crvUSDTWBTCWETH: "0xf5f5B97624542D72A9E06f04804Bf81baA15e2B4",
    LDOETH: "0xb79565c01b7Ae53618d9B847b9443aAf4f9011e7",

    crvUSD: "0x95ECDC6caAf7E4805FCeF2679A92338351D24297",

    crvUSDUSDC: "0x4DEcE678ceceb27446b35C672dC7d61F30bAD69E",
    crvUSDUSDT: "0x390f3595bCa2Df7d23783dFd126427CCeb997BF4",
    crvUSDFRAX: "0x0CD6f267b2086bea681E922E19D40512511BE538",
    crvUSDETHCRV: "0x4eBdF703948ddCEA3B11f675B4D1Fba9d2414A14",

    // CONVEX LP TOKENS
    cvx3Crv: "0x30D9410ED1D5DA1F6C8391af5338C93ab8d4035C",
    cvxcrvFRAX: "0x117A0bab81F25e60900787d98061cCFae023560c",
    cvxsteCRV: "0x9518c9063eB0262D791f38d8d6Eb0aca33c63ed0",
    cvxFRAX3CRV: "0xbE0F6478E0E4894CFb14f32855603A083A57c7dA",
    cvxLUSD3CRV: "0xFB9B2f06FDb404Fd3E2278E9A9edc8f252F273d0",
    cvxcrvPlain3andSUSD: "0x11D200ef1409cecA8D6d23e6496550f707772F11",
    cvxgusd3CRV: "0x15c2471ef46Fa721990730cfa526BcFb45574576",
    cvxOHMFRAXBP: "0xd8F1B275c320819c7D752ef79988d0780bf00446",
    cvxMIM_3LP3CRV: "0xabB54222c2b77158CC975a2b715a3d703c256F05",
    cvxcrvCRVETH: "0x0Fb8dcdD95e4C48D3dD0eFA4086512f6F8FD4565",
    cvxcrvCVXETH: "0x0bC857f97c0554d1d0D602b56F2EEcE682016fBA",
    cvxcrvUSDTWBTCWETH: "0xB77BA8B4b9d981269466eE95796A9Af57d4E82DB",
    cvxLDOETH: "0x4eBE557ae39F87D2a014719777FD4cF4d01Dc8Ee",

    // CONVEX PHANTOM TOKEN ADDRESSES
    stkcvx3Crv: "0xbAc7a431146aeAf3F57A16b9954f332Fd292F270",
    stkcvxFRAX3CRV: "0xaF314b088B53835d5cF4e4CB81beABa5934a61fe",
    stkcvxgusd3CRV: "0x34fB99abBAFb4e87e256960D572664c6ADc301B8",
    stkcvxsteCRV: "0xe15B7D80a51e1fe54aC355CaBE848Efce5289BDB",
    stkcvxcrvPlain3andSUSD: "0x7e1992A7F28dAA5f6a2d34e2cd40f962f37B172C",
    stkcvxLUSD3CRV: "0x0A1D4A25d0390899b90bCD22E1Ef155003EA76d7",
    stkcvxcrvFRAX: "0x276187f24D41745513cbE2Bd5dFC33a4d8CDc9ed",
    stkcvxOHMFRAXBP: "0x888407AabAfa936B90acF65C4Db19370A01d9bd8",
    stkcvxMIM_3LP3CRV: "0x1aAbe1B22a290cCB39FD77440D5eb96Cf40079f4",
    stkcvxcrvCRVETH: "0xfC4b109D46e12170DF31AF8ba39403fAC2b8c0cf",
    stkcvxcrvCVXETH: "0x948bEd0211076b05d22e98929217d0f04D068C5c",
    stkcvxcrvUSDTWBTCWETH: "0xEE3EE8373384BBfea3227E527C1B9b4e7821273E",
    stkcvxLDOETH: "0x2Fd6bD5b81c1060039D619E76e4e1f924B173006",

    // YEARN TOKENS
    yvDAI: "0xdA816459F1AB5631232FE5e97a05BBBb94970c95",
    yvUSDC: "0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE",
    yvWETH: "0xa258C4606Ca8206D8aA700cE2143D7db854D168c",
    yvWBTC: "0xA696a63cc78DfFa1a63E9E50587C197387FF6C7E",
    yvCurve_stETH: "0xdCD90C7f6324cfa40d7169ef80b12031770B4325",
    yvCurve_FRAX: "0xB4AdA607B9d6b2c9Ee07A275e9616B84AC560139",

    // BALANCER TOKENS
    "50OHM_50DAI": "0x76FCf0e8C7Ff37A47a799FA2cd4c13cDe0D981C9",
    "50OHM_50WETH": "0xD1eC5e215E8148D76F4460e4097FD3d5ae0A3558",
    OHM_wstETH: "0xd4f79CA0Ac83192693bce4699d0c10C66Aa6Cf0F",

    // GEARBOX
    dDAI: "0x6CFaF95457d7688022FC53e7AbE052ef8DFBbdBA",
    dUSDC: "0xc411dB5f5Eb3f7d552F9B8454B2D74097ccdE6E3",
    dWBTC: "0xe753260F1955e8678DCeA8887759e07aa57E8c54",
    dWETH: "0xF21fc650C1B34eb0FDE786D52d23dA99Db3D6278",
    dwstETH: "0x2158034dB06f06dcB9A786D2F1F8c38781bA779d",
    dFRAX: "0x8A1112AFef7F4FC7c066a77AABBc01b3Fff31D47",

    GEAR: "0xBa3335588D9403515223F109EdC4eB7269a9Ab5D",

    // AAVE
    aUSDC: "0xBcca60bB61934080951369a648Fb03DF4F96263C",
    aDAI: "0x028171bCA77440897B824Ca71D1c56caC55b68A3",
    aUSDT: "0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811",
    aWETH: "0x030bA81f1c18d280636F32af80b9AAd02Cf0854e",

    waDAI: NOT_DEPLOYED,
    waUSDC: NOT_DEPLOYED,
    waUSDT: NOT_DEPLOYED,
    waWETH: NOT_DEPLOYED,

    cDAI: NOT_DEPLOYED,
    cUSDC: NOT_DEPLOYED,
    cUSDT: NOT_DEPLOYED,
    cWETH: NOT_DEPLOYED,
    cLINK: NOT_DEPLOYED,
  },

  ///
  ///
  /// A R B I T R U M   N E T W O R K
  ///
  ///
  Arbitrum: {
    "1INCH": NOT_DEPLOYED,
    AAVE: "0xba5DdD1f9d7F570dc94a51479a000E3BCE967196",
    COMP: "0x354A6dA3fcde098F8389cad84b0182725c6C91dE",
    CRV: "0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978",
    DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    DPI: NOT_DEPLOYED,
    FEI: NOT_DEPLOYED,
    LINK: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
    SNX: "0xcBA56Cd8216FCBBF3fA6DF6137F3147cBcA37D60",
    UNI: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",
    USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    WBTC: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    YFI: "0x82e3A8F066a6989666b031d916c43672085b1582",
    OHM: "0x6E6a3D8F1AfFAc703B1aEF1F43B8D2321bE40043",
    MIM: "0xFEa7a6a0B346362BF88A9e4A88416B77a57D6c2A",
    SPELL: "0x3E6648C5a70A150A88bCE65F4aD4d506Fe15d2AF",
    GMX: "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
    ARB: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    RDNT: "0x3082CC23568eA640225c2467653dB90e9250AaA0",
    BAL: "0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8",

    /// UPDATE
    STETH: NOT_DEPLOYED,
    wstETH: "0x5979D7b546E38E414F7E9822514be443A4800529",
    CVX: "0xb952A807345991BD529FDded05009F5e80Fe8F45",
    FRAX: "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F",
    FXS: "0x9d2F299715D94d8A7E6F5eaa8E654E8c74a988A7",
    LDO: "0x13Ad51ed4F1B7e9Dc168d8a00cB3f4dDD85EfA60",
    LUSD: "0x93b346b6BC2548dA6A1E7d98E9a421B42541425b",
    sUSD: "0xA970AF1a584579B618be4d69aD6F73459D112F95",
    GUSD: NOT_DEPLOYED,
    LQTY: "0xfb9E5D956D889D91a82737B9bFCDaC1DCE3e1449",

    // REDSTONE
    SHIB: NOT_DEPLOYED,

    // YEARN TOKENS
    yvDAI: NOT_DEPLOYED,
    yvUSDC: NOT_DEPLOYED,
    yvWETH: NOT_DEPLOYED,
    yvWBTC: NOT_DEPLOYED,
    yvCurve_stETH: NOT_DEPLOYED,
    yvCurve_FRAX: NOT_DEPLOYED,

    // CURVE LP TOKENS
    "3Crv": NOT_DEPLOYED,
    crvFRAX: NOT_DEPLOYED,
    steCRV: NOT_DEPLOYED,
    FRAX3CRV: NOT_DEPLOYED,
    LUSD3CRV: NOT_DEPLOYED,
    crvPlain3andSUSD: NOT_DEPLOYED,
    gusd3CRV: NOT_DEPLOYED,
    OHMFRAXBP: NOT_DEPLOYED,
    MIM_3LP3CRV: NOT_DEPLOYED,
    crvCRVETH: NOT_DEPLOYED,
    crvCVXETH: NOT_DEPLOYED,
    crvUSDTWBTCWETH: NOT_DEPLOYED,
    LDOETH: NOT_DEPLOYED,

    crvUSDUSDC: NOT_DEPLOYED,
    crvUSDUSDT: NOT_DEPLOYED,
    crvUSDFRAX: NOT_DEPLOYED,
    crvUSDETHCRV: NOT_DEPLOYED,

    // CONVEX LP TOKENS
    cvx3Crv: NOT_DEPLOYED,
    cvxcrvFRAX: NOT_DEPLOYED,
    cvxsteCRV: NOT_DEPLOYED,
    cvxcrvPlain3andSUSD: NOT_DEPLOYED,
    cvxFRAX3CRV: NOT_DEPLOYED,
    cvxLUSD3CRV: NOT_DEPLOYED,
    cvxgusd3CRV: NOT_DEPLOYED,
    cvxOHMFRAXBP: NOT_DEPLOYED,
    cvxMIM_3LP3CRV: NOT_DEPLOYED,
    cvxcrvCRVETH: NOT_DEPLOYED,
    cvxcrvCVXETH: NOT_DEPLOYED,
    cvxcrvUSDTWBTCWETH: NOT_DEPLOYED,
    cvxLDOETH: NOT_DEPLOYED,

    crvUSD: NOT_DEPLOYED,

    // CONVEX PHANTOM TOKEN ADDRESSES
    stkcvx3Crv: NOT_DEPLOYED,
    stkcvxcrvFRAX: NOT_DEPLOYED,
    stkcvxFRAX3CRV: NOT_DEPLOYED,
    stkcvxgusd3CRV: NOT_DEPLOYED,
    stkcvxsteCRV: NOT_DEPLOYED,
    stkcvxcrvPlain3andSUSD: NOT_DEPLOYED,
    stkcvxLUSD3CRV: NOT_DEPLOYED,
    stkcvxOHMFRAXBP: NOT_DEPLOYED,
    stkcvxMIM_3LP3CRV: NOT_DEPLOYED,
    stkcvxcrvCRVETH: NOT_DEPLOYED,
    stkcvxcrvCVXETH: NOT_DEPLOYED,
    stkcvxcrvUSDTWBTCWETH: NOT_DEPLOYED,
    stkcvxLDOETH: NOT_DEPLOYED,

    // BALANCER TOKENS
    "50OHM_50DAI": NOT_DEPLOYED,
    "50OHM_50WETH": "0x89dc7e71e362faF88D92288fE2311D25c6a1B5E0",
    OHM_wstETH: NOT_DEPLOYED,

    // GEARBOX
    dDAI: NOT_DEPLOYED,
    dUSDC: NOT_DEPLOYED,
    dWBTC: NOT_DEPLOYED,
    dWETH: NOT_DEPLOYED,
    dwstETH: NOT_DEPLOYED,
    dFRAX: NOT_DEPLOYED,

    GEAR: NOT_DEPLOYED,

    // AAVE
    aUSDC: "0x724dc807b04555b71ed48a6896b6F41593b8C637",
    aDAI: "0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE",
    aUSDT: "0x6ab707Aca953eDAeFBc4fD23bA73294241490620",
    aWETH: "0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8",

    waDAI: NOT_DEPLOYED,
    waUSDC: NOT_DEPLOYED,
    waUSDT: NOT_DEPLOYED,
    waWETH: NOT_DEPLOYED,

    cDAI: NOT_DEPLOYED,
    cUSDC: NOT_DEPLOYED,
    cUSDT: NOT_DEPLOYED,
    cWETH: NOT_DEPLOYED,
    cLINK: NOT_DEPLOYED,
  },
};

export const tokenSymbolByAddress = TypedObjectUtils.entries(
  tokenDataByNetwork,
).reduce<Record<string, SupportedToken>>(
  (acc, [, tokens]) => ({
    ...acc,
    ...TypedObjectUtils.fromEntries(
      TypedObjectUtils.entries(tokens)
        .map(([k, v]) => [v.toLowerCase(), k])
        .filter(k => !!k) as Array<[string, SupportedToken]>,
    ),
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
