import type { Address, Hex } from "viem";
import { decodeAbiParameters } from "viem";

import { linearInterestRateModelV3Abi } from "../abi";
import { BaseContract } from "../base/BaseContract";
import type { MarketDataStruct } from "../base/types";
import type { LinearModelState } from "../state/poolState";

type abi = typeof linearInterestRateModelV3Abi;

export class LinearModelContract extends BaseContract<abi> {
  static deployedModels: Array<LinearModelContract> = [];
  state: LinearModelState;

  static attachMarket(
    marketData: MarketDataStruct,
    chainClient: Provider,
  ): LinearModelContract {
    const existingContract = LinearModelContract.findExistingModelByAddress(
      marketData.interestRateModel.baseParams.addr as Address,
    );

    if (existingContract) {
      return existingContract;
    }

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
      marketData.interestRateModel.baseParams.serializedParams as Hex,
    );

    const contract = new LinearModelContract({
      address: marketData.interestRateModel.baseParams.addr as Address,
      chainClient,
      params: {
        U1,
        U2,
        Rbase,
        Rslope1,
        Rslope2,
        Rslope3,
        isBorrowingMoreU2Forbidden,
      },
    });

    this.deployedModels.push(contract);

    return contract;
  }

  constructor(args: {
    address: Address;
    chainClient: Provider;
    params: LinearIRMParams;
  }) {
    super({
      ...args,
      name: "LinearInterestRateModel",
      abi: linearInterestRateModelV3Abi,
    });
    this.state = {
      ...this.contractData,
      ...args.params,
    };
  }

  static findExistingModelByAddress(
    address: Address,
  ): LinearModelContract | undefined {
    for (const model of LinearModelContract.deployedModels) {
      if (model.address.toLowerCase() === address.toLowerCase()) {
        return model;
      }
    }
  }
}
