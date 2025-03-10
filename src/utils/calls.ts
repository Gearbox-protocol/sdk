import { MULTICALL_ADDRESS } from "@gearbox-protocol/sdk-gov";
import type { Abi, Address, Hex, PublicClient } from "viem";
import { decodeFunctionResult, encodeFunctionData, multicall3Abi } from "viem";

export interface MinimalTxInfo {
  hash: string;
}

interface ViemMcall {
  address: Address;
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

export type ViemFailableMulticallRes<T> = (
  | {
      error?: undefined;
      result: T;
      status: "success";
    }
  | {
      error: Error;
      result?: undefined;
      status: "failure";
    }
)[];
