import { iPendleRouterAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import {
  type ConstructOptions,
  MissingSerializedParamsError,
} from "../../../sdk/index.js";
import { iPendleRouterAbi } from "../abi/targetContractAbi.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";
import type { PendlePairStatus, PendleTokenType } from "./types.js";

const abi = iPendleRouterAdapterAbi;
type abi = typeof abi;

const protocolAbi = iPendleRouterAbi;
type protocolAbi = typeof protocolAbi;

export class PendleRouterAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #allowedPairs?:
    | {
        market: Address;
        inputToken: Address;
        pendleToken: Address;
        status: PendlePairStatus;
      }[]
    | {
        market: Address;
        inputToken: Address;
        pendleToken: Address;
        pendleTokenType: PendleTokenType;
        status: PendlePairStatus;
      }[];

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const version = Number(args.baseParams.version);
      if (version === 310) {
        const decoded = decodeAbiParameters(
          [
            { type: "address", name: "creditManager" },
            { type: "address", name: "targetContract" },
            {
              type: "tuple[]",
              name: "allowedPairs",
              components: [
                { type: "address", name: "market" },
                { type: "address", name: "inputToken" },
                { type: "address", name: "pendleToken" },
                { type: "uint8", name: "status" },
              ],
            },
          ],
          args.baseParams.serializedParams,
        );

        this.#allowedPairs = decoded[2].map(pair => ({
          market: pair.market,
          inputToken: pair.inputToken,
          pendleToken: pair.pendleToken,
          status: pair.status as PendlePairStatus,
        }));
      } else {
        const decoded = decodeAbiParameters(
          [
            { type: "address", name: "creditManager" },
            { type: "address", name: "targetContract" },
            {
              type: "tuple[]",
              name: "allowedPairs",
              components: [
                { type: "address", name: "market" },
                { type: "address", name: "inputToken" },
                { type: "address", name: "pendleToken" },
                { type: "uint8", name: "pendleTokenType" },
                { type: "uint8", name: "status" },
              ],
            },
          ],
          args.baseParams.serializedParams,
        );

        this.#allowedPairs = decoded[2].map(pair => ({
          market: pair.market,
          inputToken: pair.inputToken,
          pendleToken: pair.pendleToken,
          pendleTokenType: pair.pendleTokenType as PendleTokenType,
          status: pair.status as PendlePairStatus,
        }));
      }
    }
  }

  get allowedPairs():
    | {
        market: Address;
        inputToken: Address;
        pendleToken: Address;
        status: PendlePairStatus;
      }[]
    | {
        market: Address;
        inputToken: Address;
        pendleToken: Address;
        pendleTokenType: PendleTokenType;
        status: PendlePairStatus;
      }[] {
    if (!this.#allowedPairs)
      throw new MissingSerializedParamsError("allowedPairs");
    return this.#allowedPairs;
  }
}
