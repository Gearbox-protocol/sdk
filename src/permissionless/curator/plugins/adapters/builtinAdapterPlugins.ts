/**
 * The built-in adapter plugins.
 *
 * `builtinAdapterPlugins` is the only list to extend: the adapter type, deploy
 * params, state and action unions below are derived from it.
 **/
import type { ActionOf } from "../../actions/defineMarketAction.js";
import { getAbstractAdapterPlugin } from "./abstract-adapter/getAbstractAdapterPlugin.js";
import { balancerV3Plugin } from "./balancer-v3/balancerV3Plugin.js";
import { camelotV3Plugin } from "./camelot-v3/camelotV3Plugin.js";
import { convexV1BaseRewardPoolPlugin } from "./convex-v1-base-reward-pool/convexV1BaseRewardPoolPlugin.js";
import { convexV1BoosterPlugin } from "./convex-v1-booster/convexV1BoosterPlugin.js";
import { getCurveV1Plugin } from "./curve-v1/getCurveV1Plugin.js";
import { curveV1StETHPlugin } from "./curve-v1-steth/curveV1StETHPlugin.js";
import { daiUsdsAdapterPlugin } from "./dai-usds/daiUsdsAdapterPlugin.js";
import type {
  ActionDefinitionsOf,
  AdapterPluginDefinition,
  AdapterStateBase,
  AdapterStateOf,
  DeployParamsOf,
} from "./defineAdapterPlugin.js";
import { erc4626AdapterPlugin } from "./erc4626/erc4626AdapterPlugin.js";
import { erc4626ReferralAdapterPlugin } from "./erc4626-referral/erc4626ReferralAdapterPlugin.js";
import { mellowClaimerAdapterPlugin } from "./mellow-claimer/mellowClaimerAdapterPlugin.js";
import { mellowErc4626AdapterPlugin } from "./mellow-erc4626/mellowErc4626AdapterPlugin.js";
import { mellowWrapperAdapterPlugin } from "./mellow-wrapper/mellowWrapperAdapterPlugin.js";
import { midasGatewayAdapterPlugin } from "./midas-gateway/midasGatewayAdapterPlugin.js";
import { midasIssuanceAdapterPlugin } from "./midas-issuance/midasIssuanceAdapterPlugin.js";
import { midasRedemptionAdapterPlugin } from "./midas-redemption/midasRedemptionAdapterPlugin.js";
import { pendlePlugin } from "./pendle/pendlePlugin.js";
import { securitizeRedemptionAdapterPlugin } from "./securitize-redemption/securitizeRedemptionAdapterPlugin.js";
import { stakingRewardsPlugin } from "./staking-rewards/stakingRewardsPlugin.js";
import { traderJoePlugin } from "./traderjoe/traderJoePlugin.js";
import { uniswapV2Plugin } from "./uniswap-v2/uniswapV2Plugin.js";
import { uniswapV3Plugin } from "./uniswap-v3/uniswapV3Plugin.js";
import { uniswapV4Plugin } from "./uniswap-v4/uniswapV4Plugin.js";
import { velodromeV2Plugin } from "./velodrome-v2/velodromeV2Plugin.js";

/** Every adapter plugin the package ships. **/
export const builtinAdapterPlugins = [
  uniswapV2Plugin,
  uniswapV3Plugin,
  uniswapV4Plugin,

  balancerV3Plugin,
  getAbstractAdapterPlugin("BALANCER_V3_WRAPPER"),

  getCurveV1Plugin("CURVE_V1_2ASSETS"),
  getCurveV1Plugin("CURVE_V1_3ASSETS"),
  getCurveV1Plugin("CURVE_V1_4ASSETS"),
  getCurveV1Plugin("CURVE_STABLE_NG"),
  curveV1StETHPlugin,

  erc4626AdapterPlugin,
  erc4626ReferralAdapterPlugin,

  pendlePlugin,

  midasGatewayAdapterPlugin,
  securitizeRedemptionAdapterPlugin,

  getAbstractAdapterPlugin("SECURITIZE_ONRAMP"),

  mellowErc4626AdapterPlugin,
  getAbstractAdapterPlugin("MELLOW_DVV"),
  mellowWrapperAdapterPlugin,
  mellowClaimerAdapterPlugin,

  midasIssuanceAdapterPlugin,
  midasRedemptionAdapterPlugin,

  convexV1BaseRewardPoolPlugin,
  convexV1BoosterPlugin,

  getAbstractAdapterPlugin("FLUID_DEX"),

  velodromeV2Plugin,
  camelotV3Plugin,
  traderJoePlugin,

  daiUsdsAdapterPlugin,
  stakingRewardsPlugin,

  getAbstractAdapterPlugin("LIDO_V1"),
  getAbstractAdapterPlugin("LIDO_WSTETH_V1"),
] as const;

type BuiltinAdapterPlugin = (typeof builtinAdapterPlugins)[number];

/** Deploy params of a built-in adapter. **/
export type AdapterDeployParams = DeployParamsOf<BuiltinAdapterPlugin>;

/** State of a built-in adapter. **/
export type AdapterState = AdapterStateOf<BuiltinAdapterPlugin>;

export type AdapterType = AdapterDeployParams["type"];

/** @deprecated the state every adapter has; use {@link AdapterStateBase}. **/
export type BaseAdapterState = AdapterStateBase;

/** @deprecated use {@link AdapterPluginDefinition}. **/
export type AdapterPlugin = AdapterPluginDefinition;

/** Definitions of the built-in adapter actions. **/
export type AdapterMarketActionDefinition =
  ActionDefinitionsOf<BuiltinAdapterPlugin>;

/** Every built-in adapter action, derived from the plugins' `actions`. **/
export type AdapterMarketActions = ActionOf<AdapterMarketActionDefinition>;

/** The built-in plugins by adapter type. **/
export const adapterPlugins = Object.fromEntries(
  builtinAdapterPlugins.map(plugin => [plugin.type, plugin]),
) as Record<AdapterType, AdapterPluginDefinition>;
