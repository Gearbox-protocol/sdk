import { providers } from "ethers";

import { multicall, MCall } from "../utils/multicall";
import { contractParams, LidoParams } from "../contracts/contracts";
import { tokenDataByNetwork } from "../tokens/token";

import { WAD, SECONDS_PER_YEAR, NetworkType } from "../core/constants";

import {
  ILidoOracle__factory,
  ILidoOracle,
  IstETH__factory,
  IstETH
} from "../types";

type ILidoOracleInterface = ILidoOracle["interface"];

type IstETHInterface = IstETH["interface"];

const lidoOracles = (contractParams.LIDO_STETH_GATEWAY as LidoParams).oracle;

const lidoStEth: Record<NetworkType, string> = {
  Mainnet: tokenDataByNetwork.Mainnet.STETH,
  Kovan: tokenDataByNetwork.Kovan.STETH,
  Goerli: tokenDataByNetwork.Goerli.STETH
};

export async function getLidoApy(
  provider: providers.Provider,
  networkType: NetworkType
) {
  if (!lidoOracles[networkType]) {
    throw new Error(
      `No Lido APR oracle found on current network: ${networkType}`
    );
  }
  if (!lidoStEth[networkType]) {
    throw new Error(`No Lido stETH found on current network: ${networkType}`);
  }

  const [{ postTotalPooledEther, preTotalPooledEther, timeElapsed }, fee] =
    await geLidoData(
      lidoOracles[networkType],
      lidoStEth[networkType],
      provider,
      networkType
    );

  const lidoAPRRay = postTotalPooledEther
    .sub(preTotalPooledEther)
    .mul(SECONDS_PER_YEAR)
    .mul(WAD)
    .div(preTotalPooledEther.mul(timeElapsed));

  return [lidoAPRRay, fee] as const;
}

export const LIDO_FEE_DECIMALS = 10000;

async function geLidoData(
  lidoOracleAddress: string,
  stETHAddress: string,
  provider: providers.Provider,
  network: NetworkType
) {
  const calls: [MCall<ILidoOracleInterface>, ...Array<MCall<IstETHInterface>>] =
    [
      {
        address: lidoOracleAddress,
        interface: ILidoOracle__factory.createInterface(),
        method: "getLastCompletedReportDelta()"
      }
    ];

  if (network === "Mainnet")
    calls.push({
      address: stETHAddress,
      interface: IstETH__factory.createInterface(),
      method: "getFee()"
    });

  const [stats, fee = Math.floor(LIDO_FEE_DECIMALS / 10)] = await multicall<
    [
      Awaited<ReturnType<ILidoOracle["getLastCompletedReportDelta"]>>,
      Awaited<ReturnType<IstETH["getFee"]>>
    ]
  >(calls, provider);

  return [stats, fee] as const;
}
