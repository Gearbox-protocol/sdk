import type { OnchainSDK, PluginsMap } from "../../index.js";
import { MidasGatewayAdapterContract } from "../../market/adapters/contracts/MidasGatewayAdapterContract.js";
import type { InnerOperation } from "../parse/index.js";

/**
 * Whether the multicall grants the Midas greenlisted role to the credit
 * account via `receiveGreenlist()`.
 */
export function midasGreenlistsAccount<P extends PluginsMap>(
  sdk: OnchainSDK<P>,
  multicall: InnerOperation[],
): boolean {
  for (const op of multicall) {
    if (op.operation !== "Execute") {
      continue;
    }
    const adapter = sdk.getContract(op.adapter);
    if (
      adapter instanceof MidasGatewayAdapterContract &&
      adapter.isReceiveGreenlist(op.calldata)
    ) {
      return true;
    }
  }
  return false;
}
