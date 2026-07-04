/**
 * Local copy of the Convex V1 Booster adapter ABI.
 *
 * The ABI published by `@gearbox-protocol/integrations-v3` is generated from
 * `IConvexV1BoosterAdapter.sol`, which declares `depositDiff`/`withdrawDiff`
 * args as `(leftoverAmount, _pid, ...)`, while the deployed implementation
 * (`ConvexV1_Booster.sol`) — and the calldata encoded by the router — uses
 * `(_pid, leftoverAmount, ...)`. Selectors only depend on types, so encoding
 * works on-chain, but decoding with the interface ABI yields swapped argument
 * names. This copy fixes the argument order to match the implementation.
 */
export const iConvexV1BoosterAdapterAbi = [
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "creditManager",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_pid", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
      { name: "_stake", internalType: "bool", type: "bool" },
    ],
    name: "deposit",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_pid", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
      { name: "_stake", internalType: "bool", type: "bool" },
    ],
    name: "depositDiff",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "pidToConvexToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "pidToCurveToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    name: "pidToPhantomToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "serialize",
    outputs: [{ name: "serializedData", internalType: "bytes", type: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "updateSupportedPids",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "_pid", internalType: "uint256", type: "uint256" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    name: "withdraw",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "_pid", internalType: "uint256", type: "uint256" },
      { name: "leftoverAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "withdrawDiff",
    outputs: [{ name: "useSafePrices", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "pid", internalType: "uint256", type: "uint256", indexed: true },
    ],
    name: "AddSupportedPid",
  },
  { type: "error", inputs: [], name: "UnsupportedPidException" },
] as const;
