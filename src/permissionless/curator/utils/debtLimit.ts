import { NO_LIMIT } from "../state/market/types.js";
import { DECIMAL_STRING } from "../validationSchemas.js";
import { numberToDecimalString } from "./numberToDecimalString.js";

/** Keep legacy numeric limits when their decimal representation is lossless. */
export function canonicalDebtLimit(value: number | string): number | string {
  if (value === NO_LIMIT) return value;
  const decimal =
    typeof value === "number" ? numberToDecimalString(value) : value;
  if (!DECIMAL_STRING.test(decimal))
    throw new Error(`Invalid debt limit: ${decimal}`);
  const [whole, fraction = ""] = decimal.split(".");
  const digits = fraction.replace(/0+$/, "");
  const normalized =
    whole.replace(/^0+(?=\d)/, "") + (digits ? `.${digits}` : "");
  const numeric = Number(normalized);
  return Number.isFinite(numeric) &&
    numberToDecimalString(numeric) === normalized
    ? numeric
    : normalized;
}
