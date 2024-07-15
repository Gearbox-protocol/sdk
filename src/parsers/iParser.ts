import { Address } from "viem";

import { ParsedObject } from "./abstractParser";

export interface IParser {
  parse: (calldata: Address) => string;
  parseToObject?: (address: Address, calldata: Address) => ParsedObject;
}
