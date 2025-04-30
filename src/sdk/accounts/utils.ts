import type { GetCreditAccountsArgs } from "./types.js";

export function stringifyGetCreditAccountsArgs(
  args: GetCreditAccountsArgs,
): Record<any, any> {
  const s = JSON.stringify(args, replacer);
  return JSON.parse(s);
}

function replacer(_key: string, value: any) {
  if (typeof value === "bigint") {
    return value.toString();
  } else {
    return value;
  }
}
