import { type Address, encodeAbiParameters, stringToHex, zeroHash } from "viem";
import { z } from "zod/v4";
import { AccessMode } from "../../../../bindings/types.js";
import { ALIAS_LOSS_POLICY_ABI } from "../../../../plugins/loss-policies/constructor-params-abi.js";
import { handleSalt } from "../../../../utils/create2.js";
import {
  address,
  boolean,
  identity,
  object,
  observed,
  optional,
  record,
  scalar,
  string,
} from "../../../state/diff/schemaNodes.js";
import type {
  AbstractLossPolicyState,
  LossPolicyPlugin,
} from "../lossPolicyPlugins.js";

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

  stateSchema: object<AliasLossPolicyState>({
    type: identity(string),
    salt: observed(optional(string)),
    enabled: boolean,
    mode: scalar,
    aliases: record(address, address),
  }),
  getDeployState(params): AliasLossPolicyState {
    return {
      ...params,
      aliases: {},
      mode: AccessMode.Permissionless,
      enabled: true,
    };
  },

  getDeployParams({ pool, addressProvider, params }) {
    return {
      postfix: stringToHex("ALIASED", { size: 32 }),
      salt: params.salt ? handleSalt(params.salt) : zeroHash,
      constructorParams: encodeAbiParameters(ALIAS_LOSS_POLICY_ABI, [
        pool,
        addressProvider,
      ]),
    };
  },
};
