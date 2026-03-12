import { type Address, decodeAbiParameters } from "viem";
import type { ConstructOptions, ParsedCallV2 } from "../../../../sdk/index.js";
import { MissingSerializedParamsError } from "../../../../sdk/index.js";
import type {
  LegacyAdapterOperation,
  Transfers,
} from "../../legacyAdapterOperations.js";
import type { ConcreteAdapterContractOptions } from "../AbstractAdapter.js";
import { AbstractAdapterContract } from "../AbstractAdapter.js";

export const iEqualizerRouterAdapterAbi = [
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
    name: "isPoolAllowed",
    inputs: [
      { name: "token0", type: "address", internalType: "address" },
      { name: "token1", type: "address", internalType: "address" },
      { name: "stable", type: "bool", internalType: "bool" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
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
    name: "setPoolStatusBatch",
    inputs: [
      {
        name: "pools",
        type: "tuple[]",
        internalType: "struct EqualizerPoolStatus[]",
        components: [
          { name: "token0", type: "address", internalType: "address" },
          { name: "token1", type: "address", internalType: "address" },
          { name: "stable", type: "bool", internalType: "bool" },
          { name: "allowed", type: "bool", internalType: "bool" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "swapDiffTokensForTokens",
    inputs: [
      { name: "leftoverAmount", type: "uint256", internalType: "uint256" },
      { name: "rateMinRAY", type: "uint256", internalType: "uint256" },
      {
        name: "routes",
        type: "tuple[]",
        internalType: "struct Route[]",
        components: [
          { name: "from", type: "address", internalType: "address" },
          { name: "to", type: "address", internalType: "address" },
          { name: "stable", type: "bool", internalType: "bool" },
        ],
      },
      { name: "deadline", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "useSafePrices", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "swapExactTokensForTokens",
    inputs: [
      { name: "amountIn", type: "uint256", internalType: "uint256" },
      { name: "amountOutMin", type: "uint256", internalType: "uint256" },
      {
        name: "routes",
        type: "tuple[]",
        internalType: "struct Route[]",
        components: [
          { name: "from", type: "address", internalType: "address" },
          { name: "to", type: "address", internalType: "address" },
          { name: "stable", type: "bool", internalType: "bool" },
        ],
      },
      { name: "", type: "address", internalType: "address" },
      { name: "deadline", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "useSafePrices", type: "bool", internalType: "bool" }],
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
    name: "SetPoolStatus",
    inputs: [
      {
        name: "token0",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "token1",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      { name: "stable", type: "bool", indexed: false, internalType: "bool" },
      { name: "allowed", type: "bool", indexed: false, internalType: "bool" },
    ],
    anonymous: false,
  },
  { type: "error", name: "InvalidPathException", inputs: [] },
] as const;

export const iEqualizerRouterAbi = [
  {
    type: "function",
    name: "factory",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAmountsOut",
    inputs: [
      { name: "amountIn", type: "uint256", internalType: "uint256" },
      {
        name: "routes",
        type: "tuple[]",
        internalType: "struct Route[]",
        components: [
          { name: "from", type: "address", internalType: "address" },
          { name: "to", type: "address", internalType: "address" },
          { name: "stable", type: "bool", internalType: "bool" },
        ],
      },
    ],
    outputs: [
      { name: "amounts", type: "uint256[]", internalType: "uint256[]" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "swapExactTokensForTokens",
    inputs: [
      { name: "amountIn", type: "uint256", internalType: "uint256" },
      { name: "amountOutMin", type: "uint256", internalType: "uint256" },
      {
        name: "routes",
        type: "tuple[]",
        internalType: "struct Route[]",
        components: [
          { name: "from", type: "address", internalType: "address" },
          { name: "to", type: "address", internalType: "address" },
          { name: "stable", type: "bool", internalType: "bool" },
        ],
      },
      { name: "to", type: "address", internalType: "address" },
      { name: "deadline", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      { name: "amounts", type: "uint256[]", internalType: "uint256[]" },
    ],
    stateMutability: "nonpayable",
  },
] as const;

const abi = iEqualizerRouterAdapterAbi;
type abi = typeof abi;

const protocolAbi = iEqualizerRouterAbi;
type protocolAbi = typeof protocolAbi;

export class EqualizerRouterAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #supportedPools?: {
    token0: Address;
    token1: Address;
    stable: boolean;
  }[];

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          {
            type: "tuple[]",
            name: "supportedPools",
            components: [
              { type: "address", name: "token0" },
              { type: "address", name: "token1" },
              { type: "bool", name: "stable" },
            ],
          },
        ],
        args.baseParams.serializedParams,
      );

      this.#supportedPools = decoded[2].map(pool => ({
        token0: pool.token0,
        token1: pool.token1,
        stable: pool.stable,
      }));
    }
  }

  get supportedPools(): {
    token0: Address;
    token1: Address;
    stable: boolean;
  }[] {
    if (!this.#supportedPools)
      throw new MissingSerializedParamsError("supportedPools");
    return this.#supportedPools;
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
