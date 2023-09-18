/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IUniswapV3AdapterExceptions,
  IUniswapV3AdapterExceptionsInterface,
} from "../../IUniswapV3Adapter.sol/IUniswapV3AdapterExceptions";

const _abi = [
  {
    inputs: [],
    name: "InvalidPathException",
    type: "error",
  },
] as const;

export class IUniswapV3AdapterExceptions__factory {
  static readonly abi = _abi;
  static createInterface(): IUniswapV3AdapterExceptionsInterface {
    return new utils.Interface(_abi) as IUniswapV3AdapterExceptionsInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IUniswapV3AdapterExceptions {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as IUniswapV3AdapterExceptions;
  }
}