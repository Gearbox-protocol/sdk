/**
 * Deep copies and deep freezes used to keep caller inputs and produced plans
 * independent of each other.
 **/

/** Structural copy that keeps `bigint`, so plans never alias caller data. **/
export function deepCopy<T>(value: T): T {
  return structuredClone(value);
}

/** Recursively freezes a value in place and returns it as deeply readonly. **/
export function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object") return value;
  if (Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const entry of Object.values(value as Record<string, unknown>)) {
    deepFreeze(entry);
  }
  return value;
}

/** Copy + freeze: the shape every builder output uses. **/
export function snapshot<T>(value: T): T {
  return deepFreeze(deepCopy(value));
}
