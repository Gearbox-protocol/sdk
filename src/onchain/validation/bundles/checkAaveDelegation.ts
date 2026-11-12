import type { Address } from "viem";
import type {
  AaveBridgeBorrow,
  InsufficientBorrowAllowanceError,
  UnexpectedFailureError,
} from "../../../model/index.js";
import {
  insufficientBorrowAllowance,
  unexpectedFailure,
} from "../../../model/index.js";
import {
  iAaveHorizonBridgeAbi,
  iAaveV3PoolAbi,
  iVariableDebtTokenAbi,
} from "../../market/adapters/abi/aave/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { toTokenAmount } from "../helpers/index.js";

export interface CheckAaveDelegationInput {
  sdk: OnchainSDK;
  /** Account owner the bridge borrows as. */
  owner: Address;
  borrow: AaveBridgeBorrow;
  blockNumber?: bigint;
}

/**
 * `owner` has delegated the bridge at least the borrowed amount on the
 * variable debt token of the borrowed token, in the pool the bridge borrows
 * from.
 */
export async function checkAaveDelegation(
  input: CheckAaveDelegationInput,
): Promise<(InsufficientBorrowAllowanceError | UnexpectedFailureError)[]> {
  const { sdk, owner, borrow, blockNumber } = input;
  const { bridge, amount } = borrow;
  const token = amount.token.address;
  try {
    const pool = await sdk.client.readContract({
      address: bridge,
      abi: iAaveHorizonBridgeAbi,
      functionName: "pool",
      blockNumber,
    });
    const { variableDebtTokenAddress } = await sdk.client.readContract({
      address: pool,
      abi: iAaveV3PoolAbi,
      functionName: "getReserveData",
      args: [token],
      blockNumber,
    });
    const allowed = await sdk.client.readContract({
      address: variableDebtTokenAddress,
      abi: iVariableDebtTokenAbi,
      functionName: "borrowAllowance",
      args: [owner, bridge],
      blockNumber,
    });
    return allowed >= amount.value
      ? []
      : [
          insufficientBorrowAllowance({
            owner,
            spender: bridge,
            debtToken: variableDebtTokenAddress,
            required: amount,
            allowed: toTokenAmount(sdk, token, allowed),
          }),
        ];
  } catch (cause) {
    return [
      unexpectedFailure(
        cause,
        `read the ${amount.token.symbol} borrow delegation`,
      ),
    ];
  }
}
