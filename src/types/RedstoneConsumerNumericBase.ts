//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// RedstoneConsumerNumericBase
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const redstoneConsumerNumericBaseAbi = [
  {
    type: "function",
    inputs: [{ name: "values", internalType: "uint256[]", type: "uint256[]" }],
    name: "aggregateValues",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "extractTimestampsAndAssertAllAreEqual",
    outputs: [
      { name: "extractedTimestamp", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [
      { name: "receivedSigner", internalType: "address", type: "address" },
    ],
    name: "getAuthorisedSignerIndex",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getDataServiceId",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "getUniqueSignersThreshold",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      {
        name: "receivedTimestampMilliseconds",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "validateTimestamp",
    outputs: [],
    stateMutability: "view",
  },
  { type: "error", inputs: [], name: "CalldataMustHaveValidPayload" },
  { type: "error", inputs: [], name: "CalldataOverOrUnderFlow" },
  { type: "error", inputs: [], name: "CanNotPickMedianOfEmptyArray" },
  { type: "error", inputs: [], name: "DataPackageTimestampMustNotBeZero" },
  { type: "error", inputs: [], name: "DataPackageTimestampsMustBeEqual" },
  { type: "error", inputs: [], name: "EachSignerMustProvideTheSameValue" },
  { type: "error", inputs: [], name: "EmptyCalldataPointersArr" },
  { type: "error", inputs: [], name: "GetDataServiceIdNotImplemented" },
  { type: "error", inputs: [], name: "IncorrectUnsignedMetadataSize" },
  {
    type: "error",
    inputs: [
      {
        name: "receivedSignersCount",
        internalType: "uint256",
        type: "uint256",
      },
      {
        name: "requiredSignersCount",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "InsufficientNumberOfUniqueSigners",
  },
  { type: "error", inputs: [], name: "InvalidCalldataPointer" },
  {
    type: "error",
    inputs: [],
    name: "RedstonePayloadMustHaveAtLeastOneDataPackage",
  },
  {
    type: "error",
    inputs: [
      { name: "receivedSigner", internalType: "address", type: "address" },
    ],
    name: "SignerNotAuthorised",
  },
  {
    type: "error",
    inputs: [
      {
        name: "receivedTimestampSeconds",
        internalType: "uint256",
        type: "uint256",
      },
      { name: "blockTimestamp", internalType: "uint256", type: "uint256" },
    ],
    name: "TimestampFromTooLongFuture",
  },
  {
    type: "error",
    inputs: [
      {
        name: "receivedTimestampSeconds",
        internalType: "uint256",
        type: "uint256",
      },
      { name: "blockTimestamp", internalType: "uint256", type: "uint256" },
    ],
    name: "TimestampIsTooOld",
  },
] as const

