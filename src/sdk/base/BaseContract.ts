import type {
  Abi,
  AbiFunction,
  Address,
  Client,
  ContractEventName,
  ContractFunctionName,
  DecodeFunctionDataReturnType,
  EncodeFunctionDataParameters,
  GetContractReturnType,
  Hex,
  Log,
} from "viem";
import { decodeFunctionData, getAddress, getContract, isHex } from "viem";

import { errorAbis } from "../../abi/errors.js";
import { iVersionAbi } from "../../abi/iVersion.js";
import { ADDRESS_0X0 } from "../constants/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { BaseContractStateHuman, ILogger, RawTx } from "../types/index.js";
import {
  bytes32ToString,
  childLogger,
  createRawTx,
  json_stringify,
} from "../utils/index.js";
import type { IAddressLabeller } from "./IAddressLabeller.js";
import { SDKConstruct } from "./SDKConstruct.js";

export interface BaseContractOptions<abi extends Abi | readonly unknown[]> {
  abi: abi;
  addr: Address;
  name?: string;
  version?: number | bigint;
  contractType?: string;
}

export interface IBaseContract {
  address: Address;
  contractType: string;
  version: number;
  name: string;
  dirty: boolean;
}

export abstract class BaseContract<abi extends Abi | readonly unknown[]>
  extends SDKConstruct
  implements IBaseContract
{
  public readonly contract: GetContractReturnType<
    abi,
    { public: Client },
    Address
  >;
  public readonly abi: abi;
  public readonly logger?: ILogger;
  public readonly contractType: string;
  public version: number;

  #name: string;
  #address: Address;

  constructor(sdk: GearboxSDK, args: BaseContractOptions<abi>) {
    super(sdk);
    this.abi = args.abi;
    this.#address = getAddress(args.addr);

    this.contract = getContract({
      address: this.address,
      // add exceptions for better error decoding
      abi: [...this.abi, ...errorAbis],
      client: {
        public: sdk.provider.publicClient,
      },
    }) as any;
    this.version = Number(args.version || 0);
    this.contractType = args.contractType ?? "";
    if (isHex(this.contractType)) {
      this.contractType = bytes32ToString(this.contractType);
    }
    this.name = this.#name = args.name || this.contractType || this.#address;
    this.logger = childLogger(this.name, sdk.logger);

    // register contract by address: this is used for system-wide call parsing
    sdk.contracts.upsert(this.address, this);
  }

  public get address(): Address {
    return this.#address;
  }

  public set address(address: Address) {
    if (this.#address !== ADDRESS_0X0) {
      throw new Error(`Address can't be changed, currently: ${this.#address}`);
    }
    this.#address = getAddress(address);
    this.addressLabels.set(address, this.#name);
  }

  public get name(): string {
    return this.#name;
  }

  public set name(name: string) {
    this.#name = name;
    if (this.#address !== ADDRESS_0X0) {
      this.addressLabels.set(this.#address, name);
    }
  }

  public stateHuman(_ = true): BaseContractStateHuman {
    return {
      address: this.sdk.provider.addressLabels.get(this.address),
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
   * Converts contract calldata to some human-friendly string
   * This is safe function which should not throw
   * @param calldata
   * @returns
   */
  public parseFunctionData(calldata: Hex): string {
    try {
      return this.mustParseFunctionData(calldata);
    } catch (e) {
      const selector = calldata.slice(0, 10);
      this.logger?.warn(
        `error parsing function with selector ${selector} in ${this.name} v${this.version} at ${this.address}: ${e}`,
      );
      return `unknown: ${this.labelAddress(this.address)}.${selector}`;
    }
  }

  public mustParseFunctionData(calldata: Hex): string {
    const decoded = decodeFunctionData({
      abi: this.abi,
      data: calldata,
    });

    const abiItem = (this.abi as Array<AbiFunction>).find(
      abiItem =>
        abiItem!.name === decoded.functionName && abiItem!.type === "function",
    );

    if (!abiItem) {
      return `Unknown function: ${decoded.functionName}`;
    }

    let paramsHuman: Array<string>;
    let humanParams = this.parseFunctionParams(decoded);
    if (humanParams) {
      paramsHuman = humanParams.map((value, i) => {
        return `${abiItem.inputs[i].name}: ${value}`;
      });
    } else if (Array.isArray(decoded.args)) {
      paramsHuman = decoded.args.map((value, i) => {
        return `${abiItem.inputs[i].name}: ${abiItem.inputs[i].type === "address" ? this.addressLabels.get(value) : abiItem.inputs[i].type.startsWith("tuple") ? json_stringify(value) : value}`;
      });
    } else {
      paramsHuman = Object.entries(decoded.args || {}).map(
        ([key, value]) => `${key}: ${value}`,
      );
    }

    return `${this.name}.${decoded.functionName}({${paramsHuman.join(", ")}})`;
  }

  /**
   * Return args and function name from calldata
   * @param calldata
   * @returns
   */
  public parseFunctionDataToObject(calldata: Hex) {
    const decoded = decodeFunctionData({
      abi: this.abi,
      data: calldata,
    });
    return decoded;
  }

  protected parseFunctionParams(
    _params: DecodeFunctionDataReturnType<abi>,
  ): Array<string> | undefined {
    return undefined;
  }

  public async getVersion(): Promise<number> {
    this.version = Number(
      await this.sdk.provider.publicClient.readContract({
        abi: iVersionAbi,
        functionName: "version",
        address: this.address,
      }),
    );

    return this.version;
  }

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

    tx.description = argsDescription || this.parseFunctionData(tx.callData); // `${this.name}.${parameters.functionName}(${argsDescription || (args && args.length > 0) ? args!.join(", ") : ""})`;

    return tx;
  }

  protected get addressLabels(): IAddressLabeller {
    return this.sdk.provider.addressLabels;
  }
}
