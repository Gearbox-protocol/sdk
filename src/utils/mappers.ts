type SupportedValue = string | number;

export class TypedObjectUtils {
  static entries = <K extends SupportedValue, T>(
    o: Record<K, T>,
  ): Array<[K, T]> => Object.entries(o) as Array<[K, T]>;

  static fromEntries = <K extends SupportedValue, T>(
    o: Array<[K, T]>,
  ): Record<K, T> => Object.fromEntries(o) as Record<K, T>;

  static swapKeyValue = <K extends SupportedValue, T extends SupportedValue>(
    o: Record<K, T>,
  ): Record<T, K> =>
    TypedObjectUtils.entries(o).reduce(
      (acc, [key, value]) => ({ ...acc, [value]: key }),
      {} as Record<T, K>,
    );

  static keyToLowercase = <K extends SupportedValue, T>(
    o: Record<K, T>,
  ): Record<K, T> =>
    TypedObjectUtils.entries(o).reduce((acc, [key, value]) => {
      const keyTransformed = typeof key === "string" ? key.toLowerCase() : key;
      return { ...acc, [keyTransformed]: value };
    }, {} as Record<K, T>);
}

export type { SupportedValue };
