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

  protected override async applyBalanceChanges(
    balances: AssetsMap,
    decoded: DecodeFunctionDataReturnType<abi>,
  ): Promise<void> {
    switch (decoded.functionName) {
      // pure "accept" of transferred pending assets, coupled with a Mellow
      // withdrawal request: it moves no ERC-20s, and the withdrawal phantom
      // token effect is credited by the storeExpectedBalances bracket delta
      // built from the compressor's outputs
      case "multiAccept":
        break;
      // no-op:
      // `multiAcceptAndClaim` is only emitted by the withdrawal
      // compressor, and sdk now encodes the spent phantom token
      // burn as a negative storeExpectedBalances delta. Resolving the phantom
      // from calldata alone is impossible offline (the multiVault-to-phantom
      // mapping is not serialized); the commented-out code recovered it via
      // an RPC lookup.
      case "multiAcceptAndClaim": {
        // const [multiVault, , , , maxAssets] = decoded.args;
        // const phantomToken =
        //   await this.sdk.withdrawalCompressor.getWithdrawalPhantomToken(
        //     this.creditManager,
        //     multiVault,
        //   );
        // this.spendExact(balances, phantomToken, maxAssets);
        break;
      }
      default:
        await super.applyBalanceChanges(balances, decoded);
    }
  }
}
