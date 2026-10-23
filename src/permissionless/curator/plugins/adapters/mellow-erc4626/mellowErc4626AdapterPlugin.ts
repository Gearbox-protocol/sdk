import { type Address, zeroAddress } from "viem";
import { z } from "zod/v4";
import { addressSchema } from "../../../validationSchemas.js";
import {
  adapterDeployParams,
  plainAdapter,
  stakedTokenDeployParamsSchema,
} from "../adapterPluginHelpers.js";
import type { AdapterStateBase } from "../defineAdapterPlugin.js";
import { defineAdapterPlugin } from "../defineAdapterPlugin.js";
import { validateErc4626Target } from "../erc4626/erc4626AdapterPlugin.js";

export type MellowErc4626AdapterState = AdapterStateBase;

export type MellowErc4626Adapter312DeployParams = {
  type: "MELLOW_ERC4626_VAULT";
  version: 312;
  target: Address;
  stakedToken: Address;
};

export type MellowErc4626AdapterDeployParams =
  | {
      type: "MELLOW_ERC4626_VAULT";
      version: 310;
      target: Address;
    }
  | MellowErc4626Adapter312DeployParams;

/**
 * v310 takes no staked token; v312 does. v311 has no constructor ABI in the
 * Gearbox SDK, so it cannot be deployed.
 *
 * @dev a v310 param set is matched first, so a `stakedToken` it carries is
 * dropped — as the deploy params union did before plugins owned their schemas
 **/
export const mellowErc4626DeployParamsSchema = z.union([
  z.object({
    type: z.literal("MELLOW_ERC4626_VAULT"),
    version: z.literal(310),
    target: addressSchema,
  }),
  stakedTokenDeployParamsSchema<MellowErc4626Adapter312DeployParams>(
    "MELLOW_ERC4626_VAULT",
    [312],
  ),
]) as unknown as z.ZodType<MellowErc4626AdapterDeployParams>;

export const mellowErc4626AdapterPlugin = defineAdapterPlugin<
  MellowErc4626AdapterDeployParams,
  MellowErc4626AdapterState
>()({
  type: "MELLOW_ERC4626_VAULT",
  deprecated: true,
  name: "Mellow ERC4626",
  description: "Adapter for Mellow ERC4626 Vault",
  getDefaultParams: () => ({
    type: "MELLOW_ERC4626_VAULT",
    version: 312,
    target: zeroAddress,
    stakedToken: zeroAddress,
  }),
  isEditable: true,
  allowGas: 950_000, // got 930,173
  ...plainAdapter("MELLOW_ERC4626_VAULT"),
  getDeployParams: (args: {
    creditManager: Address;
    params: MellowErc4626AdapterDeployParams;
  }) =>
    adapterDeployParams(
      args,
      args.params.version === 310 ? [] : [args.params.stakedToken],
    ),
  validateParams: validateErc4626Target,
  deployParamsSchema: mellowErc4626DeployParamsSchema,
  actions: {},
});
