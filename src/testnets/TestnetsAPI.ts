import { z } from "zod/v4";
import type { ILogger } from "../onchain/types/logger.js";
import {
  TestnetNotFoundError,
  TestnetRequestFailedError,
  TestnetStatusError,
  TestnetValidationError,
  TestnetWaitTimeoutError,
} from "./errors/index.js";
import { testnetSchema, testnetStatusSchema } from "./schemas.js";
import type {
  CreateTestnetRequest,
  Testnet,
  TestnetFiles,
  TestnetStatus,
} from "./types.js";

const DEFAULT_BASE_URL = "https://anvil.gearbox.foundation";
const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_WAIT_TIMEOUT = 10 * 60_000;
const DEFAULT_WAIT_INTERVAL = 5_000;

const errorBodySchema = z.object({ error: z.string() });

/**
 * Options of a {@link TestnetsAPI}.
 **/
export interface TestnetsAPIOptions {
  /**
   * Base URL of anvil-manager.
   *
   * @defaultValue `"https://anvil.gearbox.foundation"`
   **/
  baseUrl?: string;
  /**
   * API key sent as a bearer token with every request. Without it the private
   * routes (create, kill) answer 401, which surfaces as a
   * {@link TestnetStatusError}.
   **/
  apiKey?: string;
  /**
   * Timeout of one request, in milliseconds.
   *
   * @defaultValue `30_000`
   **/
  timeout?: number;
  logger?: ILogger;
}

/**
 * Options of {@link TestnetsAPI.waitUntilReady}.
 **/
export interface WaitUntilReadyOptions {
  /**
   * How long to wait for the testnet to become ready, in milliseconds.
   *
   * @defaultValue `600_000` (10 minutes)
   **/
  timeout?: number;
  /**
   * Pause between two status polls, in milliseconds.
   *
   * @defaultValue `5_000`
   **/
  interval?: number;
}

/**
 * Client for anvil-manager, which runs the anvil forks Gearbox calls
 * testnets. It manages non-persistent testnets only, addressed by their
 * execution id.
 *
 * ```ts
 * const testnets = new TestnetsAPI({ apiKey: process.env.ANVIL_MANAGER_API_KEY });
 * const { executionId } = await testnets.create({ network: "Mainnet", timeout: "2h" });
 * const status = await testnets.waitUntilReady(executionId);
 * // ... use status.rpcUrl ...
 * await testnets.kill(executionId);
 * ```
 *
 * Every method throws a {@link TestnetsError} subclass when it fails, except
 * when a response body is not JSON: then it rejects with the error of
 * `response.json()`.
 **/
export class TestnetsAPI {
  protected readonly logger?: ILogger;

  readonly #baseUrl: string;
  readonly #apiKey?: string;
  readonly #timeout: number;

  constructor(options: TestnetsAPIOptions = {}) {
    // a trailing slash would produce a double one in every path below
    this.#baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.#apiKey = options.apiKey;
    this.#timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.logger =
      options.logger?.child?.({ name: "TestnetsAPI" }) ?? options.logger;
  }

  /**
   * Base URL every request of this client is sent to.
   **/
  public get baseUrl(): string {
    return this.#baseUrl;
  }

  /**
   * Every testnet anvil-manager knows of, persistent ones included.
   **/
  public async list(): Promise<Testnet[]> {
    const url = this.#url("/api/v1/forks");
    const response = await this.#fetch(url, { method: "GET" });
    return this.#decode(url, response, z.array(testnetSchema));
  }

  /**
   * Status of one testnet.
   *
   * @param id - Execution id of the testnet.
   * @throws {@link TestnetNotFoundError} when there is no such testnet.
   **/
  public async get(id: string): Promise<TestnetStatus> {
    const url = this.#forkUrl(id);
    const response = await this.#fetch(url, { method: "GET" });
    return this.#decode(url, response, testnetStatusSchema);
  }

