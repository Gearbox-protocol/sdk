import type { AbiStateMutability, Address, Narrow } from "abitype";
import type {
  Chain,
  Client,
  ContractFunctionParameters,
  MulticallContracts,
  MulticallParameters,
  MulticallReturnType,
  Transport,
} from "viem";
import {
  BaseError,
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
  decodeFunctionData,
} from "viem";

import { errorAbis, iUpdatablePriceFeedAbi } from "../../../abi/index.js";
import type { IPriceUpdateTx } from "../../types/index.js";
import { hexEq } from "../hex.js";
import { simulateMulticall } from "./simulateMulticall.js";

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
    throw new SimulateWithPriceUpdatesError(
      new BaseError("no contracts calls provided"),
      priceUpdates,
      restContracts,
    );
  }

  try {
    const contracts = [
      ...priceUpdates.map(rawTxToMulticallPriceUpdate),
      ...restContracts,
    ] as const;

    const resp = await simulateMulticall(client, {
      contracts,
      ...rest,
      allowFailure: false,
      batchSize: 0, // we cannot have price updates and compressor request in different batches
    });
    const restResults = resp.slice(priceUpdates.length);
    return restResults as unknown as SimulateWithPriceUpdatesReturnType<contracts>;
  } catch (e) {
    throw new SimulateWithPriceUpdatesError(
      e as BaseError,
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

export type SimulateWithPriceUpdatesErrorType<
  contracts extends readonly unknown[],
> = SimulateWithPriceUpdatesError<contracts> & {
  name: "SimulateWithPriceUpdatesError";
};

export class SimulateWithPriceUpdatesError<
  contracts extends readonly unknown[],
> extends BaseError {
  override cause: Error;

  public readonly priceUpdates: IPriceUpdateTx[];
  public readonly calls: MulticallContracts<Narrow<contracts>>;

  constructor(
    cause: Error,
    priceUpdates: IPriceUpdateTx[],
    calls: MulticallContracts<Narrow<contracts>>,
  ) {
    let failedPriceFeed: Address = "0x0";

    const base = (cause instanceof BaseError ? cause : {}) as BaseError;

    let causeMeta: string[] = base.metaMessages
      ? [...base.metaMessages, " "]
      : [];

    if (
      base instanceof ContractFunctionExecutionError &&
      base.functionName === "updatePrice"
    ) {
      failedPriceFeed = base.contractAddress ?? "0x0";
      causeMeta = [
        `simulate multicall with ${priceUpdates.length} price updates failed`,
        " ",
      ];
      const updateRevert =
        cause instanceof BaseError
          ? (cause.walk(
              err => err instanceof ContractFunctionRevertedError,
            ) as ContractFunctionRevertedError)
          : undefined;
      if (updateRevert) {
        causeMeta = [
          `simulate multicall with ${priceUpdates.length} price updates failed: ${updateRevert.metaMessages?.[0]}`,
          " ",
        ];
      }
    }

    const priceUpdatesMeta = [
      "Price Updates:",
      ...priceUpdates.map(
        u =>
          `${hexEq(u.data.priceFeed, failedPriceFeed) ? "[FAILED] " : ""}${u.pretty}`,
      ),
    ];

    const callsMeta = [
      "Calls:",
      ...calls.map((c: any) => `${c.address}.${c.functionName}`),
    ];

    super(
      `simulate multicall with ${priceUpdates.length} price updates failed`,
      {
        cause: base,
        metaMessages: [...causeMeta, ...priceUpdatesMeta, ...callsMeta].filter(
          Boolean,
        ) as string[],
        name: "SimulateWithPriceUpdatesError",
      },
    );
    this.cause = cause;
    this.priceUpdates = priceUpdates;
    this.calls = calls;
  }
}
