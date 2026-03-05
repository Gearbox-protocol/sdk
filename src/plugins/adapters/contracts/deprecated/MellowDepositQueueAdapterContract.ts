import { type Address, decodeAbiParameters } from "viem";
import {
  type ConstructOptions,
  MissingSerializedParamsError,
  type ParsedCallV2,
} from "../../../../sdk/index.js";
import type {
  LegacyAdapterOperation,
  Transfers,
} from "../../legacyAdapterOperations.js";
import type { ConcreteAdapterContractOptions } from "../AbstractAdapter.js";
import { AbstractAdapterContract } from "../AbstractAdapter.js";

const abi = [] as const;
type abi = typeof abi;

const protocolAbi = [] as const;
type protocolAbi = typeof protocolAbi;

export class MellowDepositQueueAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #asset?: Address;
  #phantomToken?: Address;
  #referral?: Address;

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "asset" },
          { type: "address", name: "phantomToken" },
          { type: "address", name: "referral" },
        ],
        args.baseParams.serializedParams,
      );

      this.#asset = decoded[2];
      this.#phantomToken = decoded[3];
      this.#referral = decoded[4];
    }
  }

  get asset(): Address {
    if (!this.#asset) throw new MissingSerializedParamsError("asset");
    return this.#asset;
  }

  get phantomToken(): Address {
    if (!this.#phantomToken)
      throw new MissingSerializedParamsError("phantomToken");
    return this.#phantomToken;
  }

  get referral(): Address {
    if (!this.#referral) throw new MissingSerializedParamsError("referral");
    return this.#referral;
  }

  /** Legacy adapter not present in integrations-v3. */
  protected override classifyLegacyOperation(
    _parsed: ParsedCallV2,
    _transfers: Transfers,
  ): LegacyAdapterOperation {
    throw new Error(
      `classifyLegacyOperation is not supported for legacy adapter: ${this.contractType}`,
    );
  }
}
