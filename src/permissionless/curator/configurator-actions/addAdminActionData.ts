import type { Address } from "viem";
import { z } from "zod/v4";
import type { BaseMarketAction } from "../actions/actionTypes.js";
import { noOp } from "../actions/utils/checkHelpers.js";
import {
  type AdminRole,
  adminRoleSchema,
} from "../state/configurator/types.js";
import { lowerAddress } from "../utils/addressUtils.js";
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

interface AddAdminParams {
  role: AdminRole;
  admin: Address;
}

export type AddAdminAction = BaseMarketAction<
  "CONFIGURATOR::addAdmin",
  AddAdminParams
>;

export const addAdminActionData: ConfiguratorScopedDefinition<AddAdminAction> =
  defineConfiguratorAction<AddAdminAction>({
    type: "CONFIGURATOR::addAdmin",
    description: `Add a pausable admin, unpausable admin, loss liquidator or emergency liquidator for all markets. CONFIGURATOR::grantRole takes any role.`,
    schema: z.object({
      role: adminRoleSchema,
      admin: addressSchema,
    }),
    check: ({ state, params }) =>
      holdsRole(state, params.role, params.admin)
        ? [
            noOp(
              `${params.admin} is already one of the ${roleLabel(params.role)}`,
              ["params", "admin"],
            ),
          ]
        : [],
    apply: ({ state, params }) =>
      updateRoleHolders(state, params.role, holders => [
        ...holders,
        lowerAddress(params.admin),
      ]),
    encode: ({ ctx, params }) =>
      ctx.marketConfigurator.grantRole(params.role, params.admin),
    key: byRoleAndAdmin,
  });
