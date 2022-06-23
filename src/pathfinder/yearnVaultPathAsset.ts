import {BigNumber} from "ethers";
import {
    SupportedToken,
    supportedTokens,
    TokenDataI,
    TokenType
} from "../core/token";
import {ActionData, Path, PathAsset} from "./path";

export class YearnVaultPathAsset extends PathAsset {
    async getBestPath(currentToken: SupportedToken, p: Path): Promise<Path> {
        const currentBalance: BigNumber = p.balances[currentToken].sub(1);
        type YearnVaultDataI = Extract<TokenDataI, { type: TokenType.YEARN_VAULT }>;
        const currentTokenData = supportedTokens[currentToken] as YearnVaultDataI;

        // Yearn Vault only has one lp action
        const outputToken: SupportedToken = currentTokenData.lpActions[0].tokenOut as SupportedToken;
        const yearnActionData: ActionData = await this.getYearnActionData(currentTokenData.lpActions[0], currentBalance, p);

        p.balances[outputToken].add(yearnActionData.amountOut);
        p.balances[currentToken] = BigNumber.from(1);
        p.totalGasLimit.add(yearnActionData.gasLimit);
        p.calls.push(yearnActionData.callData);

        return await p.getBestPath();
    }
}
