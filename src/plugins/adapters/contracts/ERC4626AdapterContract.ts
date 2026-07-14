import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
  zeroAddress,
} from "viem";
import { ierc4626AdapterAbi } from "../../../abi/ierc4626Adapter.js";
import {
  type AssetsMap,
  type ConstructOptions,
  MissingSerializedParamsError,
  type ParsedCallV2,
} from "../../../sdk/index.js";
import { iERC4626Abi } from "../abi/targetContractAbi.js";
import type {
  LegacyAdapterOperation,
  Transfers,
} from "../legacyAdapterOperations.js";
import { fnSigToName, swapFromTransfers } from "../transferHelpers.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = ierc4626AdapterAbi;
type abi = typeof abi;

const protocolAbi = iERC4626Abi;
type protocolAbi = typeof protocolAbi;

export class ERC4626AdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #vault?: Address;
  #asset?: Address;

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const version = Number(args.baseParams.version);
      if (version <= 311) {
        const decoded = decodeAbiParameters(
          [
            { type: "address", name: "creditManager" },
            { type: "address", name: "targetContract" },
            { type: "address", name: "asset" },
          ],
          args.baseParams.serializedParams,
        );

        this.#asset = decoded[2];
        this.#vault = zeroAddress;
      } else {
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

  /**
   * Vault share token: the serialized `vault` when set; for v<=311 the
   * serialized vault is zeroAddress and the adapter targets the vault
   * directly, so the target contract is the share token.
   */
  get share(): Address {
    return this.#vault && this.#vault !== zeroAddress
      ? this.#vault
      : this.targetContract;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      vault: this.#vault ? this.labelAddress(this.#vault) : undefined,
      asset: this.#asset ? this.labelAddress(this.#asset) : undefined,
    };
  }

  /**
   * Charts_server maps `redeem(uint256,address,address)` → MakerRedeem.
   * Diff variants (`redeemDiff`) should also map to MakerRedeem.
   * Everything else (deposit, depositDiff, withdraw) falls to base class fallback → Swap.
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

  protected override applyBalanceChanges(
    balances: AssetsMap,
    decoded: DecodeFunctionDataReturnType<abi>,
  ): void {
    switch (decoded.functionName) {
      case "depositDiff": {
        const [leftoverAmount] = decoded.args;
        this.setLeftover(balances, this.asset, leftoverAmount);
        break;
      }
      case "redeemDiff": {
        const [leftoverAmount] = decoded.args;
        this.setLeftover(balances, this.share, leftoverAmount);
        break;
      }
      case "redeem": {
        const [shares] = decoded.args;
        this.spendExact(balances, this.share, shares);
        break;
      }
      // `withdraw`/`deposit`/`mint` stay unsupported: they are not emitted
      // by the router (which uses diff variants) or the withdrawal compressor
      default:
        super.applyBalanceChanges(balances, decoded);
    }
  }
}
