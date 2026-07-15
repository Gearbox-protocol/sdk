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
import { iMellowClaimerAdapterAbi } from "../abi/adapters/index.js";
import { iMellowClaimerAbi } from "../abi/targetContractAbi.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iMellowClaimerAdapterAbi;
type abi = typeof abi;

const protocolAbi = iMellowClaimerAbi;
type protocolAbi = typeof protocolAbi;

export class MellowClaimerAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #allowedMultiVaults?: Address[];

  constructor(sdk: OnchainSDK, args: ConcreteAdapterContractOptions) {
    super(sdk, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address[]", name: "allowedMultiVaults" },
        ],
        args.baseParams.serializedParams,
      );

      this.#allowedMultiVaults = [...decoded[2]];
    }
  }

  get allowedMultiVaults(): Address[] {
    if (!this.#allowedMultiVaults)
      throw new MissingSerializedParamsError("allowedMultiVaults");
    return this.#allowedMultiVaults;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      allowedMultiVaults: this.#allowedMultiVaults?.map(v =>
        this.labelAddress(v),
      ),
    };
  }

  protected override applyBalanceChanges(
    balances: AssetsMap,
    decoded: DecodeFunctionDataReturnType<abi>,
  ): void {
    switch (decoded.functionName) {
      // pure "accept" of transferred pending assets, coupled with a Mellow
      // withdrawal request: it moves no ERC-20s, and the withdrawal phantom
      // token effect is credited by the storeExpectedBalances bracket delta
      // built from the compressor's outputs
      case "multiAccept":
        break;
      case "withdrawPhantomToken": {
        const [token, amount] = decoded.args;
        this.spendExact(balances, token, amount);
        break;
      }
      // TODO:
      // `multiAcceptAndClaim` (the claim call emitted by the withdrawal
      // compressor) cannot be previewed offline: the burn amount IS in
      // calldata (`maxAssets` == the compressor's `withdrawalTokenSpent`),
      // but the withdrawal phantom token to debit cannot be resolved from
      // the `multiVault` argument. The on-chain adapter only serializes
      // (creditManager, targetContract, allowedMultiVaults) and drops its
      // `phantomTokenToMultiVault` mapping (unlike Midas/Kelp adapters,
      // which serialize aligned token/phantom arrays). Resolving it would
      // require DelayedWithdrawalPlugin state (WithdrawableAsset maps
      // multiVault -> withdrawalPhantomToken) or a contract-side
      // `serialize()` fix.
      default:
        super.applyBalanceChanges(balances, decoded);
    }
  }
}
