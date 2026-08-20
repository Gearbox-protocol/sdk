import type { Address, DecodeFunctionDataReturnType } from "viem";
import {
  type AssetsMap,
  type IMidasAdapter,
  MissingSerializedParamsError,
  type OnchainSDK,
  PlaceholderMidasIssuanceVaultAdapterContract,
} from "../../../sdk/index.js";
import { iMidasIssuanceVaultAdapterV310Abi } from "../abi/adapters/index.js";
import { iMidasIssuanceVaultV310Abi } from "../abi/targetContractAbi.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iMidasIssuanceVaultAdapterV310Abi;
type abi = typeof abi;

const protocolAbi = iMidasIssuanceVaultV310Abi;
type protocolAbi = typeof protocolAbi;

export class MidasIssuanceVaultAdapterContract
  extends AbstractAdapterContract<abi, protocolAbi>
  implements IMidasAdapter
{
  #mToken?: Address;
  #referrerId?: string;
  #allowedTokens?: Address[];

  constructor(sdk: OnchainSDK, args: ConcreteAdapterContractOptions) {
    super(sdk, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded =
        PlaceholderMidasIssuanceVaultAdapterContract.decodeSerializedParams(
          args.baseParams.serializedParams,
        );

      this.#mToken = decoded.mToken;
      this.#referrerId = decoded.referrerId;
      this.#allowedTokens = decoded.allowedTokens;
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
