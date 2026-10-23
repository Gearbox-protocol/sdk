import { type Address, zeroAddress } from "viem";
import { z } from "zod/v4";
import { addressSchema } from "../../../validationSchemas.js";
import {
  adapterDeployParams,
  getter,
  plainAdapter,
  readAddresses,
  validateTargetTokens,
} from "../adapterPluginHelpers.js";
import type {
  AdapterStateBase,
  ValidateAdapterParamsArgs,
} from "../defineAdapterPlugin.js";
import { defineAdapterPlugin } from "../defineAdapterPlugin.js";

export type SecuritizeRedemptionAdapterState = AdapterStateBase;

export type SecuritizeRedemptionAdapterDeployParams = {
  type: "SECURITIZE_REDEMPTION";
  version: 310 | 311;
  target: Address;
  /** No longer a constructor argument; validation reads it from the target. **/
  phantomToken?: Address;
};

export const securitizeRedemptionDeployParamsSchema = z.object({
  type: z.literal("SECURITIZE_REDEMPTION"),
  version: z.literal(311),
  target: addressSchema,
});

export const securitizeRedemptionAdapterPlugin = defineAdapterPlugin<
  SecuritizeRedemptionAdapterDeployParams,
  SecuritizeRedemptionAdapterState
>()({
  type: "SECURITIZE_REDEMPTION",
  name: "Securitize Redemption",
  description: "Adapter for Securitize Redemption",
  getDefaultParams: () => ({
    type: "SECURITIZE_REDEMPTION",
    version: 311,
    target: zeroAddress,
  }),
  isEditable: true,
  allowGas: 2_000_000, // not measured
  ...plainAdapter("SECURITIZE_REDEMPTION"),
  getDeployParams: args => adapterDeployParams(args),
  validateParams: (
    args: ValidateAdapterParamsArgs<SecuritizeRedemptionAdapterDeployParams>,
  ) => {
    const { target } = args.params;
    return validateTargetTokens(args, () =>
      readAddresses(args.client, [
        getter(target, "dsToken"),
        getter(target, "stableCoinToken"),
        getter(target, "phantomToken"),
      ]),
    );
  },
  deployParamsSchema: securitizeRedemptionDeployParamsSchema,
  actions: {},
});
