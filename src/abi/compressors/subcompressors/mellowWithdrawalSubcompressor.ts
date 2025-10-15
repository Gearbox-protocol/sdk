export const mellowWithdrawalSubcompressorAbi = [
  {
    type: "function",
    name: "contractType",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCurrentWithdrawals",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
      { name: "token", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct ClaimableWithdrawal[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          {
            name: "withdrawalPhantomToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "withdrawalTokenSpent",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "outputs",
            type: "tuple[]",
            internalType: "struct WithdrawalOutput[]",
            components: [
              { name: "token", type: "address", internalType: "address" },
              { name: "isDelayed", type: "bool", internalType: "bool" },
              { name: "amount", type: "uint256", internalType: "uint256" },
            ],
          },
          {
            name: "claimCalls",
            type: "tuple[]",
            internalType: "struct MultiCall[]",
            components: [
              { name: "target", type: "address", internalType: "address" },
              { name: "callData", type: "bytes", internalType: "bytes" },
            ],
          },
        ],
      },
      {
        name: "",
        type: "tuple[]",
        internalType: "struct PendingWithdrawal[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          {
            name: "withdrawalPhantomToken",
            type: "address",
            internalType: "address",
          },
          {
            name: "expectedOutputs",
            type: "tuple[]",
            internalType: "struct WithdrawalOutput[]",
            components: [
              { name: "token", type: "address", internalType: "address" },
              { name: "isDelayed", type: "bool", internalType: "bool" },
              { name: "amount", type: "uint256", internalType: "uint256" },
            ],
          },
          { name: "claimableAt", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getWithdrawableAssets",
    inputs: [
      { name: "", type: "address", internalType: "address" },
      { name: "token", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct WithdrawableAsset[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          {
            name: "withdrawalPhantomToken",
            type: "address",
            internalType: "address",
          },
          { name: "underlying", type: "address", internalType: "address" },
          {
            name: "withdrawalLength",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getWithdrawalRequestResult",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
      { name: "token", type: "address", internalType: "address" },
      { name: "withdrawalToken", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      {
        name: "requestableWithdrawal",
        type: "tuple",
        internalType: "struct RequestableWithdrawal",
        components: [
          { name: "token", type: "address", internalType: "address" },
          { name: "amountIn", type: "uint256", internalType: "uint256" },
          {
            name: "outputs",
            type: "tuple[]",
            internalType: "struct WithdrawalOutput[]",
            components: [
              { name: "token", type: "address", internalType: "address" },
              { name: "isDelayed", type: "bool", internalType: "bool" },
              { name: "amount", type: "uint256", internalType: "uint256" },
            ],
          },
          {
            name: "requestCalls",
            type: "tuple[]",
            internalType: "struct MultiCall[]",
            components: [
              { name: "target", type: "address", internalType: "address" },
              { name: "callData", type: "bytes", internalType: "bytes" },
            ],
          },
          { name: "claimableAt", type: "uint256", internalType: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "version",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
] as const;
