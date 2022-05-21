import {BigNumber} from "ethers";
import {
    SupportedToken,
    supportedTokens,
    tokenDataByNetwork,
    TokenDataI,
    TokenType
} from "../core/token";
import {Path, PathAsset, ExchangeData} from "./path";

export class ConnectorPathAsset extends PathAsset {
    async getBestPath(currentToken: SupportedToken, p: Path): Promise<Path> {
        type ConnectorDataI = Extract<TokenDataI, { type: TokenType.CONNECTOR }>;

        const currentBalance: BigNumber = p.balances[currentToken].sub(1);
        const currentTokenAddress: string = tokenDataByNetwork[p.networkType][currentToken];
        const currentTokenData: TokenDataI = supportedTokens[currentToken] as ConnectorDataI;
        // connector token will only swap to pool
        const nextToken: SupportedToken = p.pool;
        const nextTokenAddress: string = tokenDataByNetwork[p.networkType][nextToken];

        let exchangeData: ExchangeData = {
            callData: {
                targetContract: "",
                callData: ""
            },
            amountOut: BigNumber.from(0),
            gasLimit: BigNumber.from(0),
        };
        for (let swapAction of currentTokenData.swapActions) {
            const tmpExchangeData: ExchangeData = await this.getExchangeData(swapAction, currentTokenAddress, currentToken, currentBalance, nextTokenAddress, nextToken, p);

            if (tmpExchangeData.amountOut > exchangeData.amountOut) {
                exchangeData = tmpExchangeData;
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

    // Only compute the maximum amount of pool token output, will not modify path.
    async getMaxPoolAmount(currentToken: SupportedToken, currentBalance: BigNumber, p: Path): Promise<BigNumber> {
        type ConnectorDataI = Extract<TokenDataI, { type: TokenType.CONNECTOR }>;

        const currentTokenAddress: string = tokenDataByNetwork[p.networkType][currentToken];
        const currentTokenData: TokenDataI = supportedTokens[currentToken] as ConnectorDataI;
        // connector token will only swap to pool
        const nextToken: SupportedToken = p.pool;
        const nextTokenAddress: string = tokenDataByNetwork[p.networkType][nextToken];

        let maxAmountOut: BigNumber = BigNumber.from(0);
        for (let swapAction of currentTokenData.swapActions) {
            const exchangeData: ExchangeData = await this.getExchangeData(swapAction, currentTokenAddress, currentToken, currentBalance, nextTokenAddress, nextToken, p);

            if (exchangeData.amountOut > maxAmountOut) {
                maxAmountOut = exchangeData.amountOut;
            }
        }

        return maxAmountOut;
    }
}