import {BigNumber} from "ethers";
import {
    SupportedToken,
    supportedTokens,
    TokenDataI,
    TokenType
} from "../core/token";
import {contractsByNetwork} from "../core/contracts";
import {TradeType} from "../core/tradeTypes";
import {Path, PathAsset} from "./path";

export class ConvexLPTokenPathAsset extends PathAsset {
    async getBestPath(currentToken: SupportedToken, p: Path): Promise<Path> {
        throw Error("Implementation not finished!");
        const currentBalance: BigNumber = p.balances[currentToken].sub(1);
        type ConvexLPTokenDataI = Extract<TokenDataI, { type: TokenType.CONVEX_LP_TOKEN }>;
        const currentTokenData: ConvexLPTokenDataI = supportedTokens[currentToken] as ConvexLPTokenDataI;

        for (let lpAction of currentTokenData.lpActions) {
            if (lpAction.type == TradeType.ConvexWithdrawLP) {
                const actionContractAddress: string = contractsByNetwork[p.networkType][lpAction.contract];
                const adapterAddress: string = p.creditManager.adapters[actionContractAddress];
                const outputToken: SupportedToken = lpAction.tokenOut as SupportedToken;
                console.log(currentBalance);
                console.log(adapterAddress);
                console.log(outputToken);
                // TODO(byli) wait convex adapter types
            }
        }

        return await p.getBestPath();
    }
}