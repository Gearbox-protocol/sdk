import { erc4626ReferralAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import {
  type ConstructOptions,
  MissingSerializedParamsError,
  type ParsedCallV2,
} from "../../../sdk/index.js";
import { iERC4626ReferralAbi } from "../abi/targetContractAbi.js";
import type {
  LegacyAdapterOperation,
  Transfers,
} from "../legacyAdapterOperations.js";
import { fnSigToName, swapFromTransfers } from "../transferHelpers.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = erc4626ReferralAdapterAbi;
type abi = typeof abi;

const protocolAbi = iERC4626ReferralAbi;
type protocolAbi = typeof protocolAbi;

export class ERC4626ReferralAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #asset?: Address;
  #referral?: number;

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "asset" },
          { type: "uint16", name: "referral" },
        ],
        args.baseParams.serializedParams,
      );

      this.#asset = decoded[2];
      this.#referral = decoded[3];
    }
  }

  get asset(): Address {
    if (!this.#asset) throw new MissingSerializedParamsError("asset");
    return this.#asset;
  }

  get referral(): number {
    if (this.#referral === undefined)
      throw new MissingSerializedParamsError("referral");
    return this.#referral;
  }

  /**
   * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type_v3.go#L32-L38
   */
  protected override classifyLegacyOperation(
    parsed: ParsedCallV2,
    transfers: Transfers,
  ): LegacyAdapterOperation {
    const fn = fnSigToName(parsed.functionName);
    if (fn === "redeem" || fn === "redeemDiff") {
      return { operation: "MakerRedeem", ...swapFromTransfers(transfers) };
    }
    return super.classifyLegacyOperation(parsed, transfers);
  }
}
