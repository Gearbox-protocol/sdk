/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IwstETHGateWay,
  IwstETHGateWayInterface,
} from "../../IwstETHGateway.sol/IwstETHGateWay";

const _abi = [
  {
    inputs: [],
    name: "NonRegisterPoolException",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "onBehalfOf",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "referralCode",
        type: "uint256",
      },
    ],
    name: "addLiquidity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "removeLiquidity",
    outputs: [
      {
        internalType: "uint256",
        name: "amountGet",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IwstETHGateWay__factory {
  static readonly abi = _abi;
  static createInterface(): IwstETHGateWayInterface {
    return new utils.Interface(_abi) as IwstETHGateWayInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IwstETHGateWay {
    return new Contract(address, _abi, signerOrProvider) as IwstETHGateWay;
  }
}