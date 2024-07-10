//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CalldataExtractor
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const calldataExtractorAbi = [
  {
    type: "function",
    inputs: [],
    name: "extractTimestampsAndAssertAllAreEqual",
    outputs: [
      { name: "extractedTimestamp", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "pure",
  },
  { type: "error", inputs: [], name: "CalldataMustHaveValidPayload" },
  { type: "error", inputs: [], name: "CalldataOverOrUnderFlow" },
  { type: "error", inputs: [], name: "DataPackageTimestampMustNotBeZero" },
  { type: "error", inputs: [], name: "DataPackageTimestampsMustBeEqual" },
  { type: "error", inputs: [], name: "EachSignerMustProvideTheSameValue" },
  { type: "error", inputs: [], name: "EmptyCalldataPointersArr" },
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
] as const

