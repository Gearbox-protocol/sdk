import {BigNumber} from "ethers";
import {MultiCall} from "../core/multicall";
import {
    SupportedToken,
    supportedTokens,
    TokenDataI,
    TokenType
} from "../core/token";
import {YearnAdapter__factory} from "../types";
import {contractsByNetwork} from "../core/contracts";
import {Path, PathAsset} from "./path";

export class YearnVaultPathAsset extends PathAsset {
    async getBestPath(currentToken: SupportedToken, p: Path): Promise<Path> {
        const currentBalance: BigNumber = p.balances[currentToken].sub(1);
        type YearnVaultDataI = Extract<TokenDataI, { type: TokenType.YEARN_VAULT }>;
        const currentTokenData = supportedTokens[currentToken] as YearnVaultDataI;

        // Yearn Vault only has one lp action
        const allowedContract: string = contractsByNetwork[p.networkType][currentTokenData.lpActions[0].contract];
        const outputToken: SupportedToken = currentTokenData.lpActions[0].tokenOut as SupportedToken;
        // For Yearn Vault the token address is the contract to withdraw
        const adapterAddress = p.creditManager.adapters[allowedContract];
        const call: MultiCall = {
            targetContract: adapterAddress,
            callData: YearnAdapter__factory.createInterface().encodeFunctionData('withdraw', [currentBalance, p.creditAccount.addr])
        };

        const IYVault = YearnAdapter__factory.connect(allowedContract, p.provider);
        const price: BigNumber = await IYVault.pricePerShare(); // get price
        const gasLimit: BigNumber = await IYVault.estimateGas["withdraw(uint256,address)"](currentBalance, p.creditAccount.addr);

        p.balances[outputToken].add(price.mul(currentBalance));
        p.balances[currentToken] = BigNumber.from(1);
        p.totalGasLimit.add(gasLimit);
        p.calls.push(call);

        return await p.getBestPath();
    }
}
