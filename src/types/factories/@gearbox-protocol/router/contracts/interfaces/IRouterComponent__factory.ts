/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IRouterComponent,
  IRouterComponentInterface,
} from "../../../../../@gearbox-protocol/router/contracts/interfaces/IRouterComponent";

const _abi = [
  {
    inputs: [],
    name: "getComponentId",
    outputs: [
      {
        internalType: "enum RouterComponent",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export class IRouterComponent__factory {
  static readonly abi = _abi;
  static createInterface(): IRouterComponentInterface {
    return new utils.Interface(_abi) as IRouterComponentInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IRouterComponent {
    return new Contract(address, _abi, signerOrProvider) as IRouterComponent;
  }
}
