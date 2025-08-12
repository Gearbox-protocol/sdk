import type {
  Account,
  Chain,
  Client,
  SendTransactionRequest,
  SendTransactionReturnType,
  Transport,
} from "viem";
import { type SendTransactionParameters, sendTransaction } from "viem/actions";
import { getAction } from "viem/utils";
import type { RawTx } from "../../types/index.js";

export type SendRawTxParameters<
  chain extends Chain | undefined,
  account extends Account | undefined,
  request extends SendTransactionRequest<chain, chainOverride>,
  chainOverride extends Chain | undefined = undefined,
> = Omit<
  SendTransactionParameters<chain, account, chainOverride, request>,
  "data" | "to" | "value"
> & {
  tx: Pick<RawTx, "to" | "callData" | "value">;
};

export async function sendRawTx<
  chain extends Chain | undefined,
  account extends Account | undefined,
  const request extends SendTransactionRequest<chain, chainOverride>,
  chainOverride extends Chain | undefined,
>(
  client: Client<Transport, chain, account>,
  params: SendRawTxParameters<chain, account, request, chainOverride>,
): Promise<SendTransactionReturnType> {
  const { tx, ...rest } = params;
  return getAction(
    client,
    sendTransaction,
    "sendTransaction",
  )({
    ...(rest as any),
    data: tx.callData,
    to: tx.to,
    value: BigInt(tx.value),
  }) as Promise<SendTransactionReturnType>;
}
