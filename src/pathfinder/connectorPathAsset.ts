import {BigNumber} from "ethers";
import {
    SupportedToken,
    supportedTokens,
    tokenDataByNetwork,
    TokenDataI,
    TokenType
} from "../core/token";
import {Path, PathAsset, ActionData} from "./path";

export class ConnectorPathAsset extends PathAsset {
    async getBestPath(currentToken: SupportedToken, p: Path): Promise<Path> {
        type ConnectorDataI = Extract<TokenDataI, { type: TokenType.CONNECTOR }>;

        const currentBalance: BigNumber = p.balances[currentToken].sub(1);
        const currentTokenAddress: string = tokenDataByNetwork[p.networkType][currentToken];
        const currentTokenData: TokenDataI = supportedTokens[currentToken] as ConnectorDataI;
        // connector token will only swap to pool
        const nextToken: SupportedToken = p.pool;
        const nextTokenAddress: string = tokenDataByNetwork[p.networkType][nextToken];

        let actionData: ActionData = {
            callData: {
                targetContract: "",
                callData: ""
            },
            amountOut: BigNumber.from(0),
            gasLimit: BigNumber.from(0),
        };
        for (let swapAction of currentTokenData.swapActions) {
            const tmpActionData: ActionData = await this.getActionData(swapAction, currentTokenAddress, currentToken, currentBalance, nextTokenAddress, nextToken, p);

            if (tmpActionData.amountOut > actionData.amountOut) {
                actionData = tmpActionData;
            }
        }

        if (actionData.callData.targetContract != "") {
            p.balances[nextToken].add(actionData.amountOut);
            p.balances[currentToken] = BigNumber.from(1);
            p.totalGasLimit.add(actionData.gasLimit);
            p.calls.push(actionData.callData);
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
            const actionData: ActionData = await this.getActionData(swapAction, currentTokenAddress, currentToken, currentBalance, nextTokenAddress, nextToken, p);

            if (actionData.amountOut > maxAmountOut) {
                maxAmountOut = actionData.amountOut;
            }
        }

        return maxAmountOut;
    }
}