import type {
  Abi,
  AbiFunction,
  Address,
  Chain,
  ContractEventName,
  ContractFunctionName,
  DecodeFunctionDataReturnType,
  EncodeFunctionDataParameters,
  GetAbiItemParameters,
  GetContractReturnType,
  Hex,
  Log,
  PublicClient,
  Transport,
} from "viem";
import {
  BaseError,
  type ContractEventArgs,
  decodeFunctionData,
  type GetContractEventsReturnType,
  getAbiItem,
  getAddress,
  getContract,
  isHex,
} from "viem";

import { errorAbis } from "../../abi/errors.js";
import type { BaseContractStateHuman, RawTx } from "../types/index.js";
import {
  bytes32ToString,
  createRawTx,
  functionArgsToMap,
  json_stringify,
} from "../utils/index.js";
import { Construct, type ConstructOptions } from "./Construct.js";
import type { IBaseContract, ParsedCall, ParsedCallArgs } from "./types.js";

export interface BaseContractArgs<abi extends Abi | readonly unknown[]> {
  abi: abi;
  addr: Address;
  name?: string;
  version?: number | bigint;
  contractType?: string;
}

export interface ContractParseErrorOptions {
  address: Address;
  callData: Hex;
  contractName?: string;
}

export class ContractParseError extends BaseError {
  public readonly address: Address;
  public readonly callData: Hex;
  public readonly selector: Hex;

  constructor(cause: Error, options: ContractParseErrorOptions) {
    const { address, callData, contractName } = options;
    const selector = callData.slice(0, 10) as Hex;
    super(
      `failed to parse function data for ${contractName ?? "unknown contract"} at ${address} with selector ${selector}`,
      {
        cause,
      },
    );
    this.callData = callData;
    this.selector = selector;
    this.address = address;
  }
}

