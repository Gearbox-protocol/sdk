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
  #referralId?: Hex;
  #allowedInputTokens?: Address[];
  #allowedTokens?: { token: Address; phantomToken: Address }[];

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "gateway" },
          { type: "address", name: "mToken" },
          { type: "bytes32", name: "referralId" },
          { type: "address[]", name: "allowedInputTokens" },
          { type: "address[]", name: "allowedOutputTokens" },
          { type: "address[]", name: "allowedPhantomTokens" },
        ],
        args.baseParams.serializedParams,
      );

      this.#gateway = decoded[2];
      this.#mToken = decoded[3];
      this.#referralId = decoded[4];
      this.#allowedInputTokens = decoded[5].map(token => token as Address);
      this.#allowedTokens = decoded[6].map((token, index) => ({
        token,
        phantomToken: decoded[7][index],
      }));
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

  get allowedTokens(): { token: Address; phantomToken: Address }[] {
    if (!this.#allowedTokens)
      throw new MissingSerializedParamsError("allowedTokens");
    return this.#allowedTokens;
  }

  get referralId(): Hex {
    if (!this.#referralId) throw new MissingSerializedParamsError("referralId");
    return this.#referralId;
  }

  get allowedInputTokens(): Address[] {
    if (!this.#allowedInputTokens)
      throw new MissingSerializedParamsError("allowedInputTokens");
    return this.#allowedInputTokens;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      gateway: this.#gateway ? this.labelAddress(this.#gateway) : undefined,
      mToken: this.#mToken ? this.labelAddress(this.#mToken) : undefined,
      referralId: this.#referralId,
      allowedInputTokens: this.#allowedInputTokens?.map(token =>
        this.labelAddress(token),
      ),
      allowedTokens: this.#allowedTokens?.map(t => ({
        token: this.labelAddress(t.token),
        phantomToken: this.labelAddress(t.phantomToken),
      })),
    };
  }
}
