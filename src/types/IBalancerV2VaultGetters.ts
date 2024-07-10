//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IBalancerV2VaultGetters
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iBalancerV2VaultGettersAbi = [
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
] as const

