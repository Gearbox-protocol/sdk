import { iCurveV1_3AssetsAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import {
  type ConstructOptions,
  MissingSerializedParamsError,
  type ParsedCallV2,
} from "../../../sdk/index.js";
import { iCurvePool_3Abi, iCurvePoolAbi } from "../abi/targetContractAbi.js";
import type {
  LegacyAdapterOperation,
  Transfers,
} from "../legacyAdapterOperations.js";
import { classifyCurveOperation } from "../transferHelpers.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iCurveV1_3AssetsAdapterAbi;
type abi = typeof abi;

const protocolAbi = [...iCurvePoolAbi, ...iCurvePool_3Abi] as const;
type protocolAbi = typeof protocolAbi;

export class Curve3AssetsAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #token?: Address;
  #lpToken?: Address;
  #metapoolBase?: Address;
  #use256?: boolean;
  #tokens?: [Address, Address, Address];
  #underlyings?: [Address, Address, Address, Address];

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
          { type: "bool", name: "use256" },
          { type: "address[3]", name: "tokens" },
          { type: "address[4]", name: "underlyings" },
        ],
        args.baseParams.serializedParams,
      );

      this.#token = decoded[2];
      this.#lpToken = decoded[3];
      this.#metapoolBase = decoded[4];
      this.#use256 = decoded[5];
      this.#tokens = [decoded[6][0], decoded[6][1], decoded[6][2]];
      this.#underlyings = [
        decoded[7][0],
        decoded[7][1],
        decoded[7][2],
        decoded[7][3],
      ];
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

  get use256(): boolean {
    if (this.#use256 === undefined)
      throw new MissingSerializedParamsError("use256");
    return this.#use256;
  }

  get tokens(): [Address, Address, Address] {
    if (!this.#tokens) throw new MissingSerializedParamsError("tokens");
    return this.#tokens;
  }

  get underlyings(): [Address, Address, Address, Address] {
    if (!this.#underlyings)
      throw new MissingSerializedParamsError("underlyings");
    return this.#underlyings;
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
