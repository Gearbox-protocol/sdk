import { maxUint256 } from "viem";
import { z } from "zod/v4";
import { NO_LIMIT } from "../../state/market/types.js";
import { errorMessage } from "../../utils/errorMessage.js";
import { tokenAmountSchema } from "../../validationSchemas.js";
import { type ActionDiagnostic, actionError } from "../actionDiagnostics.js";
import type { ActionEnv } from "../actionTypes.js";
import {
  convertUnderlyingAmount,
  type GipBuilderContext,
} from "../builderContext.js";

export const MAX_UINT128 = (1n << 128n) - 1n;
export const MAX_QUOTA = (1n << 95n) - 1n;

/** A debt limit: a token amount, or `NO_LIMIT`. **/
export const debtLimitSchema = z.union([
  tokenAmountSchema,
  z.literal(NO_LIMIT),
]);

/** Raw units of a limit; `NO_LIMIT` is the contracts' `type(uint256).max`. **/
export function convertLimit(
  ctx: Pick<GipBuilderContext, "tokens">,
  state: { underlyingAsset: `0x${string}` },
  amount: number | string,
): bigint {
  return amount === NO_LIMIT
    ? maxUint256
    : convertUnderlyingAmount(ctx, state, amount);
}

/** {@link convertLimit}, or `undefined` when `env` cannot convert amounts. **/
export function rawAmount(
  env: ActionEnv,
  state: { underlyingAsset: `0x${string}` },
  amount: number | string,
): bigint | undefined {
  return env.tokens
    ? convertLimit({ tokens: env.tokens }, state, amount)
    : undefined;
}

export function amountDiagnostics(
  env: ActionEnv,
  state: { underlyingAsset: `0x${string}` },
  amount: number | string,
  maximum: bigint,
  field = "limit",
): ActionDiagnostic[] {
  try {
    const raw = rawAmount(env, state, amount);
    return raw !== undefined && amount !== NO_LIMIT && raw > maximum
      ? [
          actionError(
            "AMOUNT_OVERFLOW",
            `${field} exceeds the contract's raw-unit storage bound (${maximum})`,
            ["params", field],
          ),
        ]
      : [];
  } catch (error) {
    return [
      actionError("INVALID_TOKEN_AMOUNT", errorMessage(error), [
        "params",
        field,
      ]),
    ];
  }
}

/** PoolV3 exposes the largest stored uint128 as unlimited. */
export function projectedDebtLimit(
  env: ActionEnv,
  state: { underlyingAsset: `0x${string}` },
  amount: number | string,
): number | typeof NO_LIMIT {
  return amount === NO_LIMIT || rawAmount(env, state, amount) === MAX_UINT128
    ? NO_LIMIT
    : Number(amount);
}
