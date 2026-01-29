import type { Abi, Address, Chain, Hex, PublicClient, Transport } from "viem";
import { NOT_DEPLOYED } from "../constants/addresses.js";
import type { MultiCall } from "../types/index.js";
import type { ILogger } from "../types/logger.js";
import { AddressMap } from "../utils/AddressMap.js";
import type { BaseContract } from "./BaseContract.js";
import { TokensMeta } from "./TokensMeta.js";
import type { ParsedCall } from "./types.js";

export type ContractOrInterface<T> = T extends Abi | readonly unknown[]
  ? BaseContract<T>
  : T;

export class ChainContractsRegister {
  static #chains = new Map<number, ChainContractsRegister>();

  public static for(
    client: PublicClient<Transport, Chain>,
    logger?: ILogger,
  ): ChainContractsRegister {
    const chainId = client.chain.id;
    let result = ChainContractsRegister.#chains.get(chainId);
    if (!result) {
      result = new ChainContractsRegister(client, logger);
      ChainContractsRegister.#chains.set(chainId, result);
    }
    return result;
  }

  private readonly contracts = new AddressMap<BaseContract<any>>(
    [],
    "contracts",
  );
  private readonly labels = new AddressMap<string>([], "labels");

  public readonly client: PublicClient<Transport, Chain>;
  /**
   * Token metadata such as symbol and decimals
   */
  public readonly tokensMeta: TokensMeta;
  public readonly logger?: ILogger;

  constructor(client: PublicClient<Transport, Chain>, logger?: ILogger) {
    this.client = client;
    this.tokensMeta = new TokensMeta(client);
    this.logger = logger;
  }

  public resetContracts(): void {
    this.logger?.debug(
      `resetting contacts register with ${this.contracts.size} contracts`,
    );
    this.labels.clear();
    this.contracts.clear();
    this.tokensMeta.reset();
  }

  public getContract<T = unknown[]>(
    address: Address,
  ): ContractOrInterface<T> | undefined {
    return this.contracts.get(address) as ContractOrInterface<T> | undefined;
  }

  public mustGetContract<T = unknown[]>(
    address: Address,
  ): ContractOrInterface<T> {
    const contract = this.contracts.mustGet(address);
    if (!contract) {
      throw new Error(`contract ${address} not found on chain ${this.chainId}`);
    }
    return contract as ContractOrInterface<T>;
  }

  public setContract(address: Address, contract: BaseContract<any>): void {
    this.contracts.upsert(address, contract);
  }

  public setAddressLabel(
    address: Address,
    label: string | ((oldLabel?: string) => string),
  ): void {
    if (address === NOT_DEPLOYED) {
      return;
    }
    if (typeof label === "string") {
      this.labels.upsert(address, label);
    } else {
      this.labels.upsert(address, label(this.labels.get(address)));
    }
  }

  public labelAddress(address: Address, omitAddress?: boolean): string {
    const label = this.labels.get(address);
    return label ? (omitAddress ? label : `${address} [${label}]`) : address;
  }

  public get chain(): Chain {
    return this.client.chain;
  }

  public get chainId(): number {
    return this.client.chain.id;
  }

  /**
   * Converts contract call into some human-friendly string
   * This method is safe and should not throw
   * @param address
   * @param calldata
   * @returns
   */
  public stringifyFunctionData(address: Address, calldata: Hex): string {
    const contract = this.contracts.get(address);
    return contract
      ? contract.stringifyFunctionData(calldata)
      : `unknown: ${address}.${calldata.slice(0, 10)}`;
  }

  /**
   * Converts multicalls into some human-friendly strings
   * This method is safe and should not throw
   * @param address
   * @param calldata
   * @returns
   */
  public stringifyMultiCall(calls: MultiCall[]): string[] {
    return calls.map(call =>
      this.stringifyFunctionData(call.target, call.callData),
    );
  }

  /**
   * Return args, function, type and address name from contract call
   * @param address
   * @param calldata
   * @returns
   */
  public parseFunctionData(address: Address, calldata: Hex): ParsedCall {
    const contract = this.mustGetContract(address);
    return contract.parseFunctionData(calldata);
  }

  /**
   * Converts multicalls into call info
   * @param address
   * @param calldata
   * @returns
   */
  public parseMultiCall(calls: MultiCall[]): ParsedCall[] {
    return calls.map(call =>
      this.parseFunctionData(call.target, call.callData),
    );
  }
}
