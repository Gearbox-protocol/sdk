import type { TransactionRequest } from "@ethersproject/abstract-provider";
import { BigNumber } from "ethers";
import { FunctionFragment } from "ethers/lib/utils";

export interface RawTransaction {
  id: number;
  method: "eth_sendTransaction";
  params: [TransactionRequest];
}

export interface TxInfo {
  from?: string;
  to?: string;
  amountFrom?: BigNumber;
  amountTo?: BigNumber;
  functionFragment: FunctionFragment;
}
