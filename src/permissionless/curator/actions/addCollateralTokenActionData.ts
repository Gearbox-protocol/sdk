import { type Address, erc20Abi, isAddress, zeroAddress } from "viem";
import { z } from "zod/v4";
import { iPhantomTokenAbi } from "../../../abi/iPhantomToken.js";
import { convertPercent } from "../../utils/format.js";
import { lowerAddress } from "../utils/addressUtils.js";
import { addressSchema, percentageSchema } from "../validationSchemas.js";
import { actionError, incompleteCheck } from "./actionDiagnostics.js";
import type { BaseMarketAction } from "./actionTypes.js";
import {
  type CreditManagerTarget,
  creditManagerTargetSchema,
} from "./creditManagerTargets.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "./defineMarketAction.js";
import {
  byCreditManagerAndToken,
  requiresCreditManager,
  resource,
} from "./utils/actionKeys.js";
import {
  type ChainRead,
  contractRejected,
  isUnknown,
  readBytecode,
  readChain,
} from "./utils/chainReads.js";
import {
  assetNotFound,
  creditManagerNotFound,
  findAsset,
  findCollateral,
  findCreditManager,
  isUnderlying,
  liquidationThresholdDiagnostics,
  underlyingNotAllowed,
} from "./utils/checkHelpers.js";
import { configureCreditManager } from "./utils/configureCalls.js";
import { updateCreditManagerState } from "./utils/creditManagerStateUpdates.js";

export type AddCollateralTokenContext = {
  creditManager: CreditManagerTarget;
  token: Address;
};

export interface AddCollateralTokenParams extends AddCollateralTokenContext {
  liquidationThreshold: number;
}

export type AddCollateralTokenAction = BaseMarketAction<
  "CREDIT::addCollateralToken",
  AddCollateralTokenParams
>;

export interface CollateralResolution {
  code: ChainRead<boolean>;
  balance: ChainRead<bigint>;
  phantom: ChainRead<readonly [Address, Address]>;
}

export const addCollateralTokenActionData: MarketScopedDefinition<
  AddCollateralTokenAction,
  CollateralResolution
> = defineMarketAction<AddCollateralTokenAction, CollateralResolution>({
  type: "CREDIT::addCollateralToken",
  gas: () => 180_000, // got 176,131
  description:
    "Add a collateral token to the credit manager. It gets a liquidation threshold as parameter.",
  schema: z.object({
    creditManager: creditManagerTargetSchema,
    token: addressSchema,
    liquidationThreshold: percentageSchema,
  }),
  resolve: async ({ ctx, params }) => {
    const [code, balance, phantom] = await Promise.all([
      readBytecode(ctx, params.token),
      readChain(() =>
        ctx.client.readContract({
          address: params.token,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [
            isAddress(params.creditManager)
              ? params.creditManager
              : zeroAddress,
          ],
        }),
      ),
      readChain(() =>
        ctx.client.readContract({
          address: params.token,
          abi: iPhantomTokenAbi,
          functionName: "getPhantomTokenInfo",
        }),
      ),
    ]);
    return { code, balance, phantom };
  },
  check: ({ state, params, resolved }) => {
    const cm = findCreditManager(state, params.creditManager);
    if (!cm) return [creditManagerNotFound(params.creditManager)];
    if (isUnderlying(state, params.token)) return [underlyingNotAllowed()];
    const asset = findAsset(state, params.token);
    if (!asset) return [assetNotFound(params.token)];
    if (findCollateral(cm, params.token))
      return [
        actionError(
          "COLLATERAL_EXISTS",
          `Token ${params.token} is already collateral of the credit manager`,
          ["params", "token"],
        ),
      ];
    if (Object.keys(cm.collateralTokens).length >= 255)
      return [
        actionError(
          "TOO_MANY_COLLATERAL_TOKENS",
          "A credit manager supports at most 255 collateral tokens including underlying",
          ["params", "token"],
        ),
      ];
    const diagnostics = liquidationThresholdDiagnostics(
      state,
      cm,
      params.liquidationThreshold,
      ["params", "liquidationThreshold"],
    );
    if (resolved.code.value === false || contractRejected(resolved.balance))
      diagnostics.push(
        actionError(
          "INVALID_COLLATERAL_TOKEN",
          "Collateral must be an ERC20 contract implementing balanceOf",
        ),
      );
    if (resolved.code.value === undefined || isUnknown(resolved.balance))
      diagnostics.push(
        incompleteCheck(
          "collateralERC20",
          "Token bytecode or balanceOf is unavailable",
        ),
      );
    if (
      resolved.phantom.value &&
      !findCollateral(cm, resolved.phantom.value[1])
    )
      diagnostics.push(
        actionError(
          "PHANTOM_DEPOSITED_TOKEN_MISSING",
          `Add deposited token ${resolved.phantom.value[1]} as collateral first`,
        ),
      );
    if (isUnknown(resolved.phantom))
      diagnostics.push(
        incompleteCheck(
          "phantomToken",
          "Phantom token metadata is unavailable",
        ),
      );
    if (asset.mainPriceFeed === zeroAddress)
      diagnostics.push(
        actionError(
          "PRICE_FEED_MISSING",
          "Collateral must have a main price feed",
        ),
      );
    return diagnostics;
  },
  apply: ({ state, params }) => {
    const tokenAddress = lowerAddress(params.token);
    return updateCreditManagerState({
      state,
      creditManager: params.creditManager,
      update: cm => ({
        ...cm,
        collateralTokens: {
          ...cm.collateralTokens,
          [tokenAddress]: {
            liquidationThresholdInitial: params.liquidationThreshold,
            liquidationThresholdFinal: params.liquidationThreshold,
            rampStart: 0,
            rampDuration: 0,
            isForbidden: false,
          },
        },
      }),
    });
  },
  encode: ({ ctx, params }) =>
    configureCreditManager(ctx, params.creditManager, {
      functionName: "addCollateralToken",
      args: [params.token, convertPercent(params.liquidationThreshold)],
    }),
  requires: params => [
    ...requiresCreditManager(params),
    resource.asset(params.token),
  ],
  provides: params => [resource.collateral(params.creditManager, params.token)],
  key: byCreditManagerAndToken,
});
