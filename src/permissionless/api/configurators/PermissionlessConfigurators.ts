import { z } from "zod/v4";
import { iMarketConfiguratorV310Abi } from "../../../abi/310/generated.js";
import { iTimeLockAbi } from "../../../abi/governance/iTimeLock.js";
import { AbstractOffchainNamespace } from "../../../offchain/AbstractOffchainNamespace.js";
import { MarketConfiguratorContract } from "../../bindings/market-configurator.js";
import type { ChainsNamespace } from "../chains/ChainsNamespace.js";
import type { GearboxPermissionlessOptions } from "../types.js";
import {
  configuratorMarketSchema,
  configuratorSchema,
  timelockEventSchema,
} from "./schemas.js";
import type {
  ConfiguratorArgs,
  ListConfiguratorsArgs,
  PermissionlessConfigurator,
  PermissionlessConfiguratorMarket,
  PermissionlessConfiguratorRoles,
  PermissionlessConfiguratorTimelock,
  PermissionlessTimelockEvent,
  TimelockEventsArgs,
} from "./types.js";

/**
 * Hashes per timelock-event read. Each one is 66 characters of query string,
 * so this keeps a request well under common URL limits.
 **/
export const TIMELOCK_EVENTS_CHUNK_SIZE = 50;

/**
 * The market configurators of the stack: who they are, which markets they
 * run, and what became of the transactions their TimeLocks queued.
 *
 * ```ts
 * const configurators = await permissionless.configurators.list({ chainId: 1 });
 * const markets = await permissionless.configurators.markets({
 *   chainId: 1,
 *   address: configurators[0].address,
 * });
 * ```
 *
 * Read-only. Everything but {@link roles} and {@link timelock} is the
 * backend's index; those two read the chain, because role holders and
 * TimeLock windows are not indexed.
 **/
export class PermissionlessConfigurators extends AbstractOffchainNamespace {
  readonly #chains: ChainsNamespace;

  constructor(options: GearboxPermissionlessOptions, chains: ChainsNamespace) {
    // Every route names its chain, so there is no configured set to scope a
    // read by.
    super("PermissionlessConfigurators", { ...options, chainIds: [] });
    this.#chains = chains;
  }

  /**
   * The listed configurators, each with how many markets it runs. Hidden
   * ones are left out; {@link details} still serves them.
   **/
  public async list({
    chainId,
  }: ListConfiguratorsArgs = {}): Promise<PermissionlessConfigurator[]> {
    return this.getData({
      path: "/curators/list",
      query: { chainId: chainId?.toString() },
      schema: z.array(configuratorSchema),
    });
  }

  /**
   * One configurator, listed or not.
   *
   * @throws When the backend has not indexed it.
   **/
  public async details({
    chainId,
    address,
  }: ConfiguratorArgs): Promise<PermissionlessConfigurator> {
    return this.getData({
      path: `/curators/${chainId}/${address}`,
      schema: configuratorSchema,
    });
  }

  /**
   * The markets one configurator runs, shut down ones included.
   **/
  public async markets({
    chainId,
    address,
  }: ConfiguratorArgs): Promise<PermissionlessConfiguratorMarket[]> {
    return this.getData({
      path: `/curators/${chainId}/${address}/markets`,
      schema: z.array(configuratorMarketSchema),
    });
  }

  /**
   * The latest TimeLock event of each named transaction. A hash the backend
   * has seen no event for is absent from the result, which is what "not
   * queued" looks like.
   *
   * ```ts
   * const events = await permissionless.configurators.timelockEvents({
   *   chainId: 1,
   *   txHashes: [first, last],
   * });
   * ```
   **/
  public async timelockEvents({
    chainId,
    txHashes,
  }: TimelockEventsArgs): Promise<PermissionlessTimelockEvent[]> {
    const unique = [...new Set(txHashes.map(hash => hash.toLowerCase()))];
    const chunks: string[][] = [];
    for (let i = 0; i < unique.length; i += TIMELOCK_EVENTS_CHUNK_SIZE) {
      chunks.push(unique.slice(i, i + TIMELOCK_EVENTS_CHUNK_SIZE));
    }
    const results = await Promise.all(
      chunks.map(chunk =>
        this.getData({
          path: "/curators/timelock-transactions",
          query: { chainId: chainId.toString(), txHashes: chunk.join(",") },
          schema: z.array(timelockEventSchema),
        }),
      ),
    );
    return results.flat();
  }

  /**
   * Who holds each role of a configurator, read off the chain at the latest
   * block.
   **/
  public async roles({
    chainId,
    address,
  }: ConfiguratorArgs): Promise<PermissionlessConfiguratorRoles> {
    const contract = new MarketConfiguratorContract(
      address,
      this.#chains.client(chainId),
    );
    return contract.admins();
  }

  /**
   * The configurator's TimeLock and the windows it enforces, read off the
   * chain at the latest block.
   **/
  public async timelock({
    chainId,
    address,
  }: ConfiguratorArgs): Promise<PermissionlessConfiguratorTimelock> {
    const client = this.#chains.client(chainId);
    const timelock = await client.readContract({
      address,
      abi: iMarketConfiguratorV310Abi,
      functionName: "admin",
    });
    const [delay, gracePeriod] = await client.multicall({
      allowFailure: false,
      contracts: [
        { address: timelock, abi: iTimeLockAbi, functionName: "delay" },
        { address: timelock, abi: iTimeLockAbi, functionName: "GRACE_PERIOD" },
      ],
    });
    return {
      address: timelock,
      delay: Number(delay),
      gracePeriod: Number(gracePeriod),
    };
  }
}
