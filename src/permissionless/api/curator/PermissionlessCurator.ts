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
 * Backend-free: a session reads through the client
 * {@link ChainsNamespace.client} built for its `chainId`, or through the Anvil
 * endpoint selected with `fork`. Fork mode does not require attaching the
 * permissionless client first.
 **/
export class PermissionlessCurator {
  readonly #chains: ChainsNamespace;

  constructor(chains: ChainsNamespace) {
    this.#chains = chains;
  }

  /**
   * Opens a session on an attached chain's client or an Anvil fork. Chain mode
   * is pinned to `blockNumber` (the head by default); fork mode uses the node's
   * current block and detects its chain id.
   *
   * @throws when both `chainId` and `fork`, or neither, are supplied
   * @throws {@link PermissionlessChainUnreachableError} when the selected
   * `chainId` is not served, see {@link ChainsNamespace.client}
   * @throws when a plugin's adapter or action type is already registered
   **/
  public async open(args: OpenCuratorSessionArgs): Promise<CuratorSession> {
    if (args.fork !== undefined) {
      if (args.chainId !== undefined) {
        throw new Error(
          "Pass either chainId or fork to curator.open, not both",
        );
      }
      return CuratorSession.create(args);
    }
    if (args.chainId === undefined) {
      throw new Error("curator.open requires chainId or { fork: { rpcUrl } }");
    }
    const { chainId, ...options } = args;
    return CuratorSession.create({
      ...options,
      client: this.#chains.client(chainId),
    });
  }
}
