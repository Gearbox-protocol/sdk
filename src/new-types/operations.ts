import { z } from "zod";

import {
  addressSchema,
  blockNumberSchema,
  chainIdSchema,
  hexSchema,
  nonNegativeIntegerStringSchema,
  parsePoolId,
  parseStrategyId,
  poolIdSchema,
  signedAmountSchema,
  strategyIdSchema,
  timestampSchema,
  tokenSchema,
} from "./common.js";
import type {
  ApprovalRequirement,
  AssetDelta,
  OperationIntent,
  OperationKind,
  OperationWarning,
  PoolOperationIntent,
  PreparedOperation,
  PreparedTransaction,
  Simulation,
  StrategyOperationIntent,
} from "./types.js";

export const operationKindSchema = z.enum([
  "pool-deposit",
  "pool-withdraw",
  "pool-redeem",
  "strategy-open",
  "strategy-adjust",
  "strategy-close",
]) satisfies z.ZodType<OperationKind>;

export const poolOperationIntentSchema = z.object({
  kind: z.enum(["pool-deposit", "pool-withdraw", "pool-redeem"]),
  opportunityId: poolIdSchema,
  parametersHash: hexSchema.nullable(),
}) satisfies z.ZodType<PoolOperationIntent>;

export const strategyOperationIntentSchema = z.object({
  kind: z.enum(["strategy-open", "strategy-adjust", "strategy-close"]),
  opportunityId: strategyIdSchema,
  parametersHash: hexSchema.nullable(),
}) satisfies z.ZodType<StrategyOperationIntent>;

export const operationIntentSchema = z.union([
  poolOperationIntentSchema,
  strategyOperationIntentSchema,
]) satisfies z.ZodType<OperationIntent>;

export const approvalRequirementSchema = z.object({
  token: tokenSchema,
  spender: addressSchema,
  requiredRaw: nonNegativeIntegerStringSchema,
  currentAllowanceRaw: nonNegativeIntegerStringSchema,
}) satisfies z.ZodType<ApprovalRequirement>;

export const preparedTransactionSchema = z.object({
  kind: z.enum(["approval", "operation"]),
  to: addressSchema,
  data: hexSchema,
  valueRaw: nonNegativeIntegerStringSchema,
  description: z.string().trim().min(1),
}) satisfies z.ZodType<PreparedTransaction>;

export const assetDeltaSchema = z.object({
  token: tokenSchema,
  amount: signedAmountSchema,
}) satisfies z.ZodType<AssetDelta>;

export const simulationSchema = z
  .object({
    status: z.enum(["success", "failed", "unsupported"]),
    error: z.string().trim().min(1).nullable(),
    assetDeltas: z.array(assetDeltaSchema).nullable(),
  })
  .superRefine((simulation, ctx) => {
    if (simulation.status === "success" && simulation.error !== null) {
      ctx.addIssue({
        code: "custom",
        message: "Successful simulation cannot include an error",
        path: ["error"],
      });
    }

    if (simulation.status === "failed" && simulation.error === null) {
      ctx.addIssue({
        code: "custom",
        message: "Failed simulation must include an error",
        path: ["error"],
      });
    }
  }) satisfies z.ZodType<Simulation>;

export const operationWarningSchema = z.object({
  code: z.string().trim().min(1),
  severity: z.enum(["info", "warning", "blocking"]),
  message: z.string().trim().min(1),
}) satisfies z.ZodType<OperationWarning>;

export const preparedOperationSchema = z
  .object({
    id: z.string().trim().min(1),
    intent: operationIntentSchema,
    chainId: chainIdSchema,
    account: addressSchema,
    stateBlock: blockNumberSchema,
    preparedAt: timestampSchema,
    expiresAt: timestampSchema,
    approvals: z.array(approvalRequirementSchema),
    transactions: z.array(preparedTransactionSchema).min(1),
    simulation: simulationSchema,
    warnings: z.array(operationWarningSchema),
  })
  .superRefine((operation, ctx) => {
    const id = operation.intent.kind.startsWith("pool-")
      ? parsePoolId(poolIdSchema.parse(operation.intent.opportunityId))
      : parseStrategyId(strategyIdSchema.parse(operation.intent.opportunityId));

    if (id.chainId !== operation.chainId) {
      ctx.addIssue({
        code: "custom",
        message: "Operation chain does not match opportunity ID",
        path: ["chainId"],
      });
    }

    if (operation.expiresAt <= operation.preparedAt) {
      ctx.addIssue({
        code: "custom",
        message: "Prepared operation must expire after it was prepared",
        path: ["expiresAt"],
      });
    }
  }) satisfies z.ZodType<PreparedOperation>;
