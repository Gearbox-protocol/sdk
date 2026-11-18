import {
  type AliasedLossPolicyParams,
  type AliasedLossPolicyState,
  aliasedLossPolicyPlugin,
} from "../alias/aliasedLossPolicyPlugin.js";

export type MidasAliasLossPolicyParams = AliasedLossPolicyParams<"MIDAS_ALIAS">;

export type MidasAliasLossPolicyState = AliasedLossPolicyState<"MIDAS_ALIAS">;

const midasAlias = aliasedLossPolicyPlugin({
  type: "MIDAS_ALIAS",
  postfix: "MIDAS_ALIASED",
  name: "Midas Aliased",
  description:
    "Alias price feeds for loss calculations. Loss liquidations are blocked while any pending Midas redemption on the account is rejected.",
  deployGas: 2_500_000, // not measured
});

export const midasAliasDeployParamsSchema = midasAlias.deployParamsSchema;

/**
 * The aliased loss policy of markets whose collateral redeems through Midas:
 * the same aliases and alias actions, deployed as `LOSS_POLICY::MIDAS_ALIASED`.
 **/
export const midasAliasPlugin = midasAlias.plugin;
