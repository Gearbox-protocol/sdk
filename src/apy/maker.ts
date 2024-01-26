import {
  contractParams,
  ERC4626Params,
  ERC4626VaultContract,
  NetworkType,
  toBigInt,
  WAD_DECIMALS_POW,
} from "@gearbox-protocol/sdk-gov";
import { BigNumberish } from "ethers";
import { Interface } from "ethers/lib/utils";

import { toBN, toSignificant } from "../utils/formatter";

export const MAKER_VAULT_ABI = [
  {
    inputs: [],
    name: "dsr",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const MAKER_VAULT_INTERFACE = new Interface(MAKER_VAULT_ABI);

export type MakerPoolContract = Extract<
  ERC4626VaultContract,
  "MAKER_DSR_VAULT"
>;

const MAKER_BY_NETWORK: Record<
  NetworkType,
  Record<MakerPoolContract, string>
> = {
  Mainnet: {
    MAKER_DSR_VAULT: "0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7",
  },
  Arbitrum: {
    MAKER_DSR_VAULT: "",
  },
  Optimism: {
    MAKER_DSR_VAULT: "",
  },
};

interface PoolInfo {
  pool: ERC4626Params;
  poolAddress: string;
}

export interface GetMakerAPYBulkCallsProps {
  pools: Array<MakerPoolContract>;
  networkType: NetworkType;
}

export function getMakerAPYBulkCalls({
  pools,
  networkType,
}: GetMakerAPYBulkCallsProps) {
  const poolsInfo = pools.map((pool): PoolInfo => {
    const poolParams = contractParams[pool] as ERC4626Params;
    const basePoolAddress = MAKER_BY_NETWORK[networkType][pool];

    return {
      pool: poolParams,
      poolAddress: basePoolAddress,
    };
  });
  const calls = poolsInfo.map(info => ({
    address: info.poolAddress,
    interface: MAKER_VAULT_INTERFACE,
    method: "dsr()",
  }));

  return { poolsInfo, calls };
}

type GetMakerAPYBulkCallsReturns = ReturnType<typeof getMakerAPYBulkCalls>;

export interface GetMakerAPYBulkProps {
  generated: GetMakerAPYBulkCallsReturns;
  response: Array<BigNumberish>;
}

export function getMakerAPYBulk(props: GetMakerAPYBulkProps) {
  const { poolsInfo } = props.generated;

  const apyList = props.response.map((baseApy, i) => {
    const apy = calculateMakerAPY({
      baseApy: toBigInt(baseApy),
      poolInfo: poolsInfo[i],
    });

    return apy;
  });

  return apyList;
}

const POW = 3600 * 24 * 365;

interface CalculateMakerAPYProps {
  baseApy: bigint;
  poolInfo: PoolInfo;
}

function calculateMakerAPY(props: CalculateMakerAPYProps) {
  const rateFloat = Number(toSignificant(props.baseApy, 27, 27));
  const rate = Math.max(0, rateFloat ** POW - 1);

  return toBN(rate.toString(), WAD_DECIMALS_POW);
}
