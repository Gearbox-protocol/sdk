/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IWalletChecker,
  IWalletCheckerInterface,
} from "../../../../../contracts/integrations/convex/Interfaces.sol/IWalletChecker";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "check",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export class IWalletChecker__factory {
  static readonly abi = _abi;
  static createInterface(): IWalletCheckerInterface {
    return new utils.Interface(_abi) as IWalletCheckerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider,
  ): IWalletChecker {
    return new Contract(address, _abi, signerOrProvider) as IWalletChecker;
  }
}
