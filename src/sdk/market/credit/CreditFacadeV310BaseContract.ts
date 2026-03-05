import type { DecodeFunctionDataReturnType } from "viem";

import {
  iCreditFacadeMulticallV310Abi,
  iCreditFacadeV310Abi,
} from "../../../abi/310/generated.js";
import { iPausableAbi } from "../../../abi/iPausable.js";
import type { BaseContractArgs, ConstructOptions } from "../../base/index.js";
import { BaseContract } from "../../base/index.js";

const abi = [
  ...iCreditFacadeV310Abi,
  ...iCreditFacadeMulticallV310Abi,
  ...iPausableAbi,
] as const;
type abi = typeof abi;

export { abi as creditFacadeV310Abi };
export type { abi as CreditFacadeV310Abi };

/**
 * SDK-less facade contract, only needs address
 */
export class CreditFacadeV310BaseContract extends BaseContract<abi> {
  constructor(
    options: ConstructOptions,
    args: Omit<BaseContractArgs<abi>, "abi">,
  ) {
    super(options, { ...args, abi });
  }

  protected override parseFunctionParamsV2(
    params: DecodeFunctionDataReturnType<abi>,
    strict?: boolean,
  ): Record<string, unknown> {
    switch (params.functionName) {
      case "openCreditAccount": {
        const [onBehalfOf, calls, referralCode] = params.args;
        return {
          onBehalfOf,
          calls: this.register.parseMultiCallV2([...calls], strict),
          referralCode,
        };
      }
      case "closeCreditAccount": {
        const [creditAccount, calls] = params.args;
        return {
          creditAccount,
          calls: this.register.parseMultiCallV2([...calls], strict),
        };
      }
      case "botMulticall":
      case "multicall": {
        const [creditAccount, calls] = params.args;
        return {
          creditAccount,
          calls: this.register.parseMultiCallV2([...calls], strict),
        };
      }
      case "liquidateCreditAccount": {
        const [creditAccount, to, calls] = params.args;
        return {
          creditAccount,
          to,
          calls: this.register.parseMultiCallV2([...calls], strict),
        };
      }
      default:
        return super.parseFunctionParamsV2(params, strict);
    }
  }

  protected override stringifyFunctionParams(
    params: DecodeFunctionDataReturnType<abi>,
  ): string[] {
    switch (params.functionName) {
      case "openCreditAccount": {
        const [onBehalfOf, calls, referralCode] = params.args;
        return [
          this.labelAddress(onBehalfOf),
          this.register.parseMultiCall([...calls]).join(","),
          `${referralCode}`,
        ];
      }
      case "closeCreditAccount": {
        const [creditAccount, calls] = params.args;
        return [
          this.labelAddress(creditAccount),
          this.register.parseMultiCall([...calls]).join(","),
        ];
      }
      case "liquidateCreditAccount": {
        const [creditAccount, to, calls] = params.args;
        return [
          this.labelAddress(creditAccount),
          this.labelAddress(to),
          this.register.parseMultiCall([...calls]).join(","),
        ];
      }
      default:
        return super.stringifyFunctionParams(params);
    }
  }
}
