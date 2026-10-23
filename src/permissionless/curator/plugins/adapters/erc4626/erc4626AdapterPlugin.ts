import { type Address, zeroAddress } from "viem";
import { z } from "zod/v4";
import { addressSchema } from "../../../validationSchemas.js";
import {
  adapterDeployParams,
  plainAdapter,
  readAddress,
  validateTargetTokens,
} from "../adapterPluginHelpers.js";
import type {
  AdapterStateBase,
  ValidateAdapterParamsArgs,
} from "../defineAdapterPlugin.js";
import { defineAdapterPlugin } from "../defineAdapterPlugin.js";

export type Erc4626AdapterState = AdapterStateBase;

export type Erc4626Adapter312DeployParams = {
  type: "ERC4626_VAULT";
  version: 312;
  target: Address;
  gateway: Address;
};

export type Erc4626AdapterDeployParams =
  | {
      type: "ERC4626_VAULT";
      version: 310 | 311;
      target: Address;
    }
  | Erc4626Adapter312DeployParams;

/** v3.1.1 takes the vault only; v3.1.2 also takes the vault's gateway. **/
export const erc4626DeployParamsSchema = z.discriminatedUnion("version", [
  z.object({
    type: z.literal("ERC4626_VAULT"),
    version: z.literal(311),
    target: addressSchema,
  }),
  z.object({
    type: z.literal("ERC4626_VAULT"),
    version: z.literal(312),
    target: addressSchema,
    gateway: addressSchema,
  }),
]);

/**
 * An ERC-4626 vault is usable when its asset is collateral. Shared by every
 * adapter whose target is such a vault.
 **/
export function validateErc4626Target(
  args: ValidateAdapterParamsArgs<{ target: Address }>,
): Promise<false | string> {
  return validateTargetTokens(args, async () => [
    await readAddress(args.client, args.params.target, "asset"),
  ]);
}

export const erc4626AdapterPlugin = defineAdapterPlugin<
  Erc4626AdapterDeployParams,
  Erc4626AdapterState
>()({
  type: "ERC4626_VAULT",
  name: "ERC4626",
  description: "Adapter for ERC4626 Vault",
  getDefaultParams: () => ({
    type: "ERC4626_VAULT",
    version: 312,
    target: zeroAddress,
    gateway: zeroAddress,
  }),
  isEditable: true,
  allowGas: 1_100_000, // got 998,853, 994,659 & 1,011,759
  ...plainAdapter("ERC4626_VAULT"),
  getDeployParams: (args: {
    creditManager: Address;
    params: Erc4626AdapterDeployParams;
  }) =>
    adapterDeployParams(
      args,
      args.params.version === 312 ? [args.params.gateway] : [],
    ),
  validateParams: validateErc4626Target,
  deployParamsSchema: erc4626DeployParamsSchema,
  actions: {},
});
