/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IAirdropDistributor
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iAirdropDistributorAbi = [
  {
    type: "function",
    inputs: [
      { name: "index", internalType: "uint256", type: "uint256" },
      { name: "account", internalType: "address", type: "address" },
      { name: "totalAmount", internalType: "uint256", type: "uint256" },
      { name: "merkleProof", internalType: "bytes32[]", type: "bytes32[]" },
    ],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "user", internalType: "address", type: "address" }],
    name: "claimed",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "merkleRoot",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "token",
    outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      { name: "historic", internalType: "bool", type: "bool", indexed: true },
    ],
    name: "Claimed",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "oldRoot",
        internalType: "bytes32",
        type: "bytes32",
        indexed: false,
      },
      {
        name: "newRoot",
        internalType: "bytes32",
        type: "bytes32",
        indexed: true,
      },
    ],
    name: "RootUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "account",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "campaignId",
        internalType: "uint8",
        type: "uint8",
        indexed: true,
      },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "TokenAllocated",
  },
] as const;
