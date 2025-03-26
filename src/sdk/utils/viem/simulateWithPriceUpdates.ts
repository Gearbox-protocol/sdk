import type { AbiStateMutability, Narrow } from "abitype";
import type {
  Chain,
  Client,
  ContractFunctionParameters,
  MulticallContracts,
  MulticallParameters,
  MulticallResponse,
  MulticallReturnType,
  Transport,
} from "viem";
import {
  BaseError,
  ContractFunctionRevertedError,
  decodeFunctionData,
  parseAbi,
} from "viem";

import { errorAbis, iUpdatablePriceFeedAbi } from "../../../abi/index.js";
import type { IPriceUpdateTx } from "../../types/index.js";
import { simulateMulticall } from "./simulateMulticall.js";

const multicallTimestampAbi = parseAbi([
  "function getCurrentBlockTimestamp() public view returns (uint256 timestamp)",
]);

const updatePriceFeedAbi = [...iUpdatablePriceFeedAbi, ...errorAbis] as const;
type updatePriceFeedAbi = typeof updatePriceFeedAbi;

export type SimulateWithPriceUpdatesParameters<
  contracts extends readonly unknown[] = readonly ContractFunctionParameters[],
  options extends {
    optional?: boolean;
    properties?: Record<string, any>;
  } = {},
> = MulticallParameters<contracts, false, options> & {
  priceUpdates: IPriceUpdateTx[];
  contracts: MulticallContracts<
    Narrow<contracts>,
    { mutability: AbiStateMutability }
  >;
};

export type SimulateWithPriceUpdatesReturnType<
  contracts extends readonly unknown[] = readonly ContractFunctionParameters[],
  options extends {
    error?: Error;
  } = { error: Error },
> = MulticallReturnType<contracts, false, options>;

export async function simulateWithPriceUpdates<
  const contracts extends readonly unknown[],
  chain extends Chain | undefined,
>(
  client: Client<Transport, chain>,
  parameters: SimulateWithPriceUpdatesParameters<contracts>,
): Promise<SimulateWithPriceUpdatesReturnType<contracts>> {
  const { contracts: restContracts, priceUpdates, ...rest } = parameters;

  if (restContracts.length === 0) {
    throw getSimulateWithPriceUpdatesError(
      new BaseError("no contracts calls provided"),
      priceUpdates,
      restContracts,
    );
  }

  const multicallAddress =
    rest.multicallAddress ?? client?.chain?.contracts?.multicall3?.address;
  if (!multicallAddress) {
    throw new Error(
      "client chain not configured. multicallAddress is required.",
    );
  }

  try {
    const contracts = [
      {
        abi: multicallTimestampAbi,
        address: multicallAddress,
        functionName: "getCurrentBlockTimestamp",
        args: [],
      },
      ...priceUpdates.map(rawTxToMulticallPriceUpdate),
      ...restContracts,
    ] as ContractFunctionParameters[];
    const resp = await simulateMulticall(client, {
      contracts,
      ...rest,
      allowFailure: true,
      batchSize: 0, // we cannot have price updates and compressor request in different batches
    });
    if (resp.some(r => r.status === "failure")) {
      throw getSimulateWithPriceUpdatesError(
        undefined,
        priceUpdates,
        restContracts,
        resp as any,
      );
    }
    const restResults = resp.slice(priceUpdates.length + 1).map(r => r.result);
    return restResults as unknown as SimulateWithPriceUpdatesReturnType<contracts>;
  } catch (e) {
    if (e instanceof SimulateWithPriceUpdatesError) {
      throw e;
    }
    throw getSimulateWithPriceUpdatesError(
      e as Error,
      priceUpdates,
      restContracts,
    );
  }
}

/**
 * Helper method to convert our RawTx into viem's multicall format
 * Involves decoding what was previously encoded, but it's better than adding another method to PriceOracle
 * @param tx
 * @returns
 */
function rawTxToMulticallPriceUpdate({
  raw,
}: IPriceUpdateTx): ContractFunctionParameters<
  updatePriceFeedAbi,
  "nonpayable",
  "updatePrice"
