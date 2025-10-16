import { createRawTx } from "../../sdk/utils/index.js";
import type { RawTx } from "../../sdk/types/index.js";
import {
  Abi,
  AbiFunction,
  Address,
  Client,
  ContractEventArgs,
  ContractEventName,
  ContractFunctionName,
  decodeFunctionData,
  DecodeFunctionDataReturnType,
  EncodeFunctionDataParameters,
  getContract,
  GetContractEventsReturnType,
  GetContractReturnType,
  Hex,
  PublicClient,
} from "viem";
import { CrossChainCall, ParsedCall } from "../core/proposal";
// import { createRawTx, EncodeFunctionDataParams } from "../core/raw-tx";
import { decodeFunctionWithNamedArgs } from "../utils/abi-decoder";

export class BaseContract<const abi extends Abi | readonly unknown[]> {
  public readonly abi: abi;
  public readonly address: Address;
  public readonly name: string;
  protected static register: Record<Address, BaseContract<any>> = {};

  protected contract: GetContractReturnType<abi, Client, Address>;
  public readonly client: PublicClient;

  constructor(abi: abi, address: Address, client: PublicClient, name: string) {
    this.abi = abi;
    this.client = client;
    this.address = address.toLowerCase() as Address;
    this.name = name;
    this.contract = getContract({
      address: address,
      abi: abi,
      client: client,
    });
    BaseContract.register[this.address] = this;
  }

  public static parseCall(call: CrossChainCall): ParsedCall {
    const parsedCall = BaseContract.parse(call.target, call.callData);
    return {
      ...parsedCall,
      chainId: call.chainId,
    };
  }

  public static parse(address: Address, calldata: Hex): ParsedCall {
    const contract = BaseContract.register[address.toLowerCase() as Address];
    if (contract) {
      return contract.parseFunctionData(calldata);
    } else {
      return {
        chainId: 0,
        target: address,
        label: "Unknown contract",
        functionName: `Unknown function: ${calldata}`,
        args: {},
      };
    }
  }

  parseFunctionData(calldata: Hex): ParsedCall {
    // Use the shared utility to decode with named arguments
    const decodedWithNames = decodeFunctionWithNamedArgs(this.abi, calldata);

    if (!decodedWithNames) {
      return {
        chainId: 0,
        target: this.address,
        label: this.name,
        functionName: `Unknown function: ${calldata}`,
        args: {},
      };
    }

    // Check if there's a specific parser for this function
    const specParsed = this.parseFunctionParams(
      decodedWithNames.originalDecoded
    );
    if (specParsed) {
      return specParsed;
    }

    return this.wrapParseCall(
      decodedWithNames.originalDecoded,
      decodedWithNames.args
    );
  }

  protected wrapParseCall(
    params: DecodeFunctionDataReturnType<abi>,
    parsedParams: Record<string, string>
  ): ParsedCall {
    return {
      chainId: 0,
      target: this.address,
      label: this.name,
      functionName: params.functionName,
      args: parsedParams,
    };
  }

  parseFunctionParams(
    params: DecodeFunctionDataReturnType<abi>
  ): ParsedCall | undefined {
    return undefined;
  }

  public createRawTx<
    functionName extends ContractFunctionName<abi> | undefined = undefined
  >(
    parameters: Omit<EncodeFunctionDataParameters<abi, functionName>, "abi"> & {
      description?: string;
    }
  ): RawTx {
    const { description: argsDescription } = parameters;

    const tx = createRawTx<abi, functionName>(
      this.address,
      {
        abi: this.abi,
        ...parameters,
      } as unknown as EncodeFunctionDataParameters<abi, functionName>,
      argsDescription
    );

    tx.description =
      parameters.description ||
      argsDescription ||
      this.stringifyParsedCall(this.parseFunctionData(tx.callData));

    return tx;
  }

  protected stringifyParsedCall(parsedCall: ParsedCall): string {
    const argsStr = Object.entries(parsedCall.args)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    return `${parsedCall.label}.${parsedCall.functionName}(${argsStr})`;
  }

  public async getEvents<EventName extends ContractEventName<abi>>(
    eventName: EventName,
    fromBlock: bigint,
    toBlock: bigint,
    args?:
      | ContractEventArgs<
          abi,
          EventName extends ContractEventName<abi>
            ? EventName
            : ContractEventName<abi>
        >
      | undefined,
    chunkSize?: number
  ): Promise<
    GetContractEventsReturnType<abi, EventName, undefined, bigint, bigint>
  > {
    if (chunkSize) {
      const chunkSizeBigint = BigInt(chunkSize);

      const getEventPromises = [];
      for (let i = fromBlock; i < toBlock; i += chunkSizeBigint) {
        getEventPromises.push(
          this.client.getContractEvents({
            address: this.address,
            fromBlock: i,
            toBlock: i + chunkSizeBigint,
            abi: this.abi,
            eventName,
            args,
          })
        );
      }
      const events = (await Promise.all(getEventPromises)).flat();
      return events;
    }

    try {
      const events = await this.client.getContractEvents({
        address: this.address,
        fromBlock,
        toBlock,
        abi: this.abi,
        eventName,
        args,
      });
      return events;
    } catch (e) {
      const blockRangeErrors = [
        "query exceeds max block",
        "range is too large",
        "eth_getLogs is limited to",
        "Unable to perform request",
        "Block range limit exceeded",
      ];

      if (
        e instanceof Error &&
        blockRangeErrors.some((errorText) => e.message.includes(errorText))
      ) {
        const middle = (fromBlock + toBlock) / 2n;
        const [firstHalfEvents, secondHalfEvents] = await Promise.all([
          this.getEvents(eventName, fromBlock, middle, args),
          this.getEvents(eventName, middle + 1n, toBlock, args),
        ]);
        return [...firstHalfEvents, ...secondHalfEvents];
      }
      throw e;
    }
  }

  public getContract(): GetContractReturnType<abi, Client, Address> {
    return this.contract;
  }
}
