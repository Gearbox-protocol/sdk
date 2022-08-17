/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IAddressProviderEvents,
  IAddressProviderEventsInterface,
} from "../../../../contracts/interfaces/IAddressProvider.sol/IAddressProviderEvents";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "service",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
    ],
    name: "AddressSet",
    type: "event",
  },
];

export class IAddressProviderEvents__factory {
  static readonly abi = _abi;
  static createInterface(): IAddressProviderEventsInterface {
    return new utils.Interface(_abi) as IAddressProviderEventsInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider,
  ): IAddressProviderEvents {
    return new Contract(
      address,
      _abi,
      signerOrProvider,
    ) as IAddressProviderEvents;
  }
}
