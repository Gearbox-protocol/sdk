import {
  type AbiParameter,
  type Address,
  type DecodeFunctionDataReturnType,
  encodeAbiParameters,
  formatUnits,
  type Hex,
  hexToString,
  type PublicClient,
  recoverTypedDataAddress,
} from "viem";
import type { RawTx } from "../../sdk/types/index.js";
import { json_stringify } from "../../sdk/utils/index.js";
import { iPriceFeedStoreAbi } from "../abi";
import type {
  InputValueParams,
  ParsedCall,
  PriceFeed,
  PriceFeedParams,
} from "../core";
import { PRICE_FEED_STORE } from "../utils";
import { BaseContract } from "./base-contract";
import { priceFeedSetupParams } from "./pricefeeds";
import type { PriceUpdate } from "./types";

const abi = iPriceFeedStoreAbi;

export class PriceFeedStoreContract extends BaseContract<typeof abi> {
  chainId: number;

  constructor(address: Address, client: PublicClient, chainId: number = 1) {
    super(abi, address, client, "PriceFeedStore");
    this.chainId = chainId;
  }

  async getZeroPriceFeed(): Promise<Address> {
    const result = await this.contract.read.zeroPriceFeed();
    return result;
  }

  async getAllowedPriceFeeds(
    fromBlock: bigint,
    toBlock: bigint,
  ): Promise<Array<{ token: Address; priceFeed: Address }>> {
    const events = await this.getEvents("AllowPriceFeed", fromBlock, toBlock);

    return events.map(e => ({
      token: e.args.token! as Address,
      priceFeed: e.args.priceFeed! as Address,
    }));
  }

  async getTokenPriceFeedsMap(): Promise<
    ReadonlyArray<{ token: Address; priceFeeds: ReadonlyArray<Address> }>
  > {
    const tokenPriceFeedsMap = await this.contract.read.getTokenPriceFeedsMap();
    return tokenPriceFeedsMap;
  }

  async getAddPriceFeedEvents(
    fromBlock: bigint,
    toBlock: bigint,
  ): Promise<Array<{ priceFeed: Address; stalenessPeriod: number }>> {
    const events = await this.getEvents("AddPriceFeed", fromBlock, toBlock);

    const result = [];

    for (const e of events) {
      result.push({
        priceFeed: e.args.priceFeed! as Address,
        stalenessPeriod: Number(e.args.stalenessPeriod!),
      });
    }

    return result;
  }

  async getNewPriceFeeds(
    fromBlock: bigint,
    toBlock: bigint,
  ): Promise<Array<PriceFeed>> {
    const events = await this.getAddPriceFeedEvents(fromBlock, toBlock);

    const priceFeedInfo = await Promise.all(
      events.map(event => this.contract.read.priceFeedInfo([event.priceFeed])),
    );

    return priceFeedInfo.map((info, index) => ({
      address: events[index].priceFeed as Address,
      contractType: hexToString(info.priceFeedType, { size: 32 }),
      version: Number(info.version),
      deployedBy: this.address,
      stalenessPeriod: info.stalenessPeriod,
      name: info.name,
      isInStore: true,
      parameters: {},
    }));
  }

  async getStalenessPeriodUpdates(
    fromBlock: bigint,
    toBlock: bigint,
  ): Promise<Array<{ priceFeed: Address; stalenessPeriod: number }>> {
    const events = await this.getEvents(
      "SetStalenessPeriod",
      fromBlock,
      toBlock,
    );

    return events.map(e => ({
      priceFeed: e.args.priceFeed! as Address,
      stalenessPeriod: Number(e.args.stalenessPeriod!),
    }));
  }

  async getOwner(): Promise<Address> {
    const result = await this.contract.read.owner();
    return result;
  }

  async getPriceFeeds(token: Address): Promise<Address[]> {
    const result = await this.contract.read.getPriceFeeds([token]);
    return result as Address[];
  }

  async getStalenessPeriod(priceFeed: Address): Promise<number> {
    const result = await this.contract.read.getStalenessPeriod([priceFeed]);
    return result;
  }

  async isAllowedPriceFeed(
    token: Address,
    priceFeed: Address,
  ): Promise<boolean> {
    const result = await this.contract.read.isAllowedPriceFeed([
      token,
      priceFeed,
    ]);
    return result;
  }

