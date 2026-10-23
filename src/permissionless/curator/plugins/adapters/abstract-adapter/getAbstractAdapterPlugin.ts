import {
  type Address,
  type Chain,
  type PublicClient,
  type Transport,
  zeroAddress,
} from "viem";
import {
  adapterDeployParams,
  getter,
  plainAdapter,
  plainDeployParamsSchema,
  readAddress,
  readAddresses,
  validateTargetTokens,
} from "../adapterPluginHelpers.js";
import type {
  AdapterStateBase,
  ValidateAdapterParamsArgs,
} from "../defineAdapterPlugin.js";
import { defineAdapterPlugin } from "../defineAdapterPlugin.js";

export type AbstractAdapterState = AdapterStateBase;

export const ABSTRACT_ADAPTER_TYPES = [
  "LIDO_V1",
  "LIDO_WSTETH_V1",
  "MELLOW_DVV",
  "FLUID_DEX",
  "BALANCER_V3_WRAPPER",
  "SECURITIZE_ONRAMP",
] as const;

export type AbstractAdapterTypes = (typeof ABSTRACT_ADAPTER_TYPES)[number];

export interface AbstractAdapterDeployParams {
  type: AbstractAdapterTypes;
  version: 310;
  target: Address;
}

interface AbstractAdapterInfo {
  name: string;
  description: string;
  latestVersion: 310;
  targetLabel?: string;
  defaultTarget?: Address;
  deprecated?: boolean;
  isTargetCollateral: boolean;
  /** Gas of `CREDIT::allowAdapter` for this adapter. **/
  allowGas: number;
}

export const abstractAdapterInfo: Record<
  AbstractAdapterTypes,
  AbstractAdapterInfo
> = {
  LIDO_V1: {
    name: "Lido V1",
    description: "Adapter for Lido V1",
    latestVersion: 310,
    targetLabel: "Lido Gateway",
    defaultTarget: "0x6f4b4aB5142787c05b7aB9A9692A0f46b997C29D",
    isTargetCollateral: false,
    allowGas: 2_000_000, // not measured
  },
  LIDO_WSTETH_V1: {
    name: "Lido wstETH",
    description: "Adapter for Lido wstETH",
    latestVersion: 310,
    targetLabel: "WstETH",
    isTargetCollateral: true,
    allowGas: 890_000, // got 877,652
  },
  MELLOW_DVV: {
    name: "Mellow DVV",
    description: "Adapter for Mellow DVV Vault",
    latestVersion: 310,
    targetLabel: "Vault",
    isTargetCollateral: true,
    allowGas: 2_000_000, // not measured
  },
  FLUID_DEX: {
    name: "Fluid Dex",
    description: "Adapter for Fluid Dex",
    latestVersion: 310,
    defaultTarget: "0xdE632C3a214D5f14C1d8ddF0b92F8BCd188fee45",
    isTargetCollateral: false,
    allowGas: 2_000_000, // not measured
  },
  BALANCER_V3_WRAPPER: {
    name: "BalancerV3 Wrapper",
    description: "Adapter for Balancer V3 Wrapper",
    latestVersion: 310,
    defaultTarget: zeroAddress,
    isTargetCollateral: true,
    allowGas: 2_000_000, // not measured
  },
  SECURITIZE_ONRAMP: {
    name: "Securitize Onramp",
    description: "Securitize On-Ramp Adapter",
    latestVersion: 310,
    isTargetCollateral: false,
    allowGas: 2_000_000, // not measured
  },
};

const fluidDexConstantsAbi = [
  {
    inputs: [],
    name: "constantsView",
    outputs: [
      {
        components: [
          { name: "dexId", type: "uint256" },
          { name: "liquidity", type: "address" },
          { name: "factory", type: "address" },
          {
            components: [
              { name: "shift", type: "address" },
              { name: "admin", type: "address" },
              { name: "colOperations", type: "address" },
              { name: "debtOperations", type: "address" },
              {
                name: "perfectOperationsAndOracle",
                type: "address",
              },
            ],
            name: "implementations",
            type: "tuple",
          },
          { name: "deployerContract", type: "address" },
          { name: "token0", type: "address" },
          { name: "token1", type: "address" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

/** Getters of the target that return the tokens the adapter moves. **/
const TOKEN_GETTERS: Record<
  Exclude<AbstractAdapterTypes, "FLUID_DEX">,
  readonly string[]
> = {
  MELLOW_DVV: ["asset"],
  LIDO_V1: ["stETH", "weth"],
  LIDO_WSTETH_V1: ["stETH"],
  BALANCER_V3_WRAPPER: ["balancerPoolToken"],
  SECURITIZE_ONRAMP: ["dsToken", "liquidityToken"],
};

/** Tokens the adapter of `type` moves through `target`. **/
async function readTargetTokens(
  client: PublicClient<Transport, Chain>,
  type: AbstractAdapterTypes,
  target: Address,
): Promise<Address[]> {
  if (type === "FLUID_DEX") {
    const { token0, token1 } = await client.readContract({
      address: target,
      abi: fluidDexConstantsAbi,
      functionName: "constantsView",
    });
    return [token0, token1];
  }

  const [first, ...rest] = TOKEN_GETTERS[type];
  return rest.length === 0
    ? [await readAddress(client, target, first)]
    : readAddresses(
        client,
        [first, ...rest].map(name => getter(target, name)),
      );
}

export const getAbstractAdapterPlugin = (adapterType: AbstractAdapterTypes) => {
  const info = abstractAdapterInfo[adapterType];
  return defineAdapterPlugin<
    AbstractAdapterDeployParams,
    AbstractAdapterState
  >()({
    type: adapterType,
    deprecated: info.deprecated ?? false,
    name: info.name,
    description: info.description,
    getDefaultParams: () => ({
      type: adapterType,
      version: info.latestVersion,
      target: info.defaultTarget ?? zeroAddress,
    }),
    isEditable: false,
    allowGas: info.allowGas,
    ...plainAdapter(adapterType),
    getDeployParams: args => adapterDeployParams(args),
    validateParams: (
      args: ValidateAdapterParamsArgs<AbstractAdapterDeployParams>,
    ) =>
      validateTargetTokens(args, () =>
        readTargetTokens(args.client, args.params.type, args.params.target),
      ),
    deployParamsSchema:
      plainDeployParamsSchema<AbstractAdapterDeployParams>(adapterType),
    actions: {},
  });
};
