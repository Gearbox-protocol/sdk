/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  ITokenFactory,
  ITokenFactoryInterface,
} from "../../../../../contracts/test/sigp/Interfaces.sol/ITokenFactory";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "CreateDepositToken",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class ITokenFactory__factory {
  static readonly abi = _abi;
  static createInterface(): ITokenFactoryInterface {
    return new utils.Interface(_abi) as ITokenFactoryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider,
  ): ITokenFactory {
    return new Contract(address, _abi, signerOrProvider) as ITokenFactory;
  }
}
