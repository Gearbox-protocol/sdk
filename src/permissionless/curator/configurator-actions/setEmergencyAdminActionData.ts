import type { Address } from "viem";
import { z } from "zod/v4";
import type { BaseMarketAction } from "../actions/actionTypes.js";
import { single } from "../actions/utils/actionKeys.js";
import { noOp } from "../actions/utils/checkHelpers.js";
import { isSameAddress, lowerAddress } from "../utils/addressUtils.js";
import { addressSchema } from "../validationSchemas.js";
import {
  type ConfiguratorScopedDefinition,
  defineConfiguratorAction,
} from "./defineConfiguratorAction.js";

interface SetEmergencyAdminParams {
  emergencyAdmin: Address;
}

export type SetEmergencyAdminAction = BaseMarketAction<
  "CONFIGURATOR::setEmergencyAdmin",
  SetEmergencyAdminParams
>;

export const setEmergencyAdminActionData: ConfiguratorScopedDefinition<SetEmergencyAdminAction> =
  defineConfiguratorAction<SetEmergencyAdminAction>({
    type: "CONFIGURATOR::setEmergencyAdmin",
    description: `Set the emergency admin address for the market configurator.`,
    schema: z.object({
      emergencyAdmin: addressSchema,
    }),
    check: ({ state, params }) =>
      isSameAddress(state.emergencyAdmin, params.emergencyAdmin)
        ? [
            noOp("The emergency admin is already set to this address", [
              "params",
              "emergencyAdmin",
            ]),
          ]
        : [],
    apply: ({ state, params }) => ({
      ...state,
      emergencyAdmin: lowerAddress(params.emergencyAdmin),
    }),
    encode: ({ ctx, params }) =>
      ctx.marketConfigurator.setEmergencyAdmin(params.emergencyAdmin),
    // Only the latest emergency admin matters.
    key: single,
  });
