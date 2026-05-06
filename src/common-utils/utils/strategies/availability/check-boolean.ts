export function checkBoolean(a: boolean, b: boolean): number {
  if (a && b) return 0;
  if (a) return -1;
  if (b) return 1;
  return 0;
}
