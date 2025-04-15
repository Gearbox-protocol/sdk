/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IMulticall3
/// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iMulticall3Abi = [
  {
    type: "function",
    inputs: [
      {
        name: "calls",
        internalType: "struct IMulticall3.Call[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "aggregate",
    outputs: [
      { name: "blockNumber", internalType: "uint256", type: "uint256" },
      { name: "returnData", internalType: "bytes[]", type: "bytes[]" },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "calls",
        internalType: "struct IMulticall3.Call3[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "allowFailure", internalType: "bool", type: "bool" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "aggregate3",
    outputs: [
      {
        name: "returnData",
        internalType: "struct IMulticall3.Result[]",
        type: "tuple[]",
        components: [
          { name: "success", internalType: "bool", type: "bool" },
          { name: "returnData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "calls",
        internalType: "struct IMulticall3.Call3Value[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "allowFailure", internalType: "bool", type: "bool" },
          { name: "value", internalType: "uint256", type: "uint256" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "aggregate3Value",
    outputs: [
      {
        name: "returnData",
        internalType: "struct IMulticall3.Result[]",
        type: "tuple[]",
        components: [
          { name: "success", internalType: "bool", type: "bool" },
          { name: "returnData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "calls",
        internalType: "struct IMulticall3.Call[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "blockAndAggregate",
    outputs: [
      { name: "blockNumber", internalType: "uint256", type: "uint256" },
      { name: "blockHash", internalType: "bytes32", type: "bytes32" },
      {
        name: "returnData",
        internalType: "struct IMulticall3.Result[]",
        type: "tuple[]",
        components: [
          { name: "success", internalType: "bool", type: "bool" },
          { name: "returnData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [],
    name: "getBasefee",
    outputs: [{ name: "basefee", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "blockNumber", internalType: "uint256", type: "uint256" }],
    name: "getBlockHash",
    outputs: [{ name: "blockHash", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getBlockNumber",
    outputs: [
      { name: "blockNumber", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getChainId",
    outputs: [{ name: "chainid", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getCurrentBlockCoinbase",
    outputs: [{ name: "coinbase", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getCurrentBlockDifficulty",
    outputs: [{ name: "difficulty", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getCurrentBlockGasLimit",
    outputs: [{ name: "gaslimit", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getCurrentBlockTimestamp",
    outputs: [{ name: "timestamp", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "addr", internalType: "address", type: "address" }],
    name: "getEthBalance",
    outputs: [{ name: "balance", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getLastBlockHash",
    outputs: [{ name: "blockHash", internalType: "bytes32", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "requireSuccess", internalType: "bool", type: "bool" },
      {
        name: "calls",
        internalType: "struct IMulticall3.Call[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "tryAggregate",
    outputs: [
      {
        name: "returnData",
        internalType: "struct IMulticall3.Result[]",
        type: "tuple[]",
        components: [
          { name: "success", internalType: "bool", type: "bool" },
          { name: "returnData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    inputs: [
      { name: "requireSuccess", internalType: "bool", type: "bool" },
      {
        name: "calls",
        internalType: "struct IMulticall3.Call[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "tryBlockAndAggregate",
    outputs: [
      { name: "blockNumber", internalType: "uint256", type: "uint256" },
      { name: "blockHash", internalType: "bytes32", type: "bytes32" },
      {
        name: "returnData",
        internalType: "struct IMulticall3.Result[]",
        type: "tuple[]",
        components: [
          { name: "success", internalType: "bool", type: "bool" },
          { name: "returnData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    stateMutability: "payable",
  },
] as const;
