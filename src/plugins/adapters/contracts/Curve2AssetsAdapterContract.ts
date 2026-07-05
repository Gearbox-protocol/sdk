import { iCurveV1_2AssetsAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import {
  type ConstructOptions,
  MissingSerializedParamsError,
} from "../../../sdk/index.js";
import { iCurvePool_2Abi, iCurvePoolAbi } from "../abi/targetContractAbi.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractCurveAdapterContract } from "./AbstractCurveAdapter.js";

const abi = iCurveV1_2AssetsAdapterAbi;
type abi = typeof abi;

const protocolAbi = [...iCurvePoolAbi, ...iCurvePool_2Abi] as const;
type protocolAbi = typeof protocolAbi;

export class Curve2AssetsAdapterContract extends AbstractCurveAdapterContract<
  abi,
  protocolAbi
> {
  #token?: Address;
  #lpToken?: Address;
  #metapoolBase?: Address;
  #use256?: boolean;
  #tokens?: [Address, Address];
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
          { type: "address[2]", name: "tokens" },
          { type: "address[4]", name: "underlyings" },
        ],
        args.baseParams.serializedParams,
      );

      this.#token = decoded[2];
      this.#lpToken = decoded[3];
      this.#metapoolBase = decoded[4];
      this.#use256 = decoded[5];
      this.#tokens = [decoded[6][0], decoded[6][1]];
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

  get tokens(): [Address, Address] {
    if (!this.#tokens) throw new MissingSerializedParamsError("tokens");
    return this.#tokens;
  }

  get underlyings(): [Address, Address, Address, Address] {
    if (!this.#underlyings)
      throw new MissingSerializedParamsError("underlyings");
    return this.#underlyings;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      token: this.#token ? this.labelAddress(this.#token) : undefined,
      lpToken: this.#lpToken ? this.labelAddress(this.#lpToken) : undefined,
      metapoolBase: this.#metapoolBase
        ? this.labelAddress(this.#metapoolBase)
        : undefined,
      use256: this.#use256,
      tokens: this.#tokens?.map(t => this.labelAddress(t)),
      underlyings: this.#underlyings?.map(t => this.labelAddress(t)),
    };
  }
}
