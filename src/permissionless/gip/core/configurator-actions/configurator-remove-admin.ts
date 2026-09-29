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

interface RemoveAdminParams {
  role: AdminRole;
  admin: Address;
}

export type RemoveAdminAction = BaseMarketAction<
  "CONFIGURATOR::removeAdmin",
  RemoveAdminParams
>;

export const removeAdminActionData: ConfiguratorActionData<RemoveAdminAction> =
  {
    type: "CONFIGURATOR::removeAdmin",
    description: `Remove a pausable or unpausable admin from all markets.`,
    schema: z.object({
      role: adminRoleSchema,
      admin: addressSchema,
    }),
    stateTransition: (args: {
      state: ConfiguratorState;
      params: RemoveAdminParams;
    }): ConfiguratorState => {
      const { state, params } = args;
      const normalizedAdmin = params.admin.toLowerCase() as Address;

      switch (params.role) {
        case "PAUSABLE_ADMIN": {
          const newPausableAdmins = state.pausableAdmins.filter(
            a => a.toLowerCase() !== normalizedAdmin.toLowerCase(),
          );
          if (newPausableAdmins.length === state.pausableAdmins.length) {
            throw new Error("Admin not found in pausable admins");
          }
          return {
            ...state,
            pausableAdmins: newPausableAdmins,
          };
        }

        case "UNPAUSABLE_ADMIN": {
          const newUnpausableAdmins = state.unpausableAdmins.filter(
            a => a.toLowerCase() !== normalizedAdmin.toLowerCase(),
          );
          if (newUnpausableAdmins.length === state.unpausableAdmins.length) {
            throw new Error("Admin not found in unpausable admins");
          }
          return {
            ...state,
            unpausableAdmins: newUnpausableAdmins,
          };
        }

        case "LOSS_LIQUIDATOR": {
          const newLossLiquidators = state.lossLiquidators.filter(
            a => a.toLowerCase() !== normalizedAdmin.toLowerCase(),
          );
          if (newLossLiquidators.length === state.lossLiquidators.length) {
            throw new Error("Admin not found in loss liquidators");
          }

          return {
            ...state,
            lossLiquidators: newLossLiquidators,
          };
        }

        case "EMERGENCY_LIQUIDATOR": {
          const newEmergencyLiquidators = state.emergencyLiquidators.filter(
            a => a.toLowerCase() !== normalizedAdmin.toLowerCase(),
          );
          if (
            newEmergencyLiquidators.length === state.emergencyLiquidators.length
          ) {
            throw new Error("Admin not found in emergency liquidators");
          }
          return {
            ...state,
            emergencyLiquidators: newEmergencyLiquidators,
          };
        }
      }
    },
    getRawTx: async ({ ctx, action }) => {
      const mc = ctx.marketConfigurator;
      const { params } = action;
      return { tx: { tx: mc.revokeRole(params.role, params.admin), action } };
    },
    replace: (a: RemoveAdminParams, b: RemoveAdminParams) => {
      return (
        a.role === b.role && a.admin.toLowerCase() === b.admin.toLowerCase()
      );
    },
  };
