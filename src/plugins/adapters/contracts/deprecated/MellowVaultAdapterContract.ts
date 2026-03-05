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

export const iMellowVaultAdapterAbi = [
  {
    type: "function",
    name: "allowedUnderlyings",
    inputs: [],
    outputs: [{ name: "", type: "address[]", internalType: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "contractType",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "creditManager",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "deposit",
    inputs: [
      { name: "", type: "address", internalType: "address" },
      { name: "amounts", type: "uint256[]", internalType: "uint256[]" },
      { name: "minLpAmount", type: "uint256", internalType: "uint256" },
      { name: "deadline", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "useSafePrices", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "depositOneAsset",
    inputs: [
      { name: "asset", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
      { name: "minLpAmount", type: "uint256", internalType: "uint256" },
      { name: "deadline", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "useSafePrices", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "depositOneAssetDiff",
    inputs: [
      { name: "asset", type: "address", internalType: "address" },
      { name: "leftoverAmount", type: "uint256", internalType: "uint256" },
      { name: "rateMinRAY", type: "uint256", internalType: "uint256" },
      { name: "deadline", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "useSafePrices", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "serialize",
    inputs: [],
    outputs: [{ name: "serializedData", type: "bytes", internalType: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setUnderlyingStatusBatch",
    inputs: [
      {
        name: "underlyings",
        type: "tuple[]",
        internalType: "struct MellowUnderlyingStatus[]",
        components: [
          { name: "underlying", type: "address", internalType: "address" },
          { name: "allowed", type: "bool", internalType: "bool" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "targetContract",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "version",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "SetUnderlyingStatus",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      { name: "newStatus", type: "bool", indexed: false, internalType: "bool" },
    ],
    anonymous: false,
  },
  { type: "error", name: "IncorrectArrayLengthException", inputs: [] },
  {
    type: "error",
    name: "UnderlyingNotAllowedException",
    inputs: [{ name: "asset", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "UnderlyingNotFoundException",
    inputs: [{ name: "asset", type: "address", internalType: "address" }],
  },
] as const;

export const iMellowVaultAbi = [
  {
    type: "function",
    name: "deposit",
    inputs: [
      { name: "to", type: "address", internalType: "address" },
      { name: "amounts", type: "uint256[]", internalType: "uint256[]" },
      { name: "minLpAmount", type: "uint256", internalType: "uint256" },
      { name: "deadline", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      { name: "actualAmounts", type: "uint256[]", internalType: "uint256[]" },
      { name: "lpAmount", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "underlyingTokens",
    inputs: [],
    outputs: [
      {
        name: "underlyinigTokens_",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "underlyingTvl",
    inputs: [],
    outputs: [
      { name: "tokens", type: "address[]", internalType: "address[]" },
      { name: "amounts", type: "uint256[]", internalType: "uint256[]" },
    ],
    stateMutability: "view",
  },
] as const;

const abi = iMellowVaultAdapterAbi;
type abi = typeof abi;

const protocolAbi = iMellowVaultAbi;
type protocolAbi = typeof protocolAbi;

export class MellowVaultAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #allowedUnderlyings?: Address[];

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address[]", name: "allowedUnderlyings" },
        ],
        args.baseParams.serializedParams,
      );

      this.#allowedUnderlyings = [...decoded[2]];
    }
  }

  get allowedUnderlyings(): Address[] {
    if (!this.#allowedUnderlyings)
      throw new MissingSerializedParamsError("allowedUnderlyings");
    return this.#allowedUnderlyings;
  }

  /** Legacy adapter not present in integrations-v3. Go: MellowDeposit via operation_type.go L125-L130 */
  protected override classifyLegacyOperation(
    _parsed: ParsedCallV2,
    _transfers: Transfers,
  ): LegacyAdapterOperation {
    throw new Error(
      `classifyLegacyOperation is not supported for legacy adapter: ${this.contractType}`,
    );
  }
}
