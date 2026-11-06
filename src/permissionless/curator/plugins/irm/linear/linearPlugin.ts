import { encodeAbiParameters, stringToHex, zeroHash } from "viem";
import { z } from "zod/v4";
import { LINEAR_IRM_ABI } from "../../../../plugins/irm/constructor-params-abi.js";
import { handleSalt } from "../../../../utils/create2.js";
import { convertPercent } from "../../../../utils/format.js";
import {
  boolean,
  identity,
  object,
  observed,
  optional,
  percent,
  string,
} from "../../../state/diff/schemaNodes.js";
import { percentageSchema } from "../../../validationSchemas.js";
import type { IRMPlugin } from "../irmPlugins.js";

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

  stateSchema: object<LinearInterestRateModelState>({
    type: identity(string),
    salt: observed(optional(string)),
    params: object({
      U_1: percent,
      U_2: percent,
      R_base: percent,
      R_slope1: percent,
      R_slope2: percent,
      R_slope3: percent,
      isBorrowingMoreU2Forbidden: boolean,
    }),
  }),
  getDeployState: params => params,
  getDeployParams: params => {
    const model = params.params;
    const bps = (percentage: number) => BigInt(convertPercent(percentage));
    return {
      postfix: stringToHex(params.type, { size: 32 }),
      salt: params.salt ? handleSalt(params.salt) : zeroHash,
      constructorParams: encodeAbiParameters(LINEAR_IRM_ABI, [
        bps(model.U_1),
        bps(model.U_2),
        bps(model.R_base),
        bps(model.R_slope1),
        bps(model.R_slope2),
        bps(model.R_slope3),
        model.isBorrowingMoreU2Forbidden,
      ]),
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
