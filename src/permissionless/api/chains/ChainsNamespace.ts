import {
  type Chain,
  createPublicClient,
  fallback,
  http,
  type PublicClient,
  type Transport,
} from "viem";
import { AbstractOffchainNamespace } from "../../../offchain/AbstractOffchainNamespace.js";
import { getChain } from "../../../onchain/chain/chains.js";
import {
  PermissionlessChainUnreachableError,
  PermissionlessNotAttachedError,
} from "../errors.js";
import type { GearboxPermissionlessOptions } from "../types.js";
import { chainListSchema } from "./schemas.js";
import type { AttachChainsArgs, PermissionlessChain } from "./types.js";

/**
 * The chains the permissionless stack runs on, and the viem clients that
 * reach them.
 *
 * Both halves live here because they answer the same question. Which chains
 * exist is the backend's to decide — it holds rows for chains it does not
 * serve, and those must not be reachable — so the list is also the only
 * honest basis for deciding which clients to build. Nothing is passed in: a
 * caller that had to name the chains could name one the backend does not
 * serve, or miss one it does.
 *
 * The list is fetched once, by {@link attach}, and kept for the client's
 * lifetime:
 *
 * ```ts
 * await permissionless.attach();
 * const chains = permissionless.chains.list();
 * ```
 *
 * Every read before that throws {@link PermissionlessNotAttachedError} rather
 * than answering with an empty list, which would be indistinguishable from a
 * backend that serves nothing.
 **/
export class ChainsNamespace extends AbstractOffchainNamespace {
  readonly #clients = new Map<number, PublicClient<Transport, Chain>>();

  #chains?: PermissionlessChain[];
  #attaching?: Promise<void>;

  constructor(options: GearboxPermissionlessOptions) {
    // The chains are what this namespace is about to read, so there is
    // nothing to scope its own reads by.
    super("ChainsNamespace", { ...options, chainIds: [] });
  }

  /**
   * Reads the chain list off the backend and builds a client for each chain
   * it names.
   *
   * Idempotent, and joins a call already in flight, so a double invocation —
   * React's StrictMode, two components mounting at once — costs one request.
   * A second call with a different `scope` is a no-op: the list is decided
   * once.
   **/
  public async attach({ scope }: AttachChainsArgs = {}): Promise<void> {
    if (this.#chains) {
      return;
    }
    this.#attaching ??= this.#load(scope).finally(() => {
      this.#attaching = undefined;
    });
    return this.#attaching;
  }

  /**
   * Whether {@link attach} has completed.
   **/
  public get isAttached(): boolean {
    return this.#chains !== undefined;
  }

  /**
   * Every chain the backend serves, in the order it listed them.
   **/
  public list(): PermissionlessChain[] {
    if (!this.#chains) {
      throw new PermissionlessNotAttachedError();
    }
    return this.#chains;
  }

  /**
   * One chain by id, or nothing when the backend does not serve it.
   *
   * Reads the attached list rather than a route of its own, which is also
   * what makes "not served" and "not activated" distinguishable: the first is
   * absence here, the second is {@link PermissionlessChain.isActivated}.
   **/
  public find(chainId: number): PermissionlessChain | undefined {
    return this.list().find(chain => chain.chainId === chainId);
  }

  /**
   * Chains a client could be built for. A subset of {@link list} — see
   * {@link client}.
   **/
  public get chainIds(): number[] {
    if (!this.#chains) {
      throw new PermissionlessNotAttachedError();
    }
    return [...this.#clients.keys()];
  }

  /**
   * The client for one chain.
   *
   * @throws {@link PermissionlessChainUnreachableError} when the backend does
   * not serve the chain, or serves one this SDK carries no definition for.
   **/
  public client(chainId: number): PublicClient<Transport, Chain> {
    if (!this.#chains) {
      throw new PermissionlessNotAttachedError();
    }
    const client = this.#clients.get(chainId);
    if (!client) {
      throw new PermissionlessChainUnreachableError(chainId);
    }
    return client;
  }

  async #load(scope: AttachChainsArgs["scope"]): Promise<void> {
    const chains = await this.getData({
      path: "/chain/list",
      query: { scope },
      schema: chainListSchema,
    });

    this.#clients.clear();
    for (const { chainId } of chains) {
      const client = this.#client(chainId);
      if (client) {
        this.#clients.set(chainId, client);
      }
    }
    this.#chains = chains;
  }

  /**
   * A client over the chain's own public endpoints, or nothing when this SDK
   * has no definition for it.
   *
   * The backend will not hand over its endpoints — they carry provider keys —
   * so the chain definition is all there is to go on. A chain the SDK does
   * not know stays in {@link list}, because the backend serves it and its
   * rows are readable through the backend; only the calls that have to reach
   * it directly fail, and they say which chain they could not reach.
   **/
  #client(chainId: number): PublicClient<Transport, Chain> | undefined {
    let chain: Chain;
    try {
      chain = getChain(chainId);
    } catch {
      this.logger?.warn(
        `no chain definition for ${chainId}: it will be listed, but nothing can be read off it directly`,
      );
      return undefined;
    }

    const urls = chain.rpcUrls.default.http;
    if (urls.length === 0) {
      this.logger?.warn(`no public endpoint for chain ${chainId}`);
      return undefined;
    }
    const transports = urls.map(url => http(url));

    return createPublicClient({
      chain,
      transport: transports.length > 1 ? fallback(transports) : transports[0],
    });
  }
}
