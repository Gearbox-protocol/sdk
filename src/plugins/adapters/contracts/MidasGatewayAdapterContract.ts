import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
} from "viem";
import {
  type AddressMap,
  type ConstructOptions,
  MissingSerializedParamsError,
} from "../../../sdk/index.js";
import {
  iMidasGatewayAdapterV311Abi,
  iMidasGatewayV311Abi,
} from "../abi/adapters/index.js";
import type { DiffLeftover } from "../types.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iMidasGatewayAdapterV311Abi;
type abi = typeof abi;

const protocolAbi = iMidasGatewayV311Abi;
type protocolAbi = typeof protocolAbi;

export class MidasGatewayAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #gateway?: Address;
  #mToken?: Address;
  #referrerId?: string;
  #allowedInputTokens?: Address[];
  #allowedOutputTokens?: { token: Address; phantomToken: Address }[];

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "gateway" },
          { type: "address", name: "mToken" },
          { type: "bytes32", name: "referrerId" },
          { type: "address[]", name: "allowedInputTokens" },
          { type: "address[]", name: "allowedOutputTokens" },
          { type: "address[]", name: "allowedPhantomTokens" },
        ],
        args.baseParams.serializedParams,
      );

      this.#gateway = decoded[2];
      this.#mToken = decoded[3];
      this.#referrerId = decoded[4];
      this.#allowedInputTokens = [...decoded[5]];
      this.#allowedOutputTokens = decoded[6].map((token, index) => ({
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

  get referrerId(): string {
    if (this.#referrerId === undefined)
      throw new MissingSerializedParamsError("referrerId");
    return this.#referrerId;
  }

  get allowedInputTokens(): Address[] {
    if (!this.#allowedInputTokens)
      throw new MissingSerializedParamsError("allowedInputTokens");
    return this.#allowedInputTokens;
  }

  get allowedOutputTokens(): { token: Address; phantomToken: Address }[] {
    if (!this.#allowedOutputTokens)
      throw new MissingSerializedParamsError("allowedOutputTokens");
    return this.#allowedOutputTokens;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      gateway: this.#gateway ? this.labelAddress(this.#gateway) : undefined,
      mToken: this.#mToken ? this.labelAddress(this.#mToken) : undefined,
      referrerId: this.#referrerId,
      allowedInputTokens: this.#allowedInputTokens?.map(t =>
        this.labelAddress(t),
      ),
      allowedOutputTokens: this.#allowedOutputTokens?.map(t => ({
        token: this.labelAddress(t.token),
        phantomToken: this.labelAddress(t.phantomToken),
      })),
    };
  }

  protected override decodeDiffLeftovers(
    decoded: DecodeFunctionDataReturnType<abi>,
    balances: AddressMap<bigint>,
  ): DiffLeftover[] {
    switch (decoded.functionName) {
      case "depositInstantDiff": {
        const [tokenIn, leftoverAmount] = decoded.args;
        return [{ tokenIn, leftoverAmount }];
      }
      // redemptions spend the mToken down to the leftover, tokenOut arg is
      // the received token
      case "redeemInstantDiff":
      case "redeemRequestDiff": {
        const [, leftoverAmount] = decoded.args;
        return [{ tokenIn: this.mToken, leftoverAmount }];
      }
      default:
        return super.decodeDiffLeftovers(decoded, balances);
    }
  }
}
