import { decodeAbiParameters } from "viem";
import type { ConstructOptions, ParsedCallV2 } from "../../../../sdk/index.js";
import { MissingSerializedParamsError } from "../../../../sdk/index.js";
import type {
  LegacyAdapterOperation,
  Transfers,
} from "../../legacyAdapterOperations.js";
import type { ConcreteAdapterContractOptions } from "../AbstractAdapter.js";
import { AbstractAdapterContract } from "../AbstractAdapter.js";
import type { BalancerV2PoolStatus } from "../types.js";

export const iBalancerV2VaultAdapterAbi = [
  {
    type: "function",
    name: "batchSwap",
    inputs: [
      { name: "kind", type: "uint8", internalType: "enum SwapKind" },
      {
        name: "swaps",
        type: "tuple[]",
        internalType: "struct BatchSwapStep[]",
        components: [
          { name: "poolId", type: "bytes32", internalType: "bytes32" },
          { name: "assetInIndex", type: "uint256", internalType: "uint256" },
          { name: "assetOutIndex", type: "uint256", internalType: "uint256" },
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "userData", type: "bytes", internalType: "bytes" },
        ],
      },
      { name: "assets", type: "address[]", internalType: "contract IAsset[]" },
      {
        name: "",
        type: "tuple",
        internalType: "struct FundManagement",
        components: [
          { name: "sender", type: "address", internalType: "address" },
          { name: "fromInternalBalance", type: "bool", internalType: "bool" },
          {
            name: "recipient",
            type: "address",
            internalType: "address payable",
          },
          { name: "toInternalBalance", type: "bool", internalType: "bool" },
        ],
      },
      { name: "limits", type: "int256[]", internalType: "int256[]" },
      { name: "deadline", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "useSafePrices", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
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
    name: "exitPool",
    inputs: [
      { name: "poolId", type: "bytes32", internalType: "bytes32" },
      { name: "", type: "address", internalType: "address" },
      { name: "", type: "address", internalType: "address payable" },
      {
        name: "request",
        type: "tuple",
        internalType: "struct ExitPoolRequest",
        components: [
          {
            name: "assets",
            type: "address[]",
            internalType: "contract IAsset[]",
          },
          {
            name: "minAmountsOut",
            type: "uint256[]",
            internalType: "uint256[]",
          },
          { name: "userData", type: "bytes", internalType: "bytes" },
          { name: "toInternalBalance", type: "bool", internalType: "bool" },
        ],
      },
    ],
    outputs: [{ name: "useSafePrices", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "exitPoolSingleAsset",
    inputs: [
      { name: "poolId", type: "bytes32", internalType: "bytes32" },
      { name: "assetOut", type: "address", internalType: "contract IAsset" },
      { name: "amountIn", type: "uint256", internalType: "uint256" },
      { name: "minAmountOut", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "useSafePrices", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "exitPoolSingleAssetDiff",
    inputs: [
      { name: "poolId", type: "bytes32", internalType: "bytes32" },
      { name: "assetOut", type: "address", internalType: "contract IAsset" },
      { name: "leftoverAmount", type: "uint256", internalType: "uint256" },
      { name: "minRateRAY", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "useSafePrices", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "joinPool",
    inputs: [
      { name: "poolId", type: "bytes32", internalType: "bytes32" },
      { name: "", type: "address", internalType: "address" },
      { name: "", type: "address", internalType: "address" },
      {
        name: "request",
        type: "tuple",
        internalType: "struct JoinPoolRequest",
        components: [
          {
            name: "assets",
            type: "address[]",
            internalType: "contract IAsset[]",
          },
          {
            name: "maxAmountsIn",
            type: "uint256[]",
            internalType: "uint256[]",
          },
          { name: "userData", type: "bytes", internalType: "bytes" },
          { name: "fromInternalBalance", type: "bool", internalType: "bool" },
        ],
      },
    ],
    outputs: [{ name: "useSafePrices", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "joinPoolSingleAsset",
    inputs: [
      { name: "poolId", type: "bytes32", internalType: "bytes32" },
      { name: "assetIn", type: "address", internalType: "contract IAsset" },
      { name: "amountIn", type: "uint256", internalType: "uint256" },
      { name: "minAmountOut", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "useSafePrices", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "joinPoolSingleAssetDiff",
    inputs: [
      { name: "poolId", type: "bytes32", internalType: "bytes32" },
      { name: "assetIn", type: "address", internalType: "contract IAsset" },
      { name: "leftoverAmount", type: "uint256", internalType: "uint256" },
      { name: "minRateRAY", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "useSafePrices", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "poolStatus",
    inputs: [{ name: "poolId", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "", type: "uint8", internalType: "enum PoolStatus" }],
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
    name: "setPoolStatus",
    inputs: [
      { name: "poolId", type: "bytes32", internalType: "bytes32" },
      { name: "newStatus", type: "uint8", internalType: "enum PoolStatus" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "swap",
    inputs: [
      {
        name: "singleSwap",
        type: "tuple",
        internalType: "struct SingleSwap",
        components: [
          { name: "poolId", type: "bytes32", internalType: "bytes32" },
          { name: "kind", type: "uint8", internalType: "enum SwapKind" },
          { name: "assetIn", type: "address", internalType: "contract IAsset" },
          {
            name: "assetOut",
            type: "address",
            internalType: "contract IAsset",
          },
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "userData", type: "bytes", internalType: "bytes" },
        ],
      },
      {
        name: "",
        type: "tuple",
        internalType: "struct FundManagement",
        components: [
          { name: "sender", type: "address", internalType: "address" },
          { name: "fromInternalBalance", type: "bool", internalType: "bool" },
          {
            name: "recipient",
            type: "address",
            internalType: "address payable",
          },
          { name: "toInternalBalance", type: "bool", internalType: "bool" },
        ],
      },
      { name: "limit", type: "uint256", internalType: "uint256" },
      { name: "deadline", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "useSafePrices", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "swapDiff",
    inputs: [
      {
        name: "singleSwapDiff",
        type: "tuple",
        internalType: "struct SingleSwapDiff",
        components: [
          { name: "poolId", type: "bytes32", internalType: "bytes32" },
          { name: "leftoverAmount", type: "uint256", internalType: "uint256" },
          { name: "assetIn", type: "address", internalType: "contract IAsset" },
          {
            name: "assetOut",
            type: "address",
            internalType: "contract IAsset",
          },
          { name: "userData", type: "bytes", internalType: "bytes" },
        ],
      },
      { name: "limitRateRAY", type: "uint256", internalType: "uint256" },
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
        name: "poolId",
        type: "bytes32",
        indexed: true,
        internalType: "bytes32",
      },
      {
        name: "newStatus",
        type: "uint8",
        indexed: false,
        internalType: "enum PoolStatus",
      },
    ],
    anonymous: false,
  },
  { type: "error", name: "PoolNotSupportedException", inputs: [] },
] as const;

export const iBalancerV2VaultAbi = [
  {
    type: "function",
    name: "batchSwap",
    inputs: [
      { name: "kind", type: "uint8", internalType: "enum SwapKind" },
      {
        name: "swaps",
        type: "tuple[]",
        internalType: "struct BatchSwapStep[]",
        components: [
          { name: "poolId", type: "bytes32", internalType: "bytes32" },
          { name: "assetInIndex", type: "uint256", internalType: "uint256" },
          { name: "assetOutIndex", type: "uint256", internalType: "uint256" },
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "userData", type: "bytes", internalType: "bytes" },
        ],
      },
      { name: "assets", type: "address[]", internalType: "contract IAsset[]" },
      {
        name: "funds",
        type: "tuple",
        internalType: "struct FundManagement",
        components: [
          { name: "sender", type: "address", internalType: "address" },
          { name: "fromInternalBalance", type: "bool", internalType: "bool" },
          {
            name: "recipient",
            type: "address",
            internalType: "address payable",
          },
          { name: "toInternalBalance", type: "bool", internalType: "bool" },
        ],
      },
      { name: "limits", type: "int256[]", internalType: "int256[]" },
      { name: "deadline", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      { name: "assetDeltas", type: "int256[]", internalType: "int256[]" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "exitPool",
    inputs: [
      { name: "poolId", type: "bytes32", internalType: "bytes32" },
      { name: "sender", type: "address", internalType: "address" },
      { name: "recipient", type: "address", internalType: "address payable" },
      {
        name: "request",
        type: "tuple",
        internalType: "struct ExitPoolRequest",
        components: [
          {
            name: "assets",
            type: "address[]",
            internalType: "contract IAsset[]",
          },
          {
            name: "minAmountsOut",
            type: "uint256[]",
            internalType: "uint256[]",
          },
          { name: "userData", type: "bytes", internalType: "bytes" },
          { name: "toInternalBalance", type: "bool", internalType: "bool" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getPool",
    inputs: [{ name: "poolId", type: "bytes32", internalType: "bytes32" }],
    outputs: [
      { name: "", type: "address", internalType: "address" },
      { name: "", type: "uint8", internalType: "enum PoolSpecialization" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPoolTokenInfo",
    inputs: [
      { name: "poolId", type: "bytes32", internalType: "bytes32" },
      { name: "token", type: "address", internalType: "contract IERC20" },
    ],
    outputs: [
      { name: "cash", type: "uint256", internalType: "uint256" },
      { name: "managed", type: "uint256", internalType: "uint256" },
      { name: "lastChangeBlock", type: "uint256", internalType: "uint256" },
      { name: "assetManager", type: "address", internalType: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPoolTokens",
    inputs: [{ name: "poolId", type: "bytes32", internalType: "bytes32" }],
    outputs: [
      { name: "tokens", type: "address[]", internalType: "contract IERC20[]" },
      { name: "balances", type: "uint256[]", internalType: "uint256[]" },
      { name: "lastChangeBlock", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "joinPool",
    inputs: [
      { name: "poolId", type: "bytes32", internalType: "bytes32" },
      { name: "sender", type: "address", internalType: "address" },
      { name: "recipient", type: "address", internalType: "address" },
      {
        name: "request",
        type: "tuple",
        internalType: "struct JoinPoolRequest",
        components: [
          {
            name: "assets",
            type: "address[]",
            internalType: "contract IAsset[]",
          },
          {
            name: "maxAmountsIn",
            type: "uint256[]",
            internalType: "uint256[]",
          },
          { name: "userData", type: "bytes", internalType: "bytes" },
          { name: "fromInternalBalance", type: "bool", internalType: "bool" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "queryBatchSwap",
    inputs: [
      { name: "kind", type: "uint8", internalType: "enum SwapKind" },
      {
        name: "swaps",
        type: "tuple[]",
        internalType: "struct BatchSwapStep[]",
        components: [
          { name: "poolId", type: "bytes32", internalType: "bytes32" },
          { name: "assetInIndex", type: "uint256", internalType: "uint256" },
          { name: "assetOutIndex", type: "uint256", internalType: "uint256" },
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "userData", type: "bytes", internalType: "bytes" },
        ],
      },
      { name: "assets", type: "address[]", internalType: "contract IAsset[]" },
      {
        name: "funds",
        type: "tuple",
        internalType: "struct FundManagement",
        components: [
          { name: "sender", type: "address", internalType: "address" },
          { name: "fromInternalBalance", type: "bool", internalType: "bool" },
          {
            name: "recipient",
            type: "address",
            internalType: "address payable",
          },
          { name: "toInternalBalance", type: "bool", internalType: "bool" },
        ],
      },
    ],
    outputs: [
      { name: "assetDeltas", type: "int256[]", internalType: "int256[]" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "swap",
    inputs: [
      {
        name: "singleSwap",
        type: "tuple",
        internalType: "struct SingleSwap",
        components: [
          { name: "poolId", type: "bytes32", internalType: "bytes32" },
          { name: "kind", type: "uint8", internalType: "enum SwapKind" },
          { name: "assetIn", type: "address", internalType: "contract IAsset" },
          {
            name: "assetOut",
            type: "address",
            internalType: "contract IAsset",
          },
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "userData", type: "bytes", internalType: "bytes" },
        ],
      },
      {
        name: "funds",
        type: "tuple",
        internalType: "struct FundManagement",
        components: [
          { name: "sender", type: "address", internalType: "address" },
          { name: "fromInternalBalance", type: "bool", internalType: "bool" },
          {
            name: "recipient",
            type: "address",
            internalType: "address payable",
          },
          { name: "toInternalBalance", type: "bool", internalType: "bool" },
        ],
      },
      { name: "limit", type: "uint256", internalType: "uint256" },
      { name: "deadline", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      { name: "amountCalculated", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
] as const;

const abi = iBalancerV2VaultAdapterAbi;
type abi = typeof abi;

const protocolAbi = iBalancerV2VaultAbi;
type protocolAbi = typeof protocolAbi;

export class BalancerV2VaultAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #supportedPoolIds?: string[];
  #poolStatuses?: BalancerV2PoolStatus[];

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "bytes32[]", name: "supportedPoolIds" },
          { type: "uint8[]", name: "poolStatuses" },
        ],
        args.baseParams.serializedParams,
      );

      this.#supportedPoolIds = [...decoded[2]];
      this.#poolStatuses = decoded[3].map(
        status => status as BalancerV2PoolStatus,
      );
    }
  }

  get supportedPoolIds(): string[] {
    if (!this.#supportedPoolIds)
      throw new MissingSerializedParamsError("supportedPoolIds");
    return this.#supportedPoolIds;
  }

  get poolStatuses(): BalancerV2PoolStatus[] {
    if (!this.#poolStatuses)
      throw new MissingSerializedParamsError("poolStatuses");
    return this.#poolStatuses;
  }

  /** Legacy adapter not present in integrations-v3. Go: BalancerSwap via operation_type_v3.go L106-L125 */
  protected override classifyLegacyOperation(
    _parsed: ParsedCallV2,
    _transfers: Transfers,
  ): LegacyAdapterOperation {
    throw new Error(
      `classifyLegacyOperation is not supported for legacy adapter: ${this.contractType}`,
    );
  }
}
