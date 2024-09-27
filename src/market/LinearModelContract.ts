import { decodeAbiParameters } from "viem";

import { linearInterestRateModelV3Abi } from "../abi";
import type { MarketData } from "../base";
import { BaseContract } from "../base";
import type { GearboxSDK } from "../GearboxSDK";
import type { LinearModelState } from "../state";

type abi = typeof linearInterestRateModelV3Abi;

export class LinearModelContract extends BaseContract<abi> {
  public readonly state: LinearModelState;

  constructor({ interestRateModel }: MarketData, sdk: GearboxSDK) {
    super({
      sdk,
      address: interestRateModel.baseParams.addr,
      contractType: interestRateModel.baseParams.contractType,
      version: Number(interestRateModel.baseParams.version),
      name: "LinearInterestRateModel",
      abi: linearInterestRateModelV3Abi,
    });

    const [
      U1,
      U2,
      Rbase,
      Rslope1,
      Rslope2,
      Rslope3,
      isBorrowingMoreU2Forbidden,
    ] = decodeAbiParameters(
      [
        { type: "uint16", name: "U1" },
        { type: "uint16", name: "U2" },
        { type: "uint16", name: "Rbase" },
        { type: "uint16", name: "Rslope1" },
        { type: "uint16", name: "Rslope2" },
        { type: "uint16", name: "Rslope3" },
        { type: "bool", name: "isBorrowingMoreU2Forbidden" },
      ],
      interestRateModel.baseParams.serializedParams,
    );

    this.state = {
      ...this.contractData,
      U1,
      U2,
      Rbase,
      Rslope1,
      Rslope2,
      Rslope3,
      isBorrowingMoreU2Forbidden,
    };
  }
}
