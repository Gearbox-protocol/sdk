import type { Address } from "viem";
import { z } from "zod/v4";
import { isCreditManagerExpired } from "../state/market/isCreditManagerExpired.js";
import { addressSchema } from "../validationSchemas.js";
import type { BaseMarketAction } from "./actionTypes.js";
import {
  type CreditManagerTarget,
  creditManagerTargetSchema,
} from "./creditManagerTargets.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "./defineMarketAction.js";
import { requiresCreditManager, requiresDegenNft } from "./utils/actionKeys.js";
import type { ChainRead } from "./utils/chainReads.js";
import {
  creditManagerNotFound,
  findCreditManager,
} from "./utils/checkHelpers.js";
import { configureCreditManager } from "./utils/configureCalls.js";
import { updateCreditManagerState } from "./utils/creditManagerStateUpdates.js";
import {
  degenNftDiagnostics,
  resolveDegenNft,
} from "./utils/degenNftChecks.js";

export interface CreateCreditFacadeParams {
  degenNft: Address;
  expirable: boolean;
}

export interface UpgradeCreditFacadeParams {
  creditManager: CreditManagerTarget;
  facade: CreateCreditFacadeParams;
}

export type UpgradeCreditFacadeAction = BaseMarketAction<
  "CREDIT::upgradeCreditFacade",
  UpgradeCreditFacadeParams
>;

export const upgradeCreditFacadeActionData: MarketScopedDefinition<
  UpgradeCreditFacadeAction,
  ChainRead<boolean>
> = defineMarketAction<UpgradeCreditFacadeAction, ChainRead<boolean>>({
  type: "CREDIT::upgradeCreditFacade",
  gas: () => 5_100_000, // got 5,061,039
  description: "Upgrade credit facade of the credit manager.",
  schema: z.object({
    creditManager: creditManagerTargetSchema,
    facade: z.object({
      degenNft: addressSchema,
      expirable: z.boolean(),
    }),
  }),
  resolve: ({ ctx, params }) => resolveDegenNft(ctx, params.facade.degenNft),
  check: ({ state, params, resolved }) =>
    findCreditManager(state, params.creditManager)
      ? degenNftDiagnostics(state, params.facade.degenNft, resolved)
      : [creditManagerNotFound(params.creditManager)],
  apply: ({ state, params, env }) =>
    updateCreditManagerState({
      state,
      creditManager: params.creditManager,
      update: cm => {
        const { expirable } = params.facade;
        // A new facade keeps the date only while both facades are expirable.
        const expirationDate =
          cm.expirable && expirable ? cm.expirationDate : 0;
        return {
          ...cm,
          degenNFT: params.facade.degenNft,
          expirable,
          expirationDate,
          isExpired: isCreditManagerExpired(
            { expirable, expirationDate },
            env.timestamp,
          ),
          paused: false,
          creditFacade: undefined,
        };
      },
    }),
  requires: params => [
    ...requiresCreditManager(params),
    ...requiresDegenNft(params.facade.degenNft),
  ],
  // Each upgrade deploys a facade; collapsing it can erase resets consumed by later actions.
  key: () => undefined,
  encode: ({ ctx, params }) => {
    const { facade } = params;
    return configureCreditManager(ctx, params.creditManager, {
      functionName: "upgradeCreditFacade",
      args: [
        {
          degenNFT: facade.degenNft,
          expirable: facade.expirable,
          migrateBotList: true,
        },
      ],
    });
  },
});
