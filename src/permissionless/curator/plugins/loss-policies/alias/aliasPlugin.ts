import {
  type AliasedLossPolicyParams,
  type AliasedLossPolicyState,
  aliasedLossPolicyPlugin,
} from "./aliasedLossPolicyPlugin.js";

export type AliasLossPolicyParams = AliasedLossPolicyParams<"ALIAS">;

export type AliasLossPolicyState = AliasedLossPolicyState<"ALIAS">;

const alias = aliasedLossPolicyPlugin({
  type: "ALIAS",
  postfix: "ALIASED",
  name: "Alias",
  description:
    "Maps token addresses to alternative price feed addresses for custom loss calculations.",
  deployGas: 2_000_000, // not measured
});

export const aliasDeployParamsSchema = alias.deployParamsSchema;

export const aliasPlugin = alias.plugin;
