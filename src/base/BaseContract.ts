import type {
  Abi,
  AbiFunction,
  Address,
  Client,
  ContractFunctionName,
  DecodeFunctionDataReturnType,
  EncodeFunctionDataParameters,
  GetContractReturnType,
  Hex,
  Log,
} from "viem";
import { decodeFunctionData, getContract } from "viem";

import { iVersionAbi } from "../abi";
import { ADDRESS_0X0 } from "../constants";
import type { GearboxSDK } from "../GearboxSDK";
import type { BaseContractState } from "../state";
import type { ILogger, MultiCall, RawTx } from "../types";
import { childLogger, createRawTx, json_stringify } from "../utils";
import type { IAddressLabeller } from "./IAddressLabeller";
import { SDKConstruct } from "./SDKConstruct";

export interface BaseContractOptions<abi extends Abi | readonly unknown[]> {
  abi: abi;
  address: Address;
  name: string;
  version?: number;
  contractType?: string;
}

export abstract class BaseContract<
  abi extends Abi | readonly unknown[],
> extends SDKConstruct {
  contract: GetContractReturnType<abi, Client, Address>;
  public readonly abi: abi;
  public readonly logger?: ILogger;

  protected static register: Record<Address, BaseContract<any>> = {};

  version: number;
  contractType: string;
  #name: string;
  #address: Address;

  constructor(sdk: GearboxSDK, args: BaseContractOptions<abi>) {
    super(sdk);
    this.abi = args.abi;
    this.#address = args.address.toLowerCase() as Address;

    this.contract = getContract({
      address: this.address,
      abi: this.abi,
      client: {
        public: sdk.provider.publicClient,
      },
    });
    this.#name = args.name || args.contractType || this.#address;
    this.version = args.version || 0;
    this.contractType = args.contractType || "";
    this.logger = childLogger(this.#name, sdk.logger);

    BaseContract.register[this.#address.toLowerCase() as Address] = this;
  }

  get address(): Address {
    return this.#address;
  }

  set address(address: Address) {
    if (this.#address !== ADDRESS_0X0) {
      throw new Error(`Address can't be changed, currently: ${this.#address}`);
    }
    this.#address = address;
    this.addressLabels.set(address, this.#name);
  }

  test_setAddress(address: Address) {
    this.#address = address;
    this.addressLabels.set(address, this.#name);
  }

  get name(): string {
    return this.#name;
  }

  set name(name: string) {
    this.#name = name;
    if (this.#address !== ADDRESS_0X0) {
      this.addressLabels.set(this.#address, name);
    }
  }

  get contractData(): BaseContractState {
    return {
      address: this.address,
      version: this.version,
      contractType: this.contractType,
    };
  }

  public static parseLogs(logs: Array<Log>): void {
    logs.forEach(log => {
      const contract =
        BaseContract.register[log.address.toLowerCase() as Address];
      if (contract) {
        contract.parseLog(log);
      }
    });
  }

  protected parseLog(_log: Log) {}

  protected parseFunctionData(calldata: Hex): string {
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

  parseFunctionParams(
    _params: DecodeFunctionDataReturnType<abi>,
  ): Array<string> | undefined {
    return undefined;
  }

  public static parseMultiCall(calls: Array<MultiCall>): Array<string> {
    return calls.map(call => BaseContract.parse(call.target, call.callData));
  }

  public static parse(address: Address, calldata: Hex): string {
    const contract = BaseContract.register[address.toLowerCase() as Address];
    if (contract) {
      return contract.parseFunctionData(calldata);
    } else {
      throw new Error(`Contract not found: ${address}`);
    }
  }

  async getVersion(): Promise<number> {
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
    this.logger?.debug(tx.description);

    return tx;
  }

  protected get addressLabels(): IAddressLabeller {
    return this.sdk.provider.addressLabels;
  }
}
