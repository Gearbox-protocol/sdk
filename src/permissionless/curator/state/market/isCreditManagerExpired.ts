/**
 * Whether a credit manager is past its expiration date at `timestamp`.
 *
 * Only expirable managers with a date set can expire; `timestamp` is in
 * seconds, like `expirationDate`.
 **/
export function isCreditManagerExpired(
  manager: { expirable: boolean; expirationDate: number },
  timestamp: number,
): boolean {
  return (
    manager.expirable &&
    manager.expirationDate > 0 &&
    manager.expirationDate < timestamp
  );
}
