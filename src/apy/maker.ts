import {
  contractParams,
  contractsByNetwork,
  ERC4626Params,
  ERC4626VaultContract,
  NetworkType,
  toBigInt,
} from "@gearbox-protocol/sdk-gov";
import { BigNumber } from "ethers";
import { Interface } from "ethers/lib/utils";

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
    const contractsList = contractsByNetwork[networkType];

    const poolParams = contractParams[pool] as ERC4626Params;
    const basePoolAddress = contractsList[pool];

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
  response: Array<BigNumber>;
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

interface CalculateMakerAPYProps {
  baseApy: bigint;
  poolInfo: PoolInfo;
}

function calculateMakerAPY(props: CalculateMakerAPYProps) {
  console.log(props.baseApy);

  return 0n;
}