> {
  const { to, callData } = raw;
  const { args, functionName } = decodeFunctionData({
    abi: updatePriceFeedAbi,
    data: callData,
  });
  if (functionName !== "updatePrice") {
    throw new Error(
      `call to function ${functionName} cannot be converted to a price update`,
    );
  }
  return {
    abi: updatePriceFeedAbi,
    address: to,
    functionName,
    args,
  };
}

export function getSimulateWithPriceUpdatesError<
  contracts extends readonly unknown[],
>(
  cause: Error | undefined,
  priceUpdates: IPriceUpdateTx[],
  calls: MulticallContracts<Narrow<contracts>>,
  results?: MulticallReturnType<Narrow<contracts>>,
) {
  // not results provided, error happened before multicall
  if (!results) {
    return new SimulateWithPriceUpdatesError(cause, {
      priceUpdates: priceUpdates.map(p => p.pretty),
      calls: calls.map((c: any) => `${c.address}.${c.functionName}`),
    });
  }
  // try to get timestamp
  const timestamp = results[0]?.result as bigint | undefined;
  const priceUpdatesResults = results.slice(1, 1 + priceUpdates.length);
  const callsResults = results.slice(1 + priceUpdates.length);
  // const priceUpdatesFailed = priceUpdatesResults.some(r => r.status === "failure");
  // const callsFailed = callsResults.some(r => r.status === "failure");

  const prettyPriceUpdates = priceUpdates.map((p, i) => {
    const result = priceUpdatesResults[i];
    let tsValid = timestamp ? p.validateTimestamp(timestamp) : "";
    tsValid = tsValid === "valid" ? "" : `[timestamp ${tsValid}]`;
    return [extractCallError(result), p.pretty, tsValid]
      .filter(Boolean)
      .join(" ");
  });

  const prettyCalls = callsResults.map((c, i) => {
    const call = calls[i] as any;
    return [extractCallError(c), `${call.address}.${call.functionName}`]
      .filter(Boolean)
      .join(" ");
  });

  return new SimulateWithPriceUpdatesError(cause, {
    timestamp,
    priceUpdates: prettyPriceUpdates,
    calls: prettyCalls,
  });
}

function extractCallError(result: MulticallResponse): string {
  if (result.status === "success") {
    return "";
  }
  const err = result.error;
  const error =
    err instanceof BaseError
      ? err.walk(e => e instanceof ContractFunctionRevertedError)
      : undefined;
  if (error instanceof ContractFunctionRevertedError) {
    return "[" + (error.data?.errorName ?? "reverted") + "]";
  }
  return err instanceof BaseError ? `[${err.name}]` : "[error]";
}

export type SimulateWithPriceUpdatesErrorType =
  SimulateWithPriceUpdatesError & {
    name: "SimulateWithPriceUpdatesError";
  };

export interface SimulateWithPriceUpdatesErrorParams {
  timestamp?: bigint;
  priceUpdates: string[];
  calls: string[];
}

export class SimulateWithPriceUpdatesError extends BaseError {
  override cause?: Error;
  public readonly timestamp?: bigint;

  constructor(
    cause: Error | undefined,
    params: SimulateWithPriceUpdatesErrorParams,
  ) {
    const { calls, priceUpdates, timestamp } = params;
    const base = (cause instanceof BaseError ? cause : {}) as BaseError;

    let causeMeta: string[] = base.metaMessages
      ? [...base.metaMessages, " "]
      : [];

    super(
      `simulate multicall with ${priceUpdates.length} price updates failed`,
      {
        cause: base,
        metaMessages: [
          ...causeMeta,
          ...(timestamp
            ? [" ", "Block Timestamp: " + timestamp.toString(), " "]
            : []),
          "Price Updates:",
          ...priceUpdates,
          " ",
          "Calls: ",
          ...calls,
        ].filter(Boolean) as string[],
        name: "SimulateWithPriceUpdatesError",
      },
    );
    this.cause = cause;
    this.timestamp = timestamp;
  }
}
