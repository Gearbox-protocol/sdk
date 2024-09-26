import type { Address } from "@gearbox-protocol/sdk-gov";
import { ADDRESS_0X0 } from "@gearbox-protocol/sdk-gov";
import type {
  Abi,
  AbiFunction,
  Client,
  ContractFunctionName,
  DecodeFunctionDataReturnType,
  EncodeFunctionDataParameters,
  GetContractReturnType,
  Hex,
  Log,
} from "viem";
import { decodeFunctionData, getContract } from "viem";

import type { MultiCall, RawTx } from "../../core/transactions";
import type { EncodeFunctionDataParams } from "../../core/types";
import type { Provider } from "../../deployer/Provider";
import { iVersionAbi } from "../../generated";
import { json_stringify } from "../../utils/bigint-serializer";
import { createRawTx } from "../../utils/create-raw-tx";
import type { BaseContractState } from "../state/state";
import type { IAddressLabeller } from "./IAddressLabeller";

export abstract class BaseContract<const abi extends Abi | readonly unknown[]> {
  contract: GetContractReturnType<abi, Client, Address>;
  readonly abi: abi;

  protected static register: Record<Address, BaseContract<any>> = {};

  version: number;
  contractType: string;
  #name: string;
  #address: Address;
  v3: Provider;

  static contractByAddress(address: Address): BaseContract<any> {
    return BaseContract.register[address.toLowerCase() as Address];
  }

  constructor(args: {
    abi: abi;
    address: Address;
    chainClient: Provider;
    name: string;
    version?: number;
    contractType?: string;
  }) {
    this.abi = args.abi;
    this.#address = args.address.toLowerCase() as Address;

    this.contract = getContract({
      address: this.address,
      abi: this.abi,
      client: {
        public: args.chainClient.publicClient,
        wallet: args.chainClient.walletClient,
      },
    });

    this.v3 = args.chainClient;
    this.name = args.name || args.contractType || this.#address;
    this.version = args.version || 0;
    this.contractType = args.contractType || "";

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

  protected parseLog(log: Log) {}

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
    params: DecodeFunctionDataReturnType<abi>,
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
      await this.v3.publicClient.readContract({
        abi: iVersionAbi,
        functionName: "version",
        address: this.address,
      }),
    );

    return this.version;
  }

  public createRawTx<
    functionName extends ContractFunctionName<abi> | undefined = undefined,
  >(parameters: EncodeFunctionDataParams<abi, functionName>): RawTx {
    const { args, description: argsDescription } =
      parameters as EncodeFunctionDataParams;

    const tx = createRawTx<abi, functionName>(
      this.address,
      {
        abi: this.abi,
        ...parameters,
      } as unknown as EncodeFunctionDataParameters<abi, functionName>,
      argsDescription,
    );

    tx.description = argsDescription || this.parseFunctionData(tx.callData); // `${this.name}.${parameters.functionName}(${argsDescription || (args && args.length > 0) ? args!.join(", ") : ""})`;
    this.v3.logger.debug(tx.description);

    return tx;
  }

  /**
   * Expose this as getter for ease of refactoring
   */
  public get addressLabels(): IAddressLabeller {
    return this.v3.addressLabels;
  }
}
