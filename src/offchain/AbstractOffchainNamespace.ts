import { z } from "zod/v4";
import type { ChartBundle, ChartMetric, ChartRange } from "../model/charts.js";
import {
  chartBundleSchemaFor,
  chartQueryCodec,
} from "../model/charts.schema.js";
import type { ChainScopedFilter } from "../model/filters.js";
import type { ChainId } from "../model/primitives.js";
import type { DataResponse } from "../model/response.js";
import { responseSchema } from "../model/response.schema.js";
import type { ILogger } from "../sdk/types/logger.js";
import {
  OffchainInvalidJsonError,
  OffchainNotConfiguredError,
  OffchainRequestFailedError,
  OffchainStatusError,
  OffchainValidationError,
  readResponseBody,
} from "./errors/index.js";
import type { GearboxAPIOptions } from "./types.js";

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
   * Schema the payload is decoded with.
   **/
  schema: S;
}

/**
 * Base class of every {@link GearboxAPI} namespace: issues the requests,
 * decodes the responses and reports the failures, so that a namespace holds
 * nothing but its routes.
 **/
export abstract class AbstractOffchainNamespace {
  protected readonly logger?: ILogger;

  readonly #baseUrl?: string;
  readonly #chainIds: ChainId[];
  readonly #timeout: number;

  protected constructor(name: string, options: GearboxAPIOptions) {
    // a trailing slash would produce a double one in every path below
    this.#baseUrl = options.baseUrl?.replace(/\/+$/, "");
    this.#chainIds = [...options.chainIds];
    this.#timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.logger = options.logger?.child?.({ name }) ?? options.logger;
  }

  /**
   * Base URL every read of this namespace is issued against.
   **/
  public get baseUrl(): string | undefined {
    return this.#baseUrl;
  }

  /**
   * Chains one read covers: the configured ones, narrowed by the filter when it
   * names any. A filter naming a chain this client does not cover narrows
   * nothing.
   **/
  protected scopedChainIds(filter?: ChainScopedFilter): ChainId[] {
    const wanted = filter?.chainIds;
    return wanted
      ? this.#chainIds.filter(chainId => wanted.includes(chainId))
      : [...this.#chainIds];
  }

  /**
   * Reads one endpoint and decodes its payload. Timeouts, non-2xx answers and
   * schema skew throw, since none of them is a {@link DataResponse}.
   **/
  protected async get<S extends z.ZodType>(
    request: OffchainGetRequest<S>,
  ): Promise<DataResponse<z.output<S>>> {
    const url = this.#url(request.path, request.query);
    const payload = await this.#fetchJson(url);

    const parsed = responseSchema(request.schema).safeParse(payload);
    if (!parsed.success) {
      const error = new OffchainValidationError(url, parsed.error);
      this.logger?.error(
        error,
        "offchain response does not match the read model",
      );
      throw error;
    }

    const { data, meta } = parsed.data;
    // the backend does not have to send `source`: everything it reports came
    // from it, and stamping it here is what lets a merged envelope name the
    // side that served each chain
    const chains = meta.chains.map(chain => ({
      ...chain,
      source: "offchain" as const,
    }));
    return { data, meta: { chains } };
  }

  /**
   * Reads the charts of one subject: one series per metric named, onto the one
   * grid that lets them be compared at an index.
   **/
  protected async readCharts<const Metrics extends readonly ChartMetric[]>(
    path: string,
    metrics: Metrics,
    range: ChartRange,
  ): Promise<DataResponse<ChartBundle<Metrics>>> {
    return this.get({
      path,
      // the encode direction of the same codec the backend validates with
      query: z.encode(chartQueryCodec, { metrics, range }),
      schema: chartBundleSchemaFor(metrics, range),
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
      throw new OffchainRequestFailedError(url, error);
    }

    if (!response.ok) {
      throw new OffchainStatusError(
        url,
        response.status,
        await readResponseBody(response),
      );
    }

    try {
      return await response.json();
    } catch (error) {
      throw new OffchainInvalidJsonError(url, response.status, error);
    }
  }
}
