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
  LossPolicyDeployParams,
  LossPolicyPlugin,
} from "../lossPolicyPlugins.js";

/** Loss policies that price tokens through alias price feeds. **/
export type AliasedLossPolicyType = "ALIAS" | "MIDAS_ALIAS";

export interface AliasedLossPolicyParams<
  T extends AliasedLossPolicyType = AliasedLossPolicyType,
> {
  type: T;
  salt?: string;
}

export interface AliasedLossPolicyState<
  T extends AliasedLossPolicyType = AliasedLossPolicyType,
> extends AliasedLossPolicyParams<T>,
    AbstractLossPolicyState {
  aliases: Record<Address, Address>;
  mode: AccessMode;
}

/** Whether a loss policy state is an aliased one, whose alias actions apply. **/
export function isAliasedLossPolicy(lossPolicy: {
  type?: string;
}): lossPolicy is AliasedLossPolicyState {
  return lossPolicy.type === "ALIAS" || lossPolicy.type === "MIDAS_ALIAS";
}

/**
 * Deploy params schema and plugin of an aliased loss policy: `type` in the
 * GIP, deployed from the Bytecode Repository as `LOSS_POLICY::<postfix>`
 * with the aliased policy's constructor.
 **/
export function aliasedLossPolicyPlugin<T extends AliasedLossPolicyType>(args: {
  type: T;
  postfix: string;
  name: string;
  description: string;
  /** Gas of deploying it with `MARKET::updateLossPolicy`. **/
  deployGas: number;
}) {
  const { type, postfix } = args;
  const deployParamsSchema = z.object({
    type: z.literal(type),
    salt: z.string().optional(),
  });
  const plugin: LossPolicyPlugin = {
    name: args.name,
    description: args.description,
    deployGas: args.deployGas,
    // @dev `type` is one member of the union, which the generic cannot show
    getDefaultParams: () => ({ type }) as LossPolicyDeployParams,
    stateSchema: object<AliasedLossPolicyState>({
      type: identity(string),
      salt: observed(optional(string)),
      enabled: boolean,
      mode: scalar,
      aliases: record(address, address),
    }),
    getDeployState: (params): AliasedLossPolicyState => ({
      ...params,
      aliases: {},
      mode: AccessMode.Permissionless,
      enabled: true,
    }),
    getDeployParams: ({ pool, addressProvider, params }) => ({
      postfix: stringToHex(postfix, { size: 32 }),
      salt: params.salt ? handleSalt(params.salt) : zeroHash,
      constructorParams: encodeAbiParameters(ALIAS_LOSS_POLICY_ABI, [
        pool,
        addressProvider,
      ]),
    }),
  };
  return { deployParamsSchema, plugin };
}
