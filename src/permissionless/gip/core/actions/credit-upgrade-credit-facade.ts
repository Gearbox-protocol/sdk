import type { Address } from "viem";
import { z } from "zod";
import { iCreditConfigureActionsAbi } from "../../../../abi/310/configure/iCreditConfigureActions.js";
import { createCallData } from "../../../index.js";
import type { MarketState } from "../market-state/types.js";
import { addressSchema } from "../validation.js";
import type { BaseMarketAction, MarketActionData } from "./types.js";
import { updateCreditManagerState } from "./utils/credit-manager-state.js";

export interface CreateCreditFacadeParams {
  degenNft: Address;
  expirable: boolean;
}

export interface UpgradeCreditFacadeParams {
  creditManager: Address;
  facade: CreateCreditFacadeParams;
}

export type UpgradeCreditFacadeAction = BaseMarketAction<
  "CREDIT::upgradeCreditFacade",
  UpgradeCreditFacadeParams
>;

export const upgradeCreditFacadeActionData: MarketActionData<UpgradeCreditFacadeAction> =
  {
    type: "CREDIT::upgradeCreditFacade",
    description: "Upgrade credit facade of the credit manager.",
    schema: z.object({
      creditManager: addressSchema,
      facade: z.object({
        degenNft: addressSchema,
        expirable: z.boolean(),
      }),
    }),
    stateTransition: (args: {
      state: MarketState;
      params: UpgradeCreditFacadeParams;
    }): MarketState => {
      const { state, params } = args;

      return updateCreditManagerState({
        state,
        creditManager: params.creditManager,
        update: cm => ({
          ...cm,
          degenNFT: params.facade.degenNft,
          expirable: params.facade.expirable,
        }),
      });
    },
    replace: (a: UpgradeCreditFacadeParams, b: UpgradeCreditFacadeParams) => {
      return a.creditManager.toLowerCase() === b.creditManager.toLowerCase();
    },
    replaceCmAddress: ({ action, oldCm, newCm }) => {
      if (action.params.creditManager.toLowerCase() === oldCm.toLowerCase()) {
        return {
          ...action,
          params: {
            ...action.params,
            creditManager: newCm,
          },
        };
      }
      return action;
    },
    getRawTx: async ({ ctx, action }) => {
      const mc = ctx.marketConfigurator;
      const { params } = action;
      const tx = mc.configureCreditManager(
        params.creditManager,
        createCallData(iCreditConfigureActionsAbi, {
          functionName: "upgradeCreditFacade",
          args: [
            {
              degenNFT: params.facade.degenNft,
              expirable: params.facade.expirable,
              migrateBotList: true,
            },
          ],
        }),
      );
      return { tx: { tx, action } };
    },
  };
