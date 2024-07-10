//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IPermit2
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iPermit2Abi = [
  {
    type: "function",
    inputs: [
      { name: "user", internalType: "address", type: "address" },
      { name: "token", internalType: "address", type: "address" },
      { name: "spender", internalType: "address", type: "address" },
    ],
    name: "allowance",
    outputs: [
      {
        name: "",
        internalType: "struct IPermit2.PackedAllowance",
        type: "tuple",
        components: [
          { name: "amount", internalType: "uint160", type: "uint160" },
          { name: "expiration", internalType: "uint48", type: "uint48" },
          { name: "nonce", internalType: "uint48", type: "uint48" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      {
        name: "permitSingle",
        internalType: "struct IPermit2.PermitSingle",
        type: "tuple",
        components: [
          {
            name: "details",
            internalType: "struct IPermit2.PermitDetails",
            type: "tuple",
            components: [
              { name: "token", internalType: "address", type: "address" },
              { name: "amount", internalType: "uint160", type: "uint160" },
              { name: "expiration", internalType: "uint48", type: "uint48" },
              { name: "nonce", internalType: "uint48", type: "uint48" },
            ],
          },
          { name: "spender", internalType: "address", type: "address" },
          { name: "sigDeadline", internalType: "uint256", type: "uint256" },
        ],
      },
      { name: "signature", internalType: "bytes", type: "bytes" },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "user", internalType: "address", type: "address" },
      { name: "spender", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint160", type: "uint160" },
      { name: "token", internalType: "address", type: "address" },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const

