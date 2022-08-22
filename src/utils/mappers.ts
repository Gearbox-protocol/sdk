type SupportedValue = string | number;

const objectEntries = <K extends SupportedValue, T>(
  o: Record<K, T>,
): Array<[K, T]> => Object.entries(o) as Array<[K, T]>;

const swapKeyValue = <K extends SupportedValue, T extends SupportedValue>(
  o: Record<K, T>,
): Record<T, K> =>
  objectEntries(o).reduce(
    (acc, [key, value]) => ({ ...acc, [value]: key }),
    {} as Record<T, K>,
  );

const keyToLowercase = <K extends SupportedValue, T>(
  o: Record<K, T>,
): Record<K, T> =>
  objectEntries(o).reduce((acc, [key, value]) => {
    const keyTransformed = typeof key === "string" ? key.toLowerCase() : key;
    return { ...acc, [keyTransformed]: value };
  }, {} as Record<K, T>);

const filterEmptyKeys = <K extends SupportedValue, T>(
  o: Record<K, T>,
): Record<K, T> =>
  objectEntries(o).reduce(
    (acc, [key, value]) => (key ? { ...acc, [key]: value } : acc),
    {} as Record<K, T>,
  );

export type { SupportedValue };

export { filterEmptyKeys, keyToLowercase, objectEntries, swapKeyValue };
