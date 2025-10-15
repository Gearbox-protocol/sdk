export const routingManagerAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", type: "address", internalType: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "adapterTypeToWorkerType",
    inputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "buildGraph",
    inputs: [
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
      { name: "adapters", type: "address[]", internalType: "address[]" },
      { name: "target", type: "address", internalType: "address" },
      { name: "creditAccount", type: "address", internalType: "address" },
    ],
    outputs: [
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
              { name: "numSplits", type: "uint256", internalType: "uint256" },
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
              { name: "tokenOut", type: "address", internalType: "address" },
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
    name: "getWorker",
    inputs: [{ name: "adapter", type: "address", internalType: "address" }],
    outputs: [{ name: "worker", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "migrate",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "route",
    inputs: [
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
    outputs: [
      {
        name: "",
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
    name: "router",
    inputs: [],
    outputs: [
      { name: "", type: "address", internalType: "contract IGearboxRouter" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setAdapterToWorkerType",
    inputs: [
      { name: "adapterType", type: "bytes32", internalType: "bytes32" },
      { name: "workerType", type: "bytes32", internalType: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateRouter",
    inputs: [{ name: "newRouter", type: "address", internalType: "address" }],
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
    name: "NewRouter",
    inputs: [
      { name: "", type: "address", indexed: true, internalType: "address" },
    ],
    anonymous: false,
  },
  { type: "error", name: "FutureRouterOnlyException", inputs: [] },
  { type: "error", name: "MigrationErrorException", inputs: [] },
  { type: "error", name: "RouterOnlyException", inputs: [] },
  { type: "error", name: "RouterOwnerOnlyException", inputs: [] },
] as const;
