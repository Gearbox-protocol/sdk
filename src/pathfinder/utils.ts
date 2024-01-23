import { providers } from "ethers";

import { TxParser } from "../parsers/txParser";
import { MultiCall } from "./core";

export class PathFinderUtils {
  static findPathFees(calls: Array<MultiCall>, provider: providers.Provider) {
    const o = TxParser.parseToObjectMultiCall(calls);
    const r = TxParser.parseMultiCall(calls);

    console.log(o, r);
  }
}
