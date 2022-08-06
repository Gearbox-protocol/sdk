import type { YearnLPToken } from "../tokens/yearn";
import { AdapterInterface } from "./adapters";
import { NetworkType } from "../core/constants";
import { Protocols } from "./protocols";
import { ConvexStakedPhantomToken } from "../tokens/convex";
import type { CurveLPToken } from "../tokens/curveLP";
import { NormalToken } from "../tokens/normal";
export declare type UniswapV2Contract = "UNISWAP_V2_ROUTER" | "SUSHISWAP_ROUTER";
export declare type CurvePoolContract = "CURVE_3CRV_POOL" | "CURVE_STETH_GATEWAY" | "CURVE_FRAX_POOL" | "CURVE_LUSD_POOL" | "CURVE_GUSD_POOL" | "CURVE_SUSD_POOL" | "CURVE_SUSD_DEPOSIT";
export declare type YearnVaultContract = "YEARN_DAI_VAULT" | "YEARN_USDC_VAULT" | "YEARN_WETH_VAULT" | "YEARN_WBTC_VAULT" | "YEARN_CURVE_FRAX_VAULT" | "YEARN_CURVE_STETH_VAULT";
export declare type ConvexPoolContract = "CONVEX_3CRV_POOL" | "CONVEX_GUSD_POOL" | "CONVEX_SUSD_POOL" | "CONVEX_STECRV_POOL" | "CONVEX_FRAX3CRV_POOL" | "CONVEX_LUSD3CRV_POOL";
export declare type SupportedContract = UniswapV2Contract | "UNISWAP_V3_ROUTER" | CurvePoolContract | YearnVaultContract | "CONVEX_BOOSTER" | ConvexPoolContract | "CONVEX_CLAIM_ZAP" | "LIDO_STETH_GATEWAY";
export declare const contractsByNetwork: Record<NetworkType, Record<SupportedContract, string>>;
export declare const UNISWAP_V3_QUOTER = "0xb27308f9f90d607463bb33ea1bebb41c27ce5ab6";
export interface BaseContractParams {
    name: string;
}
declare type UniswapV2Params = {
    protocol: Protocols.Uniswap | Protocols.Sushiswap;
    type: AdapterInterface.UNISWAP_V2_ROUTER;
} & BaseContractParams;
declare type UniswapV3Params = {
    protocol: Protocols.Uniswap;
    type: AdapterInterface.UNISWAP_V3_ROUTER;
    quoter: string;
} & BaseContractParams;
export declare type CurveParams = {
    protocol: Protocols.Curve;
    type: AdapterInterface.CURVE_V1_2ASSETS | AdapterInterface.CURVE_V1_3ASSETS | AdapterInterface.CURVE_V1_4ASSETS | AdapterInterface.CURVE_V1_WRAPPER;
    lpToken: CurveLPToken;
    tokens: Array<NormalToken | CurveLPToken>;
    wrapper?: CurvePoolContract;
} & BaseContractParams;
export declare type CurveSteCRVPoolParams = {
    protocol: Protocols.Curve;
    type: AdapterInterface.CURVE_V1_STECRV_POOL;
    pool: Record<NetworkType, string>;
    tokens: ["WETH", "STETH"];
    lpToken: "steCRV";
} & BaseContractParams;
export declare type YearnParams = {
    protocol: Protocols.Yearn;
    type: AdapterInterface.YEARN_V2;
    shareToken: YearnLPToken;
} & BaseContractParams;
declare type ConvexParams = {
    protocol: Protocols.Convex;
    type: AdapterInterface.CONVEX_V1_BOOSTER | AdapterInterface.CONVEX_V1_CLAIM_ZAP;
} & BaseContractParams;
declare type ConvexExtraPoolParams = {
    rewardToken: NormalToken;
    poolAddress: Record<NetworkType, string>;
};
export declare type ConvexPoolParams = {
    protocol: Protocols.Convex;
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL;
    stakedToken: ConvexStakedPhantomToken;
    extraRewards: Array<ConvexExtraPoolParams>;
} & BaseContractParams;
export declare type LidoParams = {
    protocol: Protocols.Lido;
    type: AdapterInterface.LIDO_V1;
    oracle: Record<NetworkType, string>;
    lpToken: "steCRV";
} & BaseContractParams;
export declare type ContractParams = UniswapV2Params | UniswapV3Params | CurveParams | CurveSteCRVPoolParams | YearnParams | ConvexParams | ConvexPoolParams | LidoParams;
export declare const contractParams: Record<SupportedContract, ContractParams>;
export declare const contractsByAddress: Record<string, SupportedContract>;
export {};
