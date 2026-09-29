import { encodeAbiParameters, numberToHex, stringToHex } from "viem";
import { z } from "zod";
import { convertPercent, handleSalt } from "../../../../index.js";
import type { DeployParams } from "../../../core/market-tx.js";
import { percentageSchema } from "../../../core/validation.js";
import type { InterestRateModelParams, IRMPlugin } from "../logic.js";

export interface LinearInterestRateModelParams {
  type: "LINEAR";
  salt?: string;
  params: {
    U_1: number;
    U_2: number;
    R_base: number;
    R_slope1: number;
    R_slope2: number;
    R_slope3: number;
    isBorrowingMoreU2Forbidden: boolean;
  };
}

export type LinearInterestRateModelState = LinearInterestRateModelParams;

export const linearPlugin: IRMPlugin = {
  name: "Linear",
  description:
    "Interest rate model with three slopes based on utilization rate thresholds",
  getDefaultParams: () => ({
    type: "LINEAR",
    params: {
      U_1: 70,
      U_2: 90,
      R_base: 0,
      R_slope1: 5,
      R_slope2: 20,
      R_slope3: 100,
      isBorrowingMoreU2Forbidden: true,
    },
  }),

  getDeployState: params => params,
  getDeployParams: (params: InterestRateModelParams): DeployParams => {
    if (params.type !== "LINEAR") {
      throw new Error(`Unsupported IRM type: ${params.type}`);
    }

    return {
      postfix: stringToHex(params.type, { size: 32 }),
      salt: params.salt
        ? handleSalt(params.salt)
        : numberToHex(0, { size: 32 }),
      constructorParams: encodeAbiParameters(
        [
          { type: "uint256" },
          { type: "uint256" },
          { type: "uint256" },
          { type: "uint256" },
          { type: "uint256" },
          { type: "uint256" },
          { type: "bool" },
        ],
        [
          BigInt(convertPercent(params.params.U_1)),
          BigInt(convertPercent(params.params.U_2)),
          BigInt(convertPercent(params.params.R_base)),
          BigInt(convertPercent(params.params.R_slope1)),
          BigInt(convertPercent(params.params.R_slope2)),
          BigInt(convertPercent(params.params.R_slope3)),
          params.params.isBorrowingMoreU2Forbidden,
        ],
      ),
    };
  },
};

const unit16PercentageSchema = z
  .number()
  .min(0, "Percentage must be positive")
  .max(655.35, "Percentage cannot exceed 655.35%")
  .transform(value => Math.round(value * 100) / 100);

export const linearInterestRateModelDeployParamsSchema = z
  .object({
    type: z.literal("LINEAR"),
    salt: z.string().optional(),
    params: z.object({
      U_1: percentageSchema,
      U_2: percentageSchema,
      R_base: unit16PercentageSchema,
      R_slope1: unit16PercentageSchema,
      R_slope2: unit16PercentageSchema,
      R_slope3: unit16PercentageSchema,
      isBorrowingMoreU2Forbidden: z.boolean(),
    }),
  })
  .refine(data => data.params.U_1 <= data.params.U_2, {
    message: "Invalid params: U1 must be less than or equal to than U2",
  })
  .refine(data => data.params.R_slope1 <= data.params.R_slope2, {
    message: "Invalid params: R_slope1 must be less than or equal to R_slope2",
  })
  .refine(data => data.params.R_slope2 <= data.params.R_slope3, {
    message: "Invalid params: R_slope2 must be less than or equal to R_slope3",
  })
  .refine(data => data.params.U_2 < 100, {
    message: "Invalid params: U2 must be less than 100%",
  })
  .refine(data => data.params.R_base <= 100, {
    message: "Invalid params: R_base must be less than 100%",
  })
  .refine(data => data.params.R_slope2 <= 100, {
    message: "Invalid params: R_slope2 must be less than 100%",
  });
