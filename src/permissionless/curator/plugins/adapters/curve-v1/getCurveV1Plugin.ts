import {
  type Address,
  type Chain,
  type PublicClient,
  type Transport,
  zeroAddress,
} from "viem";
import { z } from "zod/v4";
import { addressSchema } from "../../../validationSchemas.js";
import {
  adapterDeployParams,
  getter,
  plainAdapter,
  resolveTargetTokens,
  sdkState,
} from "../adapterPluginHelpers.js";
import { getCurveTargetCoins } from "../adapterValidation.js";
import type {
  AdapterStateBase,
  AdapterValidation,
  ResolveAdapterValidationArgs,
} from "../defineAdapterPlugin.js";
import { defineAdapterPlugin } from "../defineAdapterPlugin.js";

export type CurveV1AdapterState = AdapterStateBase;

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

/** A well-known pool of each kind, offered as the default target. **/
const DEFAULT_TARGETS: Record<CurveV1AdapterTypes, Address> = {
  CURVE_V1_2ASSETS: "0x4DEcE678ceceb27446b35C672dC7d61F30bAD69E",
  CURVE_V1_3ASSETS: "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",
  CURVE_V1_4ASSETS: "0xA5407eAE9Ba41422680e2e00537571bcC53efBfD",
  CURVE_STABLE_NG: "0xd29f8980852c2c76fC3f6E96a7Aa06E0BedCC1B1",
};

/** Number of coins of the fixed-size pools; Stable NG pools report their own. **/
const FIXED_N_COINS: Record<
  Exclude<CurveV1AdapterTypes, "CURVE_STABLE_NG">,
  number
> = {
  CURVE_V1_2ASSETS: 2,
  CURVE_V1_3ASSETS: 3,
  CURVE_V1_4ASSETS: 4,
};

async function getNCoins(
  client: PublicClient<Transport, Chain>,
  params: Pick<CurveV1AdapterDeployParams, "type" | "target">,
): Promise<number> {
  if (params.type !== "CURVE_STABLE_NG") return FIXED_N_COINS[params.type];

  return Number(
    await client.readContract(getter(params.target, "N_COINS", "uint256")),
  );
}

/** A Curve pool is usable when all of its coins are collateral. **/
export function resolveCurveTarget(
  args: ResolveAdapterValidationArgs<
    Pick<CurveV1AdapterDeployParams, "type" | "target">
  >,
): Promise<AdapterValidation> {
  const { client, params } = args;
  return resolveTargetTokens(args, async () =>
    // TODO: check metapoolBase coins
    getCurveTargetCoins({
      client,
      target: params.target,
      nCoins: await getNCoins(client, params),
    }),
  );
}

export const getCurveV1Plugin = (adapterType: CurveV1AdapterTypes) =>
  defineAdapterPlugin<CurveV1AdapterDeployParams, CurveV1AdapterState>()({
    type: adapterType,
    name: curveAdapterInfo[adapterType].name,
    description: curveAdapterInfo[adapterType].description,
    getDefaultParams: () => ({
      type: adapterType,
      version: 311,
      target: DEFAULT_TARGETS[adapterType],
      lpToken: zeroAddress,
      basePool: zeroAddress,
      use256: false,
    }),
    isEditable: true,
    // got 1,942,285 for 2 assets (others are roughly the same) and 2,023,751 for
    // Stable NG
    allowGas: adapterType === "CURVE_STABLE_NG" ? 2_100_000 : 2_000_000,
    ...plainAdapter(adapterType),
    getDeployParams: args => {
      const { params } = args;
      return adapterDeployParams(
        args,
        params.version === 310
          ? [params.lpToken, params.basePool]
          : [
              params.lpToken,
              params.basePool,
              // Stable NG adapters never use uint256 coin indices.
              params.type === "CURVE_STABLE_NG" ? false : params.use256,
            ],
      );
    },
    resolveValidation: resolveCurveTarget,
    // @dev the SDK reports the concrete Curve flavour, which is authoritative
    getStateFromSDK: adapter =>
      sdkState(
        adapter.adapterType.split("::")[1] as CurveV1AdapterTypes,
        adapter,
      ),
    deployParamsSchema: z.object({
      type: z.literal(adapterType),
      version: z.literal(311),
      target: addressSchema,
      lpToken: addressSchema,
      basePool: addressSchema,
      use256: z.boolean(),
    }),
    actions: {},
  });
