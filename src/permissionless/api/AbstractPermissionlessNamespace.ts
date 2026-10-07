import type { z } from "zod/v4";
import {
  OffchainInvalidJsonError,
  OffchainNotConfiguredError,
  OffchainRequestFailedError,
  OffchainStatusError,
  OffchainValidationError,
  readResponseBody,
} from "../../offchain/errors/index.js";
import type { ILogger } from "../../onchain/types/logger.js";
import type { GearboxPermissionlessOptions } from "./types.js";

const DEFAULT_TIMEOUT = 30_000;

/**
 * Query parameters of a request. An entry set to `undefined` is a condition
 * that does not narrow, and is left out of the URL.
 **/
export type PermissionlessQuery = Record<string, string | undefined>;

/**
 * One call against the permissionless backend.
 *
 * @typeParam S - Schema the payload is decoded with.
 **/
export interface PermissionlessRequest<S extends z.ZodType> {
  /**
   * Path below the base URL, e.g. `"/pfs/1/prices"`.
   **/
  path: string;
  /**
   * Parameters to append, see {@link PermissionlessQuery}.
   **/
  query?: PermissionlessQuery;
  /**
   * Body to send as JSON. Only read by {@link
   * AbstractPermissionlessNamespace.post}.
   **/
  body?: unknown;
  /**
   * Schema the payload is decoded with.
   **/
  schema: S;
}

/**
 * Base class of every {@link GearboxPermissionless} namespace that talks to the
 * backend: issues the requests, carries the access token, decodes the responses
 * and reports the failures, so that a namespace holds nothing but its routes.
 *
 * The failures are the same classes {@link GearboxAPI} throws, so one `catch
 * (e) { if (e instanceof OffchainTransportError) ... }` covers both clients.
 * Unlike that client, the permissionless backend answers with the payload
 * itself rather than a `{ data, meta }` envelope, so nothing is unwrapped here.
 **/
export abstract class AbstractPermissionlessNamespace {
  protected readonly logger?: ILogger;

  readonly #baseUrl?: string;
  readonly #timeout: number;
  readonly #accessToken?: GearboxPermissionlessOptions["accessToken"];

  protected constructor(name: string, options: GearboxPermissionlessOptions) {
    // a trailing slash would produce a double one in every path below
    this.#baseUrl = options.baseUrl?.replace(/\/+$/, "");
    this.#timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.#accessToken = options.accessToken;
    this.logger = options.logger?.child?.({ name }) ?? options.logger;
  }

  /**
   * Base URL every call of this namespace is issued against.
   **/
  public get baseUrl(): string | undefined {
    return this.#baseUrl;
  }

  /**
   * Reads one endpoint and decodes its payload.
   **/
  protected async get<S extends z.ZodType>(
    request: PermissionlessRequest<S>,
  ): Promise<z.output<S>> {
    return this.#send("GET", request);
  }

  /**
   * Posts to one endpoint and decodes its payload.
   **/
  protected async post<S extends z.ZodType>(
    request: PermissionlessRequest<S>,
  ): Promise<z.output<S>> {
    return this.#send("POST", request);
  }

  async #send<S extends z.ZodType>(
    method: "GET" | "POST",
    request: PermissionlessRequest<S>,
  ): Promise<z.output<S>> {
    const url = this.#url(request.path, request.query);
    const payload = await this.#fetchJson(method, url, request.body);

    const parsed = request.schema.safeParse(payload);
    if (!parsed.success) {
      const error = new OffchainValidationError(url, parsed.error);
      this.logger?.error(
        error,
        "permissionless response does not match the read model",
      );
      throw error;
    }
    return parsed.data;
  }

  /**
   * Full URL of a call, with the conditions that do not narrow left out.
   **/
  #url(path: string, query?: PermissionlessQuery): string {
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
   * Body of a successful call, still undecoded.
   **/
  async #fetchJson(
    method: "GET" | "POST",
    url: string,
    body: unknown,
  ): Promise<unknown> {
    const hasBody = method !== "GET" && body !== undefined;
    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers: {
          accept: "application/json",
          ...(hasBody ? { "content-type": "application/json" } : {}),
          ...(await this.#authHeaders()),
        },
        body: hasBody ? JSON.stringify(body) : undefined,
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

  /**
   * The caller's identity, when there is one. A missing token is not an error
   * here: the public reads answer without it, and the backend is the one that
   * decides which routes do not.
   **/
  async #authHeaders(): Promise<Record<string, string>> {
    const provider = this.#accessToken;
    const token =
      typeof provider === "function" ? await provider() : (provider ?? "");
    return token ? { authorization: `Bearer ${token}` } : {};
  }
}
