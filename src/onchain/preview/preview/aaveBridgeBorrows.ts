import type { Address } from "viem";
import type { AaveBridgeBorrow } from "../../../model/index.js";
import type { OnchainSDK, PluginsMap } from "../../index.js";
import { AaveHorizonBridgeAdapterContract } from "../../market/adapters/contracts/AaveHorizonBridgeAdapterContract.js";
import type { InnerOperation } from "../parse/index.js";

/**
 * The loans the multicall's Horizon bridge calls take as the account owner,
 * at the amounts the calldata names.
 */
export function aaveBridgeBorrows<P extends PluginsMap>(
  sdk: OnchainSDK<P>,
  creditManager: Address,
  multicall: InnerOperation[],
): AaveBridgeBorrow[] {
  const { priceOracle } = sdk.marketRegister.findByCreditManager(creditManager);
  const borrows: AaveBridgeBorrow[] = [];
  for (const op of multicall) {
    if (op.operation !== "Execute") {
      continue;
    }
    const adapter = sdk.getContract(op.adapter);
    if (!(adapter instanceof AaveHorizonBridgeAdapterContract)) {
      continue;
    }
    const borrow = adapter.parseBorrow(op.calldata);
    if (borrow) {
      borrows.push({
        bridge: adapter.bridge,
        amount: priceOracle.toTokenAmount(borrow.debtToken, borrow.amount),
      });
    }
  }
  return borrows;
}
