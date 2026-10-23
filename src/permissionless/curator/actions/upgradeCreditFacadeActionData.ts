import type { Address } from "viem";
import { z } from "zod/v4";
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
import { byCreditManager, requiresCreditManager } from "./utils/actionKeys.js";
import {
  creditManagerNotFound,
  findCreditManager,
} from "./utils/checkHelpers.js";
import { configureCreditManager } from "./utils/configureCalls.js";
import { updateCreditManagerState } from "./utils/creditManagerStateUpdates.js";

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

export const upgradeCreditFacadeActionData: MarketScopedDefinition<UpgradeCreditFacadeAction> =
  defineMarketAction<UpgradeCreditFacadeAction>({
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
    check: ({ state, params }) =>
      findCreditManager(state, params.creditManager)
        ? []
        : [creditManagerNotFound(params.creditManager)],
    apply: ({ state, params }) =>
      updateCreditManagerState({
        state,
        creditManager: params.creditManager,
        update: cm => ({
          ...cm,
          degenNFT: params.facade.degenNft,
          expirable: params.facade.expirable,
        }),
      }),
    requires: requiresCreditManager,
    key: byCreditManager,
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
