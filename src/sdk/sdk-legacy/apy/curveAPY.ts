import axios from "axios";
import type { Address } from "viem";

import type { NetworkType } from "../../chain";
import { PERCENTAGE_FACTOR } from "../../constants";
import type { SupportedToken } from "../../sdk-gov-legacy";
import { TypedObjectUtils } from "../../utils";

interface VolumesResponse {
  data: {
    pools: [
      {
        address: Address;
        includedApyPcentFromLsts: number;
        latestDailyApyPcent: number;
        latestWeeklyApyPcent: number;
        type: string;
        virtualPrice: number;
        volumeUSD: number;
      },
    ];
  };
}

interface CurvePoolData {
  address: Address;
  amplificationCoefficient: string;
  assetType?: string;
  assetTypeName: string;
  coins: Array<{
    address: Address;
    decimals: string;
    isBasePoolLpToken: boolean;
    poolBalance: string;
    symbol: string;
    usdPrice: number;
  }>;
  coinsAddresses: Array<Address>;
  decimals: Array<string>;
  gaugeAddress: Address;
  gaugeCrvApy: Array<number>;
  gaugeRewards: Array<{
    apy: number;
    decimals: string;
    gaugeAddress: Address;
    name: string;
    symbol: string;
    tokenAddress: Address;
    tokenPrice: number;
  }>;
  id: string;
  implementation: string;
  implementationAddress: Address;
  isMetaPool: boolean;
  lpTokenAddress: Address;
  name: string;
  poolUrls: {
    deposit: Array<string>;
    swap: Array<string>;
    withdraw: Array<string>;
  };
  priceOracle: number;
  symbol: string;
  totalSupply: string;
  usdTotal: number;
  usdTotalExcludingBasePool: number;
  virtualPrice: string;
}
interface CurvePoolDataResponse {
  data: {
    poolData: Array<CurvePoolData>;
    tvlAll: number;
    tvl: number;
  };
}

type PoolRecord = Record<string, CurvePoolData>;
type VolumeRecord = Record<string, VolumesResponse["data"]["pools"][number]>;

const GEAR_POOL = "0x5Be6C45e2d074fAa20700C49aDA3E88a1cc0025d".toLowerCase();

const CURVE_CHAINS: Record<NetworkType, string> = {
  Arbitrum: "arbitrum",
  Mainnet: "ethereum",
  Optimism: "optimism",
  Base: "base",
};

// const CRYPTO = "https://api.curve.fi/api/getPools/${CURVE_CHAINS[n]}/crypto";
// const FACTORY = "https://api.curve.fi/api/getPools/${CURVE_CHAINS[n]}/factory";
// const CURVE_APY_URL = "https://www.convexfinance.com/api/curve-apys";
const getVolumesURL = (n: NetworkType) =>
  `https://api.curve.fi/api/getVolumes/${CURVE_CHAINS[n]}`;
const getMainURL = (n: NetworkType) =>
  `https://api.curve.fi/api/getPools/${CURVE_CHAINS[n]}/main`;
const getFactoryCryptoURL = (n: NetworkType) =>
  `https://api.curve.fi/api/getPools/${CURVE_CHAINS[n]}/factory-crypto`;
const getCryptoURL = (n: NetworkType) =>
  `https://api.curve.fi/api/getPools/${CURVE_CHAINS[n]}/crypto`;
const getFactoryTriCryptoURL = (n: NetworkType) =>
  `https://api.curve.fi/api/getPools/${CURVE_CHAINS[n]}/factory-tricrypto`;
const getFactoryCrvUsdURL = (n: NetworkType) =>
  `https://api.curve.fi/api/getPools/${CURVE_CHAINS[n]}/factory-crvusd`;
const getFactoryStableNgURL = (n: NetworkType) =>
  `https://api.curve.fi/api/getPools/${CURVE_CHAINS[n]}/factory-stable-ng`;

interface CurveAPY {
  base: number;
  crv: number;
  gauge: Array<[Address, number]>;
}

