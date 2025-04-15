import type {
  AbiStateMutability,
  Address,
  CallParameters,
  Chain,
  Client,
  ContractFunctionParameters,
  ContractFunctionReturnType,
  Hex,
  MulticallContracts,
  MulticallReturnType,
  Narrow,
  Transport,
} from "viem";
import {
  AbiDecodingZeroDataError,
  BaseError,
  decodeFunctionResult,
  encodeFunctionData,
  getChainContractAddress,
  getContractError,
  multicall3Abi,
  RawContractError,
} from "viem";
import { call } from "viem/actions";
import { getAction, parseAccount } from "viem/utils";

export type SimulateMulticallParameters<
  contracts extends readonly unknown[] = readonly ContractFunctionParameters[],
  allowFailure extends boolean = true,
  options extends {
    optional?: boolean;
    properties?: Record<string, any>;
  } = {},
> = Pick<CallParameters, "blockNumber" | "blockTag" | "gas" | "account"> & {
  allowFailure?: allowFailure | boolean | undefined;
  contracts: MulticallContracts<
    Narrow<contracts>,
    { mutability: AbiStateMutability } & options
  >;
  multicallAddress?: Address | undefined;
};

export interface SimulateMulticallReturnType<
  contracts extends readonly unknown[] = readonly ContractFunctionParameters[],
  allowFailure extends boolean = true,
  options extends {
    error?: Error;
  } = { error: Error },
> {
  results: MulticallReturnType<contracts, allowFailure, options>;
  /**
   * Raw multicall request (as in viem's call action)
   */
  request: CallParameters;
}

/**
 * This is "multicall" action from viem, modified to use "simulateContract" instead of "readContract"
 * Unlike viem's multicall there's no batching, since for simulation we assume that calls are dependent
 * @param client
 * @param parameters
 * @returns
 */
export async function simulateMulticall<
  const contracts extends readonly unknown[],
  chain extends Chain | undefined,
  allowFailure extends boolean = true,
>(
  client: Client<Transport, chain>,
  parameters: SimulateMulticallParameters<contracts, allowFailure>,
): Promise<SimulateMulticallReturnType<contracts, allowFailure>> {
  const {
    account: account_,
    allowFailure = true,
    blockNumber,
    blockTag,
    gas,
    multicallAddress: multicallAddress_,
  } = parameters;
  const contracts = parameters.contracts as ContractFunctionParameters[];
  const account = account_ ? parseAccount(account_) : client.account;

  let multicallAddress = multicallAddress_;
  if (!multicallAddress) {
    if (!client.chain)
      throw new Error(
        "client chain not configured. multicallAddress is required.",
      );

    multicallAddress = getChainContractAddress({
      blockNumber,
      chain: client.chain,
      contract: "multicall3",
    });
  }

  interface Aggregate3Call {
    allowFailure: boolean;
    callData: Hex;
    target: Address;
  }

  const calls: Aggregate3Call[] = [];
  for (const contract of contracts) {
    const { abi, address, args, functionName } = contract;
    try {
      const callData = encodeFunctionData({ abi, args, functionName });
      calls.push({
        allowFailure: true,
        callData,
        target: address,
      });
    } catch (err) {
      const error = getContractError(err as BaseError, {
        abi,
        address,
        args,
        docsPath: "/docs/contract/multicall",
        functionName,
      });
      if (!allowFailure) {
        throw error;
      }
      calls.push({
        allowFailure: true,
        callData: "0x" as Hex,
        target: address,
      });
    }
  }

  const calldata = encodeFunctionData({
    abi: multicall3Abi,
    args: [calls],
    functionName: "aggregate3",
  });
  const request: CallParameters = {
    batch: false,
    data: calldata,
    to: multicallAddress!,
    blockNumber,
    blockTag: blockTag as any, // does not infer well that either blockNumber or blockTag must be present
    gas,
    account,
  };

  const results = [];
  let result: ContractFunctionReturnType<
    typeof multicall3Abi,
    AbiStateMutability,
    "aggregate3"
  >;
  try {
    const { data } = await getAction(client, call, "call")(request);

    result = decodeFunctionResult({
      abi: multicall3Abi,
      args: [calls],
      functionName: "aggregate3",
      data: data || "0x",
    });
  } catch (e) {
    if (!allowFailure) {
      throw e;
    }
    for (const _ of contracts) {
      results.push({
        status: "failure",
        error: e,
        result: undefined,
      });
    }
    return {
      results: results as MulticallReturnType<contracts, allowFailure>,
      request,
    };
  }

  for (let j = 0; j < result.length; j++) {
    // Extract the response from `readContract`
    const { returnData, success } = result[j];

    // Extract the request call data from the original call.
    const { callData } = calls[j];

    // Extract the contract config for this call from the `contracts` argument
    // for decoding.
    const { abi, address, functionName, args } = contracts[
      results.length
    ] as ContractFunctionParameters;

    try {
      if (callData === "0x") throw new AbiDecodingZeroDataError();
      if (!success) throw new RawContractError({ data: returnData });
      const result = decodeFunctionResult({
        abi,
        args,
        data: returnData,
        functionName,
      });
      results.push(allowFailure ? { result, status: "success" } : result);
    } catch (err) {
      const error = getContractError(err as BaseError, {
        abi,
        address,
        args,
        docsPath: "/docs/contract/multicall",
        functionName,
      });
      if (!allowFailure) {
        throw error;
      }
      results.push({ error, result: undefined, status: "failure" });
    }
  }

  if (results.length !== contracts.length)
    throw new BaseError("multicall results mismatch");
  return {
    results: results as MulticallReturnType<contracts, allowFailure>,
    request,
  };
}
