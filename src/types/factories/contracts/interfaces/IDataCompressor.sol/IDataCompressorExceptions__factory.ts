/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IDataCompressorExceptions,
  IDataCompressorExceptionsInterface,
} from "../../../../contracts/interfaces/IDataCompressor.sol/IDataCompressorExceptions";

const _abi = [
  {
    inputs: [],
    name: "NotCreditManagerException",
    type: "error",
  },
  {
    inputs: [],
    name: "NotPoolException",
    type: "error",
  },
];

export class IDataCompressorExceptions__factory {
  static readonly abi = _abi;
  static createInterface(): IDataCompressorExceptionsInterface {
    return new utils.Interface(_abi) as IDataCompressorExceptionsInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider,
  ): IDataCompressorExceptions {
    return new Contract(
      address,
      _abi,
      signerOrProvider,
    ) as IDataCompressorExceptions;
  }
}
