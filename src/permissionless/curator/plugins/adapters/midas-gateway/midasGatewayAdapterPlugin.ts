import {
  type Address,
  type Chain,
  isAddress,
  type PublicClient,
  stringToHex,
  type Transport,
  zeroAddress,
} from "viem";
import { z } from "zod/v4";
import { iVersionAbi } from "../../../../../abi/iVersion.js";
import { isSameAddress, lowerAddress } from "../../../utils/addressUtils.js";
import { addressSchema } from "../../../validationSchemas.js";
import {
  adapterDeployParams,
  getter,
  plainAdapter,
  readAddress,
  readAddresses,
  resolveTargetTokens,
} from "../adapterPluginHelpers.js";
import type { AdapterStateBase } from "../defineAdapterPlugin.js";
import { defineAdapterPlugin } from "../defineAdapterPlugin.js";

export type MidasGatewayAdapterState = AdapterStateBase;

export interface MidasGatewayAdapterDeployParams {
  type: "MIDAS_GATEWAY";
  version: 311;
  target: Address;
}

export const midasGatewayDeployParamsSchema = z.object({
  type: z.literal("MIDAS_GATEWAY"),
  version: z.literal(311),
  target: addressSchema,
});

const MIDAS_DEGEN_NFT_TYPE = stringToHex("DEGEN_NFT::MIDAS", { size: 32 });

/**
 * A Midas Degen NFT is bound to one gateway, so a credit suite whitelisted by
 * one can only use that gateway.
 *
 * @dev mirrors the deployed check, which reads both the contract type and the
 * bound gateway from `target`. Unknown whitelist policies are not checked.
 **/
async function validateWhitelistPolicy(
  client: PublicClient<Transport, Chain>,
  target: Address,
): Promise<false | string> {
  let isMidasDegenNft: boolean;
  try {
    const contractType = await client.readContract({
      address: target,
      abi: iVersionAbi,
      functionName: "contractType",
    });
    isMidasDegenNft =
      contractType.toLowerCase() === MIDAS_DEGEN_NFT_TYPE.toLowerCase();
  } catch {
    return false;
  }
  if (!isMidasDegenNft) return false;

  try {
    const gateway = await readAddress(client, target, "gateway");
    return isSameAddress(gateway, target)
      ? false
      : "Whitelist policy (Degen NFT) was set for different gateway";
  } catch {
    return "Invalid whitelist policy (Degen NFT)";
  }
}

export const midasGatewayAdapterPlugin = defineAdapterPlugin<
  MidasGatewayAdapterDeployParams,
  MidasGatewayAdapterState
>()({
  type: "MIDAS_GATEWAY",
  name: "Midas Gateway",
  description: "Adapter for Midas Gateway",
  getDefaultParams: () => ({
    type: "MIDAS_GATEWAY",
    version: 311,
    target: zeroAddress,
  }),
  isEditable: false,
  allowGas: 2_000_000, // not measured
  ...plainAdapter("MIDAS_GATEWAY"),
  getDeployParams: args => adapterDeployParams(args),
  resolveValidation: async args => {
    const { client, params, marketConfigurator } = args;
    const { target } = params;
    const label = "midas gateway";

    if (!isAddress(target)) return () => `Invalid ${label} address`;

    const policyError = await validateWhitelistPolicy(client, target);
    const tokenCheck = await resolveTargetTokens(
      args,
      async () => {
        const [mToken, quoteToken, phantomToken, allowedMarketConfigurator] =
          await readAddresses(client, [
            getter(target, "mToken"),
            getter(target, "quoteToken"),
            getter(target, "phantomToken"),
            getter(target, "allowedMarketConfigurator"),
          ]);

        if (!isSameAddress(allowedMarketConfigurator, marketConfigurator)) {
          return "Gateway is not allowed for this market";
        }

        return phantomToken !== zeroAddress
          ? [mToken, quoteToken, phantomToken]
          : [mToken, quoteToken];
      },
      label,
    );
    return (state, creditManager, instance) => {
      const cmState = state.creditManagers[lowerAddress(creditManager)];
      if (!cmState) return "Credit manager not found";
      return cmState.degenNFT !== zeroAddress && policyError
        ? policyError
        : tokenCheck(state, creditManager, instance);
    };
  },
  deployParamsSchema: midasGatewayDeployParamsSchema,
  actions: {},
});
