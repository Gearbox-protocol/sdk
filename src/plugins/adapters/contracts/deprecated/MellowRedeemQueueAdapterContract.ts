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

export class MellowRedeemQueueAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #vaultToken?: Address;
  #phantomToken?: Address;

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "vaultToken" },
          { type: "address", name: "phantomToken" },
        ],
        args.baseParams.serializedParams,
      );

      this.#vaultToken = decoded[2];
      this.#phantomToken = decoded[3];
    }
  }

  get vaultToken(): Address {
    if (!this.#vaultToken) throw new MissingSerializedParamsError("vaultToken");
    return this.#vaultToken;
  }

  get phantomToken(): Address {
    if (!this.#phantomToken)
      throw new MissingSerializedParamsError("phantomToken");
    return this.#phantomToken;
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
