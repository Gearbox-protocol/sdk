/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  ILidoMockEvents,
  ILidoMockEventsInterface,
} from "../../../../../../contracts/test/mocks/integrations/LidoMock.sol/ILidoMockEvents";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "referral",
        type: "address",
      },
    ],
    name: "Mock_Submitted",
    type: "event",
  },
];

export class ILidoMockEvents__factory {
  static readonly abi = _abi;
  static createInterface(): ILidoMockEventsInterface {
    return new utils.Interface(_abi) as ILidoMockEventsInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ILidoMockEvents {
    return new Contract(address, _abi, signerOrProvider) as ILidoMockEvents;
  }
}