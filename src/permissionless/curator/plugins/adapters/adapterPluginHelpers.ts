/**
 * Scaffolding shared by the adapter plugins. Kept apart from `builtinAdapterPlugins.ts` so
 * that plugin modules can import it without a circular dependency.
 **/

import {
  type Abi,
  type AbiParameter,
  type Address,
  type Chain,
  encodeAbiParameters,
  isAddress,
  type PublicClient,
  stringToHex,
  type Transport,
  zeroAddress,
  zeroHash,
} from "viem";
import { z } from "zod/v4";
import {
  type AbstractAdapterContract,
  adapterConstructorAbi,
} from "../../../../onchain/index.js";
import type { DeployParams } from "../../types.js";
import { addressSchema, literalsSchema } from "../../validationSchemas.js";
import { plainAdapterStateSchema } from "./adapterStateSchema.js";
import { validateCollateralTokens } from "./adapterValidation.js";
import type {
  AdapterDeployParamsBase,
  ValidateAdapterParamsArgs,
} from "./defineAdapterPlugin.js";

type SdkAdapter = AbstractAdapterContract<Abi, Abi>;

/** State of an adapter that was allowed but is not deployed yet. **/
export function deployState<T extends string>(
  type: T,
  params: { version: number; target: Address },
) {
  return {
    type,
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
  };
}

/** State of a deployed adapter, as the SDK reports it. **/
export function sdkState<T extends string>(type: T, adapter: SdkAdapter) {
  return {
    type,
    version: adapter.version,
    target: adapter.targetContract,
    adapter: adapter.address,
    isForbidden: false,
  };
}

/** The state-related members of a plugin whose adapter has no own state. **/
export function plainAdapter<T extends string>(type: T) {
  return {
    stateSchema: plainAdapterStateSchema,
    getDeployState: (params: { version: number; target: Address }) =>
      deployState(type, params),
    getStateFromSDK: (adapter: SdkAdapter) => sdkState(type, adapter),
  };
}

const plainConstructorAbi: readonly AbiParameter[] = [
  { name: "creditManager", type: "address" },
  { name: "target", type: "address" },
];

/**
 * Bytecode Repository deploy params of an adapter.
 *
 * Every adapter constructor starts with `(creditManager, target)`; adapters
 * that take more append them as `extraArgs`. The constructor ABI is the Gearbox
 * SDK's for the type and version; an adapter the SDK does not know passes its
 * own `constructorAbi`, or takes `(creditManager, target)` only.
 **/
export function adapterDeployParams(
  args: {
    creditManager: Address;
    params: { type: string; version: number; target: Address };
    constructorAbi?: readonly AbiParameter[];
  },
  extraArgs: readonly unknown[] = [],
): DeployParams {
  const { creditManager, params } = args;
  const constructorAbis = adapterConstructorAbi as Partial<
    Record<string, Record<number, readonly AbiParameter[]>>
  >;
  const constructorAbi =
    args.constructorAbi ??
    constructorAbis[params.type]?.[params.version] ??
    (extraArgs.length === 0 ? plainConstructorAbi : undefined);
  if (!constructorAbi) {
    throw new Error(
      `No constructor ABI for ${params.type} v${params.version}: pass constructorAbi`,
    );
  }
  return {
    postfix: stringToHex(params.type, { size: 32 }),
    salt: zeroHash,
    constructorParams: encodeAbiParameters(constructorAbi, [
      creditManager,
      params.target,
      ...extraArgs,
    ]),
  };
}

/** A zero-argument view call returning a single value. **/
export interface GetterCall {
  address: Address;
  abi: Abi;
  functionName: string;
}

/** `name()` on `address`, returning one `output` (an address by default). **/
export function getter(
  address: Address,
  name: string,
  output: "address" | "uint256" = "address",
): GetterCall {
  return {
    address,
    abi: [
      {
        inputs: [],
        name,
        outputs: [{ name: "", type: output }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: name,
  };
}

type ReadClient = PublicClient<Transport, Chain>;

/** Reads one address getter. **/
export function readAddress(
  client: ReadClient,
  address: Address,
  name: string,
): Promise<Address> {
  return client.readContract(getter(address, name)) as Promise<Address>;
}

/** Reads several getters in one multicall; any failing call rejects. **/
export function readAddresses(
  client: ReadClient,
  calls: readonly GetterCall[],
): Promise<Address[]> {
  return client.multicall({
    allowFailure: false,
    contracts: calls,
  }) as Promise<Address[]>;
}

/**
 * The usual `validateParams`: the target must be a contract of the expected
 * kind, and every token the adapter moves must be collateral of the credit
 * manager.
 *
 * `readTokens` reads those tokens off the target. A failing read means the
 * target is not what the adapter expects; returning a string reports a more
 * specific problem. `label` names the target in the messages.
 **/
export async function validateTargetTokens<P extends { target: Address }>(
  args: ValidateAdapterParamsArgs<P>,
  readTokens: () => Promise<Address[] | string>,
  label = "target",
): Promise<false | string> {
  if (!isAddress(args.params.target)) return `Invalid ${label} address`;

  try {
    const tokens = await readTokens();
    if (typeof tokens === "string") return tokens;
    return validateCollateralTokens({ ...args, tokens });
  } catch {
    return `Invalid ${label}`;
  }
}

/**
 * Deploy params schema of an adapter whose constructor takes nothing but
 * `(creditManager, target)`.
 *
 * @dev accepts versions 310–312 whatever the plugin's type declares, so a new
 * adapter version deploys without a schema change
 **/
export function plainDeployParamsSchema<D extends AdapterDeployParamsBase>(
  type: D["type"],
): z.ZodType<D> {
  return z.object({
    type: z.literal(type),
    version: literalsSchema(310, 311, 312),
    target: addressSchema,
  }) as unknown as z.ZodType<D>;
}

/**
 * Deploy params schema of an adapter that also takes the token it stakes,
 * e.g. a Convex base reward pool. `versions` are those the SDK has a
 * constructor ABI for; 310–312 unless the adapter has fewer.
 **/
export function stakedTokenDeployParamsSchema<
  D extends AdapterDeployParamsBase,
>(
  type: D["type"],
  versions: readonly [number, ...number[]] = [310, 311, 312],
): z.ZodType<D> {
  return z.object({
    type: z.literal(type),
    version: literalsSchema(...versions),
    target: addressSchema,
    stakedToken: addressSchema,
  }) as unknown as z.ZodType<D>;
}
