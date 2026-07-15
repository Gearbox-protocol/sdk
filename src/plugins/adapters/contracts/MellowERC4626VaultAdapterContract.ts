import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
} from "viem";
import {
  type AssetsMap,
  MissingSerializedParamsError,
  type OnchainSDK,
  type ParsedCallV2,
} from "../../../sdk/index.js";
import { iMellow4626VaultAdapterAbi } from "../abi/adapters/index.js";
import { iERC4626Abi } from "../abi/targetContractAbi.js";
import type {
  LegacyAdapterOperation,
  Transfers,
} from "../legacyAdapterOperations.js";
import { fnSigToName, swapFromTransfers } from "../transferHelpers.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iMellow4626VaultAdapterAbi;
type abi = typeof abi;

const protocolAbi = iERC4626Abi;
type protocolAbi = typeof protocolAbi;

export class MellowERC4626VaultAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #vault?: Address;
  #asset?: Address;
  #stakedPhantomToken?: Address;

  constructor(sdk: OnchainSDK, args: ConcreteAdapterContractOptions) {
    super(sdk, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const version = Number(args.baseParams.version);
      if (version <= 310) {
        const decoded = decodeAbiParameters(
          [
            { type: "address", name: "creditManager" },
            { type: "address", name: "targetContract" },
            { type: "address", name: "asset" },
          ],
          args.baseParams.serializedParams,
        );

        this.#asset = decoded[2];
      } else if (version === 311) {
        const decoded = decodeAbiParameters(
          [
            { type: "address", name: "creditManager" },
            { type: "address", name: "targetContract" },
            { type: "address", name: "asset" },
            { type: "address", name: "stakedPhantomToken" },
          ],
          args.baseParams.serializedParams,
        );

        this.#asset = decoded[2];
        this.#stakedPhantomToken = decoded[3];
      } else {
        // v312+: inherits ERC4626Adapter serialize = (creditManager, targetContract, vault, asset)
        const decoded = decodeAbiParameters(
          [
            { type: "address", name: "creditManager" },
            { type: "address", name: "targetContract" },
            { type: "address", name: "vault" },
            { type: "address", name: "asset" },
          ],
          args.baseParams.serializedParams,
        );

        this.#vault = decoded[2];
        this.#asset = decoded[3];
      }
    }
  }

  get vault(): Address {
    if (!this.#vault) throw new MissingSerializedParamsError("vault");
    return this.#vault;
  }

  get asset(): Address {
    if (!this.#asset) throw new MissingSerializedParamsError("asset");
    return this.#asset;
  }

  get stakedPhantomToken(): Address {
    if (!this.#stakedPhantomToken)
      throw new MissingSerializedParamsError("stakedPhantomToken");
    return this.#stakedPhantomToken;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      vault: this.#vault ? this.labelAddress(this.#vault) : undefined,
      asset: this.#asset ? this.labelAddress(this.#asset) : undefined,
      stakedPhantomToken: this.#stakedPhantomToken
        ? this.labelAddress(this.#stakedPhantomToken)
        : undefined,
    };
  }

  /**
   * Charts_server maps `redeem(uint256,address,address)` → MakerRedeem.
   * Diff variants (`redeemDiff`) should also map to MakerRedeem.
   *
   * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type_v3.go#L32-L38
   */
  public override classifyLegacyOperation(
    parsed: ParsedCallV2,
    transfers: Transfers,
  ): LegacyAdapterOperation {
    const fn = fnSigToName(parsed.functionName);
    if (fn === "redeem" || fn === "redeemDiff") {
      return { operation: "MakerRedeem", ...swapFromTransfers(transfers) };
    }
    return super.classifyLegacyOperation(parsed, transfers);
  }

  protected override async applyBalanceChanges(
    balances: AssetsMap,
    decoded: DecodeFunctionDataReturnType<abi>,
  ): Promise<void> {
    // for v<=311 the adapter targets the vault directly and no separate vault
    // address is serialized
    const share = this.#vault ?? this.targetContract;
    switch (decoded.functionName) {
      case "depositDiff": {
        const [leftoverAmount] = decoded.args;
        this.setLeftover(balances, this.asset, leftoverAmount);
        break;
      }
      case "redeemDiff": {
        const [leftoverAmount] = decoded.args;
        this.setLeftover(balances, share, leftoverAmount);
        break;
      }
      // no-op:
      // the only in-bracket producer of plain `redeem` is the
      // withdrawal compressor, and sdk now encodes the spent
      // shares as a negative storeExpectedBalances delta. The router never
      // emits plain `redeem` — its workers use `redeemDiff` only. If the
      // router (or another assembler) ever starts emitting in-bracket plain
      // `redeem` without the negative delta, this case must decrease `share`
      // by `shares` again (see commented-out lines).
      case "redeem": {
        // const [shares] = decoded.args;
        // this.spendExact(balances, share, shares);
        break;
      }
      default:
        await super.applyBalanceChanges(balances, decoded);
    }
  }
}
