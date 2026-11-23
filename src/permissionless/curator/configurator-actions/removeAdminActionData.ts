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
  byRoleAndAdmin,
  holdsRole,
  roleLabel,
  updateRoleHolders,
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
    description: `Remove a pausable admin, unpausable admin, loss liquidator or emergency liquidator from all markets. CONFIGURATOR::revokeRole takes any role.`,
    schema: z.object({
      role: adminRoleSchema,
      admin: addressSchema,
    }),
    check: ({ state, params }) =>
      holdsRole(state, params.role, params.admin)
        ? []
        : [
            actionError(
              "ADMIN_NOT_FOUND",
              `${params.admin} is not one of the ${roleLabel(params.role)}`,
              ["params", "admin"],
            ),
          ],
    apply: ({ state, params }) =>
      updateRoleHolders(state, params.role, holders =>
        holders.filter(holder => !isSameAddress(holder, params.admin)),
      ),
    encode: ({ ctx, params }) =>
      ctx.marketConfigurator.revokeRole(params.role, params.admin),
    key: byRoleAndAdmin,
  });
