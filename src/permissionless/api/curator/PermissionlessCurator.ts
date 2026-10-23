import { CuratorSession } from "../../curator/session/CuratorSession.js";
import type { ChainsNamespace } from "../chains/ChainsNamespace.js";
import type { OpenCuratorSessionArgs } from "./types.js";

/**
 * Sessions for curators: a GIP for one market configurator, recorded as
 * actions, projected onto the market state and compiled into the Safe batch
 * the configurator's admin signs.
 *
 * ```ts
 * const session = await permissionless.curator.open({
 *   chainId: 1,
 *   marketConfigurator,
 * });
 * const plan = await session
 *   .market({ pool })
 *   .addAction({ type: "POOL::setTotalDebtLimit", params: { limit: 5_000_000 } })
 *   .build({ author, eta });
 * ```
 *
 * Backend-free: a session reads the chain through the client
 * {@link ChainsNamespace.client} built for it. To work on an Anvil fork
 * instead, create the session with {@link CuratorSession.create} and its
 * `fork` option.
 **/
export class PermissionlessCurator {
  readonly #chains: ChainsNamespace;

  constructor(chains: ChainsNamespace) {
    this.#chains = chains;
  }

  /**
   * Opens a session on the chain's client, pinned to `blockNumber` (the head
   * by default).
   *
   * @throws {@link PermissionlessChainUnreachableError} when the chain is not
   * served, see {@link ChainsNamespace.client}
   * @throws when a plugin's adapter or action type is already registered
   **/
  public async open(args: OpenCuratorSessionArgs): Promise<CuratorSession> {
    const { chainId, ...options } = args;
    return CuratorSession.create({
      ...options,
      client: this.#chains.client(chainId),
    });
  }
}
