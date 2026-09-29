import {
  type Abi,
  type Address,
  encodeAbiParameters,
  hexToString,
  isAddress,
  stringToHex,
  zeroAddress,
} from "viem";
import { iVersionAbi } from "../../../../../abi/iVersion.js";
import {
  type AbstractAdapterContract,
  adapterConstructorAbi,
} from "../../../../../onchain/index.js";
import type { DeployParams } from "../../../core/market-tx.js";
import type {
  AdapterPlugin,
  BaseAdapterState,
  ValidateAdapterParamsArgs,
} from "../logic.js";
import { validateCollateralTokens } from "../utils.js";

export type AbstractAdapterState = BaseAdapterState;

export const ABSTRACT_ADAPTER_TYPES = [
  "LIDO_V1",
  "LIDO_WSTETH_V1",
  "MELLOW_DVV",
  "FLUID_DEX",
  "BALANCER_V3_WRAPPER",
  "ACCOUNT_MIGRATOR",
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
  },
  LIDO_WSTETH_V1: {
    name: "Lido wstETH",
    description: "Adapter for Lido wstETH",
    latestVersion: 310,
    targetLabel: "WstETH",
    isTargetCollateral: true,
  },
  MELLOW_DVV: {
    name: "Mellow DVV",
    description: "Adapter for Mellow DVV Vault",
    latestVersion: 310,
    targetLabel: "Vault",
    isTargetCollateral: true,
  },
  FLUID_DEX: {
    name: "Fluid Dex",
    description: "Adapter for Fluid Dex",
    latestVersion: 310,
    defaultTarget: "0xdE632C3a214D5f14C1d8ddF0b92F8BCd188fee45",
    isTargetCollateral: false,
  },
  BALANCER_V3_WRAPPER: {
    name: "BalancerV3 Wrapper",
    description: "Adapter for Balancer V3 Wrapper",
    latestVersion: 310,
    defaultTarget: zeroAddress,
    isTargetCollateral: true,
  },
  ACCOUNT_MIGRATOR: {
    name: "Account Migrator",
    description: "Adapter for Migrating credit accounts",
    latestVersion: 310,
    targetLabel: "Migrator Bot",
    defaultTarget: "0x286Fe53994f5668D56538Aa10eaa3Ac36f878e9C",
    isTargetCollateral: false,
  },
  SECURITIZE_ONRAMP: {
    name: "Securitize Onramp",
    description: "Securitize On-Ramp Adapter",
    latestVersion: 310,
    isTargetCollateral: false,
  },
};

export const getAbstractAdapterPlugin = (
  adapterType: AbstractAdapterTypes,
): AdapterPlugin => ({
  deprecated: abstractAdapterInfo[adapterType].deprecated ?? false,
  name: abstractAdapterInfo[adapterType].name,
  description: abstractAdapterInfo[adapterType].description,
  getDefaultParams: () => ({
    type: adapterType,
    version: abstractAdapterInfo[adapterType].latestVersion,
    target: abstractAdapterInfo[adapterType].defaultTarget ?? zeroAddress,
  }),
  isEditable: false,
  getDeployState: (params: AbstractAdapterDeployParams) => ({
    type: adapterType,
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: AbstractAdapterDeployParams;
  }): DeployParams => {
    return {
      postfix: stringToHex(args.params.type, { size: 32 }),
      salt: stringToHex("", { size: 32 }),
      constructorParams: encodeAbiParameters(
        adapterConstructorAbi[args.params.type][args.params.version],
        [args.creditManager, args.params.target],
      ),
    };
  },
  validateParams: async (
    args: ValidateAdapterParamsArgs<AbstractAdapterDeployParams>,
  ): Promise<false | string> => {
    const { client, params } = args;
    const { target, type } = params;

    if (!isAddress(target)) return "Invalid target address";

    try {
      switch (type) {
        case "ACCOUNT_MIGRATOR": {
          const targetType = await client.readContract({
            address: target,
            abi: iVersionAbi,
            functionName: "contractType",
          });

          if (
            hexToString(targetType as `0x${string}`, { size: 32 }) !==
            "BOT::ACCOUNT_MIGRATOR"
          )
            return "Target must be an account migrator bot";

          return false;
        }
        case "MELLOW_DVV": {
          const asset = await client.readContract({
            address: target,
            abi: [
              {
                inputs: [],
                name: "asset",
                outputs: [{ name: "", type: "address" }],
                stateMutability: "view",
                type: "function",
              },
            ],
            functionName: "asset",
          });

          return validateCollateralTokens({
            ...args,
            tokens: [asset],
          });
        }
        case "LIDO_V1": {
          const [stETH, weth] = await client.multicall({
            allowFailure: false,
            contracts: [
              {
                address: target,
                abi: [
                  {
                    inputs: [],
                    name: "stETH",
                    outputs: [{ name: "", type: "address" }],
                    stateMutability: "view",
                    type: "function",
                  },
                ],
                functionName: "stETH",
                args: [],
              },
              {
                address: target,
                abi: [
                  {
                    inputs: [],
                    name: "weth",
                    outputs: [{ name: "", type: "address" }],
                    stateMutability: "view",
                    type: "function",
                  },
                ],
                functionName: "weth",
                args: [],
              },
            ],
          });

          return validateCollateralTokens({
            ...args,
            tokens: [stETH, weth],
          });
        }
        case "LIDO_WSTETH_V1": {
          const stETH = await client.readContract({
            address: target,
            abi: [
              {
                inputs: [],
                name: "stETH",
                outputs: [{ name: "", type: "address" }],
                stateMutability: "view",
                type: "function",
              },
            ],
            functionName: "stETH",
          });

          return validateCollateralTokens({
            ...args,
            tokens: [stETH],
          });
        }
        case "FLUID_DEX": {
          const constantViews = await client.readContract({
            address: target,
            abi: [
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
            ],
            functionName: "constantsView",
          });

          return validateCollateralTokens({
            ...args,
            tokens: [constantViews.token0, constantViews.token1],
          });
        }
        case "BALANCER_V3_WRAPPER": {
          const balancerPoolToken = await client.readContract({
            address: target,
            abi: [
              {
                inputs: [],
                name: "balancerPoolToken",
                outputs: [{ name: "", type: "address" }],
                stateMutability: "view",
                type: "function",
              },
            ],
            functionName: "balancerPoolToken",
          });

          return validateCollateralTokens({
            ...args,
            tokens: [balancerPoolToken],
          });
        }

        case "SECURITIZE_ONRAMP": {
          const [dsToken, liquidityToken] = await client.multicall({
            allowFailure: false,
            contracts: [
              {
                address: target,
                abi: [
                  {
                    inputs: [],
                    name: "dsToken",
                    outputs: [{ name: "", type: "address" }],
                    stateMutability: "view",
                    type: "function",
                  },
                ],
                functionName: "dsToken",
              },
              {
                address: target,
                abi: [
                  {
                    inputs: [],
                    name: "liquidityToken",
                    outputs: [{ name: "", type: "address" }],
                    stateMutability: "view",
                    type: "function",
                  },
                ],
                functionName: "liquidityToken",
              },
            ],
          });

          return validateCollateralTokens({
            ...args,
            tokens: [dsToken, liquidityToken],
          });
        }
      }
    } catch {
      return "Invalid target";
    }

    return false;
  },
  getStateFromSDK: (
    adapter: AbstractAdapterContract<Abi, Abi>,
  ): AbstractAdapterState => {
    return {
      type: adapterType,
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
    };
  },
});
