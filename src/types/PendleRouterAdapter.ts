//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PendleRouterAdapter
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const pendleRouterAdapterAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_creditManager", internalType: "address", type: "address" },
      { name: "_pendleRouter", internalType: "address", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterType",
    outputs: [{ name: "", internalType: "enum AdapterType", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "_gearboxAdapterVersion",
    outputs: [{ name: "", internalType: "uint16", type: "uint16" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "acl",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "addressProvider",
    outputs: [{ name: "", internalType: "address", type: "address" }],
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
    inputs: [],
    name: "getAllowedPairs",
    outputs: [
      {
        name: "pairs",
        internalType: "struct PendlePairStatus[]",
        type: "tuple[]",
        components: [
          { name: "market", internalType: "address", type: "address" },
          { name: "inputToken", internalType: "address", type: "address" },
          { name: "pendleToken", internalType: "address", type: "address" },
          { name: "status", internalType: "enum PendleStatus", type: "uint8" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "isPairAllowed",
    outputs: [{ name: "", internalType: "enum PendleStatus", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "", internalType: "address", type: "address" },
    ],
    name: "isRedemptionAllowed",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "ptToMarket",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "yt", internalType: "address", type: "address" },
      { name: "leftoverPt", internalType: "uint256", type: "uint256" },
      {
        name: "diffOutput",
        internalType: "struct TokenDiffOutput",
        type: "tuple",
        components: [
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "minRateRAY", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "redeemDiffPyToToken",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "yt", internalType: "address", type: "address" },
      { name: "netPyIn", internalType: "uint256", type: "uint256" },
      {
        name: "output",
        internalType: "struct TokenOutput",
        type: "tuple",
        components: [
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "minTokenOut", internalType: "uint256", type: "uint256" },
          { name: "tokenRedeemSy", internalType: "address", type: "address" },
          { name: "pendleSwap", internalType: "address", type: "address" },
          {
            name: "swapData",
            internalType: "struct SwapData",
            type: "tuple",
            components: [
              {
                name: "swapType",
                internalType: "enum SwapType",
                type: "uint8",
              },
              { name: "extRouter", internalType: "address", type: "address" },
              { name: "extCalldata", internalType: "bytes", type: "bytes" },
              { name: "needScale", internalType: "bool", type: "bool" },
            ],
          },
        ],
      },
    ],
    name: "redeemPyToToken",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "pairs",
        internalType: "struct PendlePairStatus[]",
        type: "tuple[]",
        components: [
          { name: "market", internalType: "address", type: "address" },
          { name: "inputToken", internalType: "address", type: "address" },
          { name: "pendleToken", internalType: "address", type: "address" },
          { name: "status", internalType: "enum PendleStatus", type: "uint8" },
        ],
      },
    ],
    name: "setPairStatusBatch",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "market", internalType: "address", type: "address" },
      { name: "leftoverPt", internalType: "uint256", type: "uint256" },
      {
        name: "diffOutput",
        internalType: "struct TokenDiffOutput",
        type: "tuple",
        components: [
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "minRateRAY", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "swapDiffPtForToken",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "market", internalType: "address", type: "address" },
      { name: "minRateRAY", internalType: "uint256", type: "uint256" },
      {
        name: "guessPtOut",
        internalType: "struct ApproxParams",
        type: "tuple",
        components: [
          { name: "guessMin", internalType: "uint256", type: "uint256" },
          { name: "guessMax", internalType: "uint256", type: "uint256" },
          { name: "guessOffchain", internalType: "uint256", type: "uint256" },
          { name: "maxIteration", internalType: "uint256", type: "uint256" },
          { name: "eps", internalType: "uint256", type: "uint256" },
        ],
      },
      {
        name: "diffInput",
        internalType: "struct TokenDiffInput",
        type: "tuple",
        components: [
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "leftoverTokenIn", internalType: "uint256", type: "uint256" },
        ],
      },
    ],
    name: "swapDiffTokenForPt",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "market", internalType: "address", type: "address" },
      { name: "exactPtIn", internalType: "uint256", type: "uint256" },
      {
        name: "output",
        internalType: "struct TokenOutput",
        type: "tuple",
        components: [
          { name: "tokenOut", internalType: "address", type: "address" },
          { name: "minTokenOut", internalType: "uint256", type: "uint256" },
          { name: "tokenRedeemSy", internalType: "address", type: "address" },
          { name: "pendleSwap", internalType: "address", type: "address" },
          {
            name: "swapData",
            internalType: "struct SwapData",
            type: "tuple",
            components: [
              {
                name: "swapType",
                internalType: "enum SwapType",
                type: "uint8",
              },
              { name: "extRouter", internalType: "address", type: "address" },
              { name: "extCalldata", internalType: "bytes", type: "bytes" },
              { name: "needScale", internalType: "bool", type: "bool" },
            ],
          },
        ],
      },
      {
        name: "",
        internalType: "struct LimitOrderData",
        type: "tuple",
        components: [
          { name: "limitRouter", internalType: "address", type: "address" },
          { name: "epsSkipMarket", internalType: "uint256", type: "uint256" },
          {
            name: "normalFills",
            internalType: "struct FillOrderParams[]",
            type: "tuple[]",
            components: [
              {
                name: "order",
                internalType: "struct Order",
                type: "tuple",
                components: [
                  { name: "salt", internalType: "uint256", type: "uint256" },
                  { name: "expiry", internalType: "uint256", type: "uint256" },
                  { name: "nonce", internalType: "uint256", type: "uint256" },
                  {
                    name: "orderType",
                    internalType: "enum OrderType",
                    type: "uint8",
                  },
                  { name: "token", internalType: "address", type: "address" },
                  { name: "YT", internalType: "address", type: "address" },
                  { name: "maker", internalType: "address", type: "address" },
                  {
                    name: "receiver",
                    internalType: "address",
                    type: "address",
                  },
                  {
                    name: "makingAmount",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  {
                    name: "lnImpliedRate",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  {
                    name: "failSafeRate",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  { name: "permit", internalType: "bytes", type: "bytes" },
                ],
              },
              { name: "signature", internalType: "bytes", type: "bytes" },
              {
                name: "makingAmount",
                internalType: "uint256",
                type: "uint256",
              },
            ],
          },
          {
            name: "flashFills",
            internalType: "struct FillOrderParams[]",
            type: "tuple[]",
            components: [
              {
                name: "order",
                internalType: "struct Order",
                type: "tuple",
                components: [
                  { name: "salt", internalType: "uint256", type: "uint256" },
                  { name: "expiry", internalType: "uint256", type: "uint256" },
                  { name: "nonce", internalType: "uint256", type: "uint256" },
                  {
                    name: "orderType",
                    internalType: "enum OrderType",
                    type: "uint8",
                  },
                  { name: "token", internalType: "address", type: "address" },
                  { name: "YT", internalType: "address", type: "address" },
                  { name: "maker", internalType: "address", type: "address" },
                  {
                    name: "receiver",
                    internalType: "address",
                    type: "address",
                  },
                  {
                    name: "makingAmount",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  {
                    name: "lnImpliedRate",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  {
                    name: "failSafeRate",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  { name: "permit", internalType: "bytes", type: "bytes" },
                ],
              },
              { name: "signature", internalType: "bytes", type: "bytes" },
              {
                name: "makingAmount",
                internalType: "uint256",
                type: "uint256",
              },
            ],
          },
          { name: "optData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "swapExactPtForToken",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "", internalType: "address", type: "address" },
      { name: "market", internalType: "address", type: "address" },
      { name: "minPtOut", internalType: "uint256", type: "uint256" },
      {
        name: "guessPtOut",
        internalType: "struct ApproxParams",
        type: "tuple",
        components: [
          { name: "guessMin", internalType: "uint256", type: "uint256" },
          { name: "guessMax", internalType: "uint256", type: "uint256" },
          { name: "guessOffchain", internalType: "uint256", type: "uint256" },
          { name: "maxIteration", internalType: "uint256", type: "uint256" },
          { name: "eps", internalType: "uint256", type: "uint256" },
        ],
      },
      {
        name: "input",
        internalType: "struct TokenInput",
        type: "tuple",
        components: [
          { name: "tokenIn", internalType: "address", type: "address" },
          { name: "netTokenIn", internalType: "uint256", type: "uint256" },
          { name: "tokenMintSy", internalType: "address", type: "address" },
          { name: "pendleSwap", internalType: "address", type: "address" },
          {
            name: "swapData",
            internalType: "struct SwapData",
            type: "tuple",
            components: [
              {
                name: "swapType",
                internalType: "enum SwapType",
                type: "uint8",
              },
              { name: "extRouter", internalType: "address", type: "address" },
              { name: "extCalldata", internalType: "bytes", type: "bytes" },
              { name: "needScale", internalType: "bool", type: "bool" },
            ],
          },
        ],
      },
      {
        name: "",
        internalType: "struct LimitOrderData",
        type: "tuple",
        components: [
          { name: "limitRouter", internalType: "address", type: "address" },
          { name: "epsSkipMarket", internalType: "uint256", type: "uint256" },
          {
            name: "normalFills",
            internalType: "struct FillOrderParams[]",
            type: "tuple[]",
            components: [
              {
                name: "order",
                internalType: "struct Order",
                type: "tuple",
                components: [
                  { name: "salt", internalType: "uint256", type: "uint256" },
                  { name: "expiry", internalType: "uint256", type: "uint256" },
                  { name: "nonce", internalType: "uint256", type: "uint256" },
                  {
                    name: "orderType",
                    internalType: "enum OrderType",
                    type: "uint8",
                  },
                  { name: "token", internalType: "address", type: "address" },
                  { name: "YT", internalType: "address", type: "address" },
                  { name: "maker", internalType: "address", type: "address" },
                  {
                    name: "receiver",
                    internalType: "address",
                    type: "address",
                  },
                  {
                    name: "makingAmount",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  {
                    name: "lnImpliedRate",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  {
                    name: "failSafeRate",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  { name: "permit", internalType: "bytes", type: "bytes" },
                ],
              },
              { name: "signature", internalType: "bytes", type: "bytes" },
              {
                name: "makingAmount",
                internalType: "uint256",
                type: "uint256",
              },
            ],
          },
          {
            name: "flashFills",
            internalType: "struct FillOrderParams[]",
            type: "tuple[]",
            components: [
              {
                name: "order",
                internalType: "struct Order",
                type: "tuple",
                components: [
                  { name: "salt", internalType: "uint256", type: "uint256" },
                  { name: "expiry", internalType: "uint256", type: "uint256" },
                  { name: "nonce", internalType: "uint256", type: "uint256" },
                  {
                    name: "orderType",
                    internalType: "enum OrderType",
                    type: "uint8",
                  },
                  { name: "token", internalType: "address", type: "address" },
                  { name: "YT", internalType: "address", type: "address" },
                  { name: "maker", internalType: "address", type: "address" },
                  {
                    name: "receiver",
                    internalType: "address",
                    type: "address",
                  },
                  {
                    name: "makingAmount",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  {
                    name: "lnImpliedRate",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  {
                    name: "failSafeRate",
                    internalType: "uint256",
                    type: "uint256",
                  },
                  { name: "permit", internalType: "bytes", type: "bytes" },
                ],
              },
              { name: "signature", internalType: "bytes", type: "bytes" },
              {
                name: "makingAmount",
                internalType: "uint256",
                type: "uint256",
              },
            ],
          },
          { name: "optData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "swapExactTokenForPt",
    outputs: [
      { name: "tokensToEnable", internalType: "uint256", type: "uint256" },
      { name: "tokensToDisable", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "targetContract",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "market",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "inputToken",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "pendleToken",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "allowed",
        internalType: "enum PendleStatus",
        type: "uint8",
        indexed: false,
      },
    ],
    name: "SetPairStatus",
  },
  { type: "error", inputs: [], name: "CallerNotConfiguratorException" },
  { type: "error", inputs: [], name: "CallerNotCreditFacadeException" },
  { type: "error", inputs: [], name: "PairNotAllowedException" },
  { type: "error", inputs: [], name: "RedemptionNotAllowedException" },
  { type: "error", inputs: [], name: "ZeroAddressException" },
] as const

