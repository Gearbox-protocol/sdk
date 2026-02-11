import {
  BaseError,
  type EIP1193RequestFn,
  HttpRequestError,
  http,
  InvalidInputRpcError,
  InvalidParamsRpcError,
  InvalidRequestRpcError,
  ResourceNotFoundRpcError,
  ResourceUnavailableRpcError,
  RpcError,
  type Transport,
  type TransportConfig,
  withRetry,
} from "viem";
import { mainnet } from "viem/chains";
import type { HttpRpcClientOptions } from "viem/utils";
import { z } from "zod/v4";
import type { ILogger } from "../sdk/index.js";
import { httpTransportOptionsSchema } from "./transports.js";

export const providerConfigSchema = z.object({
  /**
   * Provider name for display purposes
   */
  name: z.string(),
  /**
   * Provider URL
   */
  url: z.url(),
  /**
   * How long, in milliseconds, to wait before try this provider again
   */
  cooldown: z.number().optional(),
  /**
   * HTTP transport options to use for this provider
   */
  httpTransportOptions: httpTransportOptionsSchema.optional(),
});

export type ProviderConfig = z.infer<typeof providerConfigSchema>;

interface TransportEntry {
  name: string;
  transport: Transport;
  /**
   * Cannot make requests to this transport until this timestamp
   */
  cooldown: number;
}

export interface ProviderStatus {
  id: string;
  status: "active" | "cooldown" | "standby";
}

type OnRequestFn = (
  providerName: string,
  ...args: Parameters<Required<HttpRpcClientOptions>["onRequest"]>
) => ReturnType<Required<HttpRpcClientOptions>["onRequest"]>;

type OnResponseFn = (
  providerName: string,
  ...args: Parameters<Required<HttpRpcClientOptions>["onResponse"]>
) => ReturnType<Required<HttpRpcClientOptions>["onResponse"]>;

export const SelectionStrategy = z.enum(["simple", "ordered"]);

/**
 * How to select the next transport
 * - simple: selects next transport after current that is not in cooldown by checking all transports in cyclic order
 * - ordered: will select first available transport that is not in cooldown
 */
export type SelectionStrategy = z.infer<typeof SelectionStrategy>;

/**
 * Schema without underlying transport configs
 */
export const revolverTransportConfigBaseSchema = z.object({
  /**
   * How to select the next transport
   * Defaults to "simple"
   */
  selectionStrategy: SelectionStrategy.optional(),
  /** The key of the transport. */
  key: z.string().optional(),
  /** The name of the transport. */
  name: z.string().optional(),
  /**
   * Default HTTP options to use for all providers, can be overridden by provider config
   */
  defaultHTTPOptions: httpTransportOptionsSchema.optional(),
  /**
   * Default cooldown, in milliseconds, to wait before try this transport again
   */
  defaultCooldown: z.number().optional(),
});

export const revolverTransportConfigSchema = z.union([
  z.object({
    /**
     * Pass http provider configs to use
     */
    providers: z.array(providerConfigSchema),
    ...revolverTransportConfigBaseSchema.shape,
  }),
  z.object({
    /**
     * Or pass transports directly
     */
    transports: z.array(
      z.custom<Transport>((v): v is Transport => typeof v === "function"),
    ),
    ...revolverTransportConfigBaseSchema.shape,
  }),
]);

export type RevolverTransportConfig = {
  logger?: ILogger;
  /**
   * When single http transport should retry?
   * Defaults to some less strict criteria, so it'll retry "blockNumber from the future" errors
   *
   * By viem's default, simple http transport retries LimitExceededRpcError.code, InternalRpcError.code and HTTP errors
   * so for things like ResourceNotFoundRpcError (eth_call with block number from other rps, which is yet in the future for current rpc)
   * it'll fail and not retry
   * https://github.com/wevm/viem/blob/3bc5e6f3c4a317441063342dd9ec2aaa7eb56b01/src/utils/buildRequest.ts#L269
   */
  shouldRetry?:
    | ((iter: { count: number; error: Error }) => Promise<boolean> | boolean)
    | undefined;
  /**
   * Spying function that also returns provider name in additional to the request
   */
  onRequest?: OnRequestFn;
  /**
   * Spying function that also returns provider name in additional to the response
   */
  onResponse?: OnResponseFn;
  /**
   * Callback that is called when the transport is rotated
   */
  onRotateSuccess?: (
    oldTransportName: string,
    newTransportName: string,
    reason?: BaseError,
  ) => void | Promise<void>;
  /**
   * Callback that is called when the transport cannot be rotated
   */
  onRotateFailed?: (
    oldTransportName: string,
    reason?: BaseError,
  ) => void | Promise<void>;
} & z.infer<typeof revolverTransportConfigSchema>;

