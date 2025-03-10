import type { TransactionReceipt } from "viem";

import type { CreditAccountData } from "../base";
import type { NetworkType } from "../chain";

export type EtherscanURLParam =
  | { block: number }
  | { tx: string }
  | { address: string };

export function etherscanUrl(
  entity: EtherscanURLParam | TransactionReceipt | CreditAccountData,
  network: NetworkType,
): string {
  let [prefix, domain] = ["", "etherscan.io"];

  let param: EtherscanURLParam;
  if ("transactionHash" in entity && "blockHash" in entity) {
    param = { tx: entity.transactionHash };
  } else if ("creditAccount" in entity && "creditManager" in entity) {
    param = { address: entity.creditAccount };
  } else {
    param = entity;
  }

  switch (network) {
    case "Optimism":
      prefix = "optimistic.";
      break;
    case "Arbitrum":
      domain = "arbiscan.io";
      break;
    case "Base":
      domain = "basescan.org";
      break;
    case "Sonic":
      domain = "sonicscan.org";
      break;
  }
  const [key, value] = Object.entries(param)[0];
  return `https://${prefix}${domain}/${key}/${value}`;
}
