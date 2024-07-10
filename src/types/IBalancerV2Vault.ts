//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IBalancerV2Vault
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iBalancerV2VaultAbi = [
  {
    type: "function",
    inputs: [
      { name: "kind", internalType: "enum SwapKind", type: "uint8" },
      {
        name: "swaps",
        internalType: "struct BatchSwapStep[]",
        type: "tuple[]",
        components: [
          { name: "poolId", internalType: "bytes32", type: "bytes32" },
          { name: "assetInIndex", internalType: "uint256", type: "uint256" },
          { name: "assetOutIndex", internalType: "uint256", type: "uint256" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "userData", internalType: "bytes", type: "bytes" },
        ],
      },
      { name: "assets", internalType: "contract IAsset[]", type: "address[]" },
      {
        name: "funds",
        internalType: "struct FundManagement",
        type: "tuple",
        components: [
          { name: "sender", internalType: "address", type: "address" },
          { name: "fromInternalBalance", internalType: "bool", type: "bool" },
          {
            name: "recipient",
            internalType: "address payable",
            type: "address",
          },
          { name: "toInternalBalance", internalType: "bool", type: "bool" },
        ],
      },
      { name: "limits", internalType: "int256[]", type: "int256[]" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
    ],
    name: "batchSwap",
    outputs: [
      { name: "assetDeltas", internalType: "int256[]", type: "int256[]" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "poolId", internalType: "bytes32", type: "bytes32" },
      { name: "sender", internalType: "address", type: "address" },
      { name: "recipient", internalType: "address payable", type: "address" },
      {
        name: "request",
        internalType: "struct ExitPoolRequest",
        type: "tuple",
        components: [
          {
            name: "assets",
            internalType: "contract IAsset[]",
            type: "address[]",
          },
          {
            name: "minAmountsOut",
            internalType: "uint256[]",
            type: "uint256[]",
          },
          { name: "userData", internalType: "bytes", type: "bytes" },
          { name: "toInternalBalance", internalType: "bool", type: "bool" },
        ],
      },
    ],
    name: "exitPool",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "poolId", internalType: "bytes32", type: "bytes32" }],
    name: "getPool",
    outputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "enum PoolSpecialization", type: "uint8" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "poolId", internalType: "bytes32", type: "bytes32" },
      { name: "token", internalType: "contract IERC20", type: "address" },
    ],
    name: "getPoolTokenInfo",
    outputs: [
      { name: "cash", internalType: "uint256", type: "uint256" },
      { name: "managed", internalType: "uint256", type: "uint256" },
      { name: "lastChangeBlock", internalType: "uint256", type: "uint256" },
      { name: "assetManager", internalType: "address", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "poolId", internalType: "bytes32", type: "bytes32" }],
    name: "getPoolTokens",
    outputs: [
      { name: "tokens", internalType: "contract IERC20[]", type: "address[]" },
      { name: "balances", internalType: "uint256[]", type: "uint256[]" },
      { name: "lastChangeBlock", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "poolId", internalType: "bytes32", type: "bytes32" },
      { name: "sender", internalType: "address", type: "address" },
      { name: "recipient", internalType: "address", type: "address" },
      {
        name: "request",
        internalType: "struct JoinPoolRequest",
        type: "tuple",
        components: [
          {
            name: "assets",
            internalType: "contract IAsset[]",
            type: "address[]",
          },
          {
            name: "maxAmountsIn",
            internalType: "uint256[]",
            type: "uint256[]",
          },
          { name: "userData", internalType: "bytes", type: "bytes" },
          { name: "fromInternalBalance", internalType: "bool", type: "bool" },
        ],
      },
    ],
    name: "joinPool",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "kind", internalType: "enum SwapKind", type: "uint8" },
      {
        name: "swaps",
        internalType: "struct BatchSwapStep[]",
        type: "tuple[]",
        components: [
          { name: "poolId", internalType: "bytes32", type: "bytes32" },
          { name: "assetInIndex", internalType: "uint256", type: "uint256" },
          { name: "assetOutIndex", internalType: "uint256", type: "uint256" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "userData", internalType: "bytes", type: "bytes" },
        ],
      },
      { name: "assets", internalType: "contract IAsset[]", type: "address[]" },
      {
        name: "funds",
        internalType: "struct FundManagement",
        type: "tuple",
        components: [
          { name: "sender", internalType: "address", type: "address" },
          { name: "fromInternalBalance", internalType: "bool", type: "bool" },
          {
            name: "recipient",
            internalType: "address payable",
            type: "address",
          },
          { name: "toInternalBalance", internalType: "bool", type: "bool" },
        ],
      },
    ],
    name: "queryBatchSwap",
    outputs: [
      { name: "assetDeltas", internalType: "int256[]", type: "int256[]" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "singleSwap",
        internalType: "struct SingleSwap",
        type: "tuple",
        components: [
          { name: "poolId", internalType: "bytes32", type: "bytes32" },
          { name: "kind", internalType: "enum SwapKind", type: "uint8" },
          { name: "assetIn", internalType: "contract IAsset", type: "address" },
          {
            name: "assetOut",
            internalType: "contract IAsset",
            type: "address",
          },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "userData", internalType: "bytes", type: "bytes" },
        ],
      },
      {
        name: "funds",
        internalType: "struct FundManagement",
        type: "tuple",
        components: [
          { name: "sender", internalType: "address", type: "address" },
          { name: "fromInternalBalance", internalType: "bool", type: "bool" },
          {
            name: "recipient",
            internalType: "address payable",
            type: "address",
          },
          { name: "toInternalBalance", internalType: "bool", type: "bool" },
        ],
      },
      { name: "limit", internalType: "uint256", type: "uint256" },
      { name: "deadline", internalType: "uint256", type: "uint256" },
    ],
    name: "swap",
    outputs: [
      { name: "amountCalculated", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
] as const

