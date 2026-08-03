import type { Address, DecodeFunctionDataReturnType } from "viem";
import { iMidasLiquidatorV311Abi } from "../../../../abi/rwa/iMidasLiquidatorV311.js";
import type { ConstructOptions } from "../../../base/index.js";
import { BaseContract } from "../../../base/index.js";
import { RWA_LIQUIDATOR_MIDAS } from "./constants.js";

const abi = iMidasLiquidatorV311Abi;
type abi = typeof abi;

export class MidasLiquidatorContract extends BaseContract<abi> {
  constructor(options: ConstructOptions, address: Address) {
    super(options, {
      addr: address,
      contractType: RWA_LIQUIDATOR_MIDAS,
      version: 311,
      name: "MidasLiquidator",
      abi,
    });
  }

  protected override stringifyFunctionParams(
    params: DecodeFunctionDataReturnType<abi>,
  ): string[] {
    if (params.functionName === "liquidateWithRedeemerTransfers") {
      const [creditAccount, gateway, calls, lossPolicyData] = params.args;
      return [
        this.labelAddress(creditAccount),
        this.labelAddress(gateway),
        `[${this.register.stringifyMultiCall([...calls]).join(", ")}]`,
        lossPolicyData === "0x" ? "none" : lossPolicyData,
      ];
    }
    return super.stringifyFunctionParams(params);
  }

  protected override parseFunctionParamsV2(
    params: DecodeFunctionDataReturnType<abi>,
    strict?: boolean,
  ): Record<string, unknown> {
    if (params.functionName === "liquidateWithRedeemerTransfers") {
      const [creditAccount, gateway, calls, lossPolicyData] = params.args;
      return {
        creditAccount,
        gateway,
        calls: this.register.parseMultiCallV2([...calls], strict),
        lossPolicyData,
      };
    }
    return super.parseFunctionParamsV2(params, strict);
  }
}
