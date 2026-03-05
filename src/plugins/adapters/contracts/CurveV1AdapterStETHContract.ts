import { iCurveV1_2AssetsAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import {
  type ConstructOptions,
  MissingSerializedParamsError,
  type ParsedCallV2,
} from "../../../sdk/index.js";
import { iCurvePool_2Abi, iCurvePoolAbi } from "../abi/targetContractAbi.js";
import type {
  LegacyAdapterOperation,
  Transfers,
} from "../legacyAdapterOperations.js";
import { classifyCurveOperation } from "../transferHelpers.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iCurveV1_2AssetsAdapterAbi;
type abi = typeof abi;

const protocolAbi = [...iCurvePoolAbi, ...iCurvePool_2Abi] as const;
type protocolAbi = typeof protocolAbi;

export class CurveV1AdapterStETHContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #token?: Address;
  #lpToken?: Address;
  #metapoolBase?: Address;
  #nCoins?: number;
  #use256?: boolean;
  #tokens?: [Address, Address];

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "token" },
          { type: "address", name: "lpToken" },
          { type: "address", name: "metapoolBase" },
          { type: "uint256", name: "nCoins" },
          { type: "bool", name: "use256" },
          { type: "address[2]", name: "tokens" },
        ],
        args.baseParams.serializedParams,
      );

      this.#token = decoded[2];
      this.#lpToken = decoded[3];
      this.#metapoolBase = decoded[4];
      this.#nCoins = Number(decoded[5]);
      this.#use256 = decoded[6];
      this.#tokens = [decoded[7][0], decoded[7][1]];
    }
  }

  get token(): Address {
    if (!this.#token) throw new MissingSerializedParamsError("token");
    return this.#token;
  }

  get lpToken(): Address {
    if (!this.#lpToken) throw new MissingSerializedParamsError("lpToken");
    return this.#lpToken;
  }

  get metapoolBase(): Address {
    if (!this.#metapoolBase)
      throw new MissingSerializedParamsError("metapoolBase");
    return this.#metapoolBase;
  }

  get nCoins(): number {
    if (!this.#nCoins) throw new MissingSerializedParamsError("nCoins");
    return this.#nCoins;
  }

  get use256(): boolean {
    if (this.#use256 === undefined)
      throw new MissingSerializedParamsError("use256");
    return this.#use256;
  }

  get tokens(): [Address, Address] {
    if (!this.#tokens) throw new MissingSerializedParamsError("tokens");
    return this.#tokens;
  }

  /** @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type.go#L132-L164 */
  protected override classifyLegacyOperation(
    parsed: ParsedCallV2,
    transfers: Transfers,
  ): LegacyAdapterOperation {
    return (
      classifyCurveOperation(parsed.functionName, transfers) ??
      super.classifyLegacyOperation(parsed, transfers)
    );
  }
}
