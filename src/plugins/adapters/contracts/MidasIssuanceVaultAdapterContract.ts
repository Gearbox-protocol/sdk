import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
} from "viem";
import {
  type AssetsMap,
  MissingSerializedParamsError,
  type OnchainSDK,
} from "../../../sdk/index.js";
import { iMidasIssuanceVaultAdapterV310Abi } from "../abi/adapters/index.js";
import { iMidasIssuanceVaultV310Abi } from "../abi/targetContractAbi.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iMidasIssuanceVaultAdapterV310Abi;
type abi = typeof abi;

const protocolAbi = iMidasIssuanceVaultV310Abi;
type protocolAbi = typeof protocolAbi;

export class MidasIssuanceVaultAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #mToken?: Address;
  #referrerId?: string;
  #allowedTokens?: Address[];

  constructor(sdk: OnchainSDK, args: ConcreteAdapterContractOptions) {
    super(sdk, { ...args, abi, protocolAbi });

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

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      mToken: this.#mToken ? this.labelAddress(this.#mToken) : undefined,
      referrerId: this.#referrerId,
      allowedTokens: this.#allowedTokens?.map(t => this.labelAddress(t)),
    };
  }

  protected override async applyBalanceChanges(
    balances: AssetsMap,
    decoded: DecodeFunctionDataReturnType<abi>,
  ): Promise<void> {
    switch (decoded.functionName) {
      case "depositInstantDiff": {
        const [tokenIn, leftoverAmount] = decoded.args;
        this.setLeftover(balances, tokenIn, leftoverAmount);
        break;
      }
      default:
        await super.applyBalanceChanges(balances, decoded);
    }
  }
}
