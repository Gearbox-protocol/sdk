import type { Address, Hex } from "viem";
import type {
  CreditAccountData,
  OnchainSDK,
  PluginsMap,
} from "../onchain/index.js";
import type { ILogger } from "../onchain/types/logger.js";

/**
 * Raw-calldata operation input shared by `parseOperationCalldata` and
 * `previewOperation`.
 */
export interface PreviewOperationInput<P extends PluginsMap = PluginsMap> {
  /**
   * Already-attached SDK; chain, RPC and block are baked in at attach time.
   */
  sdk: OnchainSDK<P>;
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

interface PreviewOperationOptionsBase {
  /**
   * Block to read/simulate at; defaults to latest. Only set for testnet
   * forks.
   */
  blockNumber?: bigint;
  /**
   * Optional logger.
   **/
  logger?: ILogger;
}

/**
 * Options shared by the preview and simulation flows.
 * Each flow uses the subset it needs and ignores the rest.
 *
 * `WithAccount = true` marks options whose credit account state has already
 * been resolved (internal preview paths on an existing credit account).
 */
export type PreviewOperationOptions<WithAccount extends boolean = false> =
  WithAccount extends true
    ? PreviewOperationOptionsBase & {
        /**
         * Pre-resolved state of the credit account the operation targets
         */
        creditAccount: CreditAccountData;
      }
    : PreviewOperationOptionsBase & {
        /**
         * @internal
         * Credit account state for testing purposes
         */
        creditAccount?: CreditAccountData;
      };
