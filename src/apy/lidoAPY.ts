import { providers } from "ethers";

import { multicall, MCall } from "../utils/multicall";

import { WAD, SECONDS_PER_YEAR, NetworkType } from "../core/constants";

import {
  ILidoOracle__factory,
  ILidoOracle,
  IstETH__factory,
  IstETH
} from "../types";

type ILidoOracleInterface = ILidoOracle["interface"];

type IstETHInterface = IstETH["interface"];

const lidoOracleAddress: Record<NetworkType, string> = {
  Mainnet: "0x442af784A788A5bd6F42A01Ebe9F287a871243fb",
  Kovan: ""
};

const lidoStEthAddress: Record<NetworkType, string> = {
  Mainnet: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
  Kovan: ""
};

export async function getLidoApy(
  provider: providers.Provider,
  networkType: NetworkType
) {
  if (!lidoOracleAddress[networkType]) {
    throw `No Lido APR oracle found on current network: ${networkType}`;
  }
  if (!lidoStEthAddress[networkType]) {
    throw `No Lido stETH found on current network: ${networkType}`;
  }

  const [{ postTotalPooledEther, preTotalPooledEther, timeElapsed }, fee] =
    await geLidoData(
      lidoOracleAddress[networkType],
      lidoStEthAddress[networkType],
      provider
    );

  const lidoAPRRay = postTotalPooledEther
    .sub(preTotalPooledEther)
    .mul(SECONDS_PER_YEAR)
    .mul(WAD)
    .div(preTotalPooledEther.mul(timeElapsed));

  return [lidoAPRRay, fee] as const;
}

async function geLidoData(
  lidoOracleAddress: string,
  stETHAddress: string,
  provider: providers.Provider
) {
  const calls: [MCall<ILidoOracleInterface>, MCall<IstETHInterface>] = [
    {
      address: lidoOracleAddress,
      interface: ILidoOracle__factory.createInterface(),
      method: "getLastCompletedReportDelta()"
    },
    {
      address: stETHAddress,
      interface: IstETH__factory.createInterface(),
      method: "getFee()"
    }
  ];

  return multicall<
    [
      Awaited<ReturnType<ILidoOracle["getLastCompletedReportDelta"]>>,
      Awaited<ReturnType<IstETH["getFee"]>>
    ]
  >(calls, provider);
}

export const LIDO_FEE_DECIMALS = 10000;
