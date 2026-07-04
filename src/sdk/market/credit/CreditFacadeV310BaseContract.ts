import {
  type DecodeFunctionDataReturnType,
  decodeFunctionData,
  type Hex,
} from "viem";

import {
  iCreditFacadeMulticallV310Abi,
  iCreditFacadeV310Abi,
} from "../../../abi/310/generated.js";
import { iPausableAbi } from "../../../abi/iPausable.js";
import type { BaseContractArgs, ConstructOptions } from "../../base/index.js";
import { BaseContract } from "../../base/index.js";
import type { MultiCall } from "../../types/index.js";

const abi = [
  ...iCreditFacadeV310Abi,
  ...iCreditFacadeMulticallV310Abi,
  ...iPausableAbi,
] as const;
type abi = typeof abi;

export type { abi as CreditFacadeV310Abi };
export { abi as creditFacadeV310Abi };

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

  /**
   * Decodes entry-point calldata with the facade ABI and returns the untouched
   * inner multicall structs (targets with still-ABI-encoded `callData`).
   *
   * Unlike {@link ChainContractsRegister.parseMultiCallV2}, the inner calls are
   * not decoded, so callers can re-decode them with a specific contract's ABI.
   *
   * @throws When the calldata cannot be decoded or the function has no inner
   * multicall argument.
   */
  public extractRawInnerCalls(calldata: Hex): MultiCall[] {
    const decoded = decodeFunctionData({ abi: this.abi, data: calldata });
    switch (decoded.functionName) {
      case "openCreditAccount":
      case "closeCreditAccount":
      case "botMulticall":
      case "multicall": {
        const [, calls] = decoded.args;
        return [...calls];
      }
      case "liquidateCreditAccount": {
        const [, , calls] = decoded.args;
        return [...calls];
      }
      default:
        throw new Error(
          `function ${decoded.functionName} on ${this.name} has no inner multicall`,
        );
    }
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
