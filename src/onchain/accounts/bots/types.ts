import type { Address, ContractFunctionParameters } from "viem";
import type { iBotListV310Abi } from "../../../abi/310/generated.js";
import type { peripheryCompressorAbi } from "../../../abi/compressors/peripheryCompressor.js";
import type { ConnectedBotData } from "../../base/index.js";
import type { RouterCASlice } from "../../router/index.js";
import type {
  CreditAccountOperationResult,
  CreditManagerOperationResult,
} from "../types.js";

/**
 * @internal
 * Descriptor of a `getConnectedBots` call on the periphery compressor, so that
 * it can be batched with calls to other contracts.
 **/
export type ConnectedBotsCall = ContractFunctionParameters<
  typeof peripheryCompressorAbi,
  "pure" | "view",
  "getConnectedBots"
>;

/**
 * @internal
 * Descriptor of a `getBotStatus` call on a bot list, so that it can be batched
 * with calls to other contracts.
 **/
export type BotStatusCall = ContractFunctionParameters<
  typeof iBotListV310Abi,
  "pure" | "view",
  "getBotStatus"
>;

/**
 * @internal
 * Result of a `multicall` with `allowFailure: true`.
 **/
export type MulticallWithFailure<T> = (
  | {
      error?: undefined;
      result: T;
      status: "success";
    }
  | {
      error: Error;
      result?: undefined;
      status: "failure";
    }
)[];

/**
 * @internal
 * Raw responses of a bot list's `getBotStatus`.
 **/
export type BotsDirectResponse = MulticallWithFailure<
  readonly [bigint, boolean, boolean] | readonly [bigint, boolean]
>;

/**
 * Credit account and credit manager address pair, used for batch queries such as connected bot lookups.
 **/
export type AccountToCheck = {
  /**
   * Address of the credit account.
   **/
  creditAccount: Address;
  /**
   * Address of the credit manager that manages this account.
   **/
  creditManager: Address;
};

/**
 * Minimal credit manager data an operation can be performed on, when it does
 * not target a specific credit account.
 **/
export interface CMSlice {
  creditManager: Address;
  creditFacade: Address;
  type: "creditManager";
}

/**
 * Props for {@link AccountBotsService.setBot}.
 **/
export interface SetBotProps {
  /**
   * Address of a bot that is being updated
   */
  botAddress: Address;
  /**
   * Permissions to set for the bot
   */
  permissions: bigint | null;
  /**
   * Minimal credit account data {@link RouterCASlice} on which operation is performed; if omitted, credit manager data is used
   * Minimal credit manager data {@link CMSlice} on which operation is performed; used only if credit account is omitted
   * At least one of credit account or credit manager must be provided
   */
  targetContract: (RouterCASlice & { type: "creditAccount" }) | CMSlice;
}

/**
 * Multicall result of querying connected bots across multiple credit accounts.
 **/
export type GetConnectedBotsResult = Array<
  | {
      error?: undefined;
      result: readonly ConnectedBotData[];
      status: "success";
    }
  | {
      error: Error;
      result?: undefined;
      status: "failure";
    }
>;

/**
 * Result of querying a migration bot's status across credit accounts, or `undefined` if no migration bot was provided.
 **/
export type GetConnectedMigrationBotsResult =
  | {
      result: (
        | {
            error: Error;
            result?: undefined;
            status: "failure";
          }
        | {
            error?: undefined;
            result:
              | readonly [bigint, boolean, boolean]
              | readonly [bigint, boolean];
            status: "success";
          }
      )[];
      botAddress: Address;
    }
  | undefined;

/**
 * Statuses of the queried bots on one credit account, in the order the bots
 * were passed in.
 **/
export interface ConnectedBotsPerAccount {
  result: BotsDirectResponse;
}

/**
 * Result of {@link AccountBotsService.getConnectedBots}.
 **/
export interface GetConnectedBotsResponse {
  /**
   * Bots the periphery compressor reports for each checked account, in the
   * order the accounts were passed in.
   **/
  legacy: GetConnectedBotsResult;
  /**
   * Status of the legacy migration bot on each checked account, or
   * `undefined` when no migration bot was passed in.
   **/
  legacyMigration: GetConnectedMigrationBotsResult;
  /**
   * Statuses of the additionally requested bots, one entry per checked
   * account.
   **/
  additionalBots: Array<ConnectedBotsPerAccount>;
}

/**
 * Result of {@link AccountBotsService.setBot}: a full transaction when the bot
 * is set on a credit account, calls only when it is set on a credit manager.
 **/
export type SetBotResult =
  | CreditAccountOperationResult
  | CreditManagerOperationResult;