export async function getCurveAPY(
  network: NetworkType,
  currentTokens: Record<SupportedToken, Address>,
) {
  const { mainnetVolumes, mainnetFactoryPools, volumes, pools } =
    await getCurvePools(network);

  const volumeByAddress = volumes.data.data.pools.reduce<VolumeRecord>(
    (acc, v) => {
      acc[v.address.toLowerCase()] = v;
      return acc;
    },
    {},
  );

  const poolDataByAddress = pools.reduce<PoolRecord>((acc, poolCategory) => {
    const { poolData = [] } = poolCategory?.data?.data || {};

    poolData.forEach(p => {
      acc[p.lpTokenAddress.toLowerCase()] = p;
    });

    return acc;
  }, {});

  const curveAPY = TypedObjectUtils.entries(currentTokens).reduce<
    Record<Address, CurveAPY>
  >((acc, [, address]) => {
    if (!poolDataByAddress[address]) return acc;

    const pool = poolDataByAddress[address];
    const volume = volumeByAddress[(pool?.address || "").toLowerCase()];

    const baseAPY = volume?.latestDailyApyPcent || 0;
    const maxCrv = Math.max(...(pool?.gaugeCrvApy || []), 0);

    const extraRewards = (pool?.gaugeRewards || []).map(
      ({ apy = 0, tokenAddress }): [Address, number] => [
        tokenAddress.toLowerCase() as Address,
        curveAPYToBn(apy),
      ],
    );

    acc[address] = {
      base: curveAPYToBn(baseAPY),
      crv: curveAPYToBn(maxCrv),
      gauge: extraRewards,
    };

    return acc;
  }, {});

  const poolFactoryByAddress = (
    mainnetFactoryPools?.data?.data?.poolData || []
  ).reduce<PoolRecord>((acc, p) => {
    acc[p.lpTokenAddress.toLowerCase()] = p;

    return acc;
  }, {});

  const mainnetVolumeByAddress =
    mainnetVolumes.data.data.pools.reduce<VolumeRecord>((acc, v) => {
      acc[v.address.toLowerCase()] = v;
      return acc;
    }, {});

  const gearPool = poolFactoryByAddress[GEAR_POOL];
  const gearVolume =
    mainnetVolumeByAddress[(gearPool?.address || "").toLowerCase()];

  const gearAPY: CurveAPY = {
    base: curveAPYToBn(gearVolume?.latestDailyApyPcent || 0),
    crv: curveAPYToBn(Math.max(...(gearPool?.gaugeCrvApy || []), 0)),
    gauge: (gearPool?.gaugeRewards || []).map(
      ({ apy = 0, tokenAddress }): [Address, number] => [
        tokenAddress.toLowerCase() as Address,
        curveAPYToBn(apy),
      ],
    ),
  };

  return { curveAPY, gearAPY };
}

async function getCurvePools(network: NetworkType) {
  switch (network) {
    case "Mainnet": {
      const [volumes, mainnetFactoryPools, ...pools] = await Promise.all([
        axios.get<VolumesResponse>(getVolumesURL(network)),
        axios.get<CurvePoolDataResponse>(getFactoryCryptoURL(network)),

        axios.get<CurvePoolDataResponse>(getMainURL(network)),
        axios.get<CurvePoolDataResponse>(getCryptoURL(network)),
        axios.get<CurvePoolDataResponse>(getFactoryTriCryptoURL(network)),
        axios.get<CurvePoolDataResponse>(getFactoryCrvUsdURL(network)),
      ]);
      return {
        mainnetVolumes: volumes,
        mainnetFactoryPools,

        volumes,
        pools: [mainnetFactoryPools, ...pools],
      };
    }
    case "Arbitrum": {
      const [mainnetVolumes, mainnetFactoryPools, volumes, ...pools] =
        await Promise.all([
          axios.get<VolumesResponse>(getVolumesURL("Mainnet")),
          axios.get<CurvePoolDataResponse>(getFactoryCryptoURL("Mainnet")),

          axios.get<VolumesResponse>(getVolumesURL(network)),
          axios.get<CurvePoolDataResponse>(getMainURL(network)),
          axios.get<CurvePoolDataResponse>(getFactoryStableNgURL(network)),
        ]);

      return {
        mainnetVolumes,
        mainnetFactoryPools,

        volumes,
        pools,
      };
    }

    case "Optimism": {
      const [mainnetVolumes, mainnetFactoryPools, volumes, ...pools] =
        await Promise.all([
          axios.get<VolumesResponse>(getVolumesURL("Mainnet")),
          axios.get<CurvePoolDataResponse>(getFactoryCryptoURL("Mainnet")),

          axios.get<VolumesResponse>(getVolumesURL(network)),
          axios.get<CurvePoolDataResponse>(getMainURL(network)),
          axios.get<CurvePoolDataResponse>(getFactoryStableNgURL(network)),
        ]);

      return {
        mainnetVolumes,
        mainnetFactoryPools,

        volumes,
        pools,
      };
    }
    default:
      throw new Error("Unknown network");
  }
}

function curveAPYToBn(baseApy: number) {
  return Math.round(baseApy * Number(PERCENTAGE_FACTOR));
}

export async function getCurveGearPool(): Promise<CurvePoolData | undefined> {
  const resp = await axios.get<CurvePoolDataResponse>(
    getFactoryCryptoURL("Mainnet"),
  );
  const { poolData = [] } = resp?.data?.data || {};

  const poolDataByAddress = poolData.reduce<PoolRecord>((acc, p) => {
    acc[p.lpTokenAddress.toLowerCase()] = p;
    return acc;
  }, {});

  const gearPool = poolDataByAddress[GEAR_POOL];
  return gearPool;
}
