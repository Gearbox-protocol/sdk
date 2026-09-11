import type { Address } from "viem";
import { ierc20Abi } from "../../../abi/iERC20.js";
import type {
  InsufficientAllowanceError,
  UnexpectedFailureError,
} from "../../../model/index.js";
import {
  insufficientAllowance,
  unexpectedFailure,
} from "../../../model/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { toToken, toTokenAmount } from "../helpers/index.js";

export interface CheckWalletAllowanceInput {
  sdk: OnchainSDK;
  token: Address;
  owner: Address;
  spender: Address;
  required: bigint;
  blockNumber?: bigint;
}

/** `owner` has approved `spender` for at least `required` of `token`. */
export async function checkWalletAllowance(
  input: CheckWalletAllowanceInput,
): Promise<(InsufficientAllowanceError | UnexpectedFailureError)[]> {
  const { sdk, token, owner, spender, required, blockNumber } = input;
  try {
    const allowed = await sdk.client.readContract({
      address: token,
      abi: ierc20Abi,
      functionName: "allowance",
      args: [owner, spender],
      blockNumber,
    });
    return allowed >= required
      ? []
      : [
          insufficientAllowance({
            owner,
            spender,
            required: toTokenAmount(sdk, token, required),
            allowed: toTokenAmount(sdk, token, allowed),
          }),
        ];
  } catch (cause) {
    const { symbol } = toToken(sdk, token);
    return [unexpectedFailure(cause, `read the ${symbol} allowance`)];
  }
}
