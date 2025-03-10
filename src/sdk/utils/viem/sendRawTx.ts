import type {
  Account,
  Chain,
  Client,
  SendTransactionReturnType,
  Transport,
} from "viem";
import { sendTransaction } from "viem/actions";
import { getAction } from "viem/utils";

import type { RawTx } from "../../types";

export interface SendRawTxParameters {
  account?: Account;
  tx: RawTx;
}

export async function sendRawTx<
  chain extends Chain | undefined = Chain | undefined,
>(
  client: Client<Transport, chain, Account | undefined>,
  params: SendRawTxParameters,
): Promise<SendTransactionReturnType> {
  const { account, tx } = params;
  return getAction(
    client,
    sendTransaction,
    "sendTransaction",
  )({
    // @ts-expect-error
    account,
    data: tx.callData,
    to: tx.to,
    value: BigInt(tx.value),
  }) as Promise<SendTransactionReturnType>;
}
