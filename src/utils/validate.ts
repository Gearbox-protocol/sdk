export function isPositiveFloat(val: string): boolean {
  const floatRegex = /^\d+(?:[.,]\d*?)?$/;
  if (!floatRegex.test(val)) return false;

  const valF = parseFloat(val);
  if (isNaN(valF)) return false;
  return true;
}