  /**
   * Starts a testnet. It answers as soon as the testnet is created, long
   * before it is {@link TestnetStatus.ready}.
   *
   * @param files - Saved in the testnet's shared dir, where scripts and tasks
   * can read them.
   **/
  public async create(
    request: CreateTestnetRequest,
    files?: TestnetFiles,
  ): Promise<TestnetStatus> {
    const url = this.#url("/api/v1/forks");
    const response = await this.#fetch(url, {
      method: "POST",
      ...createBody(request, files),
    });
    return this.#decode(url, response, testnetStatusSchema);
  }

  /**
   * Stops a testnet. Stopping one that is already stopped succeeds.
   *
   * @param id - Execution id of the testnet.
   * @throws {@link TestnetNotFoundError} when there is no such testnet.
   * @throws {@link TestnetStatusError} with status 400 when the testnet is
   * persistent.
   **/
  public async kill(id: string): Promise<void> {
    await this.#fetch(this.#forkUrl(id), { method: "DELETE" });
  }

  /**
   * Polls a testnet's status until it is {@link TestnetStatus.ready}.
   *
   * @param id - Execution id of the testnet.
   * @returns The first status that is ready.
   * @throws {@link TestnetWaitTimeoutError} when the testnet is not ready in
   * time. Any error of a poll is thrown as is, without retrying.
   **/
  public async waitUntilReady(
    id: string,
    options: WaitUntilReadyOptions = {},
  ): Promise<TestnetStatus> {
    const { timeout = DEFAULT_WAIT_TIMEOUT, interval = DEFAULT_WAIT_INTERVAL } =
      options;
    const deadline = Date.now() + timeout;

    while (true) {
      const status = await this.get(id);
      if (status.ready) {
        return status;
      }
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        throw new TestnetWaitTimeoutError(this.#forkUrl(id), id, timeout);
      }
      this.logger?.debug(`testnet ${id} is not ready yet`);
      await new Promise(resolve =>
        setTimeout(resolve, Math.min(interval, remaining)),
      );
    }
  }

  #url(path: string): string {
    return `${this.#baseUrl}${path}`;
  }

  #forkUrl(id: string): string {
    return this.#url(`/api/v1/forks/${encodeURIComponent(id)}`);
  }

  /**
   * Sends one request and returns its response once it is known to be 2xx.
   **/
  async #fetch(url: string, init: RequestInit): Promise<Response> {
    const headers = new Headers(init.headers);
    headers.set("accept", "application/json");
    if (this.#apiKey) {
      headers.set("authorization", `Bearer ${this.#apiKey}`);
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...init,
        headers,
        signal: AbortSignal.timeout(this.#timeout),
      });
    } catch (error) {
      throw new TestnetRequestFailedError(url, error);
    }

    if (!response.ok) {
      const responseBody = await response.text();
      const details = errorBodySchema.safeParse(responseBody).data?.error;
      throw response.status === 404
        ? new TestnetNotFoundError(url, details)
        : new TestnetStatusError(url, response.status, details);
    }
    return response;
  }

  /**
   * Body of a 2xx response, decoded.
   **/
  async #decode<S extends z.ZodType>(
    url: string,
    response: Response,
    schema: S,
  ): Promise<z.output<S>> {
    const payload = await response.json();

    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      const error = new TestnetValidationError(url, parsed.error);
      this.logger?.error(
        error,
        "anvil-manager response does not match the testnet schemas",
      );
      throw error;
    }
    return parsed.data;
  }
}

/**
 * Body and content type of a create request: JSON alone, or a multipart form
 * with the JSON in its `json` field when there are files to upload.
 **/
function createBody(
  request: CreateTestnetRequest,
  files: TestnetFiles | undefined,
): RequestInit {
  const json = JSON.stringify(request);
  if (!files || Object.keys(files).length === 0) {
    return { body: json, headers: { "content-type": "application/json" } };
  }
  // no content type: fetch sets it, with the multipart boundary
  const form = new FormData();
  form.append("json", json);
  for (const [name, contents] of Object.entries(files)) {
    form.append("file", toBlob(contents), name);
  }
  return { body: form };
}

function toBlob(contents: TestnetFiles[string]): Blob {
  if (contents instanceof Blob) {
    return contents;
  }
  // a Blob refuses a view of a SharedArrayBuffer, the copy is backed by a plain one
  return new Blob([
    typeof contents === "string" ? contents : new Uint8Array(contents),
  ]);
}
