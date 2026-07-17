import { type Address, decodeAbiParameters, type Hex } from "viem";
import {
  type ConstructOptions,
  MissingSerializedParamsError,
} from "../../../sdk/index.js";
import { iMidasGatewayAdapterAbi } from "../abi/index.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

// TODO: not yet merged into integrations-v3/main branch
const abi = iMidasGatewayAdapterAbi;
type abi = typeof abi;

const protocolAbi = iMidasGatewayAdapterAbi;
type protocolAbi = typeof protocolAbi;

export class MidasGatewayAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #gateway?: Address;
  #mToken?: Address;
  #quoteToken?: Address;
  #phantomToken?: Address;
  #referralId?: Hex;
  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "gateway" },
          { type: "address", name: "mToken" },
          { type: "address", name: "quoteToken" },
          { type: "address", name: "phantomToken" },
          { type: "bytes32", name: "referralId" },
        ],
        args.baseParams.serializedParams,
      );

      this.#gateway = decoded[2];
      this.#mToken = decoded[3];
      this.#quoteToken = decoded[4];
      this.#phantomToken = decoded[5];
      this.#referralId = decoded[6];
    }
  }

  get gateway(): Address {
    if (!this.#gateway) throw new MissingSerializedParamsError("gateway");
    return this.#gateway;
  }

  get mToken(): Address {
    if (!this.#mToken) throw new MissingSerializedParamsError("mToken");
    return this.#mToken;
  }

  get quoteToken(): Address {
    if (!this.#quoteToken) throw new MissingSerializedParamsError("quoteToken");
    return this.#quoteToken;
  }

  get phantomToken(): Address {
    if (!this.#phantomToken)
      throw new MissingSerializedParamsError("phantomToken");
    return this.#phantomToken;
  }

  get referralId(): Hex {
    if (!this.#referralId) throw new MissingSerializedParamsError("referralId");
    return this.#referralId;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      gateway: this.#gateway ? this.labelAddress(this.#gateway) : undefined,
      mToken: this.#mToken ? this.labelAddress(this.#mToken) : undefined,
      quoteToken: this.#quoteToken
        ? this.labelAddress(this.#quoteToken)
        : undefined,
      phantomToken: this.#phantomToken
        ? this.labelAddress(this.#phantomToken)
        : undefined,
      referralId: this.#referralId,
    };
  }
}
