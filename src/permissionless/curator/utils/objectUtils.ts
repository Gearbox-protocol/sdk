/** `T` without the keys whose value is `undefined`. **/
type Compact<T> = { [K in keyof T]?: Exclude<T[K], undefined> };

/** Drops `undefined` values, keeping the remaining keys in their order. **/
export function compact<T extends object>(value: T): Compact<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as Compact<T>;
}

/**
 * JSON with object keys sorted, so that equal values always produce the same
 * string. `bigint`s are written as `<digits>n`; `undefined` members are
 * dropped, as `JSON.stringify` does.
 **/
export function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_key, entry: unknown) => {
    if (typeof entry === "bigint") return `${entry}n`;
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
      return entry;
    }
    return Object.fromEntries(
      Object.entries(entry).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
    );
  });
}
