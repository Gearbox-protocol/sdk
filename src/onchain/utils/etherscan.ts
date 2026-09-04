import type { TransactionReceipt } from "viem";

import type { CreditAccountData } from "../base/index.js";
import { getChain, type NetworkType } from "../chain/index.js";

export type EtherscanURLParam =
  | { block: number }
  | { tx: string }
  | { address: string };

export function etherscanUrl(
  entity: EtherscanURLParam | TransactionReceipt | CreditAccountData,
  networkOrChainId: NetworkType | number | bigint,
  safe = "true",
): string {
  try {
    let param: EtherscanURLParam;
    if ("transactionHash" in entity && "blockHash" in entity) {
      param = { tx: entity.transactionHash };
    } else if ("creditAccount" in entity && "creditManager" in entity) {
      param = { address: entity.creditAccount };
    } else {
      param = entity;
    }
    const [key, value] = Object.entries(param)[0];

    const chain = getChain(networkOrChainId);
    const url = chain.blockExplorers?.default?.url;
    if (!url) {
      throw new Error(`block explorer url for ${chain.name} not configured`);
    }
    return `${url}/${key}/${value}`;
  } catch (e) {
    if (safe) {
      return "";
    }
    throw e;
  }
}

export function etherscanApiUrl(
  networkOrChainId: NetworkType | number | bigint,
): string {
  const chain = getChain(networkOrChainId);
  const url = chain.blockExplorers?.default?.apiUrl;
  if (!url) {
    throw new Error(`block explorer api url for ${chain.name} not configured`);
  }
  return url;
}
