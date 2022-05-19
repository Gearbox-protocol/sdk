import {BigNumber} from "ethers";
import {MultiCall} from "../core/multicall";
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

        let callData: MultiCall = {
            targetContract: "",
            callData: ""
        };
        // Just a initial value
        let nextToken: SupportedToken = p.pool;
        let gasLimit: BigNumber = BigNumber.from(0);
        let amountOut: BigNumber = BigNumber.from(0);
        let maxPoolAmountOut: BigNumber = BigNumber.from(0);

        // enumerate connector token and find a best one
        for (let connToken of ConnectorTokens) {
            const connTokenAddress: string = tokenDataByNetwork[p.networkType][connToken];

            for (let swapAction of currentTokenData.swapActions!) {
               const exchangeData: ExchangeData = await this.getExchangeData(swapAction, currentTokenAddress, currentToken, currentBalance, connTokenAddress, connToken, p);

                // compute connToken to pool token
                if (connToken != p.pool) {
                    const connectorPathAsset = new ConnectorPathAsset();
                    const poolAmountOut: BigNumber = await connectorPathAsset.getMaxPoolAmount(connToken, exchangeData.amountOut, p);
                    if (poolAmountOut > maxPoolAmountOut) {
                        maxPoolAmountOut = poolAmountOut;

                        callData = exchangeData.callData;
                        amountOut = exchangeData.amountOut;
                        gasLimit = exchangeData.gasLimit;
                        nextToken = connToken;
                    }
                } else {
                   if (exchangeData.amountOut > maxPoolAmountOut) {
                       maxPoolAmountOut = exchangeData.amountOut;

                       callData = exchangeData.callData;
                       amountOut = exchangeData.amountOut;
                       gasLimit = exchangeData.gasLimit;
                       nextToken = p.pool;
                   }
                }
            }
        }

        if (callData.targetContract != "") {
            p.balances[nextToken].add(amountOut);
            p.balances[currentToken] = BigNumber.from(1);
            p.totalGasLimit.add(gasLimit);
            p.calls.push(callData);
        }
        return await p.getBestPath();
    }
}