export class NoAvailableTransportsError extends BaseError {
  constructor(cause?: Error) {
    super("no available transports", { cause });
  }
}

export interface RevolverTransportValue {
  /**
   * Manually try to rotate the transport
   * @param reason
   */
  rotate: (reason?: BaseError) => Promise<void>;
  /**
   * Returns the name of the current transport
   */
  currentTransportName: () => string;
  /**
   * Returns statuses of all providers
   */
  statuses: () => ProviderStatus[];
}

export class RevolverTransport
  implements ReturnType<Transport<"revolver", RevolverTransportValue>>
{
  #config: RevolverTransportConfig;
  #requests = new WeakMap();
  #selector: ITransportSelector;
  #rotating = false;
  #isSingle: boolean;

  private overrides?: Parameters<
    Transport<"revolver", RevolverTransportValue>
  >[0];

  /**
   * Create a new RevolverTransport
   * RevolverTransport usues several RPC providers and rotates between them when requests fail
   * Failed transport goes into temporary cooldown, after which it can be tried again
   * When all transports are on cooldown, the transport will throw a NoAvailableTransportsError
   * @param config
   * @returns
   */
  public static create(
    config: RevolverTransportConfig,
  ): Transport<"revolver", RevolverTransportValue> {
    const transport = new RevolverTransport({
      ...config,
    });

    return (
      ...args: Parameters<Transport<"revolver", RevolverTransportValue>>
    ) => {
      transport.overrides = args[0];
      return transport;
    };
  }

  constructor(config: RevolverTransportConfig) {
    this.#config = {
      ...config,
      shouldRetry: config.shouldRetry ?? defaultShouldRetry,
    };

    let transports: TransportEntry[];
    if ("providers" in config) {
      transports = config.providers.map(
        ({ url, name, cooldown, httpTransportOptions }): TransportEntry => ({
          name,
          transport: http(url, {
            ...config.defaultHTTPOptions,
            ...httpTransportOptions,
            key: name,
            name: name,
            onFetchRequest: this.#config.onRequest
              ? (...args) => this.#config.onRequest?.(name, ...args)
              : undefined,
            onFetchResponse: this.#config.onResponse
              ? (...args) => this.#config.onResponse?.(name, ...args)
              : undefined,
          }),
          cooldown: cooldown ?? 0,
        }),
      );
    } else {
      transports = config.transports.map(
        (t, i): TransportEntry => ({
          name: t({ chain: mainnet }).config.name ?? `transport-${i}`,
          transport: t,
          cooldown: 0,
        }),
      );
    }

    if (transports.length === 0) {
      throw new NoAvailableTransportsError();
    }
    this.#isSingle = transports.length === 1;

    const selectionStrategy = config.selectionStrategy ?? "simple";
    this.#selector =
      selectionStrategy === "simple"
        ? new SimpleTransportSelector(transports, config.defaultCooldown)
        : new OrderedTransportSelector(transports, config.defaultCooldown);
  }

  public get value(): RevolverTransportValue {
    return {
      rotate: (reason?: BaseError) => this.rotate(reason),
      currentTransportName: () => this.#selector.transportName(),
      statuses: () => this.#selector.statuses(),
    };
  }

  public request: EIP1193RequestFn = async r => {
    // this will make it return HTTPError instead of rotation error
    if (this.#isSingle) {
      return this.#selector
        .select()({
          ...this.overrides,
        })
        .request(r);
    }

    let error: Error | undefined;
    do {
      try {
        this.#requests.set(r, this.#selector.transportName());
        const transport = this.#selector.select()({
          ...this.overrides,
        });

        // for explanation, see shouldRetry comment
        const resp = await withRetry(() => transport.request(r), {
          delay: this.#config.defaultHTTPOptions?.retryDelay,
          retryCount: this.#config.defaultHTTPOptions?.retryCount,
          shouldRetry: this.#config.shouldRetry,
        });
        this.#requests.delete(r);
        return resp as any;
      } catch (e) {
        error = error ?? (e as Error);
        if (e instanceof RpcError || e instanceof HttpRequestError) {
          const reqTransport = this.#requests.get(r);
          if (reqTransport === this.#selector.transportName()) {
            await this.rotate(e);
          } else {
            this.#logger?.debug(
              `request made with old transport ${reqTransport}, trying again`,
            );
          }
        } else {
          this.#requests.delete(r);
          throw e;
        }
      }
    } while (this.#selector.canRotate());

    this.#requests.delete(r);
    throw new NoAvailableTransportsError(error);
  };

  public get config(): TransportConfig<"revolver"> {
    return {
      key: "revolver",
      name: "revolver",
      type: "revolver",
      request: this.request,
      retryCount: this.#config.defaultHTTPOptions?.retryCount,
      methods: this.#config.defaultHTTPOptions?.methods,
      retryDelay: this.#config.defaultHTTPOptions?.retryDelay,
      timeout: this.#config.defaultHTTPOptions?.timeout,
    };
  }

  /**
   * Manually rotate the transport
   * @param reason
   * @returns true if rotation was successful
   */
  public async rotate(reason?: BaseError): Promise<void> {
    if (this.#rotating) {
      this.#logger?.debug("already rotating, skipping");
      return;
    }
    this.#rotating = true;

    const from = this.#selector.transportName();
    const success = this.#selector.rotate();
    const to = this.#selector.transportName();
    if (success) {
      if (from !== to) {
        this.#logger?.debug({ from, to, reason }, "transport rotated");
        try {
          await this.#config.onRotateSuccess?.(from, to, reason);
        } catch {}
      }
    } else {
      this.#logger?.warn({ from, reason }, "transport rotation failed");
      try {
        await this.#config.onRotateFailed?.(from, reason);
      } catch {}
    }

    this.#rotating = false;
  }

  get #logger(): ILogger | undefined {
    return this.#config.logger;
  }
}

