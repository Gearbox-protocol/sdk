import { iMidasIssuanceVaultAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import {
  type ConstructOptions,
  MissingSerializedParamsError,
} from "../../../sdk/index.js";
import { iMidasIssuanceVaultAbi } from "../abi/targetContractAbi.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iMidasIssuanceVaultAdapterAbi;
type abi = typeof abi;

const protocolAbi = iMidasIssuanceVaultAbi;
type protocolAbi = typeof protocolAbi;

export class MidasIssuanceVaultAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #mToken?: Address;
  #referrerId?: string;
  #allowedTokens?: Address[];

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "mToken" },
          { type: "bytes32", name: "referrerId" },
          { type: "address[]", name: "allowedTokens" },
        ],
        args.baseParams.serializedParams,
      );

      this.#mToken = decoded[2];
      this.#referrerId = decoded[3];
      this.#allowedTokens = [...decoded[4]];
    }
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

  get allowedTokens(): Address[] {
    if (!this.#allowedTokens)
      throw new MissingSerializedParamsError("allowedTokens");
    return this.#allowedTokens;
  }
}
