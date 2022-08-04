declare type SupportedValue = string | number;
declare const objectEntries: <K extends SupportedValue, T>(o: Record<K, T>) => [K, T][];
declare const swapKeyValue: <K extends SupportedValue, T extends SupportedValue>(o: Record<K, T>) => Record<T, K>;
declare const keyToLowercase: <K extends SupportedValue, T>(o: Record<K, T>) => Record<K, T>;
declare const filterEmptyKeys: <K extends SupportedValue, T>(o: Record<K, T>) => Record<K, T>;
export type { SupportedValue };
export { objectEntries, swapKeyValue, keyToLowercase, filterEmptyKeys };
