import type { Abi, Address, Chain, Hex, PublicClient, Transport } from "viem";
import { NOT_DEPLOYED } from "../constants/addresses.js";
import type { MultiCall } from "../types/index.js";
import type { ILogger } from "../types/logger.js";
import { AddressMap } from "../utils/AddressMap.js";
import type { BaseContract } from "./BaseContract.js";
import { TokensMeta } from "./TokensMeta.js";
import type { ParsedCall, ParsedCallV2 } from "./types.js";

/**
 * @internal
 * Conditional type that resolves to `BaseContract<T>` when `T` is an ABI type,
 * or returns `T` unchanged otherwise. Used by register lookup methods to
 * provide strongly-typed contract references.
 */
export type ContractOrInterface<T> = T extends Abi | readonly unknown[]
  ? BaseContract<T>
  : T;

/**
 * Central registry of all known contracts on a single chain.
 *
 * Used to share information between contracts, enables instances of {@link BaseContract} to discover each other
 * This is critical for parsing of calls that involve multiple contracts
 */
export class ChainContractsRegister {
  private readonly contracts = new AddressMap<BaseContract<any>>(
    [],
    "contracts",
  );
  private readonly labels = new AddressMap<string>([], "labels");

  public readonly client: PublicClient<Transport, Chain>;
  /**
   * Shared token metadata (symbol, decimals) for all tokens known on this chain.
   **/
  public readonly tokensMeta: TokensMeta;
  public readonly logger?: ILogger;

  constructor(client: PublicClient<Transport, Chain>, logger?: ILogger) {
    this.client = client;
    this.tokensMeta = new TokensMeta(client, logger);
    this.logger = logger;
  }

  /**
   * Clears all registered contracts, address labels, and token metadata.
   **/
  public resetContracts(): void {
    this.logger?.debug(
      `resetting contacts register with ${this.contracts.size} contracts`,
    );
    this.labels.clear();
    this.contracts.clear();
    this.tokensMeta.reset();
  }

  /**
   * Looks up a contract by address.
   * @param address - On-chain address.
   * @returns The contract wrapper, or `undefined` if not registered.
   */
  public getContract<T = unknown[]>(
    address: Address,
  ): ContractOrInterface<T> | undefined {
    return this.contracts.get(address) as ContractOrInterface<T> | undefined;
  }

  /**
   * Looks up a contract by address, throwing if not found.
   * @param address - On-chain address.
   * @throws If no contract is registered at this address.
   */
  public mustGetContract<T = unknown[]>(
    address: Address,
  ): ContractOrInterface<T> {
    const contract = this.contracts.mustGet(address);
    if (!contract) {
      throw new Error(`contract ${address} not found on chain ${this.chainId}`);
    }
    return contract as ContractOrInterface<T>;
  }

  /**
   * Registers (or replaces) a contract at the given address.
   * @param address - On-chain address.
   * @param contract - Contract wrapper instance.
   */
  public setContract(address: Address, contract: BaseContract<any>): void {
    this.contracts.upsert(address, contract);
  }

  /**
   * Assigns a human-readable label to an address for use in logging and
   * parsed call output.
   * @param address - On-chain address.
   * @param label - Static label string, or a function that receives the
   *   current label and returns a new one.
   */
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

  /**
   * Returns a display string for an address, incorporating its label if one exists.
   * @param address - On-chain address.
   * @param omitAddress - When `true`, returns only the label (no address prefix).
   *   Falls back to the raw address when no label is set.
   */
  public labelAddress(address: Address, omitAddress?: boolean): string {
    const label = this.labels.get(address);
    return label ? (omitAddress ? label : `${address} [${label}]`) : address;
  }

  /**
   * The viem {@link Chain} object for this register's connected client.
   **/
  public get chain(): Chain {
    return this.client.chain;
  }

  /**
   * Numeric chain ID (e.g. `1` for Ethereum mainnet).
   **/
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

  /**
   * Parses calldata for a contract at the given address, preserving original types.
   * When strict is true, throws on unknown address or selector; otherwise returns a fallback.
   */
  public parseFunctionDataV2(
    address: Address,
    calldata: Hex,
    strict?: boolean,
  ): ParsedCallV2 {
    const contract = this.contracts.get(address);
    if (contract) {
      return contract.parseFunctionDataV2(calldata, strict);
    }
    if (strict) {
      throw new Error(`contract ${address} not found on chain ${this.chainId}`);
    }
    const selector = calldata.slice(0, 10) as Hex;
    const data = `0x${calldata.slice(10)}` as Hex;
    return {
      chainId: this.chainId,
      target: address,
      contractType: "",
      label: this.labelAddress(address, true),
      version: 0,
      functionName: `unknown function ${selector}`,
      rawArgs: { _data: data },
    };
  }

  /**
   * Parses multicalls preserving original types.
   * When strict is true, throws on unknown targets or selectors.
   */
  public parseMultiCallV2(
    calls: MultiCall[],
    strict?: boolean,
  ): ParsedCallV2[] {
    return calls.map(call =>
      this.parseFunctionDataV2(call.target, call.callData, strict),
    );
  }
}
