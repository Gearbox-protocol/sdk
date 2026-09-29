import { z } from "zod";
import { addressSchema, literalsSchema } from "../../core/validation.js";
import { balancerV3MarketActionsSchema } from "./balancer-v3/index.js";
import { camelotV3MarketActionsSchema } from "./camelot-v3/index.js";
import { convexV1BoosterMarketActionsSchema } from "./convex-v1-booster/index.js";
import { curveV1DeployParamsSchema } from "./curve-v1/index.js";
import { curveV1StETHDeployParamsSchema } from "./curve-v1-steth/index.js";
import { erc4626DeployParamsSchema } from "./erc4626/index.js";
import { erc4626ReferralDeployParamsSchema } from "./erc4626-referral/index.js";
import { infinifiGatewayMarketActionsSchema } from "./infinifi/infinifi-gateway/index.js";
import {
  infinifiUnwindingDeployParamsSchema,
  infinifiUnwindingMarketActionsSchema,
} from "./infinifi/infinifi-unwinding/index.js";
import { KelpLRTWithdrawalManagerMarketActionsSchema } from "./kelp-lrt-withdrawal-manager/index.js";
import { mellowClaimerMarketActionsSchema } from "./mellow-claimer/index.js";
import {
  mellowWrapperDeployParamsSchema,
  mellowWrapperMarketActionsSchema,
} from "./mellow-wrapper/index.js";
import { midasGatewayDeployParamsSchema } from "./midas-gateway/index.js";
import {
  midasIssuanceDeployParamsSchema,
  midasIssuanceMarketActionsSchema,
} from "./midas-issuance/index.js";
import {
  midasRedemptionDeployParamsSchema,
  midasRedemptionMarketActionsSchema,
} from "./midas-redemption/index.js";
import { pendleMarketActionsSchema } from "./pendle/index.js";
import { securitizeRedemptionDeployParamsSchema } from "./securitize-redemption/index.js";
import { stakingRewardsDeployParamsSchema } from "./staking-rewards/index.js";
import { traderJoeMarketActionsSchema } from "./traderjoe/index.js";
import { uniswapV2MarketActionsSchema } from "./uniswap-v2/index.js";
import { uniswapV3MarketActionsSchema } from "./uniswap-v3/index.js";
import { uniswapV4MarketActionsSchema } from "./uniswap-v4/index.js";
import { velodromeV2MarketActionsSchema } from "./velodrome-v2/index.js";

const defaultAdapterDeployParamsSchema = z.object({
  version: literalsSchema(310, 311, 312),
  target: addressSchema,
});

const stakedTokenAdapterDeployParamsSchema = z.object({
  type: literalsSchema(
    "CVX_V1_BASE_REWARD_POOL",
    "MELLOW_ERC4626_VAULT",
    "UPSHIFT_VAULT",
  ),
  version: literalsSchema(310, 311, 312),
  target: addressSchema,
  stakedToken: addressSchema,
});

export const kelpDeployParamsSchema = z.object({
  type: literalsSchema("KELP_DEPOSIT_POOL", "KELP_WITHDRAWAL"),
  version: z.literal(310),
  target: addressSchema,
  referralId: z.string(),
});

export const adapterDeployParamsSchema = z.union([
  defaultAdapterDeployParamsSchema,
  stakedTokenAdapterDeployParamsSchema,
  curveV1DeployParamsSchema,
  curveV1StETHDeployParamsSchema,
  erc4626DeployParamsSchema,
  erc4626ReferralDeployParamsSchema,
  infinifiUnwindingDeployParamsSchema,
  kelpDeployParamsSchema,
  mellowWrapperDeployParamsSchema,
  midasGatewayDeployParamsSchema,
  midasIssuanceDeployParamsSchema,
  midasRedemptionDeployParamsSchema,
  securitizeRedemptionDeployParamsSchema,
  stakingRewardsDeployParamsSchema,
]);

export const adapterMarketActionsSchemas = [
  z.object({
    type: z.literal("allowAdapter"),
    creditManager: addressSchema,
    adapter: adapterDeployParamsSchema,
  }),
  balancerV3MarketActionsSchema,
  camelotV3MarketActionsSchema,
  convexV1BoosterMarketActionsSchema,
  infinifiGatewayMarketActionsSchema,
  infinifiUnwindingMarketActionsSchema,
  KelpLRTWithdrawalManagerMarketActionsSchema,
  KelpLRTWithdrawalManagerMarketActionsSchema,
  mellowClaimerMarketActionsSchema,
  mellowWrapperMarketActionsSchema,
  midasIssuanceMarketActionsSchema,
  midasRedemptionMarketActionsSchema,
  pendleMarketActionsSchema,
  traderJoeMarketActionsSchema,
  uniswapV2MarketActionsSchema,
  uniswapV3MarketActionsSchema,
  uniswapV4MarketActionsSchema,
  velodromeV2MarketActionsSchema,
];
