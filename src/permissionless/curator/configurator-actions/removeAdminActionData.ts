import type { Address } from "viem";
import { z } from "zod/v4";
import { actionError } from "../actions/actionDiagnostics.js";
import type { BaseMarketAction } from "../actions/actionTypes.js";
import {
  type AdminRole,
  adminRoleSchema,
} from "../state/configurator/types.js";
import { isSameAddress } from "../utils/addressUtils.js";
import { addressSchema } from "../validationSchemas.js";
import {
  adminRoleLabel,
  byRoleAndAdmin,
  holdsAdminRole,
  updateAdminRole,
} from "./configuratorActionHelpers.js";
import {
  type ConfiguratorScopedDefinition,
  defineConfiguratorAction,
} from "./defineConfiguratorAction.js";

interface RemoveAdminParams {
  role: AdminRole;
  admin: Address;
}

export type RemoveAdminAction = BaseMarketAction<
  "CONFIGURATOR::removeAdmin",
  RemoveAdminParams
>;

export const removeAdminActionData: ConfiguratorScopedDefinition<RemoveAdminAction> =
  defineConfiguratorAction<RemoveAdminAction>({
    type: "CONFIGURATOR::removeAdmin",
    description: `Remove a pausable or unpausable admin from all markets.`,
    schema: z.object({
      role: adminRoleSchema,
      admin: addressSchema,
    }),
    check: ({ state, params }) =>
      holdsAdminRole(state, params.role, params.admin)
        ? []
        : [
            actionError(
              "ADMIN_NOT_FOUND",
              `${params.admin} is not one of the ${adminRoleLabel(params.role)}`,
              ["params", "admin"],
            ),
          ],
    apply: ({ state, params }) =>
      updateAdminRole(state, params.role, holders =>
        holders.filter(holder => !isSameAddress(holder, params.admin)),
      ),
    encode: ({ ctx, params }) =>
      ctx.marketConfigurator.revokeRole(params.role, params.admin),
    key: byRoleAndAdmin,
  });
