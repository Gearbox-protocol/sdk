import { z } from "zod/v4";
import type {
  HistoryMetric,
  HistoryRange,
  HistorySeries,
} from "../model/history.js";
import { historySeriesSchema } from "../model/history.schema.js";
import type { ILogger } from "../sdk/types/logger.js";
import type { GearboxAPIOptions, OffchainResult } from "./types.js";
import {
  OffchainNotConfiguredError,
  OffchainTransportError,
  OffchainValidationError,
} from "./types.js";

const DEFAULT_TIMEOUT = 30_000;

/**
 * Query parameters of a backend read. An entry set to `undefined` is a
 * condition that does not narrow, and is left out of the URL.
 **/
export type OffchainQuery = Record<string, string | undefined>;

/**
 * One backend read.
 *
 * @typeParam S - Schema the payload is decoded with.
 **/
export interface OffchainGetRequest<S extends z.ZodType> {
  /**
   * Path below the base URL, e.g. `"/v2/opportunities/pools/1/0x..."`.
   **/
  path: string;
  /**
   * Parameters to append, see {@link OffchainQuery}.
   **/
  query?: OffchainQuery;
  /**
   * Schema the payload is decoded with. Decoding is what turns the response
   * into read model values, so it is required rather than optional.
   **/
  schema: S;
}

/**
 * One backend read of a historical series.
 *
 * @typeParam M - Metric the series carries.
 **/
export interface OffchainHistoryRequest<M extends HistoryMetric> {
  /**
   * Path of the series, metric included.
   **/
  path: string;
  /**
   * Metric the response must carry, see
   * {@link AbstractOffchainNamespace.readHistory}.
   **/
  metric: M;
  /**
   * Window to cover.
   **/
  range: HistoryRange;
}

/**
 * Common logic of every {@link GearboxAPI} namespace.
 *
 * A namespace is a set of routes: it knows which path answers which read and
 * which schema describes the payload. Everything under that — where the
 * backend is, how long a request may take, how a failure is reported and how a
 * response becomes read model values — lives here, so a namespace holds
 * nothing but its routes.
 **/
export abstract class AbstractOffchainNamespace {
  protected readonly logger?: ILogger;

  readonly #baseUrl?: string;
  readonly #timeout: number;

  protected constructor(name: string, options?: GearboxAPIOptions) {
    // a trailing slash would produce a double one in every path below
    this.#baseUrl = options?.baseUrl?.replace(/\/+$/, "");
    this.#timeout = options?.timeout ?? DEFAULT_TIMEOUT;
    this.logger = options?.logger?.child?.({ name }) ?? options?.logger;
  }

  /**
   * Base URL every read of this namespace is issued against.
   **/
  public get baseUrl(): string | undefined {
    return this.#baseUrl;
  }

  /**
   * Reads one endpoint and decodes its payload.
   *
   * The envelope is built here rather than by the caller: the status is
   * `"success"` whenever this returns at all, because anything else has
   * already thrown.
   **/
  protected async get<S extends z.ZodType>(
    request: OffchainGetRequest<S>,
  ): Promise<OffchainResult<z.output<S>>> {
    const url = this.#url(request.path, request.query);
    this.logger?.debug(`reading ${url}`);

    const payload = await this.#fetchJson(url);

    // the decode direction: amounts arrive as decimal strings and addresses
    // unchecksummed, and the model's codecs are what turn them into values
    const parsed = request.schema.safeParse(payload);
    if (!parsed.success) {
      this.logger?.error(
        { url, issues: parsed.error.issues },
        "offchain response does not match the read model",
      );
      throw new OffchainValidationError(url, parsed.error.issues);
    }

    return { result: parsed.data, meta: { status: "success" } };
  }

  /**
   * Reads one historical series.
   *
   * The requested metric is pinned in the schema, which is what upholds the
   * `HistorySeries<M>` a caller gets back: a response carrying a different
   * metric is version skew and fails validation like any other mismatch,
   * rather than being cast into the requested shape.
   **/
  protected async readHistory<M extends HistoryMetric>(
    request: OffchainHistoryRequest<M>,
  ): Promise<OffchainResult<HistorySeries<M>>> {
    return this.get({
      path: request.path,
      query: { range: request.range },
      schema: historySeriesSchema.extend({ metric: z.literal(request.metric) }),
    });
  }

  /**
   * Full URL of a read, with the conditions that do not narrow left out.
   **/
  #url(path: string, query?: OffchainQuery): string {
    if (!this.#baseUrl) {
      throw new OffchainNotConfiguredError(path);
    }
    const url = new URL(`${this.#baseUrl}${path}`);
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined) {
        url.searchParams.set(key, value);
      }
    }
    return url.toString();
  }

  /**
   * Body of a successful read, still undecoded.
   **/
  async #fetchJson(url: string): Promise<unknown> {
    let response: Response;
    try {
      response = await fetch(url, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(this.#timeout),
      });
    } catch (error) {
      throw new OffchainTransportError(url, describe(error));
    }

    if (!response.ok) {
      throw new OffchainTransportError(
        url,
        await failureReason(response),
        response.status,
      );
    }

    try {
      return await response.json();
    } catch (error) {
      throw new OffchainTransportError(
        url,
        `the body is not JSON (${describe(error)})`,
        response.status,
      );
    }
  }
}

/**
 * Why a non-2xx response failed, in the backend's own words when it said.
 **/
async function failureReason(response: Response): Promise<string> {
  const status = `the backend answered ${response.status}`;
  let body: string;
  try {
    body = await response.text();
  } catch {
    return status;
  }
  const message = backendMessage(body) ?? body.trim();
  return message ? `${status}: ${truncate(message)}` : status;
}

/**
 * The `message` of a Gearbox backend error body, or nothing when the body is
 * not one.
 **/
function backendMessage(body: string): string | undefined {
  try {
    const parsed: unknown = JSON.parse(body);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "message" in parsed &&
      typeof parsed.message === "string"
    ) {
      return parsed.message;
    }
  } catch {}
  return undefined;
}

function describe(error: unknown): string {
  if (error instanceof Error) {
    return error.name === "TimeoutError"
      ? "the request timed out"
      : error.message;
  }
  return String(error);
}

function truncate(text: string): string {
  return text.length > 200 ? `${text.slice(0, 200)}…` : text;
}
