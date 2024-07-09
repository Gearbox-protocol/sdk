import { MULTICALL_ADDRESS } from "@gearbox-protocol/sdk-gov";
import { JsonRpcSigner, Signer } from "ethers";
import {
  Abi,
  Address,
  decodeFunctionResult,
  encodeFunctionData,
  Hex,
  multicall3Abi,
  PublicClient,
} from "viem";

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

interface ViemMcall {
  address: string;
  abi: Abi;
  functionName: string;
  args: Array<any>;
}

interface MultiCallStruct {
  target: Address;
  callData: Hex;
  allowFailure: boolean;
}

/**
 * Like multicall from sdk, but uses tryAggregate instead of aggregate
 * @param calls
 * @param p
 * @param overrides
 * @returns
 */
export async function staticMulticallViem<
  V = any,
  T extends ViemMcall = ViemMcall,
>(
  calls: T[],
  publicClient: PublicClient,
): Promise<Array<{ error?: Error; value?: V }>> {
  if (!calls.length) {
    return [];
  }

  const { result } = await publicClient.simulateContract({
    address: MULTICALL_ADDRESS,
    abi: multicall3Abi,
    functionName: "aggregate3",
    args: [
      calls.map((p): MultiCallStruct => {
        return {
          target: p.address as Address,
          callData: encodeFunctionData({
            functionName: p.functionName,
            args: p.args,
            abi: p.abi,
          }),
          allowFailure: true,
        };
      }),
    ],
    gas: 550_000_000n,
  });

  return (result as Array<{ success: boolean; returnData: Hex }>).map(
    (d, num) => {
      let value: V | undefined;
      let error: Error | undefined;

      if (d.success) {
        try {
          const c = calls[num];
          const r = decodeFunctionResult({
            functionName: c.functionName,
            abi: c.abi,
            data: d.returnData,
          });

          value = unwrapArray(r);
        } catch (e) {
          if (e instanceof Error) {
            error = e;
          } else {
            error = new Error(`${e}`);
          }
        }
      } else {
        error = new Error("multicall call failed");
      }
      return { error, value };
    },
  );
}

function unwrapArray<V>(data: unknown): V {
  if (!data) {
    return data as V;
  }
  if (Array.isArray(data)) {
    return data.length === 1 ? data[0] : data;
  }
  return data as V;
}
