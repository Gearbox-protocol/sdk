import type { Address } from "viem";

import type { ParsedObject } from "./abstractParser";

export interface IParser {
  parse: (calldata: Address) => string;
  parseToObject?: (address: Address, calldata: Address) => ParsedObject;
}
