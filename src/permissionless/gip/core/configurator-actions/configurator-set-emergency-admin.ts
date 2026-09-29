import type { Address } from "viem";
import { z } from "zod";
import type { BaseMarketAction } from "../actions/types.js";
import type { ConfiguratorState } from "../configurator-state/types.js";
import { addressSchema } from "../validation.js";
import type { ConfiguratorActionData } from "./types.js";

interface SetEmergencyAdminParams {
  emergencyAdmin: Address;
}

export type SetEmergencyAdminAction = BaseMarketAction<
  "CONFIGURATOR::setEmergencyAdmin",
  SetEmergencyAdminParams
>;

export const setEmergencyAdminActionData: ConfiguratorActionData<SetEmergencyAdminAction> =
  {
    type: "CONFIGURATOR::setEmergencyAdmin",
    description: `Set the emergency admin address for the market configurator.`,
    schema: z.object({
      emergencyAdmin: addressSchema,
    }),
    stateTransition: (args: {
      state: ConfiguratorState;
      params: SetEmergencyAdminParams;
    }): ConfiguratorState => {
      const { state, params } = args;
      const normalizedEmergencyAdmin =
        params.emergencyAdmin.toLowerCase() as Address;

      if (
        state.emergencyAdmin.toLowerCase() ===
        normalizedEmergencyAdmin.toLowerCase()
      ) {
        throw new Error("Emergency admin address is already set to this value");
      }

      return {
        ...state,
        emergencyAdmin: normalizedEmergencyAdmin,
      };
    },
    getRawTx: async ({ ctx, action }) => {
      const mc = ctx.marketConfigurator;
      const { params } = action;
      return {
        tx: { tx: mc.setEmergencyAdmin(params.emergencyAdmin), action },
      };
    },
    replace: () => {
      // Always replace previous setEmergencyAdmin action
      return true;
    },
  };
