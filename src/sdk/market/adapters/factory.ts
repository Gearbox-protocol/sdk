import type { Hex } from "viem";

import type { AdapterData } from "../../base/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import { bytes32ToString } from "../../utils/index.js";
import { PlaceholderAdapterContract } from "./PlaceholderAdapterContracts.js";
import type { IAdapterContract } from "./types.js";

export function createAdapter(
  sdk: GearboxSDK,
  args: AdapterData,
): IAdapterContract {
  const adapterType = bytes32ToString(args.baseParams.contractType as Hex);
  for (const plugin of sdk.plugins) {
    try {
      const adapter = plugin.createContract(sdk, args);
      if (adapter) {
        sdk.logger?.info(
          ` ${adapterType} v${args.baseParams.version} created using plugin ${plugin.name}`,
        );
        return adapter as IAdapterContract;
      }
    } catch (e) {
      sdk.logger?.warn(
        `plugin ${plugin.name} error while trying to create ${adapterType} v${args.baseParams.version}: ${e}`,
      );
    }
  }

  sdk.logger?.warn(
    `no class found for ${adapterType} v${args.baseParams.version}, falling back to placeholder`,
  );
  return new PlaceholderAdapterContract(sdk, args);
}
