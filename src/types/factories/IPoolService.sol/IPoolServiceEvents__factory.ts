/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IPoolServiceEvents,
  IPoolServiceEventsInterface,
} from "../../IPoolService.sol/IPoolServiceEvents";

const _abi = [
  {
    type: "event",
    name: "AddLiquidity",
    inputs: [
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "onBehalfOf",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "referralCode",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Borrow",
    inputs: [
      {
        name: "creditManager",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "creditAccount",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "BorrowForbidden",
    inputs: [
      {
        name: "creditManager",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "NewCreditManagerConnected",
    inputs: [
      {
        name: "creditManager",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "NewExpectedLiquidityLimit",
    inputs: [
      {
        name: "newLimit",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "NewInterestRateModel",
    inputs: [
      {
        name: "newInterestRateModel",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "NewWithdrawFee",
    inputs: [
      {
        name: "fee",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RemoveLiquidity",
    inputs: [
      {
        name: "sender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "to",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Repay",
    inputs: [
      {
        name: "creditManager",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "borrowedAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "profit",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "loss",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "UncoveredLoss",
    inputs: [
      {
        name: "creditManager",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "loss",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
] as const;

export class IPoolServiceEvents__factory {
  static readonly abi = _abi;
  static createInterface(): IPoolServiceEventsInterface {
    return new Interface(_abi) as IPoolServiceEventsInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IPoolServiceEvents {
    return new Contract(address, _abi, runner) as unknown as IPoolServiceEvents;
  }
}
