/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IZapperRegister,
  IZapperRegisterInterface,
} from "../IZapperRegister";

const _abi = [
  {
    type: "function",
    name: "zappers",
    inputs: [
      {
        name: "pool",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "AddZapper",
    inputs: [
      {
        name: "",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RemoveZapper",
    inputs: [
      {
        name: "",
        type: "address",
        indexed: false,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
] as const;

export class IZapperRegister__factory {
  static readonly abi = _abi;
  static createInterface(): IZapperRegisterInterface {
    return new Interface(_abi) as IZapperRegisterInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IZapperRegister {
    return new Contract(address, _abi, runner) as unknown as IZapperRegister;
  }
}
