import { mellowDvvAdapterAbi } from "@gearbox-protocol/integrations-v3";
import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
} from "viem";
import {
  type AddressMap,
  type ConstructOptions,
  MissingSerializedParamsError,
  type ParsedCallV2,
} from "../../../sdk/index.js";
import { iERC4626Abi } from "../abi/targetContractAbi.js";
import { clampToLeftover } from "../balanceChanges.js";
import type {
  LegacyAdapterOperation,
  Transfers,
} from "../legacyAdapterOperations.js";
import { fnSigToName, swapFromTransfers } from "../transferHelpers.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = mellowDvvAdapterAbi;
type abi = typeof abi;

const protocolAbi = iERC4626Abi;
type protocolAbi = typeof protocolAbi;

export class MellowDVVAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #vault?: Address;
  #asset?: Address;

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
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

  get vault(): Address {
    if (!this.#vault) throw new MissingSerializedParamsError("vault");
    return this.#vault;
  }

  get asset(): Address {
    if (!this.#asset) throw new MissingSerializedParamsError("asset");
    return this.#asset;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      vault: this.#vault ? this.labelAddress(this.#vault) : undefined,
      asset: this.#asset ? this.labelAddress(this.#asset) : undefined,
    };
  }

  /**
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

  protected override previewDecodedBalanceChanges(
    balances: AddressMap<bigint>,
    decoded: DecodeFunctionDataReturnType<abi>,
  ): AddressMap<bigint> {
    const share = this.#vault ?? this.targetContract;
    switch (decoded.functionName) {
      case "depositDiff": {
        const [leftoverAmount] = decoded.args;
        return clampToLeftover(balances, this.asset, leftoverAmount);
      }
      case "redeemDiff": {
        const [leftoverAmount] = decoded.args;
        return clampToLeftover(balances, share, leftoverAmount);
      }
      default:
        return super.previewDecodedBalanceChanges(balances, decoded);
    }
  }
}
