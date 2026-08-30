import type { Address } from "viem";
import { iRedemptionLoggerV310Abi } from "../../../abi/iRedemptionLoggerV310.js";
import type { DelayedIntent } from "../../../model/index.js";
import { type SDKReturn, sdkErr, sdkOk } from "../../../model/index.js";
import { BaseContract } from "../../base/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import type { InvalidDelayedIntentError } from "./errors.js";
import { decodeDelayedIntent } from "./intent-codec.js";
import type { IRedemptionLoggerContract, RedemptionLog } from "./types.js";

const abi = iRedemptionLoggerV310Abi;
type abi = typeof abi;

/**
 * Wrapper around the v310 `RedemptionLogger` helper contract that stores
 * redemption data logged by delayed-withdrawal gateways for off-chain
 * indexing. Resolved from the address provider by the
 * `LOCAL::REDEMPTION_LOGGER` key.
 **/
export class RedemptionLoggerV310Contract
  extends BaseContract<abi>
  implements IRedemptionLoggerContract
{
  constructor(sdk: OnchainSDK, address: Address, version: number) {
    super(sdk, {
      addr: address,
      name: "RedemptionLogger",
      abi,
      version,
    });
  }

  /**
   * Returns the redemption data logged for a redeemer; all-zero fields when
   * nothing was logged for it.
   **/
  public async getRedemptionLog(
    redeemer: Address,
    blockNumber?: bigint,
  ): Promise<RedemptionLog> {
    return this.contract.read.redemptionLogs([redeemer], {
      blockNumber,
    });
  }

  /**
   * Reads the redemption log of a redeemer and decodes the recorded intent.
   *
   * @param redeemer - Redeemer contract the withdrawal is claimed from.
   * @param blockNumber - Optional block number to read the log at.
   * @returns The decoded intent behind `ok` (`undefined` when the log
   * carries none, including when nothing was logged for the redeemer), or
   * the `invalidDelayedIntent` refusal when the logged `extraData` is
   * non-empty but cannot be decoded as a `DelayedIntent`.
   **/
  public async getDelayedIntent(
    redeemer: Address,
    blockNumber?: bigint,
  ): Promise<SDKReturn<DelayedIntent | undefined, InvalidDelayedIntentError>> {
    const log = await this.getRedemptionLog(redeemer, blockNumber);
    if (!log.extraData || log.extraData === "0x") {
      return sdkOk(undefined);
    }
    try {
      return sdkOk(decodeDelayedIntent(log.extraData));
    } catch (e) {
      return sdkErr({
        code: "invalidDelayedIntent",
        message: `cannot decode delayed intent from extraData ${log.extraData}`,
        extraData: log.extraData,
        // The same normalisation decodeSimulationError applies: a non-Error
        // reason is kept, stringified, rather than dropped.
        cause: e instanceof Error ? e : new Error(String(e)),
      } satisfies InvalidDelayedIntentError);
    }
  }
}
