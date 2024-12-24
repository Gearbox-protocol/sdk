import {
  NetworkType,
  PartialRecord,
  PERCENTAGE_FACTOR,
  TypedObjectUtils,
} from "@gearbox-protocol/sdk-gov";
import axios from "axios";

import { GearboxBackendApi } from "../core/endpoint";
import { TokensWithAPY } from ".";

interface LamaItem {
  apy: number;
  apyBase: number;

  chain: string;
  pool: string;
  symbol: string;
  project: string;
}

interface LamaResponse {
  data: Array<LamaItem>;
}

export async function getDefiLamaAPY(
  networkType: NetworkType,
): Promise<PartialRecord<TokensWithAPY, number>> {
  const currentNormal = NORMAL_TO_LAMA[networkType];
  const idList = Object.values(currentNormal);
  if (idList.length === 0) return {};

  const res = await axios.get<LamaResponse>(
    GearboxBackendApi.getLlamaAPYUrl(idList),
  );
  const itemsRecord = res.data.data.reduce<Record<string, LamaItem>>(
    (acc, item) => {
      acc[item.pool] = item;
      return acc;
    },
    {},
  );

  const allAPY = TypedObjectUtils.entries(
    currentNormal as Record<TokensWithAPY, string>,
  ).reduce<PartialRecord<TokensWithAPY, number>>((acc, [symbol, pool]) => {
    const { apy = 0 } = itemsRecord[pool] || {};
    acc[symbol] = Math.round(apy * Number(PERCENTAGE_FACTOR));

    return acc;
  }, {});

  return allAPY;
}

const NORMAL_TO_LAMA: Record<
  NetworkType,
  PartialRecord<TokensWithAPY, string>
> = {
  Mainnet: {
    sDAI: "c8a24fee-ec00-4f38-86c0-9f6daebc4225",
    rETH: "d4b3c522-6127-4b89-bedf-83641cdcd2eb",
    osETH: "4d01599c-69ae-41a3-bae1-5fab896f04c8",

    auraB_rETH_STABLE_vault: "a4b5b995-99e7-4b8f-916d-8940b5627d70",

    sUSDe: "66985a81-9c51-46ca-9977-42b4fe7bc6df",

    stkcvxcrvFRAX: "bd072651-d99c-4154-aeae-51f12109c054",
    stkcvxcrvUSDETHCRV: "654ac683-141b-42d3-b28d-b2f77eedd595",
    stkcvxcrvUSDFRAX: "411af006-56b0-480a-9586-1071bccbd178",
    stkcvxcrvUSDTWBTCWETH: "3be97c90-d4a8-42b3-a0d0-2906ae4e9d27",
    stkcvxcrvUSDUSDC: "755fcec6-f4fd-4150-9184-60f099206694",
    stkcvxcrvUSDUSDT: "a3ffd3fe-b21c-44eb-94d5-22c80057a600",

    PT_sUSDe_26DEC2024: "992d00f3-d43f-44fe-8b62-987e8610c9a8",
    PT_ezETH_26DEC2024: "76953dd9-3132-49ad-ae88-b551c5b5c774",
    PT_eETH_26DEC2024: "7bafc0e5-3789-4920-944f-d734d3ef0cef",
    PT_LBTC_27MAR2025: "05216992-5538-4c93-aecc-49398388464f",
    PT_eBTC_26DEC2024: "e093fa52-1f6a-4256-9e3e-a58490468c0e",

    PT_cornLBTC_26DEC2024: "f7826423-8043-4799-b12a-83a68adc992d",
    PT_corn_eBTC_27MAR2025: "eb7de368-b460-4638-bde1-50a129109b7b",

    PT_corn_pumpBTC_26DEC2024: "a23e2b97-ff92-4ebf-8c7d-171cad8431ad",

    PT_sUSDe_27MAR2025: "6b28892f-0909-418d-b4bb-3106fff72449",

    scrvUSD: "5fd328af-4203-471b-bd16-1705c726d926",
  },
  Optimism: { rETH: "d4b3c522-6127-4b89-bedf-83641cdcd2eb" },
  Arbitrum: {
    rETH: "d4b3c522-6127-4b89-bedf-83641cdcd2eb",
    cbETH: "0f45d730-b279-4629-8e11-ccb5cc3038b4",

    sfrxETH: "77020688-e1f9-443c-9388-e51ace15cc32",
  },
  Base: {},
};

// const CONVEX_TO_LAMA: Record<
//   NetworkType,
//   Record<ConvexStakedPhantomToken, string>
// > = {
//   Mainnet: {
//     stkcvx3Crv: "7394f1bc-840a-4ff0-9e87-5e0ef932943a",
//     stkcvxFRAX3CRV: "844a8a29-4653-42e6-b675-a6b43fac3678", // !!
//     stkcvxgusd3CRV: "dc81639c-9391-4e56-96b9-76cfbcda61d4",
//     stkcvxLUSD3CRV: "b61ef013-6391-4cdd-b057-b344ab852088", // !!
//     stkcvxcrvPlain3andSUSD: "45f74ed5-5832-4d6d-8f2c-2929b6ac5e9c", // !!
//     stkcvxsteCRV: "5ce23e7e-3800-4c9c-ad30-6db3db0515a1", // !!
//     stkcvxcrvFRAX: "bd072651-d99c-4154-aeae-51f12109c054",

//     stkcvxOHMFRAXBP: "42de7839-da37-4a99-8992-d6352177c4db", // !!
//     stkcvxMIM_3LP3CRV: "8a20c472-142c-4442-b724-40f2183c073e",

//     stkcvxcrvCRVETH: "disabled",
//     stkcvxcrvCVXETH: "25d9dc49-3182-493a-bda4-0db53b25f457",
//     stkcvxcrvUSDTWBTCWETH: "3be97c90-d4a8-42b3-a0d0-2906ae4e9d27",
//     stkcvxLDOETH: "69361f05-1a95-4323-9b6f-44338ad22e98",

//     stkcvxcrvUSDUSDC: "755fcec6-f4fd-4150-9184-60f099206694",
//     stkcvxcrvUSDUSDT: "a3ffd3fe-b21c-44eb-94d5-22c80057a600",
//     stkcvxcrvUSDFRAX: "411af006-56b0-480a-9586-1071bccbd178",
//     stkcvxcrvUSDETHCRV: "654ac683-141b-42d3-b28d-b2f77eedd595",
//   },
//   Optimism: {} as any,
//   Arbitrum: {} as any,
// };
