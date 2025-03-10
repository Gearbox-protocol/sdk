import { decodeAbiParameters } from "viem";

import { iLinearInterestRateModelV300Abi } from "../../../abi/v300";
import type { BaseState } from "../../base";
import { BaseContract } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import type { LinearInterestRateModelStateHuman } from "../../types";
import { percentFmt } from "../../utils";
import type { IInterestRateModelContract } from "./types";

const abi = iLinearInterestRateModelV300Abi;
type abi = typeof abi;

export class LinearInterestRateModelContract
  extends BaseContract<abi>
  implements IInterestRateModelContract
{
  public readonly U1: number;
  public readonly U2: number;
  public readonly Rbase: number;
  public readonly Rslope1: number;
  public readonly Rslope2: number;
  public readonly Rslope3: number;
  public readonly isBorrowingMoreU2Forbidden: boolean;

  constructor(sdk: GearboxSDK, params: BaseState) {
    super(sdk, {
      ...params.baseParams,
      name: "LinearInterestRateModel",
      abi,
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
      params.baseParams.serializedParams,
    );

    this.U1 = U1;
    this.U2 = U2;
    this.Rbase = Rbase;
    this.Rslope1 = Rslope1;
    this.Rslope2 = Rslope2;
    this.Rslope3 = Rslope3;
    this.isBorrowingMoreU2Forbidden = isBorrowingMoreU2Forbidden;
  }

  public override stateHuman(raw?: boolean): LinearInterestRateModelStateHuman {
    return {
      ...super.stateHuman(raw),
      U1: percentFmt(this.U1, raw),
      U2: percentFmt(this.U2, raw),
      Rbase: percentFmt(this.Rbase, raw),
      Rslope1: percentFmt(this.Rslope1, raw),
      Rslope2: percentFmt(this.Rslope2, raw),
      Rslope3: percentFmt(this.Rslope3, raw),
      isBorrowingMoreU2Forbidden: this.isBorrowingMoreU2Forbidden,
    };
  }
}
