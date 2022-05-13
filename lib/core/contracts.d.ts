import { AdapterInterface } from "./adapters";
import { NetworkType } from "./constants";
import { Protocols } from "./protocols";
import { ConvexStakedPhantomToken, CurveLPToken, NormalToken } from "./token";
export declare type UniswapV2Contract = "UNISWAP_V2_ROUTER" | "SUSHISWAP_ROUTER";
export declare type CurvePoolContract = "CURVE_3POOL" | "CURVE_STETH_GATEWAY" | "CURVE_FRAX" | "CURVE_LUSD" | "CURVE_GUSD" | "CURVE_SUSD";
export declare type YearnVaultContract = "YEARN_DAI" | "YEARN_USDC" | "YEARN_WETH" | "YEARN_WBTC" | "YEARN_CURVE_FRAX" | "YEARN_CURVE_STETH";
export declare type ConvexPoolContract = "CONVEX_3CRV" | "CONVEX_GUSD" | "CONVEX_SUSD" | "CONVEX_STECRV" | "CONVEX_FRAX3CRV";
export declare type SupportedContract = UniswapV2Contract | "UNISWAP_V3_ROUTER" | CurvePoolContract | YearnVaultContract | "CONVEX_BOOSTER" | ConvexPoolContract | "CONVEX_CLAIM_ZAP" | "LIDO_STETH_GATEWAY";
export declare const contractsByNetwork: Record<NetworkType, Record<SupportedContract, string>>;
export declare const UNISWAP_V3_QUOTER = "0xb27308f9f90d607463bb33ea1bebb41c27ce5ab6";
export declare type ContractParams = {
    protocol: Protocols.Uniswap | Protocols.Sushiswap;
    type: AdapterInterface.UNISWAP_V2_ROUTER;
} | {
    protocol: Protocols.Uniswap;
    type: AdapterInterface.UNISWAP_V3_ROUTER;
    quoter: string;
} | {
    protocol: Protocols.Curve;
    type: AdapterInterface.CURVE_V1_2ASSETS | AdapterInterface.CURVE_V1_3ASSETS | AdapterInterface.CURVE_V1_4ASSETS;
    lpToken: CurveLPToken;
    tokens: Array<NormalToken | CurveLPToken>;
} | {
    protocol: Protocols.Curve;
    type: AdapterInterface.CURVE_V1_STECRV_POOL;
    pool: string;
    poolKovan?: string;
} | {
    protocol: Protocols.Yearn;
    type: AdapterInterface.YEARN_V2;
} | {
    protocol: Protocols.Convex;
    type: AdapterInterface.CONVEX_V1_BOOSTER | AdapterInterface.CONVEX_V1_CLAIM_ZAP;
} | {
    protocol: Protocols.Convex;
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL;
    stakedToken: ConvexStakedPhantomToken;
} | {
    protocol: Protocols.Lido;
    type: AdapterInterface.LIDO_V1;
};
export declare const contractParams: Record<SupportedContract, ContractParams>;
