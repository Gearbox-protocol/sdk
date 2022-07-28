import { BigNumber } from "ethers";

import { YearnLPToken, yearnTokens } from "../tokens/yearn";
import { NormalToken } from "../tokens/normal";
import { CurveLPToken } from "../tokens/curveLP";
import { SupportedToken, tokenDataByNetwork } from "../tokens/token";

import { PartialRecord } from "../utils/types";
import { MCall, multicall } from "../utils/multicall";
import { objectEntries } from "../utils/mappers";

import { IYVault__factory } from "../types";
import { IYVaultInterface } from "../types/contracts/integrations/yearn/IYVault";

import type { Path, LPWithdrawPathFinder } from "./path";

interface WithdrawBalance {
  token: SupportedToken;
  balance: BigNumber;
}

export class YearnVaultPathFinder implements LPWithdrawPathFinder {
  _vault: YearnLPToken;

  token: NormalToken | CurveLPToken;

  constructor(vault: YearnLPToken) {
    this._vault = vault;

    const currentTokenData = yearnTokens[vault];

    // Yearn Vault only has one lp action
    this.token = currentTokenData.underlying;
  }

  // eslint-disable-next-line class-methods-use-this
  async findWithdrawPaths(path: Path): Promise<Array<Path>> {
    // make path copy
    const p: Path = Object.assign(
      Object.create(Object.getPrototypeOf(path)),
      path
    );

    const vaultBalances = objectEntries(yearnTokens).reduce<
      PartialRecord<SupportedToken, WithdrawBalance>
    >((acc, [yVault, tokenData]) => {
      const typedVault = yVault;
      const currentBalance = p.popBalance(typedVault);
      if (currentBalance.gt(1)) {
        acc[typedVault] = {
          token: tokenData.underlying,
          balance: currentBalance
        };
      }
      return acc;
    }, {});

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

    for (let i = 0; i < vaultList.length; i += 1) {
      const vault = vaultList[i];
      const vb = vaultBalances[vault];

      p.balances[vb!.token] = (p.balances[vb!.token] || BigNumber.from(0)).add(
        BigNumber.from(vb?.balance || 0).mul(prices[i])
      );

      const tokenAddress = tokenDataByNetwork[p.networkType][vault];
      const adapterAddress = p.creditManager.adapters[tokenAddress];

      const callData =
        IYVault__factory.createInterface().encodeFunctionData("withdraw()");

      p.calls.push({ target: adapterAddress, callData });
    }

    return p.withdrawTokens();
  }
}