  computeEIP712ExternalPriceFeedDigest(
    priceFeed: Address,
    name: string,
    stalenessPeriod: number,
    chainId?: number,
  ) {
    return {
      domain: this.getEIP712Domain(chainId),
      types: {
        ExternalPriceFeed: [
          { name: "priceFeed", type: "address" },
          { name: "name", type: "string" },
          { name: "stalenessPeriod", type: "uint256" },
        ],
      },
      primaryType: "ExternalPriceFeed",
      message: {
        priceFeed: priceFeed.toLowerCase() as Address,
        name,
        stalenessPeriod: BigInt(stalenessPeriod),
      },
    } as const;
  }
  private getEIP712Domain(chainId?: number) {
    return {
      name: PRICE_FEED_STORE,
      version: "310",
      chainId: chainId ?? this.chainId,
      verifyingContract: this.address,
    };
  }

  async recoverExternalPriceFeedSigner(
    priceFeed: Address,
    name: string,
    stalenessPeriod: number,
    signature: Hex,
    chainId?: number,
  ) {
    const digest = this.computeEIP712ExternalPriceFeedDigest(
      priceFeed,
      name,
      stalenessPeriod,
      chainId,
    );

    // Recover signer from signature
    return await recoverTypedDataAddress({
      ...digest,
      signature,
    });
  }

  async getKnownTokens(): Promise<Address[]> {
    const result = await this.contract.read.getKnownTokens();
    return result as Address[];
  }

  async getKnownPriceFeeds(): Promise<Address[]> {
    const result = await this.contract.read.getKnownPriceFeeds();
    return result as Address[];
  }

  async isKnownPriceFeed(priceFeed: Address): Promise<boolean> {
    const result = await this.contract.read.isKnownPriceFeed([priceFeed]);
    return result;
  }

  async encodeConstructorParams(
    contractType: string,
    version: number,
    data: Record<string, InputValueParams>,
  ): Promise<Hex> {
    const types: AbiParameter[] = [];
    const values: (
      | string
      | number
      | bigint
      | boolean
      | Address
      | Address[]
      | [Address, bigint][]
    )[] = [];

    let flattenedAddresses: Address[] = [];
    let flattenedPeriods: bigint[] = [];

    const params = priceFeedSetupParams.find(
      p => p.contractType === contractType && p.version === version,
    )?.constructorParams;

    if (!params) {
      throw new Error("Params not found");
    }

    for (let i = 0; i < params.length; i++) {
      const param = params[i];

      if (param.type.type === "pricefeedParamsFlattened") {
        // Collect all consecutive pricefeedParamsFlattened parameters
        const p = data[param.label] as PriceFeedParams;
        flattenedAddresses.push(p.address);
        flattenedPeriods.push(BigInt(p.stalenessPeriod));

        // Check if next parameter is also pricefeedParamsFlattened
        if (
          i + 1 < params.length &&
          params[i + 1].type.type === "pricefeedParamsFlattened"
        ) {
          continue; // Continue collecting flattened parameters
        }

        // We've reached the end of consecutive pricefeedParamsFlattened parameters
        // Now encode all collected flattened parameters
        if (flattenedAddresses.length > 0) {
          for (const addr of flattenedAddresses) {
            types.push({ type: "address" });
            values.push(addr);
          }
          for (const period of flattenedPeriods) {
            types.push({ type: "uint32" });
            values.push(period);
          }
          // Reset for next sequence
          flattenedAddresses = [];
          flattenedPeriods = [];
        }
        continue;
      }

      switch (param.type.type) {
        case "address":
        case "bytes32":
        case "string":
          types.push({ type: param.type.type });
          values.push(data[param.label] as string);
          break;
        case "uint256":
        case "int256":
        case "uint32":
          types.push({ type: param.type.type });
          values.push(BigInt(data[param.label] as string | number));
          break;
        case "uint8":
          types.push({ type: param.type.type });
          values.push(Number(data[param.label] as string | number));
          break;
        case "bool":
          types.push({ type: param.type.type });
          values.push(data[param.label] as boolean);
          break;
        case "owner":
          types.push({ type: "address" });
          values.push(this.address);
          break;
        case "pricefeedParamsFixed":
        case "pricefeedParamsVariable": {
          const structType =
            param.type.type === "pricefeedParamsFixed"
              ? `tuple[${param.type.qty}]`
              : `tuple[]`;

          const structData: [Address, bigint][] = Array.from(
            {
              length: param.type.qty,
            },
            (_, i) => {
              const key = `${param.label}-${i}`;
              const priceFeedParams = data[key] as PriceFeedParams | undefined;

              if (!priceFeedParams) {
                if (param.type.type === "pricefeedParamsFixed") {
                  throw new Error(`${key} not found`);
                } else {
                  return undefined;
                }
              }
              return [
                priceFeedParams.address,
                BigInt(priceFeedParams.stalenessPeriod),
              ];
            },
          ).filter(d => !!d) as [Address, bigint][];

          types.push({
            type: structType,
            components: [{ type: "address" }, { type: "uint256" }],
          });
          values.push(structData);

          break;
        }
        case "addressArrayFixed": {
          const arrayData: Address[] = Array.from(
            {
              length: param.type.qty,
            },
            (_, i) => {
              const key = `${param.label}-${i}`;
              const address = data[key] as Address | undefined;

              if (!address) {
                throw new Error(`${key} not found`);
              }
              return address;
            },
          ).filter(d => !!d) as Address[];

          types.push({
            type: `address[${param.type.qty}]`,
          });
          values.push(arrayData);

          break;
        }
        case "lowerbound": {
          const lowerbound = await param.type.getter(data, this.client);
          types.push({ type: "uint256" });
          values.push((lowerbound * 99n) / 100n);
          break;
        }
      }
    }

    return encodeAbiParameters(types, values) as Hex;
  }

