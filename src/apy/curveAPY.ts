import {
  curveTokens,
  NetworkType,
  PartialRecord,
  PERCENTAGE_FACTOR,
  tokenDataByNetwork,
  TypedObjectUtils,
} from "@gearbox-protocol/sdk-gov";
import { CurveLPToken } from "@gearbox-protocol/sdk-gov/lib/tokens/curveLP";
import { GearboxToken } from "@gearbox-protocol/sdk-gov/lib/tokens/gear";
import axios from "axios";

interface VolumesResponse {
  data: {
    pools: [
      {
        address: string;
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
  address: string;
  amplificationCoefficient: string;
  assetType?: string;
  assetTypeName: string;
  coins: Array<{
    address: string;
    decimals: string;
    isBasePoolLpToken: boolean;
    poolBalance: string;
    symbol: string;
    usdPrice: number;
  }>;
  coinsAddresses: Array<string>;
  decimals: Array<string>;
  gaugeAddress: string;
  gaugeCrvApy: Array<number>;
  gaugeRewards: Array<{
    apy: number;
    decimals: string;
    gaugeAddress: string;
    name: string;
    symbol: string;
    tokenAddress: string;
    tokenPrice: number;
  }>;
  id: string;
  implementation: string;
  implementationAddress: string;
  isMetaPool: boolean;
  lpTokenAddress: string;
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

type CurveAPYTokens = CurveLPToken | GearboxToken;

const GEAR_POOL = "0x5Be6C45e2d074fAa20700C49aDA3E88a1cc0025d".toLowerCase();

const CURVE_CHAINS: Record<NetworkType, string> = {
  Arbitrum: "arbitrum",
  Mainnet: "ethereum",
  Optimism: "optimism",
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

interface CurveAPY {
  base: number;
  crv: number;
  gauge: Array<[string, number]>;
}
export type CurveAPYResult = PartialRecord<CurveAPYTokens, CurveAPY>;

export async function getCurveAPY(network: NetworkType) {
  try {
    const currentTokens = tokenDataByNetwork[network];

    const [volumes, ...pools] = await Promise.all([
      axios.get<VolumesResponse>(getVolumesURL(network)),
      axios.get<CurvePoolDataResponse>(getMainURL(network)),
      axios.get<CurvePoolDataResponse>(getFactoryCryptoURL(network)),
      axios.get<CurvePoolDataResponse>(getCryptoURL(network)),
      axios.get<CurvePoolDataResponse>(getFactoryTriCryptoURL(network)),
      axios.get<CurvePoolDataResponse>(getFactoryCrvUsdURL(network)),
    ]);

    const volumeByAddress = Object.fromEntries(
      volumes.data.data.pools.map(v => [v.address.toLowerCase(), v]),
    );

    const poolDataByAddress = Object.fromEntries(
      pools
        .map(poolCategory => {
          const { poolData = [] } = poolCategory?.data?.data || {};
          return poolData.map((p): [string, CurvePoolData] => [
            p.lpTokenAddress.toLowerCase(),
            p,
          ]);
        })
        .flat(1),
    );

    const curveAPY = TypedObjectUtils.entries(
      curveTokens,
    ).reduce<CurveAPYResult>((acc, [curveSymbol]) => {
      const address = (currentTokens?.[curveSymbol] || "").toLowerCase();

      const pool = poolDataByAddress[address];
      const volume = volumeByAddress[(pool?.address || "").toLowerCase()];

      const baseAPY = volume?.latestDailyApyPcent || 0;
      const maxCrv = Math.max(...(pool?.gaugeCrvApy || []));

      if (!pool) {
        console.log(curveSymbol);
      }

      const extraRewards = (pool?.gaugeRewards || []).map(
        ({ apy = 0, symbol }): [string, number] => [
          symbol.toLowerCase(),
          curveAPYToBn(apy),
        ],
      );

      acc[curveSymbol] = {
        base: curveAPYToBn(baseAPY),
        crv: curveAPYToBn(maxCrv),
        gauge: extraRewards,
      };

      return acc;
    }, {});

    const gearPool = poolDataByAddress[GEAR_POOL];
    const gearVolume = volumeByAddress[(gearPool?.address || "").toLowerCase()];

    const gearAPY: CurveAPY = {
      base: curveAPYToBn(gearVolume?.latestDailyApyPcent || 0),
      crv: curveAPYToBn(Math.max(...(gearPool?.gaugeCrvApy || []))),
      gauge: (gearPool?.gaugeRewards || []).map(
        ({ apy = 0, symbol }): [string, number] => [
          symbol.toLowerCase(),
          curveAPYToBn(apy),
        ],
      ),
    };

    return { curveAPY, gearAPY };
  } catch (e) {
    console.error(e);
    return undefined;
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

  const poolDataByAddress = Object.fromEntries(
    poolData.map(p => [p.lpTokenAddress.toLowerCase(), p]),
  );
  const gearPool = poolDataByAddress[GEAR_POOL];
  return gearPool;
}
