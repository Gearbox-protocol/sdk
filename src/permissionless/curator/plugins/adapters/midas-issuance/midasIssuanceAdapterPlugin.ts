import { type Address, stringToHex, zeroAddress } from "viem";
import { z } from "zod/v4";
import type { MidasIssuanceVaultAdapterContract } from "../../../../../onchain/index.js";
import { addressSchema } from "../../../validationSchemas.js";
import {
  adapterDeployParams,
  deployState,
  readAddress,
  resolveTargetTokens,
  sdkState,
} from "../adapterPluginHelpers.js";
import { adapterStateSchema } from "../adapterStateSchema.js";
import type {
  AdapterStateBase,
  ResolveAdapterValidationArgs,
} from "../defineAdapterPlugin.js";
import { defineAdapterPlugin } from "../defineAdapterPlugin.js";
import type { MidasIssuanceTokenStatus } from "./setTokenAllowedStatusBatchActionData.js";
import {
  midasIssuanceAllowedTokensList,
  setTokenAllowedStatusBatchActionData,
} from "./setTokenAllowedStatusBatchActionData.js";

export type MidasIssuanceAdapterState = AdapterStateBase & {
  allowedTokens: MidasIssuanceTokenStatus[];
};

export interface MidasIssuanceAdapterDeployParams {
  type: "MIDAS_ISSUANCE_VAULT";
  version: 310 | 311;
  target: Address;
  reffererId: string;
}

export const midasIssuanceDeployParamsSchema = z.object({
  type: z.literal("MIDAS_ISSUANCE_VAULT"),
  version: z.literal(311),
  target: addressSchema,
  reffererId: z.string(),
});

export const midasIssuanceAdapterPlugin = defineAdapterPlugin<
  MidasIssuanceAdapterDeployParams,
  MidasIssuanceAdapterState
>()({
  type: "MIDAS_ISSUANCE_VAULT",
  name: "Midas Issuance",
  description: "Adapter for Midas Issuance",
  getDefaultParams: () => ({
    type: "MIDAS_ISSUANCE_VAULT",
    version: 311,
    target: zeroAddress,
    reffererId: "",
  }),
  isEditable: true,
  allowGas: 2_000_000, // not measured
  stateSchema: adapterStateSchema<MidasIssuanceAdapterState>({
    allowedTokens: midasIssuanceAllowedTokensList,
  }),
  getDeployState: (params: MidasIssuanceAdapterDeployParams) => ({
    ...deployState("MIDAS_ISSUANCE_VAULT", params),
    allowedTokens: [],
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: MidasIssuanceAdapterDeployParams;
  }) =>
    adapterDeployParams(args, [
      stringToHex(args.params.reffererId, { size: 32 }),
    ]),
  resolveValidation: (
    args: ResolveAdapterValidationArgs<MidasIssuanceAdapterDeployParams>,
  ) =>
    resolveTargetTokens(
      args,
      async () => [
        await readAddress(args.client, args.params.target, "mToken"),
      ],
      "midas issuance vault",
    ),
  getStateFromSDK: (adapter): MidasIssuanceAdapterState => ({
    ...sdkState("MIDAS_ISSUANCE_VAULT", adapter),
    allowedTokens: (
      adapter as unknown as MidasIssuanceVaultAdapterContract
    ).allowedTokens.map(token => ({ token, allowed: true })),
  }),
  deployParamsSchema: midasIssuanceDeployParamsSchema,
  actions: { setTokenAllowedStatusBatch: setTokenAllowedStatusBatchActionData },
});
