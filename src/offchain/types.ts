import type { z } from "zod/v4";
import type { ChainId } from "../model/primitives.js";
import type { ILogger } from "../sdk/types/logger.js";

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
 * Thrown when a read is issued against a client that was never told where the
 * backend is.
 **/
export class OffchainNotConfiguredError extends Error {
  constructor(path: string) {
    super(`GearboxAPI: cannot read ${path}, no baseUrl was configured`);
    this.name = "OffchainNotConfiguredError";
  }
}

/**
 * Thrown when the backend could not be reached, or answered with a status
 * outside the 2xx range.
 **/
export class OffchainTransportError extends Error {
  /**
   * URL that was requested, query included.
   **/
  public readonly url: string;
  /**
   * Status the backend answered with, absent when the request never completed.
   **/
  public readonly status?: number;

  constructor(url: string, reason: string, status?: number) {
    super(`GearboxAPI: request to ${url} failed, ${reason}`);
    this.name = "OffchainTransportError";
    this.url = url;
    this.status = status;
  }
}

/**
 * Thrown when the backend answered, but with a payload the read model does not
 * describe.
 *
 * This is version skew rather than a bad request, and it is deliberately
 * handled like a transport error: the combined SDK drops the backend's
 * contribution in `both` mode and fails the read in `offchain` mode.
 **/
export class OffchainValidationError extends Error {
  /**
   * URL whose payload failed to validate.
   **/
  public readonly url: string;
  /**
   * What did not match, in the order zod reported it.
   **/
  public readonly issues: readonly z.core.$ZodIssue[];

  constructor(url: string, issues: readonly z.core.$ZodIssue[]) {
    const summary = issues
      .map(issue => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
      .join("; ");
    super(
      `GearboxAPI: response from ${url} does not match the model, ${summary}`,
    );
    this.name = "OffchainValidationError";
    this.url = url;
    this.issues = issues;
  }
}

/**
 * Options for creating a {@link GearboxAPI} instance.
 **/
export interface GearboxAPIOptions {
  /**
   * Chains this client reads. Every request names them, so the backend is
   * never asked for a chain the caller does not cover — it knows chains this
   * client has no business showing.
   *
   * A caller who thinks in network labels converts with {@link toChainIds}.
   **/
  chainIds: ChainId[];
  /**
   * Base URL of the Gearbox backend, without a trailing slash.
   *
   * @example `"https://api.gearbox.fi"`
   **/
  baseUrl?: string;
  /**
   * How long a single request may take, in milliseconds.
   *
   * @defaultValue 30 seconds
   **/
  timeout?: number;
  /**
   * Logger used for transport and validation diagnostics.
   **/
  logger?: ILogger;
}
