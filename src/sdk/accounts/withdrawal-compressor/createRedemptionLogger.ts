import {
  AP_REDEMPTION_LOGGER,
  isV310,
  VERSION_RANGE_310,
} from "../../constants/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { RedemptionLoggerV310Contract } from "./RedemptionLoggerV310Contract.js";
import type { IRedemptionLoggerContract } from "./types.js";

/**
 * Creates a redemption logger contract for the current chain, resolving its
 * address from the address provider, or returns `undefined` when it is not
 * deployed on it. Consumers should access the instance via
 * `sdk.redemptionLogger`.
 * @param sdk
 **/
export function createRedemptionLogger(
  sdk: OnchainSDK,
): IRedemptionLoggerContract | undefined {
  const latest = sdk.addressProvider.getLatest(
    AP_REDEMPTION_LOGGER,
    VERSION_RANGE_310,
  );
  if (!latest) {
    return undefined;
  }
  const [address, version] = latest;
  if (isV310(version)) {
    return new RedemptionLoggerV310Contract(sdk, address, version);
  }
  throw new Error(`Unsupported redemption logger version: ${version}`);
}