  updatePricesTx(updates: { priceFeed: Address; data: Hex }[]): RawTx {
    return this.createRawTx({
      functionName: "updatePrices",
      args: [updates],
    });
  }

  addPriceFeedTx(
    priceFeed: Address,
    stalenessPeriod: number,
    name: string,
  ): RawTx {
    return this.createRawTx({
      functionName: "addPriceFeed",
      args: [priceFeed, stalenessPeriod, name],
    });
  }

  removePriceFeedTx(priceFeed: Address): RawTx {
    return this.createRawTx({
      functionName: "removePriceFeed",
      args: [priceFeed],
    });
  }

  allowPriceFeedTx(token: Address, priceFeed: Address): RawTx {
    return this.createRawTx({
      functionName: "allowPriceFeed",
      args: [token, priceFeed],
    });
  }

  setStalenessPeriodTx(priceFeed: Address, stalenessPeriod: number): RawTx {
    return this.createRawTx({
      functionName: "setStalenessPeriod",
      args: [priceFeed, stalenessPeriod],
    });
  }

  updatePrices(updates: PriceUpdate[]): RawTx {
    return this.createRawTx({
      functionName: "updatePrices",
      args: [updates],
    });
  }

  configurePriceFeeds(priceFeeds: { target: Address; callData: Hex }[]): RawTx {
    return this.createRawTx({
      functionName: "configurePriceFeeds",
      args: [priceFeeds],
    });
  }

  async getPriceFeedsInfo(priceFeeds: Address[]): Promise<PriceFeed[]> {
    if (priceFeeds.length === 0) {
      return [];
    }

    const multicallCalls = priceFeeds.map(priceFeed => ({
      address: this.address,
      abi: this.abi,
      functionName: "priceFeedInfo",
      args: [priceFeed],
    }));

    // Execute multicall to get all price feed info at once
    const results = await this.client.multicall({
      contracts: multicallCalls,
    });

    // Transform results into PriceFeed objects
    return results.map((result, index) => {
      if (result.status === "failure") {
        throw new Error(
          `Failed to get price feed info for ${priceFeeds[index]}: ${result.error}`,
        );
      }

      const info = result.result as unknown as {
        priceFeedType: Hex;
        version: bigint;
        stalenessPeriod: bigint;
        name: string;
      };

      return {
        address: priceFeeds[index],
        contractType: hexToString(info.priceFeedType, { size: 32 }),
        version: Number(info.version),
        deployedBy: this.address,
        stalenessPeriod: Number(info.stalenessPeriod),
        name: info.name,
        isInStore: true,
        parameters: {},
      };
    });
  }

  parseFunctionParams(
    params: DecodeFunctionDataReturnType<typeof abi>,
  ): ParsedCall | undefined {
    switch (params.functionName) {
      case "configurePriceFeeds": {
        const [priceFeedCalls] = params.args;
        const calls = [];
        for (const priceFeedCall of priceFeedCalls) {
          // TODO: this is a temporary solution, we need to make general solution
          const selector = priceFeedCall.callData.slice(0, 10).toLowerCase();
          if (selector === "0xbc489a65") {
            calls.push({
              target: priceFeedCall.target,
              functionName: "setLimiter",
              args: {
                lowerBound: formatUnits(
                  BigInt("0x" + priceFeedCall.callData.slice(10)),
                  18, // TODO: use decimals returned by getScale()
                ), // uint256 formatted with 18 decimals
              },
            });
          } else {
            calls.push({
              target: priceFeedCall.target,
              callData: priceFeedCall.callData,
            });
          }
        }
        return {
          chainId: 0,
          target: this.address,
          label: this.name,
          functionName: params.functionName,
          args: { calls: json_stringify(calls) },
        };
      }

      default:
        return undefined;
    }
  }
}
