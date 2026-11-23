/** Helpers shared by the configurator action definitions. **/

import type { Address } from "viem";
import { TreasurySplitterContract } from "../../bindings/treasury-splitter.js";
import type { GipBuilderContext } from "../actions/builderContext.js";
import type {
  AdminRole,
  ConfiguratorState,
} from "../state/configurator/types.js";
import { isSameAddress } from "../utils/addressUtils.js";
import { ownEntry } from "../utils/objectUtils.js";

/** The treasury splitter every market of the configurator shares. **/
export interface TreasurySplitterResolution {
  treasurySplitter: Address;
}

export async function resolveTreasurySplitter(args: {
  ctx: GipBuilderContext;
}): Promise<TreasurySplitterResolution> {
  const { treasury } = await args.ctx.marketConfigurator.admins();
  return { treasurySplitter: treasury };
}

export function treasurySplitter(
  ctx: GipBuilderContext,
  resolved: TreasurySplitterResolution,
): TreasurySplitterContract {
  return new TreasurySplitterContract(
    resolved.treasurySplitter,
    ctx.marketConfigurator.client,
  );
}

type AdminListField =
  | "pausableAdmins"
  | "unpausableAdmins"
  | "lossLiquidators"
  | "emergencyLiquidators";

/** The `ConfiguratorState` list holding each role, and how errors name it. **/
const ADMIN_ROLE_LISTS: Record<
  AdminRole,
  { field: AdminListField; label: string }
> = {
  PAUSABLE_ADMIN: { field: "pausableAdmins", label: "pausable admins" },
  UNPAUSABLE_ADMIN: { field: "unpausableAdmins", label: "unpausable admins" },
  LOSS_LIQUIDATOR: { field: "lossLiquidators", label: "loss liquidators" },
  EMERGENCY_LIQUIDATOR: {
    field: "emergencyLiquidators",
    label: "emergency liquidators",
  },
};

/** The list field of `role` if it has one, `undefined` for any other role. **/
function adminRoleList(role: string) {
  return Object.hasOwn(ADMIN_ROLE_LISTS, role)
    ? ADMIN_ROLE_LISTS[role as AdminRole]
    : undefined;
}

/**
 * Who holds `role`: its own list for the four admin roles, `otherRoles` for
 * any other.
 **/
export function roleHolders(
  state: ConfiguratorState,
  role: string,
): readonly Address[] {
  const list = adminRoleList(role);
  return list ? state[list.field] : (ownEntry(state.otherRoles, role) ?? []);
}

/** Whether `account` holds `role`. **/
export function holdsRole(
  state: ConfiguratorState,
  role: string,
  account: Address,
): boolean {
  return roleHolders(state, role).some(holder =>
    isSameAddress(holder, account),
  );
}

/** How diagnostics name the holders of `role`. **/
export function roleLabel(role: string): string {
  return adminRoleList(role)?.label ?? `${role} holders`;
}

/** Rewrites the holders of `role`: `update` maps the holders to the new ones. **/
export function updateRoleHolders(
  state: ConfiguratorState,
  role: string,
  update: (holders: Address[]) => Address[],
): ConfiguratorState {
  const list = adminRoleList(role);
  if (list) return { ...state, [list.field]: update(state[list.field]) };
  return {
    ...state,
    otherRoles: {
      ...state.otherRoles,
      [role]: update([...(ownEntry(state.otherRoles, role) ?? [])]),
    },
  };
}

export const byRoleAndAdmin = (params: {
  role: AdminRole;
  admin: Address;
}): string => `${params.role}:${params.admin.toLowerCase()}`;

/** Merges `CONFIGURATOR::grantRole` and `revokeRole` per role and account. **/
export const byRoleAndAccount = (params: {
  role: string;
  account: Address;
}): string => `${params.role}:${params.account.toLowerCase()}`;
