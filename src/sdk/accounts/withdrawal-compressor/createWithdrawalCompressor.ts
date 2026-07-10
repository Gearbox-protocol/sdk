import type { OnchainSDK } from "../../OnchainSDK.js";
import type { WithdrawalCompressorVersion } from "./addresses.js";
import { getWithdrawalCompressorAddress } from "./addresses.js";
import type { IWithdrawalCompressorContract } from "./types.js";
import { WithdrawalCompressorV310Contract } from "./WithdrawalCompressorV310Contract.js";
import { WithdrawalCompressorV311Contract } from "./WithdrawalCompressorV311Contract.js";
import { WithdrawalCompressorV313Contract } from "./WithdrawalCompressorV313Contract.js";

/**
 * Returns a withdrawal compressor contract for the current chain,
 * reusing an instance from the contracts register when available.
 * @param sdk
 * @param version - Desired compressor version; when omitted, the latest supported version is used.
 * @throws if no withdrawal compressor of given version is supported on the current chain.
 **/
export function createWithdrawalCompressor(
  sdk: OnchainSDK,
  version?: WithdrawalCompressorVersion,
): IWithdrawalCompressorContract {
  const location = getWithdrawalCompressorAddress(sdk.networkType, version);
  if (!location) {
    throw new Error(
      `no withdrawal compressor${version ? ` v${version}` : ""} on ${sdk.networkType}`,
    );
  }
  const cached = sdk.getContract<IWithdrawalCompressorContract>(
    location.address,
  );
  if (cached) {
    return cached;
  }
  switch (location.version) {
    case 310:
      return new WithdrawalCompressorV310Contract(sdk, location.address);
    case 311:
      return new WithdrawalCompressorV311Contract(sdk, location.address);
    case 313:
      return new WithdrawalCompressorV313Contract(sdk, location.address);
  }
}
