import { JsonRpcSigner, Signer } from "ethers";

import { MetamaskError } from "../core/errors";
import {
  ContractMethodArgs,
  StateMutability,
  TypedContractMethod,
} from "../types/common";

export async function callRepeater<T>(
  call: () => Promise<T>,
  step = 0,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    call()
      .then(r => resolve(r))
      .catch(e => {
        console.error(`Error ${step}: ${e}`);
        if (step > 5 || (e as MetamaskError).code !== -32000) {
          reject(e);
        } else {
          setTimeout(() => resolve(callRepeater(call, step + 1)), 200);
        }
      });
  });
}

export interface MinimalTxInfo {
  hash: string;
}

export async function makeTransactionCall<
  A extends Array<any> = Array<any>,
  R = any,
  S extends StateMutability = "payable",
>(
  m: TypedContractMethod<A, R, S>,
  args: ContractMethodArgs<A, S>,
  signer: JsonRpcSigner | Signer,
) {
  const tx = await m.populateTransaction(...args);

  if ("sendUncheckedTransaction" in signer) {
    const hash = await signer.sendUncheckedTransaction(tx);
    const r: MinimalTxInfo = { hash };
    return r;
  }

  return await signer.sendTransaction(tx);
}
