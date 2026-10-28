/** Helpers shared by the configurator action definitions. **/

import type { Address } from "viem";
import { TreasurySplitterContract } from "../../bindings/treasury-splitter.js";
import type { GipBuilderContext } from "../actions/builderContext.js";
import type {
  AdminRole,
  ConfiguratorState,
} from "../state/configurator/types.js";
import { isSameAddress } from "../utils/addressUtils.js";

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

function adminRoleList(role: AdminRole) {
  const list = ADMIN_ROLE_LISTS[role];
  if (!list) throw new Error(`Unknown admin role: ${role}`);
  return list;
}

/** Whether `admin` holds `role`. **/
export function holdsAdminRole(
  state: ConfiguratorState,
  role: AdminRole,
  admin: Address,
): boolean {
  return state[adminRoleList(role).field].some(holder =>
    isSameAddress(holder, admin),
  );
}

/** How diagnostics name the holder list of `role`. **/
export function adminRoleLabel(role: AdminRole): string {
  return adminRoleList(role).label;
}

/** Rewrites the holder list of `role`: `update` maps the holders to the new ones. **/
export function updateAdminRole(
  state: ConfiguratorState,
  role: AdminRole,
  update: (holders: Address[]) => Address[],
): ConfiguratorState {
  const { field } = adminRoleList(role);
  return { ...state, [field]: update(state[field]) };
}

export const byRoleAndAdmin = (params: {
  role: AdminRole;
  admin: Address;
}): string => `${params.role}:${params.admin.toLowerCase()}`;
