import type { Address } from "viem";
import { z } from "zod";
import type { BaseMarketAction } from "../actions/types.js";
import {
  type AdminRole,
  adminRoleSchema,
  type ConfiguratorState,
} from "../configurator-state/types.js";
import { addressSchema } from "../validation.js";
import type { ConfiguratorActionData } from "./types.js";

interface AddAdminParams {
  role: AdminRole;
  admin: Address;
}

export type AddAdminAction = BaseMarketAction<
  "CONFIGURATOR::addAdmin",
  AddAdminParams
>;

export const addAdminActionData: ConfiguratorActionData<AddAdminAction> = {
  type: "CONFIGURATOR::addAdmin",
  description: `Add a new pausable or unpausable admin for all markets.`,
  schema: z.object({
    role: adminRoleSchema,
    admin: addressSchema,
  }),
  stateTransition: (args: {
    state: ConfiguratorState;
    params: AddAdminParams;
  }): ConfiguratorState => {
    const { state, params } = args;
    const normalizedAdmin = params.admin.toLowerCase() as Address;

    // Check if admin already exists
    switch (params.role) {
      case "PAUSABLE_ADMIN": {
        if (
          state.pausableAdmins.some(
            a => a.toLowerCase() === normalizedAdmin.toLowerCase(),
          )
        ) {
          throw new Error("Admin already exists in pausable admins");
        }
        return {
          ...state,
          pausableAdmins: [...state.pausableAdmins, normalizedAdmin],
        };
      }

      case "UNPAUSABLE_ADMIN": {
        if (
          state.unpausableAdmins.some(
            a => a.toLowerCase() === normalizedAdmin.toLowerCase(),
          )
        ) {
          throw new Error("Admin already exists in unpausable admins");
        }
        return {
          ...state,
          unpausableAdmins: [...state.unpausableAdmins, normalizedAdmin],
        };
      }

      case "LOSS_LIQUIDATOR": {
        if (
          state.lossLiquidators.some(
            a => a.toLowerCase() === normalizedAdmin.toLowerCase(),
          )
        ) {
          throw new Error("Admin already exists in loss liquidators");
        }
        return {
          ...state,
          lossLiquidators: [...state.lossLiquidators, normalizedAdmin],
        };
      }

      case "EMERGENCY_LIQUIDATOR": {
        if (
          state.emergencyLiquidators.some(
            a => a.toLowerCase() === normalizedAdmin.toLowerCase(),
          )
        ) {
          throw new Error("Admin already exists in emergency liquidators");
        }
        return {
          ...state,
          emergencyLiquidators: [
            ...state.emergencyLiquidators,
            normalizedAdmin,
          ],
        };
      }
    }
  },
  getRawTx: async ({ ctx, action }) => {
    const mc = ctx.marketConfigurator;
    const { params } = action;
    const tx = mc.grantRole(params.role, params.admin);
    return { tx: { tx, action } };
  },
  replace: (a: AddAdminParams, b: AddAdminParams) => {
    return a.role === b.role && a.admin.toLowerCase() === b.admin.toLowerCase();
  },
};
