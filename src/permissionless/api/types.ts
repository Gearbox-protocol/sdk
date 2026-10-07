import type { ILogger } from "../../onchain/types/logger.js";

/**
 * The access token the permissionless backend identifies a caller by.
 *
 * A string for a service call whose key never changes, a function for a
 * signed-in session, whose token is rotated behind the client's back.
 **/
export type AccessTokenProvider =
  | string
  | (() => string | undefined | Promise<string | undefined>);

/**
 * Options for creating a {@link GearboxPermissionless} instance.
 *
 * Chains are deliberately absent: the backend decides which ones exist, and
 * {@link ChainsNamespace} reads that list and builds the clients from it.
 **/
export interface GearboxPermissionlessOptions {
  /**
   * Base URL of the permissionless backend, without a trailing slash.
   *
   * @example `"https://permissionless.gearbox.fi"`
   **/
  baseUrl?: string;
  /**
   * Token sent as `Authorization: Bearer`, see {@link AccessTokenProvider}.
   *
   * Left out, only the public reads answer, and every mutating route is
   * rejected by the backend.
   **/
  accessToken?: AccessTokenProvider;
  /**
   * How long a single request may take, in milliseconds.
   *
   * @defaultValue 30 seconds
   **/
  timeout?: number;
  logger?: ILogger;
}
