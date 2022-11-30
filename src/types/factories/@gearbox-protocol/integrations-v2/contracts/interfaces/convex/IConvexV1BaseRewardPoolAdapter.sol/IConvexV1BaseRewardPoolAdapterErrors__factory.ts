/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IConvexV1BaseRewardPoolAdapterErrors,
  IConvexV1BaseRewardPoolAdapterErrorsInterface,
} from "../../../../../../../@gearbox-protocol/integrations-v2/contracts/interfaces/convex/IConvexV1BaseRewardPoolAdapter.sol/IConvexV1BaseRewardPoolAdapterErrors";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "TokenIsNotAddedToCreditManagerException",
    type: "error",
  },
];

export class IConvexV1BaseRewardPoolAdapterErrors__factory {
  static readonly abi = _abi;
  static createInterface(): IConvexV1BaseRewardPoolAdapterErrorsInterface {
    return new utils.Interface(
      _abi
    ) as IConvexV1BaseRewardPoolAdapterErrorsInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IConvexV1BaseRewardPoolAdapterErrors {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as IConvexV1BaseRewardPoolAdapterErrors;
  }
}