import type { Address } from "viem";
import { z } from "zod/v4";
import { actionWarning } from "../actions/actionDiagnostics.js";
import type { BaseMarketAction } from "../actions/actionTypes.js";
import { noOp } from "../actions/utils/checkHelpers.js";
import {
  knownRoleLabelMap,
  roleNameSchema,
} from "../state/configurator/types.js";
import { lowerAddress } from "../utils/addressUtils.js";
import { addressSchema } from "../validationSchemas.js";
import {
  byRoleAndAccount,
  holdsRole,
  roleLabel,
  updateRoleHolders,
} from "./configuratorActionHelpers.js";
import {
  type ConfiguratorScopedDefinition,
  defineConfiguratorAction,
} from "./defineConfiguratorAction.js";

export interface GrantRoleParams {
  /** Role name, e.g. `PAUSABLE_ADMIN` or `OPENING_SIGNER`; encoded as `bytes32`. **/
  role: string;
  account: Address;
}

export type GrantRoleAction = BaseMarketAction<
  "CONFIGURATOR::grantRole",
  GrantRoleParams
>;

/**
 * Grants any role in the configurator's ACL. Covers what
 * `CONFIGURATOR::addAdmin` does and the roles it does not take, such as
 * `OPENING_SIGNER`.
 **/
export const grantRoleActionData: ConfiguratorScopedDefinition<GrantRoleAction> =
  defineConfiguratorAction<GrantRoleAction>({
    type: "CONFIGURATOR::grantRole",
    description: `Grant a role in the market configurator's ACL to an account, for all markets.`,
    schema: z.object({
      role: roleNameSchema,
      account: addressSchema,
    }),
    check: ({ state, params }) => {
      if (holdsRole(state, params.role, params.account)) {
        return [
          noOp(
            `${params.account} is already one of the ${roleLabel(params.role)}`,
            ["params", "account"],
          ),
        ];
      }
      // A typo grants a role no contract checks, and the transaction succeeds.
      return Object.hasOwn(knownRoleLabelMap, params.role)
        ? []
        : [
            actionWarning(
              "UNKNOWN_ROLE",
              `No Gearbox contract checks role ${params.role}; known roles: ${Object.keys(knownRoleLabelMap).join(", ")}`,
              ["params", "role"],
            ),
          ];
    },
    apply: ({ state, params }) =>
      updateRoleHolders(state, params.role, holders => [
        ...holders,
        lowerAddress(params.account),
      ]),
    encode: ({ ctx, params }) =>
      ctx.marketConfigurator.grantRole(params.role, params.account),
    key: byRoleAndAccount,
  });
