import type { Address, DecodeFunctionDataReturnType } from "viem";
import { iSecuritizeLiquidatorV311Abi } from "../../../../abi/rwa/iSecuritizeLiquidatorV311.js";
import type { ConstructOptions } from "../../../base/index.js";
import { BaseContract } from "../../../base/index.js";
import { RWA_LIQUIDATOR_SECURITIZE } from "./constants.js";

const abi = iSecuritizeLiquidatorV311Abi;
type abi = typeof abi;

export class SecuritizeLiquidatorContract extends BaseContract<abi> {
  constructor(options: ConstructOptions, address: Address) {
    super(options, {
      addr: address,
      contractType: RWA_LIQUIDATOR_SECURITIZE,
      version: 311,
      name: "SecuritizeLiquidator",
      abi,
    });
  }

  protected override stringifyFunctionParams(
    params: DecodeFunctionDataReturnType<abi>,
  ): string[] {
    if (params.functionName === "liquidatePendingRedemption") {
      const [creditAccount, redemptionGateway, priceUpdates, lossPolicyData] =
        params.args;
      return [
        this.labelAddress(creditAccount),
        this.labelAddress(redemptionGateway),
        `${priceUpdates.length} price updates`,
        lossPolicyData === "0x" ? "none" : lossPolicyData,
      ];
    }
    return super.stringifyFunctionParams(params);
  }
}
