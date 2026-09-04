import type {
  PositionCollateral,
  StrategyPosition,
} from "../../model/index.js";
import type { OnchainSDK } from "../../onchain/index.js";
import { isPhantomToken } from "../../onchain/index.js";

/**
 * {@inheritDoc IOpportunitiesPrepare.withdrawableCollaterals}
 **/
export function withdrawableCollaterals(
  sdk: OnchainSDK,
  position: StrategyPosition,
): PositionCollateral[] {
  return position.collaterals
    .filter(c => !isPhantomToken(sdk, c.collateral.token.address))
    .sort(byValueThenAddress);
}

/**
 * Most valuable first. Address breaks a tie so the order is stable: two
 * collaterals can share a value — a pair of unpriced ones share `null` — and a
 * picker that seeds its default from the first row would otherwise change it
 * between reads.
 */
function byValueThenAddress(
  a: PositionCollateral,
  b: PositionCollateral,
): number {
  const byValue = (b.collateral.valueUsd ?? 0) - (a.collateral.valueUsd ?? 0);
  if (byValue !== 0) {
    return byValue;
  }
  return a.collateral.token.address < b.collateral.token.address ? -1 : 1;
}
