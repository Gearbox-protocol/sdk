import type { DecodeFunctionDataReturnType } from "viem";

import type { GearboxSDK } from "../../sdk/index.js";
import { formatBN } from "../../sdk/index.js";
import { iUniswapV2AdapterAbi } from "./abi/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iUniswapV2AdapterAbi;

export class UniswapV2AdapterContract extends AbstractAdapterContract<
  typeof abi
> {
  constructor(
    sdk: GearboxSDK,
    args: Omit<AbstractAdapterContractOptions<typeof abi>, "abi">,
  ) {
    super(sdk, {
      ...args,
      abi,
    });
  }

  protected parseFunctionParams(
    params: DecodeFunctionDataReturnType<typeof abi>,
  ): string[] | undefined {
    switch (params.functionName) {
      case "swapDiffTokensForTokens": {
        const [leftoverAmount, rateMinRAY, path, _deadline] = params.args;

        const leftoverAmountStr = this.sdk.tokensMeta.formatBN(
          path[0],
          leftoverAmount,
        );

        const pathStr = path.map(t => this.labelAddress(t)).join(" => ");

        return [
          `(leftoverAmount: ${leftoverAmountStr}, rate: ${formatBN(
            rateMinRAY,
            27,
          )},  path: ${pathStr}`,
        ];
      }

      default:
        return undefined;
    }
  }
}
