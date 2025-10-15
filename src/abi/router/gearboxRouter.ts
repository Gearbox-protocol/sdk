export const gearboxRouterAbi = [
  {
    type: "constructor",
    inputs: [{ name: "owner", type: "address", internalType: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "componentAddressByType",
    inputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "", type: "address", internalType: "address" }],
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
    name: "createOpenStrategyPathTask",
    inputs: [
      {
        name: "creditManager",
        type: "address",
        internalType: "contract ICreditManagerV3",
      },
      { name: "target", type: "address", internalType: "address" },
      { name: "slippage", type: "uint256", internalType: "uint256" },
      {
        name: "tData",
        type: "tuple[]",
        internalType: "struct TokenData[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          { name: "balance", type: "uint256", internalType: "uint256" },
          { name: "leftoverBalance", type: "uint256", internalType: "uint256" },
          { name: "numSplits", type: "uint256", internalType: "uint256" },
          { name: "claimRewards", type: "bool", internalType: "bool" },
        ],
      },
    ],
    outputs: [
      {
        name: "task",
        type: "tuple",
        internalType: "struct StrategyPathTask",
        components: [
          { name: "creditAccount", type: "address", internalType: "address" },
          {
            name: "graph",
            type: "tuple",
            internalType: "struct Graph",
            components: [
              {
                name: "vertices",
                type: "tuple[]",
                internalType: "struct Vertex[]",
                components: [
                  { name: "token", type: "address", internalType: "address" },
                  { name: "balance", type: "uint256", internalType: "uint256" },
                  {
                    name: "leftoverBalance",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "numSplits",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "currentOptimalEdge",
                    type: "uint256",
                    internalType: "uint256",
                  },
                ],
              },
              {
                name: "edges",
                type: "tuple[]",
                internalType: "struct Edge[]",
                components: [
                  { name: "id", type: "uint256", internalType: "uint256" },
                  { name: "tokenIn", type: "address", internalType: "address" },
                  {
                    name: "tokenOut",
                    type: "address",
                    internalType: "address",
                  },
                  { name: "adapter", type: "address", internalType: "address" },
                  { name: "worker", type: "address", internalType: "address" },
                  { name: "extraData", type: "bytes", internalType: "bytes" },
                  {
                    name: "amountInTotal",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "amountOutTotal",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "amountInCurrent",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "amountOutCurrent",
                    type: "uint256",
                    internalType: "uint256",
                  },
                ],
              },
            ],
          },
          { name: "target", type: "address", internalType: "address" },
          { name: "adapters", type: "address[]", internalType: "address[]" },
          { name: "slippage", type: "uint256", internalType: "uint256" },
          { name: "force", type: "bool", internalType: "bool" },
          {
            name: "initTargetBalance",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "calls",
            type: "tuple[]",
            internalType: "struct MultiCall[]",
            components: [
              { name: "target", type: "address", internalType: "address" },
              { name: "callData", type: "bytes", internalType: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createStrategyPathTask",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
      { name: "target", type: "address", internalType: "address" },
      { name: "slippage", type: "uint256", internalType: "uint256" },
      { name: "force", type: "bool", internalType: "bool" },
      {
        name: "tData",
        type: "tuple[]",
        internalType: "struct TokenData[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          { name: "balance", type: "uint256", internalType: "uint256" },
          { name: "leftoverBalance", type: "uint256", internalType: "uint256" },
          { name: "numSplits", type: "uint256", internalType: "uint256" },
          { name: "claimRewards", type: "bool", internalType: "bool" },
        ],
      },
    ],
    outputs: [
      {
        name: "task",
        type: "tuple",
        internalType: "struct StrategyPathTask",
        components: [
          { name: "creditAccount", type: "address", internalType: "address" },
          {
            name: "graph",
            type: "tuple",
            internalType: "struct Graph",
            components: [
              {
                name: "vertices",
                type: "tuple[]",
                internalType: "struct Vertex[]",
                components: [
                  { name: "token", type: "address", internalType: "address" },
                  { name: "balance", type: "uint256", internalType: "uint256" },
                  {
                    name: "leftoverBalance",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "numSplits",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "currentOptimalEdge",
                    type: "uint256",
                    internalType: "uint256",
                  },
                ],
              },
              {
                name: "edges",
                type: "tuple[]",
                internalType: "struct Edge[]",
                components: [
                  { name: "id", type: "uint256", internalType: "uint256" },
                  { name: "tokenIn", type: "address", internalType: "address" },
                  {
                    name: "tokenOut",
                    type: "address",
                    internalType: "address",
                  },
                  { name: "adapter", type: "address", internalType: "address" },
                  { name: "worker", type: "address", internalType: "address" },
                  { name: "extraData", type: "bytes", internalType: "bytes" },
                  {
                    name: "amountInTotal",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "amountOutTotal",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "amountInCurrent",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "amountOutCurrent",
                    type: "uint256",
                    internalType: "uint256",
                  },
                ],
              },
            ],
          },
          { name: "target", type: "address", internalType: "address" },
          { name: "adapters", type: "address[]", internalType: "address[]" },
          { name: "slippage", type: "uint256", internalType: "uint256" },
          { name: "force", type: "bool", internalType: "bool" },
          {
            name: "initTargetBalance",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "calls",
            type: "tuple[]",
            internalType: "struct MultiCall[]",
            components: [
              { name: "target", type: "address", internalType: "address" },
              { name: "callData", type: "bytes", internalType: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "futureRouter",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAdapters",
    inputs: [
      {
        name: "creditManager",
        type: "address",
        internalType: "contract ICreditManagerV3",
      },
    ],
    outputs: [{ name: "result", type: "address[]", internalType: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDefaultTokenData",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "tData",
        type: "tuple[]",
        internalType: "struct TokenData[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          { name: "balance", type: "uint256", internalType: "uint256" },
          { name: "leftoverBalance", type: "uint256", internalType: "uint256" },
          { name: "numSplits", type: "uint256", internalType: "uint256" },
          { name: "claimRewards", type: "bool", internalType: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isRouterConfigurator",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "knownComponentTypes",
    inputs: [],
    outputs: [
      { name: "knownTypes", type: "bytes32[]", internalType: "bytes32[]" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "migrateRouterComponents",
    inputs: [{ name: "_prevRouter", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "processClaims",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
      {
        name: "tData",
        type: "tuple[]",
        internalType: "struct TokenData[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          { name: "balance", type: "uint256", internalType: "uint256" },
          { name: "leftoverBalance", type: "uint256", internalType: "uint256" },
          { name: "numSplits", type: "uint256", internalType: "uint256" },
          { name: "claimRewards", type: "bool", internalType: "bool" },
        ],
      },
    ],
    outputs: [
      {
        name: "calls",
        type: "tuple[]",
        internalType: "struct MultiCall[]",
        components: [
          { name: "target", type: "address", internalType: "address" },
          { name: "callData", type: "bytes", internalType: "bytes" },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "renounceOwnership",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "routeManyToOne",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
      { name: "target", type: "address", internalType: "address" },
      { name: "slippage", type: "uint256", internalType: "uint256" },
      {
        name: "tData",
        type: "tuple[]",
        internalType: "struct TokenData[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          { name: "balance", type: "uint256", internalType: "uint256" },
          { name: "leftoverBalance", type: "uint256", internalType: "uint256" },
          { name: "numSplits", type: "uint256", internalType: "uint256" },
          { name: "claimRewards", type: "bool", internalType: "bool" },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct RouterResult",
        components: [
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "minAmount", type: "uint256", internalType: "uint256" },
          {
            name: "calls",
            type: "tuple[]",
            internalType: "struct MultiCall[]",
            components: [
              { name: "target", type: "address", internalType: "address" },
              { name: "callData", type: "bytes", internalType: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "routeOneToOne",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
      { name: "tokenIn", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
      { name: "target", type: "address", internalType: "address" },
      { name: "slippage", type: "uint256", internalType: "uint256" },
      { name: "numSplits", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct RouterResult",
        components: [
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "minAmount", type: "uint256", internalType: "uint256" },
          {
            name: "calls",
            type: "tuple[]",
            internalType: "struct MultiCall[]",
            components: [
              { name: "target", type: "address", internalType: "address" },
              { name: "callData", type: "bytes", internalType: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "routeOneToOneDiff",
    inputs: [
      { name: "creditAccount", type: "address", internalType: "address" },
      { name: "tokenIn", type: "address", internalType: "address" },
      { name: "balance", type: "uint256", internalType: "uint256" },
      { name: "leftoverBalance", type: "uint256", internalType: "uint256" },
      { name: "target", type: "address", internalType: "address" },
      { name: "slippage", type: "uint256", internalType: "uint256" },
      { name: "numSplits", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct RouterResult",
        components: [
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "minAmount", type: "uint256", internalType: "uint256" },
          {
            name: "calls",
            type: "tuple[]",
            internalType: "struct MultiCall[]",
            components: [
              { name: "target", type: "address", internalType: "address" },
              { name: "callData", type: "bytes", internalType: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "routeOpenManyToOne",
    inputs: [
      { name: "creditManager", type: "address", internalType: "address" },
      { name: "target", type: "address", internalType: "address" },
      { name: "slippage", type: "uint256", internalType: "uint256" },
      {
        name: "tData",
        type: "tuple[]",
        internalType: "struct TokenData[]",
        components: [
          { name: "token", type: "address", internalType: "address" },
          { name: "balance", type: "uint256", internalType: "uint256" },
          { name: "leftoverBalance", type: "uint256", internalType: "uint256" },
          { name: "numSplits", type: "uint256", internalType: "uint256" },
          { name: "claimRewards", type: "bool", internalType: "bool" },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct RouterResult",
        components: [
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "minAmount", type: "uint256", internalType: "uint256" },
          {
            name: "calls",
            type: "tuple[]",
            internalType: "struct MultiCall[]",
            components: [
              { name: "target", type: "address", internalType: "address" },
              { name: "callData", type: "bytes", internalType: "bytes" },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "routingManager",
    inputs: [],
    outputs: [
      { name: "", type: "address", internalType: "contract IRoutingManager" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setFutureRouter",
    inputs: [
      { name: "_futureRouter", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setPathComponent",
    inputs: [
      { name: "componentAddress", type: "address", internalType: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setPathComponentBatch",
    inputs: [
      {
        name: "componentAddresses",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferOwnership",
    inputs: [{ name: "newOwner", type: "address", internalType: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
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
    name: "OwnershipTransferred",
    inputs: [
      {
        name: "previousOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newOwner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RouterComponentUpdate",
    inputs: [
      { name: "", type: "bytes32", indexed: true, internalType: "bytes32" },
      { name: "", type: "address", indexed: true, internalType: "address" },
      {
        name: "version",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SetFutureRouter",
    inputs: [
      { name: "", type: "address", indexed: true, internalType: "address" },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "UnsupportedRouterComponent",
    inputs: [{ name: "", type: "address", internalType: "address" }],
  },
] as const;
