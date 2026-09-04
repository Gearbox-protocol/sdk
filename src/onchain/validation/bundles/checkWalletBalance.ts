import type { Address } from "viem";
import { isAddressEqual } from "viem";
import { ierc20Abi } from "../../../abi/iERC20.js";
import type {
  InsufficientBalanceError,
  UnexpectedFailureError,
} from "../../../model/index.js";
import { insufficientBalance, unexpectedFailure } from "../../../model/index.js";
import { NATIVE_ADDRESS } from "../../constants/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { amountOf, toToken } from "../helpers/index.js";

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
    if (required <= held) {
      return [];
    }
    const meta = toToken(sdk, token);
    return [
      insufficientBalance({
        required: amountOf(meta, required),
        held: amountOf(meta, held),
        holderKind: "wallet",
        holder,
      }),
    ];
  } catch (cause) {
    const { symbol } = toToken(sdk, token);
    return [unexpectedFailure(cause, `read the ${symbol} balance`)];
  }
}
