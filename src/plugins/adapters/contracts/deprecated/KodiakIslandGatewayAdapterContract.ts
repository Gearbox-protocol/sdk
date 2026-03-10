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

export const iKodiakIslandGatewayAdapterAbi = [
  {
    type: "function",
    name: "addLiquidityImbalanced",
    inputs: [
      { name: "island", type: "address", internalType: "address" },
      { name: "amount0", type: "uint256", internalType: "uint256" },
      { name: "amount1", type: "uint256", internalType: "uint256" },
      { name: "minLPAmount", type: "uint256", internalType: "uint256" },
      { name: "receiver", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addLiquidityImbalancedAssisted",
    inputs: [
      { name: "island", type: "address", internalType: "address" },
      { name: "amount0", type: "uint256", internalType: "uint256" },
      { name: "amount1", type: "uint256", internalType: "uint256" },
      { name: "minLPAmount", type: "uint256", internalType: "uint256" },
      { name: "receiver", type: "address", internalType: "address" },
      {
        name: "ratios",
        type: "tuple",
        internalType: "struct Ratios",
        components: [
          { name: "priceRatio", type: "uint256", internalType: "uint256" },
          { name: "balance0", type: "uint256", internalType: "uint256" },
          { name: "balance1", type: "uint256", internalType: "uint256" },
          { name: "swapAll", type: "bool", internalType: "bool" },
          { name: "is0to1", type: "bool", internalType: "bool" },
        ],
      },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addLiquidityImbalancedDiff",
    inputs: [
      { name: "island", type: "address", internalType: "address" },
      { name: "leftoverAmount0", type: "uint256", internalType: "uint256" },
      { name: "leftoverAmount1", type: "uint256", internalType: "uint256" },
      { name: "minRatesRAY", type: "uint256[2]", internalType: "uint256[2]" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addLiquidityImbalancedDiffAssisted",
    inputs: [
      { name: "island", type: "address", internalType: "address" },
      { name: "leftoverAmount0", type: "uint256", internalType: "uint256" },
      { name: "leftoverAmount1", type: "uint256", internalType: "uint256" },
      { name: "minRatesRAY", type: "uint256[2]", internalType: "uint256[2]" },
      {
        name: "ratios",
        type: "tuple",
        internalType: "struct Ratios",
        components: [
          { name: "priceRatio", type: "uint256", internalType: "uint256" },
          { name: "balance0", type: "uint256", internalType: "uint256" },
          { name: "balance1", type: "uint256", internalType: "uint256" },
          { name: "swapAll", type: "bool", internalType: "bool" },
          { name: "is0to1", type: "bool", internalType: "bool" },
        ],
      },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allowedIslands",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct KodiakIslandStatus[]",
        components: [
          { name: "island", type: "address", internalType: "address" },
          { name: "status", type: "uint8", internalType: "enum IslandStatus" },
        ],
      },
    ],
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
    name: "removeLiquiditySingle",
    inputs: [
      { name: "island", type: "address", internalType: "address" },
      { name: "lpAmount", type: "uint256", internalType: "uint256" },
      { name: "tokenOut", type: "address", internalType: "address" },
      { name: "minAmountOut", type: "uint256", internalType: "uint256" },
      { name: "receiver", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "removeLiquiditySingleDiff",
    inputs: [
      { name: "island", type: "address", internalType: "address" },
      { name: "leftoverAmount", type: "uint256", internalType: "uint256" },
      { name: "tokenOut", type: "address", internalType: "address" },
      { name: "minRateRAY", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
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
    name: "setIslandStatusBatch",
    inputs: [
      {
        name: "islands",
        type: "tuple[]",
        internalType: "struct KodiakIslandStatus[]",
        components: [
          { name: "island", type: "address", internalType: "address" },
          { name: "status", type: "uint8", internalType: "enum IslandStatus" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "swap",
    inputs: [
      { name: "island", type: "address", internalType: "address" },
      { name: "tokenIn", type: "address", internalType: "address" },
      { name: "amountIn", type: "uint256", internalType: "uint256" },
      { name: "amountOutMin", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "swapDiff",
    inputs: [
      { name: "island", type: "address", internalType: "address" },
      { name: "tokenIn", type: "address", internalType: "address" },
      { name: "leftoverAmount", type: "uint256", internalType: "uint256" },
      { name: "minRateRAY", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
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
    name: "SetIslandStatus",
    inputs: [
      {
        name: "island",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "status",
        type: "uint8",
        indexed: false,
        internalType: "enum IslandStatus",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "IslandNotAllowedException",
    inputs: [{ name: "island", type: "address", internalType: "address" }],
  },
] as const;

export const iKodiakIslandGatewayAbi = [
  {
    type: "function",
    name: "addLiquidityImbalanced",
    inputs: [
      { name: "island", type: "address", internalType: "address" },
      { name: "amount0", type: "uint256", internalType: "uint256" },
      { name: "amount1", type: "uint256", internalType: "uint256" },
      { name: "minLPAmount", type: "uint256", internalType: "uint256" },
      { name: "receiver", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "lpAmount", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addLiquidityImbalancedAssisted",
    inputs: [
      { name: "island", type: "address", internalType: "address" },
      { name: "amount0", type: "uint256", internalType: "uint256" },
      { name: "amount1", type: "uint256", internalType: "uint256" },
      { name: "minLPAmount", type: "uint256", internalType: "uint256" },
      { name: "receiver", type: "address", internalType: "address" },
      {
        name: "ratios",
        type: "tuple",
        internalType: "struct Ratios",
        components: [
          { name: "priceRatio", type: "uint256", internalType: "uint256" },
          { name: "balance0", type: "uint256", internalType: "uint256" },
          { name: "balance1", type: "uint256", internalType: "uint256" },
          { name: "swapAll", type: "bool", internalType: "bool" },
          { name: "is0to1", type: "bool", internalType: "bool" },
        ],
      },
    ],
    outputs: [{ name: "lpAmount", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "estimateAddLiquidityImbalanced",
    inputs: [
      { name: "island", type: "address", internalType: "address" },
      { name: "amount0", type: "uint256", internalType: "uint256" },
      { name: "amount1", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      { name: "lpAmount", type: "uint256", internalType: "uint256" },
      {
        name: "ratios",
        type: "tuple",
        internalType: "struct Ratios",
        components: [
          { name: "priceRatio", type: "uint256", internalType: "uint256" },
          { name: "balance0", type: "uint256", internalType: "uint256" },
          { name: "balance1", type: "uint256", internalType: "uint256" },
          { name: "swapAll", type: "bool", internalType: "bool" },
          { name: "is0to1", type: "bool", internalType: "bool" },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "estimateRemoveLiquiditySingle",
    inputs: [
      { name: "island", type: "address", internalType: "address" },
      { name: "lpAmount", type: "uint256", internalType: "uint256" },
      { name: "tokenOut", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "amountOut", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "estimateSwap",
    inputs: [
      { name: "island", type: "address", internalType: "address" },
      { name: "tokenIn", type: "address", internalType: "address" },
      { name: "amountIn", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "amountOut", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "removeLiquiditySingle",
    inputs: [
      { name: "island", type: "address", internalType: "address" },
      { name: "lpAmount", type: "uint256", internalType: "uint256" },
      { name: "tokenOut", type: "address", internalType: "address" },
      { name: "minAmountOut", type: "uint256", internalType: "uint256" },
      { name: "receiver", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "amountOut", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "swap",
    inputs: [
      { name: "island", type: "address", internalType: "address" },
      { name: "tokenIn", type: "address", internalType: "address" },
      { name: "amountIn", type: "uint256", internalType: "uint256" },
      { name: "amountOutMin", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "amountOut", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  { type: "error", name: "InsufficientAmountOutException", inputs: [] },
  { type: "error", name: "InvalidTokenInException", inputs: [] },
] as const;

const abi = iKodiakIslandGatewayAdapterAbi;
type abi = typeof abi;

const protocolAbi = iKodiakIslandGatewayAbi;
type protocolAbi = typeof protocolAbi;

export enum KodiakIslandStatus {
  NOT_ALLOWED = 0,
  ALLOWED = 1,
  SWAP_AND_EXIT_ONLY = 2,
  EXIT_ONLY = 3,
}

export class KodiakIslandGatewayAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #allowedIslands?: {
    island: Address;
    status: KodiakIslandStatus;
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
            name: "allowedIslands",
            components: [
              { type: "address", name: "island" },
              { type: "uint8", name: "status" },
            ],
          },
        ],
        args.baseParams.serializedParams,
      );

      this.#allowedIslands = decoded[2].map(({ island, status }) => ({
        island,
        status: status as KodiakIslandStatus,
      }));
    }
  }

  get allowedIslands(): {
    island: Address;
    status: KodiakIslandStatus;
  }[] {
    if (!this.#allowedIslands)
      throw new MissingSerializedParamsError("allowedIslands");
    return this.#allowedIslands;
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
