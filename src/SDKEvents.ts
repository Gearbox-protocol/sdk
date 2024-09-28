import type { Address } from "viem";

import type { PathOptionSerie } from "./router";
import type { MultiCall } from "./types";

export interface SDKEventsMap {
  /**
   * Emitted by router
   */
  foundPathOptions: [{ pathOptions: PathOptionSerie[] }];
  /**
   * Emitted by router
   */
  foundBestClosePath: [
    {
      creditAccount: Address;
      amount: bigint;
      minAmount: bigint;
      calls: MultiCall[];
      underlyingBalance: bigint;
    },
  ];
}