export class BaseContract<abi extends Abi | readonly unknown[]>
  extends Construct
  implements IBaseContract
{
  public readonly contract: GetContractReturnType<
    abi,
    PublicClient<Transport, Chain>,
    Address
  >;
  public readonly abi: abi;
  public readonly contractType: string;
  public readonly version: number;
  public readonly address: Address;
  public readonly name: string;

  constructor(
    { client, logger }: ConstructOptions,
    args: BaseContractArgs<abi>,
  ) {
    super({ client, logger });
    this.abi = args.abi;
    this.address = getAddress(args.addr);

    this.contract = getContract({
      address: this.address,
      // add exceptions for better error decoding
      abi: [...this.abi, ...errorAbis],
      client,
    }) as any;
    this.version = Number(args.version || 0);
    this.contractType = args.contractType ?? "";
    if (isHex(this.contractType)) {
      this.contractType = bytes32ToString(this.contractType);
    }
    this.name =
      args.name || this.contractType || this.address || this.constructor.name;

    // register contract by address: this is used for chain-wide call parsing
    this.register.setContract(this.address, this);
    this.register.setAddressLabel(this.address, this.name);
  }

  public stateHuman(_ = true): BaseContractStateHuman {
    return {
      address: this.labelAddress(this.address),
      version: this.version,
      contractType: this.contractType,
    };
  }

  /**
   * Updates (or not) contract's internal state from event
   * @param _log
   */
  public processLog(
    _log: Log<
      bigint,
      number,
      false,
      undefined,
      undefined,
      abi,
      ContractEventName<abi>
    >,
  ): void {}

  /**
   * Return parsed args and function name from calldata belonging to this contract
   * Target of the call is always this contract, but args can be parsed into calls to other contracts (de-facto recursive ParsedCall)
   * @param calldata
   * @returns
   */
  public parseFunctionData(calldata: Hex): ParsedCall {
    try {
      return this.mustParseFunctionData(calldata);
    } catch (e) {
      this.logger?.warn(e);
      return {
        chainId: this.chainId,
        target: this.address,
        contractType: this.contractType,
        label: this.name,
        functionName: `Unknown function: ${calldata}`,
        args: {},
      };
    }
  }

  /**
   * Same as {@link parseFunctionData}, but throws {@link ContractParseError} if error occurs
   * @param callData
   * @returns
   */
  public mustParseFunctionData(callData: Hex): ParsedCall {
    try {
      const decoded = decodeFunctionData({
        abi: this.abi,
        data: callData,
      });
      return this.wrapParseCall(
        decoded.functionName,
        this.parseFunctionParams(decoded),
      );
    } catch (e) {
      throw new ContractParseError(e as Error, {
        address: this.address,
        callData,
        contractName: this.name,
      });
    }
  }

  /**
   * Parses viem-decoded contract function arguments to a map of named arguments
   * This default implementation uses abi-based parsing, you can override it,
   * but use this super implementation as fallback
   * @param params
   * @returns
   */
  protected parseFunctionParams(
    params: DecodeFunctionDataReturnType<abi>,
  ): ParsedCallArgs {
    return functionArgsToMap(this.abi, params.functionName, params.args);
  }

  /**
   * Converts contract calldata to some human-friendly string
   * This is safe function which should not throw
   * @param calldata
   * @returns
   */
  public stringifyFunctionData(calldata: Hex): string {
    try {
      return this.mustStringifyFunctionData(calldata);
    } catch (e) {
      const selector = calldata.slice(0, 10);
      this.logger?.warn(
        `error parsing function with selector ${selector} in ${this.name} v${this.version} at ${this.address}: ${e}`,
      );
      return `unknown: ${this.labelAddress(this.address)}.${selector}`;
    }
  }

  /**
   * Same as {@link stingifyFunctionData}, but throws if error occurs
   * @param calldata
   * @returns
   */
  public mustStringifyFunctionData(calldata: Hex): string {
    const decoded = decodeFunctionData({
      abi: this.abi,
      data: calldata,
    });

    const abiItem = getAbiItem({
      abi: this.abi,
      name: decoded.functionName,
      args: decoded.args,
    } as GetAbiItemParameters);

    if (!abiItem || abiItem.type !== "function") {
      return `Unknown function: ${decoded.functionName}`;
    }

    const params = this.stringifyFunctionParams(decoded).map(
      (v, i) => `${abiItem.inputs[i].name}: ${v}`,
    );

    return `${this.name}.${decoded.functionName}({${params.join(", ")}})`;
  }

  /**
   * Pretty-prints values of function arguments (do not include parameter names)
   * Can be overriden in classes, but use this super implementation as fallback
   *
   * @param decoded - Function arguments decoded by viem
   * @returns
   */
  protected stringifyFunctionParams(
    decoded: DecodeFunctionDataReturnType<abi>,
  ): string[] {
    const abiItem = getAbiItem({
      abi: this.abi,
      name: decoded.functionName,
      args: decoded.args,
    } as GetAbiItemParameters) as AbiFunction;
    if (Array.isArray(decoded.args)) {
      return decoded.args.map((v, i) => {
        return abiItem.inputs[i].type === "address"
          ? this.labelAddress(v)
          : abiItem.inputs[i].type.startsWith("tuple")
            ? json_stringify(v)
            : `${v}`;
      });
    }
    return Object.entries(decoded.args || {}).map(v => `${v}`);
  }

  protected wrapParseCall(
    functionName: string,
    args: Record<string, string>,
  ): ParsedCall {
    return {
      chainId: this.chainId,
      target: this.address,
      contractType: this.contractType,
      label: this.register.labelAddress(this.address),
      functionName,
      args,
    };
  }

  /**
   * Creates a raw transaction for a function in this contract
   * @param parameters
   * @returns
   */
  public createRawTx<
    functionName extends ContractFunctionName<abi> | undefined = undefined,
  >(
    parameters: Omit<EncodeFunctionDataParameters<abi, functionName>, "abi"> & {
      description?: string;
    },
  ): RawTx {
    const { description: argsDescription } = parameters;

    const tx = createRawTx<abi, functionName>(
      this.address,
      {
        ...parameters,
        abi: this.abi,
      } as EncodeFunctionDataParameters<abi, functionName>,
      argsDescription,
    );

    tx.description = argsDescription || this.stringifyFunctionData(tx.callData);

    return tx;
  }

  /**
   * Get events in safe manner, by bisecting block range if needed
   *
   * @deprecated TODO: this should be moved to viem transport
   *
   * @param eventName
   * @param fromBlock
   * @param toBlock
   * @param args
   * @param chunkSize
   * @returns
   */
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
    chunkSize?: number,
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
          }),
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
        blockRangeErrors.some(errorText => e.message.includes(errorText))
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
}
