/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  RedstoneConsumerNumericBase,
  RedstoneConsumerNumericBaseInterface,
} from "../RedstoneConsumerNumericBase";

const _abi = [
  {
    type: "function",
    name: "aggregateValues",
    inputs: [
      {
        name: "values",
        type: "uint256[]",
        internalType: "uint256[]",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "extractTimestampsAndAssertAllAreEqual",
    inputs: [],
    outputs: [
      {
        name: "extractedTimestamp",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "pure",
  },
  {
    type: "function",
    name: "getAuthorisedSignerIndex",
    inputs: [
      {
        name: "receivedSigner",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "uint8",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDataServiceId",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "string",
        internalType: "string",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUniqueSignersThreshold",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "uint8",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "validateTimestamp",
    inputs: [
      {
        name: "receivedTimestampMilliseconds",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "view",
  },
  {
    type: "error",
    name: "CalldataMustHaveValidPayload",
    inputs: [],
  },
  {
    type: "error",
    name: "CalldataOverOrUnderFlow",
    inputs: [],
  },
  {
    type: "error",
    name: "CanNotPickMedianOfEmptyArray",
    inputs: [],
  },
  {
    type: "error",
    name: "DataPackageTimestampMustNotBeZero",
    inputs: [],
  },
  {
    type: "error",
    name: "DataPackageTimestampsMustBeEqual",
    inputs: [],
  },
  {
    type: "error",
    name: "EachSignerMustProvideTheSameValue",
    inputs: [],
  },
  {
    type: "error",
    name: "EmptyCalldataPointersArr",
    inputs: [],
  },
  {
    type: "error",
    name: "GetDataServiceIdNotImplemented",
    inputs: [],
  },
  {
    type: "error",
    name: "IncorrectUnsignedMetadataSize",
    inputs: [],
  },
  {
    type: "error",
    name: "InsufficientNumberOfUniqueSigners",
    inputs: [
      {
        name: "receivedSignersCount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "requiredSignersCount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "InvalidCalldataPointer",
    inputs: [],
  },
  {
    type: "error",
    name: "RedstonePayloadMustHaveAtLeastOneDataPackage",
    inputs: [],
  },
  {
    type: "error",
    name: "SignerNotAuthorised",
    inputs: [
      {
        name: "receivedSigner",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    type: "error",
    name: "TimestampFromTooLongFuture",
    inputs: [
      {
        name: "receivedTimestampSeconds",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "blockTimestamp",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "TimestampIsTooOld",
    inputs: [
      {
        name: "receivedTimestampSeconds",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "blockTimestamp",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
] as const;

export class RedstoneConsumerNumericBase__factory {
  static readonly abi = _abi;
  static createInterface(): RedstoneConsumerNumericBaseInterface {
    return new Interface(_abi) as RedstoneConsumerNumericBaseInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): RedstoneConsumerNumericBase {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as RedstoneConsumerNumericBase;
  }
}