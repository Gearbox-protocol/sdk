import type { Hex } from "viem";

import type { AdapterData } from "../../base/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import type { PluginsMap } from "../../plugins/index.js";
import { bytes32ToString } from "../../utils/index.js";
import {
  PlaceholderMidasGatewayAdapterContract,
  PlaceholderMidasIssuanceVaultAdapterContract,
} from "./midas/index.js";
import { PlaceholderAdapterContract } from "./PlaceholderAdapterContracts.js";
import type { IAdapterContract } from "./types.js";

export function createAdapter<const Plugins extends PluginsMap>(
  sdk: OnchainSDK<Plugins>,
  args: AdapterData,
): IAdapterContract {
  const adapterType = bytes32ToString(args.baseParams.contractType as Hex);
  for (const [name, plugin] of Object.entries(sdk.plugins)) {
    try {
      const adapter = plugin.createContract?.(args);
      if (adapter) {
        sdk.logger?.info(
          ` ${adapterType} v${args.baseParams.version} created using plugin ${name}`,
        );
        return adapter as IAdapterContract;
      }
    } catch (e) {
      sdk.logger?.warn(
        `plugin ${name} error while trying to create ${adapterType} v${args.baseParams.version} at ${args.baseParams.addr}: ${e}`,
      );
    }
  }

  // Core callers such as prependMidasReceiveGreenlist need mToken even when the
  // adapters plugin is not loaded, so Midas types get IMidasAdapter placeholders
  // instead of the generic one.
  switch (adapterType) {
    case "ADAPTER::MIDAS_GATEWAY":
      return new PlaceholderMidasGatewayAdapterContract(sdk, args);
    case "ADAPTER::MIDAS_ISSUANCE_VAULT":
      return new PlaceholderMidasIssuanceVaultAdapterContract(sdk, args);
    default:
      return new PlaceholderAdapterContract(sdk, args);
  }
}
