import { type Address, zeroAddress } from "viem";
import { z } from "zod/v4";
import { addressSchema, uintSchema } from "../../../validationSchemas.js";
import { adapterDeployParams, plainAdapter } from "../adapterPluginHelpers.js";
import type { AdapterStateBase } from "../defineAdapterPlugin.js";
import { defineAdapterPlugin } from "../defineAdapterPlugin.js";
import { resolveErc4626Target } from "../erc4626/erc4626AdapterPlugin.js";

export type Erc4626ReferralAdapterState = AdapterStateBase;

export interface Erc4626ReferralAdapterDeployParams {
  type: "ERC4626_VAULT_REFERRAL";
  version: 310;
  target: Address;
  referral: number;
}

export const erc4626ReferralDeployParamsSchema = z.object({
  type: z.literal("ERC4626_VAULT_REFERRAL"),
  version: z.literal(310),
  target: addressSchema,
  /** `uint16` referral code passed to the vault; 0 is none. **/
  referral: uintSchema(16),
});

export const erc4626ReferralAdapterPlugin = defineAdapterPlugin<
  Erc4626ReferralAdapterDeployParams,
  Erc4626ReferralAdapterState
>()({
  type: "ERC4626_VAULT_REFERRAL",
  name: "ERC4626 Referral",
  description: "Adapter for ERC4626 Vault with referral",
  getDefaultParams: () => ({
    type: "ERC4626_VAULT_REFERRAL",
    version: 310,
    target: zeroAddress,
    referral: 0,
  }),
  isEditable: true,
  allowGas: 2_000_000, // not measured
  ...plainAdapter("ERC4626_VAULT_REFERRAL"),
  getDeployParams: (args: {
    creditManager: Address;
    params: Erc4626ReferralAdapterDeployParams;
  }) => adapterDeployParams(args, [args.params.referral]),
  resolveValidation: resolveErc4626Target,
  deployParamsSchema: erc4626ReferralDeployParamsSchema,
  actions: {},
});
