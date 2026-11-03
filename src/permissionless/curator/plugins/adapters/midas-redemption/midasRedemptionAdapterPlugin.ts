import { type Address, zeroAddress } from "viem";
import { z } from "zod/v4";
import type { MidasRedemptionVaultAdapterContract } from "../../../../../onchain/index.js";
import { addressSchema } from "../../../validationSchemas.js";
import {
  adapterDeployParams,
  deployState,
  readAddress,
  resolveTargetTokens,
  sdkState,
} from "../adapterPluginHelpers.js";
import { adapterStateSchema } from "../adapterStateSchema.js";
import type { AdapterStateBase } from "../defineAdapterPlugin.js";
import { defineAdapterPlugin } from "../defineAdapterPlugin.js";
import type { MidasRedemptionTokenStatus } from "./setTokenAllowedStatusBatchActionData.js";
import {
  midasRedemptionAllowedTokensList,
  setTokenAllowedStatusBatchActionData,
} from "./setTokenAllowedStatusBatchActionData.js";

export type MidasRedemptionAdapterState = AdapterStateBase & {
  allowedTokens: MidasRedemptionTokenStatus[];
};

export interface MidasRedemptionAdapterDeployParams {
  type: "MIDAS_REDEMPTION_VAULT";
  version: 311;
  target: Address;
}

export const midasRedemptionDeployParamsSchema = z.object({
  type: z.literal("MIDAS_REDEMPTION_VAULT"),
  version: z.literal(311),
  target: addressSchema,
});

export const midasRedemptionAdapterPlugin = defineAdapterPlugin<
  MidasRedemptionAdapterDeployParams,
  MidasRedemptionAdapterState
>()({
  type: "MIDAS_REDEMPTION_VAULT",
  name: "Midas Redemption",
  description: "Adapter for Midas Redemption",
  getDefaultParams: () => ({
    type: "MIDAS_REDEMPTION_VAULT",
    version: 311,
    target: zeroAddress,
  }),
  isEditable: false,
  allowGas: 2_000_000, // not measured
  stateSchema: adapterStateSchema<MidasRedemptionAdapterState>({
    allowedTokens: midasRedemptionAllowedTokensList,
  }),
  getDeployState: params => ({
    ...deployState("MIDAS_REDEMPTION_VAULT", params),
    allowedTokens: [],
  }),
  getDeployParams: args => adapterDeployParams(args),
  resolveValidation: args =>
    resolveTargetTokens(
      args,
      async () => [
        await readAddress(args.client, args.params.target, "mToken"),
      ],
      "midas redemption gateway",
    ),
  getStateFromSDK: (adapter): MidasRedemptionAdapterState => ({
    ...sdkState("MIDAS_REDEMPTION_VAULT", adapter),
    allowedTokens: (
      adapter as unknown as MidasRedemptionVaultAdapterContract
    ).allowedTokens.map(t => ({
      token: typeof t === "object" ? t.token : t,
      phantomToken: typeof t === "object" ? t.phantomToken : undefined,
      allowed: true,
    })),
  }),
  deployParamsSchema: midasRedemptionDeployParamsSchema,
  actions: { setTokenAllowedStatusBatch: setTokenAllowedStatusBatchActionData },
});
