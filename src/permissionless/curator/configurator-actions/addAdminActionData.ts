import type { Address } from "viem";
import { z } from "zod/v4";
import type { BaseMarketAction } from "../actions/actionTypes.js";
import { noOp } from "../actions/utils/checkHelpers.js";
import {
  type AdminRole,
  adminRoleSchema,
} from "../state/configurator/types.js";
import { isSameAddress, lowerAddress } from "../utils/addressUtils.js";
import { addressSchema } from "../validationSchemas.js";
import {
  adminRoleHolders,
  adminRoleLabel,
  byRoleAndAdmin,
  updateAdminRole,
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
    description: `Add a new pausable or unpausable admin for all markets.`,
    schema: z.object({
      role: adminRoleSchema,
      admin: addressSchema,
    }),
    check: ({ state, params }) =>
      adminRoleHolders(state, params.role).some(holder =>
        isSameAddress(holder, params.admin),
      )
        ? [
            noOp(
              `${params.admin} is already one of the ${adminRoleLabel(params.role)}`,
              ["params", "admin"],
            ),
          ]
        : [],
    apply: ({ state, params }) =>
      updateAdminRole(state, params.role, holders => [
        ...holders,
        lowerAddress(params.admin),
      ]),
    encode: ({ ctx, params }) =>
      ctx.marketConfigurator.grantRole(params.role, params.admin),
    key: byRoleAndAdmin,
  });
