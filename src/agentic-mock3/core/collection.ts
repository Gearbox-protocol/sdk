import { orderBy } from "es-toolkit";
import { GearboxEntity } from "./base.js";
import type { SDKContext } from "./context.js";
import type { Mode } from "./mode.js";

export interface IBaseCollection<T, Self> extends Iterable<T> {
  all(): T[];
  first(): T | undefined;
  at(index: number): T | undefined;
  readonly length: number;

  filter(predicate: (item: T, index: number) => boolean): Self;
  sort(compareFn: (a: T, b: T) => number): Self;
  map<U>(fn: (item: T, index: number) => U): U[];
  flatMap<U>(fn: (item: T, index: number) => U[]): U[];
  sortBy(
    criteria: Array<((item: T) => unknown) | keyof T>,
    orders: Array<"asc" | "desc">,
  ): Self;
  limit(n: number): Self;
}

export abstract class BaseCollection<T extends object, M extends Mode = Mode>
  extends GearboxEntity
  implements Iterable<T>
{
  readonly #items: T[];

  constructor(ctx: SDKContext, items: T[]) {
    super(ctx);
    this.#items = items;
  }

  // --- Materialization ---

  all(): T[] {
    return [...this.#items];
  }

  first(): T | undefined {
    return this.#items[0];
  }

  at(index: number): T | undefined {
    return this.#items.at(index);
  }

  get length(): number {
    return this.#items.length;
  }

  // --- Array-mirror helpers ---

  filter(predicate: (item: T, index: number) => boolean): this {
    return this.wrap(this.#items.filter(predicate));
  }

  sort(compareFn: (a: T, b: T) => number): this {
    return this.wrap([...this.#items].sort(compareFn));
  }

  map<U>(fn: (item: T, index: number) => U): U[] {
    return this.#items.map(fn);
  }

  flatMap<U>(fn: (item: T, index: number) => U[]): U[] {
    return this.#items.flatMap(fn);
  }

  // --- Sorting via es-toolkit orderBy ---

  sortBy(
    criteria: Array<((item: T) => unknown) | keyof T>,
    orders: Array<"asc" | "desc">,
  ): this {
    return this.wrap(orderBy(this.#items, criteria, orders));
  }

  limit(n: number): this {
    return this.wrap(this.#items.slice(0, n));
  }

  // --- Iterable ---

  [Symbol.iterator](): Iterator<T> {
    return this.#items[Symbol.iterator]();
  }

  // --- Subclass factory ---

  protected abstract wrap(items: T[]): this;

  protected get items(): T[] {
    return this.#items;
  }
}
