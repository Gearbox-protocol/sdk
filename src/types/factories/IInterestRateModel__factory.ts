/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type {
  IInterestRateModel,
  IInterestRateModelInterface,
} from "../IInterestRateModel";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "expectedLiquidity",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "availableLiquidity",
        type: "uint256",
      },
    ],
    name: "calcBorrowRate",
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

export class IInterestRateModel__factory {
  static readonly abi = _abi;
  static createInterface(): IInterestRateModelInterface {
    return new utils.Interface(_abi) as IInterestRateModelInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IInterestRateModel {
    return new Contract(address, _abi, signerOrProvider) as IInterestRateModel;
  }
}
