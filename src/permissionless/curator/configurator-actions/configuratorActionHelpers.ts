/** Helpers shared by the configurator action processors. **/

import type { Address } from "viem";
import { TreasurySplitterContract } from "../../bindings/treasury-splitter.js";
import type { GipBuilderContext } from "../actions/builderContext.js";
import type {
  AdminRole,
  ConfiguratorState,
} from "../state/configurator/types.js";

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

/** Holders of `role`. **/
export function adminRoleHolders(
  state: ConfiguratorState,
  role: AdminRole,
): Address[] {
  const list = ADMIN_ROLE_LISTS[role];
  if (!list) throw new Error(`Unknown admin role: ${role}`);
  return state[list.field];
}

/** How diagnostics name the holder list of `role`. **/
export function adminRoleLabel(role: AdminRole): string {
  return ADMIN_ROLE_LISTS[role]?.label ?? role;
}

/**
 * Rewrites the holder list of `role`.
 *
 * `update` receives the current holders and returns the new ones; it is also
 * given the role's label so its errors can say which list was involved.
 **/
export function updateAdminRole(
  state: ConfiguratorState,
  role: AdminRole,
  update: (holders: Address[], label: string) => Address[],
): ConfiguratorState {
  const list = ADMIN_ROLE_LISTS[role];
  if (!list) throw new Error(`Unknown admin role: ${role}`);
  return { ...state, [list.field]: update(state[list.field], list.label) };
}

export const byRoleAndAdmin = (params: {
  role: AdminRole;
  admin: Address;
}): string => `${params.role}:${params.admin.toLowerCase()}`;
