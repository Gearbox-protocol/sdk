import type {
  Abi,
  CallParameters,
  Chain,
  Client,
  Hex,
  Transport,
  UnionOmit,
} from "viem";
import { BaseError, decodeFunctionData, getContractError } from "viem";
import { call } from "viem/actions";
import { getAction, parseAccount } from "viem/utils";

import { generateCastTraceCall, getCastTraceArgs } from "./cast.js";

export type SimulateCallParameters<
  chain extends Chain | undefined = Chain | undefined,
> = CallParameters<chain> & {
  /**
   * ABIs used to decode the function and any custom error, but only when the call reverts.
   * Nothing is appended implicitly: pass `errorAbis` yourself to have gearbox exceptions decoded.
   */
  abis?: readonly (Abi | readonly unknown[])[];
};

/**
 * Same as {@link SimulateCallParameters}, minus the parts a contract knows about itself.
 */
export type SimulateCallOptions<
  chain extends Chain | undefined = Chain | undefined,
> = UnionOmit<SimulateCallParameters<chain>, "to" | "data">;

export interface SimulateCallReturnType {
  /**
   * Raw bytes returned by the call, `0x` when the function returns nothing.
   */
  data: Hex;
}

/**
 * Simulates raw calldata with `eth_call`, without encoding or decoding anything on success.
 *
 * Use it when calldata already exists (for example a {@link RawTx} built by the SDK): the happy
 * path is a pure passthrough, and the calldata is only decoded when the call reverts, to build a
 * viem {@link ContractFunctionExecutionError} out of the revert data.
 *
 * @param client - viem client to call with.
 * @param parameters - viem call parameters, plus the ABIs used for error decoding.
 * @throws {@link SimulationError} when the call reverts or the request fails.
 */
export async function simulateCall<chain extends Chain | undefined>(
  client: Client<Transport, chain>,
  parameters: SimulateCallParameters<chain>,
): Promise<SimulateCallReturnType> {
  const { abis = [], account: account_, ...rest } = parameters;

  // rest-destructuring collapses the union of transaction request types, and viem's variants
  // exclude each other's fee fields, so the flattened object matches none of them
  const request = {
    ...rest,
    account: account_ ? parseAccount(account_) : client.account,
  } as CallParameters;

  try {
    const { data } = await getAction(client, call, "call")(request);
    return { data: data ?? "0x" };
  } catch (e) {
    throw new SimulationError(
      e as Error,
      request,
      abis.flat() as unknown as Abi,
    );
  }
}

export type SimulationErrorType = SimulationError & {
  name: "SimulationError";
};

/**
 * Thrown by {@link simulateCall} when a simulation fails.
 *
 * The viem {@link ContractFunctionExecutionError} built from the revert data is kept as `cause`,
 * so `walk()` still finds `ContractFunctionRevertedError` and its decoded (or raw) revert data.
 */
export class SimulationError extends BaseError {
  /**
   * The call that failed, kept verbatim so that it can be replayed or traced.
   */
  public readonly request: CallParameters;

  constructor(cause: Error, request: CallParameters, abi: Abi) {
    const callData = (request.data ?? "0x") as Hex;
    // decoding the revert data needs only `abi`, so an unrecognised selector still yields
    // a decoded reason: fall back to the selector rather than failing to build the error
    let functionName: string = callData.slice(0, 10);
    let args: readonly unknown[] = [];
    try {
      const decoded = decodeFunctionData({ abi, data: callData });
      functionName = decoded.functionName;
      args = (decoded.args ?? []) as readonly unknown[];
    } catch {}

    const account = request.account;
    super(`simulation of ${functionName} at ${request.to} failed`, {
      cause: getContractError(cause as BaseError, {
        abi,
        address: request.to ?? undefined,
        args,
        functionName,
        sender:
          typeof account === "string"
            ? account
            : (account?.address ?? undefined),
      }),
      name: "SimulationError",
    });

    this.request = request;
  }

  /**
   * Arguments of a `cast call --trace` command replaying this call, for spawning `cast` directly.
   */
  public getCastTraceArgs(rpcUrl?: string): string[] {
    return getCastTraceArgs(this.request, rpcUrl);
  }

  /**
   * Full `cast call --trace` command replaying this call.
   */
  public getCastTraceCall(rpcUrl?: string): string {
    return generateCastTraceCall(this.request, rpcUrl);
  }
}
