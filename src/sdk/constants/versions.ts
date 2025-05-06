/**
 * Version range, inclusive of both ends
 */
export type VersionRange = [number, number];

export const VERSION_RANGE_300: VersionRange = [300, 309];
export const VERSION_RANGE_310: VersionRange = [310, 319];

export function isV300(version: number | bigint | string): boolean {
  return isVersionRange(version, VERSION_RANGE_300);
}

export function isV310(version: number | bigint | string): boolean {
  return isVersionRange(version, VERSION_RANGE_310);
}

export function isVersionRange(
  version: number | bigint | string,
  range: VersionRange,
): boolean {
  return Number(version) >= range[0] && Number(version) <= range[1];
}
