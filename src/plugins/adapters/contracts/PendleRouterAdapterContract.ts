import { iPendleRouterAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import {
  type ConstructOptions,
  MissingSerializedParamsError,
} from "../../../sdk/index.js";
import { iPendleRouterAbi } from "../abi/targetContractAbi.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

export enum PendleTokenType {
  PT = 0,
  LP = 1,
}

export enum PendlePairStatus {
  NOT_ALLOWED = 0,
  ALLOWED = 1,
  EXIT_ONLY = 2,
}

const abi = iPendleRouterAdapterAbi;
type abi = typeof abi;

const protocolAbi = iPendleRouterAbi;
type protocolAbi = typeof protocolAbi;

export interface PendlePair {
  market: Address;
  inputToken: Address;
  pendleToken: Address;
  pendleTokenType?: PendleTokenType;
  status: PendlePairStatus;
}

export class PendleRouterAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #allowedPairs?: PendlePair[];

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

  get allowedPairs(): PendlePair[] {
    if (!this.#allowedPairs)
      throw new MissingSerializedParamsError("allowedPairs");
    return this.#allowedPairs;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      allowedPairs: this.#allowedPairs?.map(p => ({
        market: this.labelAddress(p.market),
        inputToken: this.labelAddress(p.inputToken),
        pendleToken: this.labelAddress(p.pendleToken),
        pendleTokenType: p.pendleTokenType,
        status: p.status,
      })),
    };
  }
}
