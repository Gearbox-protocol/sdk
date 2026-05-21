export function isZeroBalance(balance: bigint | undefined) {
  return (balance ?? 0n) <= 10n;
}
