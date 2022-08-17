type SupportedValue = string | number;

const objectEntries = <K extends SupportedValue, T>(
  o: Record<K, T>,
): Array<[K, T]> => Object.entries(o) as Array<[K, T]>;

const swapKeyValue = <K extends SupportedValue, T extends SupportedValue>(
  o: Record<K, T>,
): Record<T, K> =>
  objectEntries(o).reduce(
    (acc, [key, value]) => ({ ...acc, [value]: key }),
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    {} as Record<T, K>,
  );

const keyToLowercase = <K extends SupportedValue, T>(
  o: Record<K, T>,
): Record<K, T> =>
  objectEntries(o).reduce((acc, [key, value]) => {
    const keyTransformed = typeof key === "string" ? key.toLowerCase() : key;
    return { ...acc, [keyTransformed]: value };
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  }, {} as Record<K, T>);

const filterEmptyKeys = <K extends SupportedValue, T>(
  o: Record<K, T>,
): Record<K, T> =>
  objectEntries(o).reduce(
    (acc, [key, value]) => (key ? { ...acc, [key]: value } : acc),
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    {} as Record<K, T>,
  );

export type { SupportedValue };

export { filterEmptyKeys, keyToLowercase, objectEntries, swapKeyValue };
