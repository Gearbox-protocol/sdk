import {
  type Abi,
  type Address,
  type Chain,
  encodeAbiParameters,
  isAddress,
  type PublicClient,
  stringToHex,
  type Transport,
  zeroAddress,
} from "viem";
import { z } from "zod";
import {
  type AbstractAdapterContract,
  adapterConstructorAbi,
} from "../../../../../onchain/index.js";
import type { DeployParams } from "../../../core/market-tx.js";
import { addressSchema, literalsSchema } from "../../../core/validation.js";
import type {
  AdapterPlugin,
  BaseAdapterState,
  ValidateAdapterParamsArgs,
} from "../logic.js";
import { getCurveTargetCoins, validateCollateralTokens } from "../utils.js";

export type CurveV1AdapterState = BaseAdapterState;

export const CURVE_V1_ADAPTER_TYPES = [
  "CURVE_V1_2ASSETS",
  "CURVE_V1_3ASSETS",
  "CURVE_V1_4ASSETS",
  "CURVE_STABLE_NG",
] as const;

export type CurveV1AdapterTypes = (typeof CURVE_V1_ADAPTER_TYPES)[number];

export type CurveV1Adapter310DeployParams = {
  type: CurveV1AdapterTypes;
  version: 310;
  target: Address;
  lpToken: Address;
  basePool: Address;
};

export type CurveV1Adapter311DeployParams = {
  type: CurveV1AdapterTypes;
  version: 311;
  target: Address;
  lpToken: Address;
  basePool: Address;
  use256: boolean;
};

export type CurveV1AdapterDeployParams =
  | CurveV1Adapter310DeployParams
  | CurveV1Adapter311DeployParams;

export const curveV1DeployParamsSchema = z.object({
  type: literalsSchema(...CURVE_V1_ADAPTER_TYPES),
  version: z.literal(311),
  target: addressSchema,
  lpToken: addressSchema,
  basePool: addressSchema,
  use256: z.boolean(),
});

const getDefaultParams = (
  adapterType: CurveV1AdapterTypes,
): CurveV1AdapterDeployParams => {
  switch (adapterType) {
    case "CURVE_V1_2ASSETS":
      return {
        type: adapterType,
        version: 311,
        target: "0x4DEcE678ceceb27446b35C672dC7d61F30bAD69E" as Address,
        lpToken: zeroAddress,
        basePool: zeroAddress,
        use256: false,
      };
    case "CURVE_V1_3ASSETS":
      return {
        type: adapterType,
        version: 311,
        target: "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7" as Address,
        lpToken: zeroAddress,
        basePool: zeroAddress,
        use256: false,
      };
    case "CURVE_V1_4ASSETS":
      return {
        type: adapterType,
        version: 311,
        target: "0xA5407eAE9Ba41422680e2e00537571bcC53efBfD" as Address,
        lpToken: zeroAddress,
        basePool: zeroAddress,
        use256: false,
      };
    case "CURVE_STABLE_NG":
      return {
        type: adapterType,
        version: 311,
        target: "0xd29f8980852c2c76fC3f6E96a7Aa06E0BedCC1B1" as Address,
        lpToken: zeroAddress,
        basePool: zeroAddress,
        use256: false,
      };
  }
};

export const curveAdapterInfo: Record<
  CurveV1AdapterTypes,
  {
    name: string;
    description: string;
  }
> = {
  CURVE_V1_2ASSETS: {
    name: "CurveV1 2 Assets",
    description: "Adapter for Curve V1 2 Assets",
  },
  CURVE_V1_3ASSETS: {
    name: "CurveV1 3 Assets",
    description: "Adapter for Curve V1 3 Assets",
  },
  CURVE_V1_4ASSETS: {
    name: "CurveV1 4 Assets",
    description: "Adapter for Curve V1 4 Assets",
  },
  CURVE_STABLE_NG: {
    name: "CurveV1 StableNg",
    description: "Adapter for Curve V1 Stable NG",
  },
};

const getNCoins = async (
  client: PublicClient<Transport, Chain>,
  params: CurveV1AdapterDeployParams,
): Promise<number> => {
  switch (params.type) {
    case "CURVE_V1_2ASSETS":
      return 2;
    case "CURVE_V1_3ASSETS":
      return 3;
    case "CURVE_V1_4ASSETS":
      return 4;
    case "CURVE_STABLE_NG": {
      const nCoins = await client.readContract({
        address: params.target,
        abi: [
          {
            inputs: [],
            name: "N_COINS",
            outputs: [{ name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "N_COINS",
      });

      return Number(nCoins);
    }
  }
};

export const getCurveV1Plugin = (
  adapterType: CurveV1AdapterTypes,
): AdapterPlugin => ({
  name: curveAdapterInfo[adapterType].name,
  description: curveAdapterInfo[adapterType].description,
  getDefaultParams: () => getDefaultParams(adapterType),
  isEditable: true,
  getDeployState: (params: CurveV1AdapterDeployParams) => ({
    type: adapterType,
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: CurveV1AdapterDeployParams;
  }): DeployParams => {
    return {
      postfix: stringToHex(args.params.type, { size: 32 }),
      salt: stringToHex("", { size: 32 }),
      constructorParams: encodeAbiParameters(
        adapterConstructorAbi[args.params.type][args.params.version],
        args.params.version === 310
          ? [
              args.creditManager,
              args.params.target,
              args.params.lpToken,
              args.params.basePool,
            ]
          : [
              args.creditManager,
              args.params.target,
              args.params.lpToken,
              args.params.basePool,
              args.params.type === "CURVE_STABLE_NG"
                ? false
                : args.params.use256,
            ],
      ),
    };
  },
  validateParams: async (
    args: ValidateAdapterParamsArgs<CurveV1AdapterDeployParams>,
  ): Promise<false | string> => {
    const { client, params } = args;
    const target = params.target;
    if (!isAddress(target)) return "Invalid target address";

    try {
      const nCoins = await getNCoins(client, params);
      const coins = await getCurveTargetCoins({
        client,
        target,
        nCoins,
      });

      return validateCollateralTokens({
        ...args,
        tokens: coins,
      });

      // TODO: check metapoolBase coins
    } catch {
      return "Invalid target";
    }
  },
  getStateFromSDK: (
    adapter: AbstractAdapterContract<Abi, Abi>,
  ): CurveV1AdapterState => {
    return {
      type: adapter.adapterType.split("::")[1] as CurveV1AdapterTypes,
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
    };
  },
});