const retryCodes = new Set<number>([
  InvalidRequestRpcError.code,
  InvalidParamsRpcError.code,
  InvalidInputRpcError.code,
  ResourceNotFoundRpcError.code,
  ResourceUnavailableRpcError.code,
]);

const defaultShouldRetry: RevolverTransportConfig["shouldRetry"] = ({
  error,
}) => {
  if ("code" in error && typeof error.code === "number") {
    return retryCodes.has(error.code);
  }
  const msg = error.message?.toLowerCase() ?? `${error}`.toLowerCase();
  if (
    [
      "unknown block",
      "header not found",
      "resource unavailable",
      "requested resource not available",
    ].some(s => msg.includes(s))
  ) {
    return true;
  }
  return false;
};

interface ITransportSelector {
  select: () => Transport;
  transportName: () => string;
  canRotate: () => boolean;
  rotate: () => boolean;
  statuses: () => ProviderStatus[];
}

abstract class AbstractTransportSelector {
  protected readonly transports: TransportEntry[];
  protected readonly cooldown: number;
  protected index = 0;

  constructor(transports: TransportEntry[], cooldown = 60_000) {
    this.transports = transports;
    this.cooldown = cooldown;
  }

  public transportName(): string {
    return this.transports[this.index].name;
  }

  public canRotate(): boolean {
    const now = Date.now();
    return this.transports.some(t => t.cooldown < now);
  }

  public statuses(): ProviderStatus[] {
    const now = Date.now();
    return this.transports.map((t, i) => ({
      id: t.name,
      status:
        t.cooldown < now
          ? this.index === i
            ? "active"
            : "standby"
          : "cooldown",
    }));
  }
}

class SimpleTransportSelector
  extends AbstractTransportSelector
  implements ITransportSelector
{
  /**
   * For simple selector, transport status is not re-evaluated on each request
   * @returns
   */
  public select(): Transport {
    return this.transports[this.index].transport;
  }

  /**
   * Simply selects next transport that is not in cooldown by checking all transports in cyclic order
   * @returns true if rotation was successful
   */
  public rotate(): boolean {
    // nothing to rotate, always consider it successful
    if (this.transports.length === 1) {
      return true;
    }

    const now = Date.now();
    this.transports[this.index].cooldown = now + this.cooldown;

    for (let i = 0; i < this.transports.length - 1; i++) {
      this.index = (this.index + 1) % this.transports.length;
      if (this.transports[this.index].cooldown < now) {
        return true;
      }
    }

    return false;
  }
}

class OrderedTransportSelector
  extends AbstractTransportSelector
  implements ITransportSelector
{
  /**
   * Will select first transport that is not in cooldown
   * @returns
   */
  public select(): Transport {
    this.#updateIndex(Date.now());
    return this.transports[this.index].transport;
  }

  /**
   * Will put current transport into cooldown and select first available transport that is not in cooldown
   * @returns true if rotation was successful
   */
  public rotate(): boolean {
    // nothing to rotate, always consider it successful
    if (this.transports.length === 1) {
      return true;
    }

    const now = Date.now();
    this.transports[this.index].cooldown = now + this.cooldown;

    return this.#updateIndex(now);
  }

  #updateIndex(now: number): boolean {
    for (let i = 0; i < this.transports.length; i++) {
      if (this.transports[i].cooldown < now) {
        this.index = i;
        return true;
      }
    }
    return false;
  }
}
