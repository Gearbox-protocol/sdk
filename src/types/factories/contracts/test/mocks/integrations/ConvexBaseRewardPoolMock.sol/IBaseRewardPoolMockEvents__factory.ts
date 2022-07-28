/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IBaseRewardPoolMockEvents,
  IBaseRewardPoolMockEventsInterface,
} from "../../../../../../contracts/test/mocks/integrations/ConvexBaseRewardPoolMock.sol/IBaseRewardPoolMockEvents";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "reward",
        type: "uint256",
      },
    ],
    name: "Mock_BaseRewardPaid",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Mock_BaseStaked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Mock_BaseWithdrawn",
    type: "event",
  },
];

export class IBaseRewardPoolMockEvents__factory {
  static readonly abi = _abi;
  static createInterface(): IBaseRewardPoolMockEventsInterface {
    return new utils.Interface(_abi) as IBaseRewardPoolMockEventsInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IBaseRewardPoolMockEvents {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as IBaseRewardPoolMockEvents;
  }
}