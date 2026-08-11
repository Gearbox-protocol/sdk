import type { ILogger } from "../sdk/types/logger.js";

/**
 * Outcome of the single request that serves a backend read. Unlike the
 * on-chain source there is no per-chain breakdown here: one HTTP call covers
 * every chain, so splitting it per chain would be fabricated.
 **/
export interface OffchainSourceMeta {
  /**
   * Whether the backend served the request.
   **/
  status: "success" | "error";
  /**
   * Rejection reason. Only set when {@link status} is `"error"`.
   **/
  error?: unknown;
}

/**
 * What every {@link GearboxAPI} read returns: the payload plus the outcome of
 * the request that produced it, in the same shape the combined SDK exposes.
 *
 * @typeParam T - Payload type.
 **/
export interface OffchainResult<T> {
  /**
   * Requested payload.
   **/
  result: T;
  /**
   * Outcome of the backend request.
   **/
  meta: OffchainSourceMeta;
}

/**
 * Thrown by the endpoints that have no stub answer, so that a caller in
 * `offchain` mode fails loudly instead of reading an empty detail page as a
 * missing entity.
 *
 * Lives here rather than in one namespace because every stubbed namespace
 * throws it.
 **/
export class OffchainNotImplementedError extends Error {
  constructor(endpoint: string) {
    super(`GearboxAPI: ${endpoint} is not implemented yet`);
    this.name = "OffchainNotImplementedError";
  }
}

/**
 * Options for creating a {@link GearboxAPI} instance.
 **/
export interface GearboxAPIOptions {
  /**
   * Base URL of the Gearbox backend, without a trailing slash.
   *
   * @example `"https://api.gearbox.fi"`
   **/
  baseUrl?: string;
  /**
   * Logger used for transport and validation diagnostics.
   **/
  logger?: ILogger;
}
