import {BigNumber} from "ethers";
import {
    ConnectorTokens,
    SupportedToken,
    supportedTokens,
    tokenDataByNetwork,
    TokenDataI,
    TokenType
} from "../core/token";
import {ExchangeData, Path, PathAsset} from "./path";
import {ConnectorPathAsset} from "./connectorPathAsset";

export class NormalTokenPathAsset extends PathAsset {
    async getBestPath(currentToken: SupportedToken, p: Path): Promise<Path> {
        type ConnectorDataI = Extract<TokenDataI, { type: TokenType.NORMAL_TOKEN }>;

        const currentBalance: BigNumber = p.balances[currentToken].sub(1);
        const currentTokenAddress: string = tokenDataByNetwork[p.networkType][currentToken];
        const currentTokenData: TokenDataI = supportedTokens[currentToken] as ConnectorDataI;

        let exchangeData: ExchangeData = {
            callData: {
                targetContract: "",
                callData: ""
            },
            amountOut: BigNumber.from(0),
            gasLimit: BigNumber.from(0),
        };
        let nextToken: SupportedToken = p.pool;
        let maxPoolAmountOut: BigNumber = BigNumber.from(0);

        // enumerate connector token and find a best one
        for (let connToken of ConnectorTokens) {
            const connTokenAddress: string = tokenDataByNetwork[p.networkType][connToken];

            for (let swapAction of currentTokenData.swapActions!) {
               const tmpExchangeData: ExchangeData = await this.getExchangeData(swapAction, currentTokenAddress, currentToken, currentBalance, connTokenAddress, connToken, p);

                // compute connToken to pool token
                if (connToken != p.pool) {
                    const connectorPathAsset = new ConnectorPathAsset();
                    const poolAmountOut: BigNumber = await connectorPathAsset.getMaxPoolAmount(connToken, exchangeData.amountOut, p);
                    if (poolAmountOut > maxPoolAmountOut) {
                        maxPoolAmountOut = poolAmountOut;

                        exchangeData = tmpExchangeData;
                        nextToken = connToken;
                    }
                } else {
                   if (exchangeData.amountOut > maxPoolAmountOut) {
                       maxPoolAmountOut = exchangeData.amountOut;

                       exchangeData = tmpExchangeData;
                       nextToken = p.pool;
                   }
                }
            }
        }

        if (exchangeData.callData.targetContract != "") {
            p.balances[nextToken].add(exchangeData.amountOut);
            p.balances[currentToken] = BigNumber.from(1);
            p.totalGasLimit.add(exchangeData.gasLimit);
            p.calls.push(exchangeData.callData);
        }
        return await p.getBestPath();
    }
}