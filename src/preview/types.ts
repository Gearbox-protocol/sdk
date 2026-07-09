import type { Address, Hex } from "viem";
import type { SdkWithAdapters } from "../plugins/adapters/index.js";
import type { CreditAccountData, PluginsMap } from "../sdk/index.js";
import type { ILogger } from "../sdk/types/logger.js";

/**
 * Raw-calldata operation input shared by `parseOperationCalldata`,
 * `previewOperation` and `checkPrerequisites`.
 */
export interface PreviewOperationInput<P extends PluginsMap = PluginsMap> {
  /**
   * Already-attached SDK; chain, RPC and block are baked in at attach time.
   * Must be created with the adapters plugin (enforced at compile time) so
   * adapter contracts resolve during multicall classification.
   */
  sdk: SdkWithAdapters<P>;
  /**
   * Contract address that was called
   */
  to: Address;
  /**
   * Raw calldata of the operation
   */
  calldata: Hex;
  /**
   * Transaction sender
   */
  sender: Address;
  /**
   * Transaction `msg.value`, required for native-token zapper deposits.
   **/
  value?: bigint;
}

/**
 * Options shared by the preview, simulation and prerequisite-check flows.
 * Each flow uses the subset it needs and ignores the rest.
 */
export interface PreviewOperationOptions {
  /**
   * Block to read/simulate at; defaults to latest. Only set for testnet
   * forks.
   */
  blockNumber?: bigint;
  /**
   * Optional logger.
   **/
  logger?: ILogger;
  /**
   * @internal
   * Credit account state for testing purposes
   */
  creditAccount?: CreditAccountData;
}
