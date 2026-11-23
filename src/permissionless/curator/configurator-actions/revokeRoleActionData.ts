import type { Address } from "viem";
import { z } from "zod/v4";
import {
  type ActionDiagnostic,
  actionError,
} from "../actions/actionDiagnostics.js";
import type { BaseMarketAction } from "../actions/actionTypes.js";
import { roleNameSchema } from "../state/configurator/types.js";
import { isSameAddress } from "../utils/addressUtils.js";
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

export interface RevokeRoleParams {
  /** Role name, e.g. `PAUSABLE_ADMIN` or `OPENING_SIGNER`; encoded as `bytes32`. **/
  role: string;
  account: Address;
}

export type RevokeRoleAction = BaseMarketAction<
  "CONFIGURATOR::revokeRole",
  RevokeRoleParams
>;

/**
 * Roles the market configurator grants itself on deployment: it pauses and
 * unpauses market contracts as itself, through `configure*` and
 * `emergencyConfigure*` alike.
 **/
const CONFIGURATOR_OWN_ROLES: readonly string[] = [
  "PAUSABLE_ADMIN",
  "UNPAUSABLE_ADMIN",
];

/**
 * Revokes any role in the configurator's ACL. Covers what
 * `CONFIGURATOR::removeAdmin` does and the roles it does not take, such as
 * `OPENING_SIGNER`.
 **/
export const revokeRoleActionData: ConfiguratorScopedDefinition<RevokeRoleAction> =
  defineConfiguratorAction<RevokeRoleAction>({
    type: "CONFIGURATOR::revokeRole",
    description: `Revoke a role in the market configurator's ACL from an account, for all markets.`,
    schema: z.object({
      role: roleNameSchema,
      account: addressSchema,
    }),
    check: ({ state, params }) => {
      const diagnostics: ActionDiagnostic[] = [];
      if (!holdsRole(state, params.role, params.account)) {
        diagnostics.push(
          actionError(
            "ROLE_NOT_GRANTED",
            `${params.account} is not one of the ${roleLabel(params.role)}`,
            ["params", "account"],
          ),
        );
      } else if (
        isSameAddress(params.account, state.address) &&
        CONFIGURATOR_OWN_ROLES.includes(params.role)
      ) {
        diagnostics.push(
          actionError(
            "CONFIGURATOR_ROLE_REQUIRED",
            `The market configurator needs ${params.role} to pause and unpause its markets`,
            ["params", "account"],
          ),
        );
      }
      return diagnostics;
    },
    apply: ({ state, params }) =>
      updateRoleHolders(state, params.role, holders =>
        holders.filter(holder => !isSameAddress(holder, params.account)),
      ),
    encode: ({ ctx, params }) =>
      ctx.marketConfigurator.revokeRole(params.role, params.account),
    key: byRoleAndAccount,
  });
