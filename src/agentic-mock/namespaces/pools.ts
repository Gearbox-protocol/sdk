import type { Address, Mode, NetworkType } from "../core/index.js";
import type { Pool, PoolImpl } from "../entities/index.js";

export interface PoolFilter {
  network?: NetworkType;
  networks?: NetworkType[];
  underlying?: Address;
  address?: Address;
  minLiquidity?: bigint;
}

export interface PoolsNamespace<M extends Mode> {
  find(filter?: PoolFilter): Pool<M>[];
  get(network: NetworkType, address: Address): Pool<M> | undefined;
}

export class PoolsNamespaceImpl<M extends Mode> implements PoolsNamespace<M> {
  readonly #pools: PoolImpl[];

  constructor(pools: PoolImpl[]) {
    this.#pools = pools;
  }

  find(filter?: PoolFilter): Pool<M>[] {
    let result = this.#pools as unknown as Pool<M>[];
    if (!filter) return result;

    if (filter.networks) {
      result = result.filter(p => filter.networks!.includes(p.network));
    }
    if (filter.network) {
      result = result.filter(p => p.network === filter.network);
    }
    if (filter.underlying) {
      result = result.filter(p => p.underlying === filter.underlying);
    }
    if (filter.address) {
      result = result.filter(p => p.address === filter.address);
    }
    if (filter.minLiquidity !== undefined) {
      result = result.filter(p => p.availableLiquidity >= filter.minLiquidity!);
    }
    return result;
  }

  get(network: NetworkType, address: Address): Pool<M> | undefined {
    return this.#pools.find(
      p => p.network === network && p.address === address,
    ) as unknown as Pool<M> | undefined;
  }
}
