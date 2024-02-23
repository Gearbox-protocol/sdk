/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IPriceOracleV2Events,
  IPriceOracleV2EventsInterface,
} from "../../IPriceOracle.sol/IPriceOracleV2Events";

const _abi = [
  {
    type: "event",
    name: "NewPriceFeed",
    inputs: [
      {
        name: "token",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "priceFeed",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
] as const;

export class IPriceOracleV2Events__factory {
  static readonly abi = _abi;
  static createInterface(): IPriceOracleV2EventsInterface {
    return new utils.Interface(_abi) as IPriceOracleV2EventsInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IPriceOracleV2Events {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as IPriceOracleV2Events;
  }
}