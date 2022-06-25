import {BigNumber} from "ethers";
import {IYVault__factory} from "../types";
import {Path, LPWithdrawPathFinder} from "./path";
import {YearnLPToken, yearnTokens} from "../tokens/yearn";
import {NormalToken} from "../tokens/normal";
import {CurveLPToken} from "../tokens/curveLP";
import {SupportedToken, tokenDataByNetwork} from "../tokens/token";
import {PartialRecord} from "../utils/types";
import {MCall, multicall} from "../utils/multicall";
import {IYVaultInterface} from "../types/contracts/integrations/yearn/IYVault";

interface WithdrawBalance {
    token: SupportedToken;
    balance: BigNumber;
}

export class YearnVaultPathFinder extends LPWithdrawPathFinder {
    _vault: YearnLPToken;
    token: NormalToken | CurveLPToken;

    constructor(vault: YearnLPToken) {
        super();
        this._vault = vault;

        const currentTokenData = yearnTokens[vault];

        // Yearn Vault only has one lp action
        this.token = currentTokenData.underlying;
    }

    async findWithdrawPaths(p: Path): Promise<Array<Path>> {
        let vaultBalances: PartialRecord<SupportedToken, WithdrawBalance> = {};

        for (let [yVault, tokenData] of Object.entries(yearnTokens)) {
            const currentBalance = p.popBalance(yVault as YearnLPToken);
            if (currentBalance.gt(1)) {
                vaultBalances[yVault as YearnLPToken] = {
                    token: tokenData.underlying,
                    balance: currentBalance
                };
            }
        }

        const vaultList = Object.keys(vaultBalances) as Array<SupportedToken>;

        // Yearn Vault only has one lp action
        const multicallData: Array<MCall<IYVaultInterface>> = vaultList
            .map(t => tokenDataByNetwork[p.networkType][t as SupportedToken])
            .map(addr => ({
                address: addr,
                interface: IYVault__factory.createInterface(),
                method: "pricePerShare()"
            }));

        const prices = await multicall<Array<BigNumber>>(multicallData, p.provider);

        for (let i = 0; i < vaultList.length; i++) {
            const vault = vaultList[i];
            const vb = vaultBalances[vault];

            p.balances[vb!.token] = (p.balances[vb!.token] || BigNumber.from(0)).add(
                BigNumber.from(vb?.balance || 0).mul(prices[i])
            );

            p.calls.push({
                targetContract:
                    p.creditManager.adapters[tokenDataByNetwork[p.networkType][vault]],
                callData:
                    IYVault__factory.createInterface().encodeFunctionData("withdraw()")
            });
        }

        return await p.withdrawTokens();
    }
}
