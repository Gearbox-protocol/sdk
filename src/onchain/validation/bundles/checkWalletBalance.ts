import type { Address } from "viem";
import { isAddressEqual } from "viem";
import { ierc20Abi } from "../../../abi/iERC20.js";
import type {
  InsufficientBalanceError,
  UnexpectedFailureError,
} from "../../../model/index.js";
import { unexpectedFailure } from "../../../model/index.js";
import { NATIVE_ADDRESS } from "../../constants/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { checkFunding } from "../checks/checkFunding.js";
import { toToken } from "../helpers/index.js";

export interface CheckWalletBalanceInput {
  sdk: OnchainSDK;
  token: Address;
  holder: Address;
  required: bigint;
  blockNumber?: bigint;
}

/** `holder` holds at least `required` of `token` (ERC-20 or native). */
export async function checkWalletBalance(
  input: CheckWalletBalanceInput,
): Promise<(InsufficientBalanceError | UnexpectedFailureError)[]> {
  const { sdk, token, holder, required, blockNumber } = input;
  try {
    const held = isAddressEqual(token, NATIVE_ADDRESS)
      ? await sdk.client.getBalance({ address: holder, blockNumber })
      : await sdk.client.readContract({
          address: token,
          abi: ierc20Abi,
          functionName: "balanceOf",
          args: [holder],
          blockNumber,
        });
    return checkFunding({
      token: toToken(sdk, token),
      required,
      held,
      holderKind: "wallet",
      holder,
    });
  } catch (cause) {
    const { symbol } = toToken(sdk, token);
    return [unexpectedFailure(cause, `read the ${symbol} balance`)];
  }
}
