import { PermissionlessAnalytics } from "./analytics/PermissionlessAnalytics.js";
import { ChainsNamespace } from "./chains/ChainsNamespace.js";
import type { AttachChainsArgs } from "./chains/types.js";
import { PermissionlessCurator } from "./curator/PermissionlessCurator.js";
import { PermissionlessDeploy } from "./deploy/PermissionlessDeploy.js";
import { PermissionlessOracles } from "./oracles/PermissionlessOracles.js";
import { InstanceOwnerTransactions } from "./transactions/InstanceOwnerTransactions.js";
import type { GearboxPermissionlessOptions } from "./types.js";

/**
 * Client for the permissionless stack: the oracle rows of a chain, the
 * batches an instance owner executes, the deploys that produce what goes
 * into both, and the GIPs a curator assembles for a market configurator.
 *
 * It reads the same backend {@link GearboxAPI} does, and reads the same way —
 * one namespace per subject, every call scoped by the chain it names. Which
 * chains those are is not passed in: {@link attach} reads the list off the
 * backend and builds a client for each, so this client covers exactly what
 * the backend serves.
 *
 * ```ts
 * const permissionless = new GearboxPermissionless({
 *   baseUrl: "https://api.gearbox.fi",
 * });
 * await permissionless.attach();
 *
 * const [chain] = permissionless.chains.list();
 * const store = await permissionless.oracles.store({ chainId: chain.chainId });
 * ```
 *
 * Only what needs a server goes to one. {@link chains}, {@link oracles} and
 * {@link analytics} are the backend's reads; {@link deploy},
 * {@link transactions} and {@link curator} read the target chain directly, because everything
 * they answer is derived from there and a round trip would only move the
 * derivation further from the wallet that has to sign for it.
 **/
export class GearboxPermissionless {
  /**
   * Namespace for the chains the stack runs on, and the viem clients that
   * reach them.
   **/
  public readonly chains: ChainsNamespace;
  /**
   * Namespace for price feeds: the store and its prices.
   **/
  public readonly oracles: PermissionlessOracles;
  /**
   * Namespace for history: what a feed's price did over a window, see
   * {@link PermissionlessAnalytics}.
   **/
  public readonly analytics: PermissionlessAnalytics;
  /**
   * Namespace for the Safe batches an instance owner executes. Backend-free,
   * see {@link InstanceOwnerTransactions}.
   **/
  public readonly transactions: InstanceOwnerTransactions;
  /**
   * Namespace for deploys through the BytecodeRepository. Backend-free, see
   * {@link PermissionlessDeploy}.
   **/
  public readonly deploy: PermissionlessDeploy;
  /**
   * Namespace for GIP sessions over a market configurator. Backend-free, see
   * {@link PermissionlessCurator}.
   **/
  public readonly curator: PermissionlessCurator;

  constructor(options: GearboxPermissionlessOptions = {}) {
    this.chains = new ChainsNamespace(options);
    this.oracles = new PermissionlessOracles(options, this.chains);
    this.analytics = new PermissionlessAnalytics(options);
    this.transactions = new InstanceOwnerTransactions(
      this.chains,
      this.oracles,
    );
    this.deploy = new PermissionlessDeploy(this.chains);
    this.curator = new PermissionlessCurator(this.chains);
  }

  /**
   * Loads the chain list and builds the clients, see
   * {@link ChainsNamespace.attach}. Idempotent, and joins a call already in
   * flight.
   *
   * Everything that reads a chain goes through it, so this has to finish
   * before the first such call.
   **/
  public async attach(args: AttachChainsArgs = {}): Promise<void> {
    return this.chains.attach(args);
  }

  /**
   * Whether {@link attach} has completed.
   **/
  public get isAttached(): boolean {
    return this.chains.isAttached;
  }
}
