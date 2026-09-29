import {
  type Address,
  encodeAbiParameters,
  numberToHex,
  stringToHex,
} from "viem";
import { z } from "zod";
import { AccessMode } from "../../../../index.js";
import type { DeployParams } from "../../../core/market-tx.js";
import type {
  AbstractLossPolicyState,
  LossPolicyDeployParams,
  LossPolicyPlugin,
} from "../logic.js";

export interface AliasLossPolicyParams {
  type: "ALIAS";
  salt?: string;
}

export interface AliasLossPolicyState
  extends AliasLossPolicyParams,
    AbstractLossPolicyState {
  aliases: Record<Address, Address>;
  mode: AccessMode;
}

export const aliasDeployParamsSchema = z.object({
  type: z.literal("ALIAS"),
  salt: z.string().optional(),
});

export const aliasPlugin: LossPolicyPlugin = {
  name: "Alias",
  description:
    "Maps token addresses to alternative price feed addresses for custom loss calculations.",

  getDefaultParams(): AliasLossPolicyParams {
    return {
      type: "ALIAS",
    };
  },

  getDeployState(params: LossPolicyDeployParams): AliasLossPolicyState {
    if (params.type !== "ALIAS") {
      throw new Error("Invalid params");
    }
    return {
      ...params,
      aliases: {},
      mode: AccessMode.Permissionless,
      enabled: true,
    };
  },

  getDeployParams(args: {
    pool: Address;
    addressProvider: Address;
    params: LossPolicyDeployParams;
  }): DeployParams {
    const { pool, addressProvider, params } = args;

    if (params.type !== "ALIAS") {
      throw new Error("Invalid ALIAS params");
    }

    return {
      postfix: stringToHex("ALIASED", { size: 32 }),
      salt: params.salt
        ? stringToHex(params.salt, { size: 32 })
        : numberToHex(0, { size: 32 }),
      constructorParams: encodeAbiParameters(
        [{ type: "address" }, { type: "address" }],
        [pool, addressProvider],
      ),
    };
  },
};

export * from "./actions/index.js";
