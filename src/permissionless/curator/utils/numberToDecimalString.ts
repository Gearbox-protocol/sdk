/**
 * Plain decimal notation of a number, as `parseUnits` expects it.
 *
 * `String(n)` switches to exponent notation for very large and very small
 * numbers (`1e+21`, `1e-7`), which `parseUnits` rejects. The digits are the
 * same shortest round-trip digits `String(n)` produces; only the notation
 * changes.
 **/
export function numberToDecimalString(value: number): string {
  if (!Number.isFinite(value)) {
    throw new Error(`Cannot convert ${value} to a decimal amount`);
  }
  const text = String(value);
  const match = /^(-?)(\d+)(?:\.(\d+))?e([+-]\d+)$/.exec(text);
  if (!match) return text;

  const [, sign, whole, fraction = "", exponentText] = match;
  const exponent = Number(exponentText);
  const digits = whole + fraction;
  // Position of the decimal point inside `digits`.
  const point = whole.length + exponent;

  if (point <= 0) return `${sign}0.${"0".repeat(-point)}${digits}`;
  if (point >= digits.length) {
    return `${sign}${digits}${"0".repeat(point - digits.length)}`;
  }
  return `${sign}${digits.slice(0, point)}.${digits.slice(point)}`;
}
