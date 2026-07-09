import type { AbiParameter, Address } from "viem";
import type { OnchainSDK, PluginsMap } from "../../sdk/index.js";
import type { BaseContractStateHuman } from "../../sdk/types/state-human.js";
import type { AdaptersPlugin } from "./AdaptersPlugin.js";

export type VersionedAbi = Record<number, readonly AbiParameter[]>;

export type AdapterContractType =
  | "ADAPTER::ACCOUNT_MIGRATOR"
  | "ADAPTER::BALANCER_V3_ROUTER"
  | "ADAPTER::BALANCER_V3_WRAPPER"
  | "ADAPTER::CAMELOT_V3_ROUTER"
  | "ADAPTER::CURVE_STABLE_NG"
  | "ADAPTER::CURVE_V1_2ASSETS"
  | "ADAPTER::CURVE_V1_3ASSETS"
  | "ADAPTER::CURVE_V1_4ASSETS"
  | "ADAPTER::CURVE_V1_STECRV_POOL"
  | "ADAPTER::CVX_V1_BASE_REWARD_POOL"
  | "ADAPTER::CVX_V1_BOOSTER"
  | "ADAPTER::DAI_USDS_EXCHANGE"
  | "ADAPTER::ERC4626_VAULT"
  | "ADAPTER::ERC4626_VAULT_REFERRAL"
  | "ADAPTER::FLUID_DEX"
  | "ADAPTER::INFINIFI_GATEWAY"
  | "ADAPTER::INFINIFI_UNWINDING"
  | "ADAPTER::KELP_DEPOSIT_POOL"
  | "ADAPTER::KELP_WITHDRAWAL"
  | "ADAPTER::LIDO_V1"
  | "ADAPTER::LIDO_WSTETH_V1"
  | "ADAPTER::MELLOW_CLAIMER"
  | "ADAPTER::MELLOW_DVV"
  | "ADAPTER::MELLOW_ERC4626_VAULT"
  | "ADAPTER::MELLOW_WRAPPER"
  | "ADAPTER::MIDAS_ISSUANCE_VAULT"
  | "ADAPTER::MIDAS_REDEMPTION_VAULT"
  | "ADAPTER::PENDLE_ROUTER"
  | "ADAPTER::SECURITIZE_ONRAMP"
  | "ADAPTER::SECURITIZE_REDEMPTION"
  | "ADAPTER::STAKING_REWARDS"
  | "ADAPTER::TRADERJOE_ROUTER"
  | "ADAPTER::UNISWAP_V2_ROUTER"
  | "ADAPTER::UNISWAP_V3_ROUTER"
  | "ADAPTER::UNISWAP_V4_GATEWAY"
  | "ADAPTER::UPSHIFT_VAULT"
  | "ADAPTER::VELODROME_V2_ROUTER";

export enum AdapterType {
  ACCOUNT_MIGRATOR = "ACCOUNT_MIGRATOR",
  BALANCER_V3_ROUTER = "BALANCER_V3_ROUTER",
  BALANCER_V3_WRAPPER = "BALANCER_V3_WRAPPER",
  CAMELOT_V3_ROUTER = "CAMELOT_V3_ROUTER",
  CURVE_STABLE_NG = "CURVE_STABLE_NG",
  CURVE_V1_2ASSETS = "CURVE_V1_2ASSETS",
  CURVE_V1_3ASSETS = "CURVE_V1_3ASSETS",
  CURVE_V1_4ASSETS = "CURVE_V1_4ASSETS",
  CURVE_V1_STECRV_POOL = "CURVE_V1_STECRV_POOL",
  CVX_V1_BASE_REWARD_POOL = "CVX_V1_BASE_REWARD_POOL",
  CVX_V1_BOOSTER = "CVX_V1_BOOSTER",
  DAI_USDS_EXCHANGE = "DAI_USDS_EXCHANGE",
  ERC4626_VAULT = "ERC4626_VAULT",
  ERC4626_VAULT_REFERRAL = "ERC4626_VAULT_REFERRAL",
  FLUID_DEX = "FLUID_DEX",
  INFINIFI_GATEWAY = "INFINIFI_GATEWAY",
  INFINIFI_UNWINDING = "INFINIFI_UNWINDING",
  KELP_DEPOSIT_POOL = "KELP_DEPOSIT_POOL",
  KELP_WITHDRAWAL = "KELP_WITHDRAWAL",
  LIDO_V1 = "LIDO_V1",
  LIDO_WSTETH_V1 = "LIDO_WSTETH_V1",
  MELLOW_CLAIMER = "MELLOW_CLAIMER",
  MELLOW_DVV = "MELLOW_DVV",
  MELLOW_ERC4626_VAULT = "MELLOW_ERC4626_VAULT",
  MELLOW_WRAPPER = "MELLOW_WRAPPER",
  MIDAS_ISSUANCE_VAULT = "MIDAS_ISSUANCE_VAULT",
  MIDAS_REDEMPTION_VAULT = "MIDAS_REDEMPTION_VAULT",
  PENDLE_ROUTER = "PENDLE_ROUTER",
  SECURITIZE_ONRAMP = "SECURITIZE_ONRAMP",
  SECURITIZE_REDEMPTION = "SECURITIZE_REDEMPTION",
  STAKING_REWARDS = "STAKING_REWARDS",
  TRADERJOE_ROUTER = "TRADERJOE_ROUTER",
  UNISWAP_V2_ROUTER = "UNISWAP_V2_ROUTER",
  UNISWAP_V3_ROUTER = "UNISWAP_V3_ROUTER",
  UNISWAP_V4_GATEWAY = "UNISWAP_V4_GATEWAY",
  UPSHIFT_VAULT = "UPSHIFT_VAULT",
  VELODROME_V2_ROUTER = "VELODROME_V2_ROUTER",
}

/**
 * Diff-call semantics of a diff-style adapter call: the call spends the
 * consumed token down to the exact `leftoverAmount` encoded in its calldata,
 * so the post-call balance of `tokenIn` is `leftoverAmount` regardless of the
 * actual amount spent.
 */
export interface DiffLeftover {
  tokenIn: Address;
  leftoverAmount: bigint;
}

export interface AdapterContractStateHuman extends BaseContractStateHuman {
  creditManager?: string;
  targetContract?: string;
}

/**
 * Protocol-level call performed by an adapter: the target (protocol) contract
 * together with the decoded function name and arguments of the actual CALL the
 * adapter made to it. Recovered from an execution trace, so it is only present
 * when a trace is available (history, facade simulation).
 */
export interface AdapterProtocolOperation {
  /**
   * Address of protocol contract (targetContract of adapter contract)
   */
  contract: Address;
  /**
   * Function name protocol called by adapter
   */
  functionName: string;
  /**
   * Arguments of protocol called by adapter
   */
  functionArgs: Record<string, unknown>;
}

/**
 * True when the plugin map `P` contains the {@link AdaptersPlugin} under any key
 */
export type HasAdaptersPlugin<P extends PluginsMap> =
  Extract<P[keyof P], AdaptersPlugin> extends never ? false : true;

/**
 * Compile-time guard for the adapters plugin
 */
export type RequireAdaptersPlugin<P extends PluginsMap> =
  HasAdaptersPlugin<P> extends true
    ? unknown
    : { "OnchainSDK must be created with the AdaptersPlugin": never };

/**
 * {@link OnchainSDK} whose plugin map is guaranteed at compile time to include
 * the {@link AdaptersPlugin}.
 */
export type SdkWithAdapters<P extends PluginsMap = PluginsMap> = OnchainSDK<P> &
  RequireAdaptersPlugin<P>;
