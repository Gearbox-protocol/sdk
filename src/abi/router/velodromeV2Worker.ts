export const velodromeV2WorkerAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_router", type: "address", internalType: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "buildEdges",
    inputs: [
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
      { name: "adapter", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "",
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
    name: "getEdgeAmountOutCurrent",
    inputs: [
      {
        name: "edge",
        type: "tuple",
        internalType: "struct Edge",
        components: [
          { name: "id", type: "uint256", internalType: "uint256" },
          { name: "tokenIn", type: "address", internalType: "address" },
          { name: "tokenOut", type: "address", internalType: "address" },
          { name: "adapter", type: "address", internalType: "address" },
          { name: "worker", type: "address", internalType: "address" },
          { name: "extraData", type: "bytes", internalType: "bytes" },
          { name: "amountInTotal", type: "uint256", internalType: "uint256" },
          { name: "amountOutTotal", type: "uint256", internalType: "uint256" },
          { name: "amountInCurrent", type: "uint256", internalType: "uint256" },
          {
            name: "amountOutCurrent",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
    ],
    outputs: [
      { name: "amountOutCurrent", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMulticalls",
    inputs: [
      {
        name: "edge",
        type: "tuple",
        internalType: "struct Edge",
        components: [
          { name: "id", type: "uint256", internalType: "uint256" },
          { name: "tokenIn", type: "address", internalType: "address" },
          { name: "tokenOut", type: "address", internalType: "address" },
          { name: "adapter", type: "address", internalType: "address" },
          { name: "worker", type: "address", internalType: "address" },
          { name: "extraData", type: "bytes", internalType: "bytes" },
          { name: "amountInTotal", type: "uint256", internalType: "uint256" },
          { name: "amountOutTotal", type: "uint256", internalType: "uint256" },
          { name: "amountInCurrent", type: "uint256", internalType: "uint256" },
          {
            name: "amountOutCurrent",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
      { name: "currentBalance", type: "uint256", internalType: "uint256" },
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
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isNonLinear",
    inputs: [],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
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
    name: "processClaims",
    inputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct Edge",
        components: [
          { name: "id", type: "uint256", internalType: "uint256" },
          { name: "tokenIn", type: "address", internalType: "address" },
          { name: "tokenOut", type: "address", internalType: "address" },
          { name: "adapter", type: "address", internalType: "address" },
          { name: "worker", type: "address", internalType: "address" },
          { name: "extraData", type: "bytes", internalType: "bytes" },
          { name: "amountInTotal", type: "uint256", internalType: "uint256" },
          { name: "amountOutTotal", type: "uint256", internalType: "uint256" },
          { name: "amountInCurrent", type: "uint256", internalType: "uint256" },
          {
            name: "amountOutCurrent",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
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
      { name: "", type: "address", internalType: "address" },
    ],
    outputs: [
      {
        name: "",
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
        name: "",
        type: "tuple[]",
        internalType: "struct MultiCall[]",
        components: [
          { name: "target", type: "address", internalType: "address" },
          { name: "callData", type: "bytes", internalType: "bytes" },
        ],
      },
    ],
    stateMutability: "pure",
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
    name: "trimSpecialVertex",
    inputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct Edge",
        components: [
          { name: "id", type: "uint256", internalType: "uint256" },
          { name: "tokenIn", type: "address", internalType: "address" },
          { name: "tokenOut", type: "address", internalType: "address" },
          { name: "adapter", type: "address", internalType: "address" },
          { name: "worker", type: "address", internalType: "address" },
          { name: "extraData", type: "bytes", internalType: "bytes" },
          { name: "amountInTotal", type: "uint256", internalType: "uint256" },
          { name: "amountOutTotal", type: "uint256", internalType: "uint256" },
          { name: "amountInCurrent", type: "uint256", internalType: "uint256" },
          {
            name: "amountOutCurrent",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
      {
        name: "",
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
      { name: "", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "pure",
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
