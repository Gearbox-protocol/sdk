import { providers } from "ethers";
import { detectNetwork } from "../utils/network";
import { NetworkType, RAY, SECONDS_PER_YEAR } from "../core/constants";
import { ILidoOracle__factory } from "../types";

const lidoOracleAddress: Record<NetworkType, string> = {
    Mainnet: "0x442af784A788A5bd6F42A01Ebe9F287a871243fb",
    Kovan: ""
}

export async function getLidoApyRay(provider: providers.Provider) {

    const networkType = await detectNetwork(provider);

    if (!lidoOracleAddress[networkType]) {
        throw(`No Lido APR oracle found on current network: ${networkType}`)
    }

    const lidoOracle = ILidoOracle__factory.connect(
        lidoOracleAddress[networkType],
        provider
    );

    const pooledEtherData = await lidoOracle.getLastCompletedReportDelta();

    const postTotalPooledEther = pooledEtherData.postTotalPooledEther;
    const preTotalPooledEther = pooledEtherData.preTotalPooledEther;
    const timeElapsed = pooledEtherData.timeElapsed;

    const lidoAPRRay = (postTotalPooledEther.sub(preTotalPooledEther))
                        .mul(SECONDS_PER_YEAR)
                            .mul(RAY)
                                .div(preTotalPooledEther.mul(timeElapsed))

    return lidoAPRRay;

}
