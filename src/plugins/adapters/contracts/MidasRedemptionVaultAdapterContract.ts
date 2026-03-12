import {
  iMidasRedemptionVaultAdapterAbi,
  iMidasRedemptionVaultGatewayAbi,
} from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import {
  type ConstructOptions,
  MissingSerializedParamsError,
} from "../../../sdk/index.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iMidasRedemptionVaultAdapterAbi;
type abi = typeof abi;

const protocolAbi = iMidasRedemptionVaultGatewayAbi;
type protocolAbi = typeof protocolAbi;

export class MidasRedemptionVaultAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #gateway?: Address;
  #mToken?: Address;
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
          { type: "address[]", name: "allowedTokens" },
          { type: "address[]", name: "allowedPhantomTokens" },
        ],
        args.baseParams.serializedParams,
      );

      this.#gateway = decoded[2];
      this.#mToken = decoded[3];
      this.#allowedTokens = decoded[4].map((token, index) => ({
        token,
        phantomToken: decoded[5][index],
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
}
