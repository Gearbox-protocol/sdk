import { contractParams, LidoParams } from "../contracts/contracts";
import { NetworkType } from "../core/chains";
import { SECONDS_PER_YEAR, WAD } from "../core/constants";
import { tokenDataByNetwork } from "../tokens/token";
import {
  ILidoOracle,
  ILidoOracle__factory,
  IstETH,
  IstETH__factory,
} from "../types";
import { MCall } from "../utils/multicall";

type ILidoOracleInterface = ILidoOracle["interface"];

type IstETHInterface = IstETH["interface"];

export type LidoDataCallResponse = [
  Awaited<ReturnType<ILidoOracle["getLastCompletedReportDelta"]>>,
  Awaited<ReturnType<IstETH["getFee"]>>,
];

export interface GetLidoAPYProps {
  generated: GetLidoAPYCallsReturns;
  response: LidoDataCallResponse;
}

export function getLidoAPY({ response }: GetLidoAPYProps) {
  const [
    { postTotalPooledEther, preTotalPooledEther, timeElapsed },
    fee = Math.floor(LIDO_FEE_DECIMALS / 10),
  ] = response;

  const lidoAPRRay = postTotalPooledEther
    .sub(preTotalPooledEther)
    .mul(SECONDS_PER_YEAR)
    .mul(WAD)
    .div(preTotalPooledEther.mul(timeElapsed));

  return [lidoAPRRay, fee] as const;
}

export const LIDO_FEE_DECIMALS = 10000;

export interface GetLidoAPYCallsProps {
  networkType: NetworkType;
}

type GetLidoAPYCallsReturns = ReturnType<typeof getLidoAPYCalls>;

export function getLidoAPYCalls({ networkType }: GetLidoAPYCallsProps) {
  const poolInfo = getLidoInfo(networkType);
  const calls = getLidoDataCalls({ ...poolInfo, network: networkType });

  return { poolInfo, calls };
}

const lidoOracles = (contractParams.LIDO_STETH_GATEWAY as LidoParams).oracle;

const lidoStEth: Record<NetworkType, string> = {
  Mainnet: tokenDataByNetwork.Mainnet.STETH,
  Goerli: tokenDataByNetwork.Goerli.STETH,
};

type GetPoolInfoReturns = ReturnType<typeof getLidoInfo>;

function getLidoInfo(networkType: NetworkType) {
  if (!lidoOracles[networkType]) {
    throw new Error(
      `No Lido APR oracle found on current network: ${networkType}`,
    );
  }
  if (!lidoStEth[networkType]) {
    throw new Error(`No Lido stETH found on current network: ${networkType}`);
  }

  const lidoOracleAddress = lidoOracles[networkType];
  const stETHAddress = lidoStEth[networkType];

  return { lidoOracleAddress, stETHAddress };
}

interface GetLidoDataCallsProps extends GetPoolInfoReturns {
  network: NetworkType;
}

function getLidoDataCalls({
  lidoOracleAddress,
  stETHAddress,
  network,
}: GetLidoDataCallsProps) {
  const calls: [MCall<ILidoOracleInterface>, ...Array<MCall<IstETHInterface>>] =
    [
      {
        address: lidoOracleAddress,
        interface: ILidoOracle__factory.createInterface(),
        method: "getLastCompletedReportDelta()",
      },
    ];

  if (network === "Mainnet")
    calls.push({
      address: stETHAddress,
      interface: IstETH__factory.createInterface(),
      method: "getFee()",
    });

  return calls;
}
