/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  ICreditManagerV2Events,
  ICreditManagerV2EventsInterface,
} from "../../ICreditManagerV2.sol/ICreditManagerV2Events";

const _abi = [
  {
    type: "event",
    name: "ExecuteOrder",
    inputs: [
      {
        name: "borrower",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "target",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "NewConfigurator",
    inputs: [
      {
        name: "newConfigurator",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
] as const;

export class ICreditManagerV2Events__factory {
  static readonly abi = _abi;
  static createInterface(): ICreditManagerV2EventsInterface {
    return new utils.Interface(_abi) as ICreditManagerV2EventsInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ICreditManagerV2Events {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as ICreditManagerV2Events;
  }
}