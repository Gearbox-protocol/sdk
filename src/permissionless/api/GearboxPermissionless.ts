import { ChainsNamespace } from "./chains/ChainsNamespace.js";
import type { AttachChainsArgs } from "./chains/types.js";
import { PermissionlessDeploy } from "./deploy/PermissionlessDeploy.js";
import { PermissionlessOracles } from "./oracles/PermissionlessOracles.js";
import { InstanceOwnerTransactions } from "./transactions/InstanceOwnerTransactions.js";
import type { GearboxPermissionlessOptions } from "./types.js";

/**
 * Client for the permissionless stack: the oracle rows of a chain, the
 * batches an instance owner executes, and the deploys that produce what goes
 * into both.
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
 * Only what needs a server goes to one. {@link chains} and {@link oracles}
 * are the backend's reads; {@link deploy} and {@link transactions} read the
 * target chain directly, because everything they answer is derived from there
 * and a round trip would only move the derivation further from the wallet
 * that has to sign for it.
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
   * Namespace for the Safe batches an instance owner executes. Backend-free,
   * see {@link InstanceOwnerTransactions}.
   **/
  public readonly transactions: InstanceOwnerTransactions;
  /**
   * Namespace for deploys through the BytecodeRepository. Backend-free, see
   * {@link PermissionlessDeploy}.
   **/
  public readonly deploy: PermissionlessDeploy;

  constructor(options: GearboxPermissionlessOptions = {}) {
    this.chains = new ChainsNamespace(options);
    this.oracles = new PermissionlessOracles(options, this.chains);
    this.transactions = new InstanceOwnerTransactions(
      this.chains,
      this.oracles,
    );
    this.deploy = new PermissionlessDeploy(this.chains);
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
