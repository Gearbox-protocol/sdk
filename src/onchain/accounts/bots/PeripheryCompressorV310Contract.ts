import type { Address } from "viem";
import { peripheryCompressorAbi } from "../../../abi/compressors/peripheryCompressor.js";
import { BaseContract } from "../../base/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import type { ConnectedBotsCall } from "./types.js";

const abi = peripheryCompressorAbi;
type abi = typeof abi;

export class PeripheryCompressorV310Contract extends BaseContract<abi> {
  constructor(sdk: OnchainSDK, address: Address) {
    super(sdk, {
      addr: address,
      name: "PeripheryCompressorV310",
      abi,
      version: 310,
    });
  }

  /**
   * Descriptor of a `getConnectedBots` call on this compressor.
   *
   * @param marketConfigurator - Configurator that governs the account's market.
   * @param creditAccount - Credit account to list the connected bots of.
   **/
  public connectedBotsCall(
    marketConfigurator: Address,
    creditAccount: Address,
  ): ConnectedBotsCall {
    return {
      abi,
      address: this.address,
      functionName: "getConnectedBots",
      args: [marketConfigurator, creditAccount],
    };
  }
}
