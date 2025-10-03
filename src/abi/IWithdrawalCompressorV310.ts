//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IWithdrawalCompressorV310
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iWithdrawalCompressorV310Abi = [
  {
    type: "function",
    inputs: [],
    name: "contractType",
    outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
    ],
    name: "getCurrentWithdrawals",
    outputs: [
      {
        name: "",
        internalType: "struct ClaimableWithdrawal[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          {
            name: "outputs",
            internalType: "struct WithdrawalOutput[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "isDelayed", internalType: "bool", type: "bool" },
              { name: "amount", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "claimCalls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
        ],
      },
      {
        name: "",
        internalType: "struct PendingWithdrawal[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          {
            name: "expectedOutputs",
            internalType: "struct WithdrawalOutput[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "isDelayed", internalType: "bool", type: "bool" },
              { name: "amount", internalType: "uint256", type: "uint256" },
            ],
          },
          { name: "claimableAt", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditManager", internalType: "address", type: "address" },
    ],
    name: "getWithdrawableAssets",
    outputs: [
      {
        name: "",
        internalType: "struct WithdrawableAsset[]",
        type: "tuple[]",
        components: [
          { name: "token", internalType: "address", type: "address" },
          {
            name: "withdrawalPhantomToken",
            internalType: "address",
            type: "address",
          },
          { name: "underlying", internalType: "address", type: "address" },
          {
            name: "withdrawalLength",
            internalType: "uint256",
            type: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "creditAccount", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "getWithdrawalRequestResult",
    outputs: [
      {
        name: "",
        internalType: "struct RequestableWithdrawal",
        type: "tuple",
        components: [
          { name: "token", internalType: "address", type: "address" },
          { name: "amountIn", internalType: "uint256", type: "uint256" },
          {
            name: "outputs",
            internalType: "struct WithdrawalOutput[]",
            type: "tuple[]",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "isDelayed", internalType: "bool", type: "bool" },
              { name: "amount", internalType: "uint256", type: "uint256" },
            ],
          },
          {
            name: "requestCalls",
            internalType: "struct MultiCall[]",
            type: "tuple[]",
            components: [
              { name: "target", internalType: "address", type: "address" },
              { name: "callData", internalType: "bytes", type: "bytes" },
            ],
          },
          { name: "claimableAt", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "version",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
] as const;
