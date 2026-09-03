import type { OnchainSDK } from "../../OnchainSDK.js";
import {
  getLegacyWithdrawalCompressorAddresses,
  getWithdrawalCompressorAddress,
  type WithdrawalCompressorLocation,
} from "./addresses.js";
import type { IWithdrawalCompressorContract } from "./types.js";
import { WithdrawalCompressorV310Contract } from "./WithdrawalCompressorV310Contract.js";
import { WithdrawalCompressorV311Contract } from "./WithdrawalCompressorV311Contract.js";
import { WithdrawalCompressorV313Contract } from "./WithdrawalCompressorV313Contract.js";

/**
 * Creates a withdrawal compressor contract for the current chain,
 * or returns `undefined` if no withdrawal compressor is supported on it.
 * Called once from the SDK constructor; consumers should access the
 * instance via `sdk.withdrawalCompressor`.
 * @param sdk
 **/
export function createWithdrawalCompressor(
  sdk: OnchainSDK,
): IWithdrawalCompressorContract | undefined {
  const location = getWithdrawalCompressorAddress(sdk.networkType);
  return location ? createCompressor(sdk, location) : undefined;
}

/** Creates read-only historical compressors used to name existing phantoms. */
export function createLegacyWithdrawalCompressors(
  sdk: OnchainSDK,
): IWithdrawalCompressorContract[] {
  return getLegacyWithdrawalCompressorAddresses(sdk.networkType).map(location =>
    createCompressor(sdk, location),
  );
}

function createCompressor(
  sdk: OnchainSDK,
  location: WithdrawalCompressorLocation,
): IWithdrawalCompressorContract {
  switch (location.version) {
    case 310:
      return new WithdrawalCompressorV310Contract(sdk, location.address);
    case 311:
      return new WithdrawalCompressorV311Contract(sdk, location.address);
    case 313:
      return new WithdrawalCompressorV313Contract(sdk, location.address);
  }
}
