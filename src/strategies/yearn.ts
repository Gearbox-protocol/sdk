import { BigNumberish } from "ethers";

import {
  contractParams,
  contractsByNetwork,
  YearnParams,
  YearnVaultContract,
} from "../contracts/contracts";
import { ADDRESS_0X0, NetworkType } from "../core/constants";
import { CreditManagerData } from "../core/creditManager";
import { CurveLPTokenData } from "../tokens/curveLP";
import { supportedTokens, tokenDataByNetwork } from "../tokens/token";
import { TokenType } from "../tokens/tokenType";
import { IYVault__factory } from "../types";
import { MultiCallStruct } from "../types/@gearbox-protocol/router/contracts/interfaces/IClosePathResolver";
import { CurveStrategies } from "./curve";
import { UniswapV2Multicaller } from "./uniswapV2";

export class YearnV2Calls {
  public static deposit(amount?: BigNumberish, recipient?: string): string {
    const contractInterface = IYVault__factory.createInterface();
    if (amount && recipient) {
      return contractInterface.encodeFunctionData("deposit(uint256,address)", [
        amount,
        recipient,
      ]);
    }
    if (amount) {
      return contractInterface.encodeFunctionData("deposit(uint256)", [amount]);
    }
    return contractInterface.encodeFunctionData("deposit()");
  }

  public static withdraw(
    maxShares?: BigNumberish,
    recipient?: string,
    maxLoss?: BigNumberish,
  ): string {
    const contractInterface = IYVault__factory.createInterface();
    if (maxShares && recipient && maxLoss) {
      return contractInterface.encodeFunctionData(
        "withdraw(uint256,address,uint256)",
        [maxShares, recipient, maxLoss],
      );
    }
    if (maxShares && recipient) {
      return contractInterface.encodeFunctionData("withdraw(uint256,address)", [
        maxShares,
        recipient,
      ]);
    }
    if (maxShares) {
      return contractInterface.encodeFunctionData("withdraw(uint256)", [
        maxShares,
      ]);
    }
    return contractInterface.encodeFunctionData("withdraw()");
  }
}

export class YearnV2Multicaller {
  private readonly _address: string;

  constructor(address: string) {
    this._address = address;
  }

  static connect(address: string) {
    return new YearnV2Multicaller(address);
  }

  deposit(amount?: BigNumberish, recipient?: string): MultiCallStruct {
    return {
      target: this._address,
      callData: YearnV2Calls.deposit(amount, recipient),
    };
  }

  withdraw(
    maxShares?: BigNumberish,
    recipient?: string,
    maxLoss?: BigNumberish,
  ): MultiCallStruct {
    return {
      target: this._address,
      callData: YearnV2Calls.withdraw(maxShares, recipient, maxLoss),
    };
  }
}

export class YearnV2Strategies {
  static underlyingToYearn(
    data: CreditManagerData,
    network: NetworkType,
    yearnVault: YearnVaultContract,
    underlyingAmount: BigNumberish,
  ): MultiCallStruct[] {
    let calls: Array<MultiCallStruct> = [];
    const vaultParams = contractParams[yearnVault] as YearnParams;
    const yearnToken = vaultParams.shareToken;
    const yearnParams = supportedTokens[yearnToken];

    if (yearnParams.type === TokenType.YEARN_ON_NORMAL_TOKEN) {
      if (
        data.underlyingToken.toLowerCase() !==
        tokenDataByNetwork[network][yearnParams.underlying].toLowerCase()
      ) {
        // This should be a pathfinder call
        calls.push(
          UniswapV2Multicaller.connect(
            data.adapters[
              contractsByNetwork[network].UNISWAP_V2_ROUTER.toLowerCase()
            ],
          ).swapExactTokensForTokens(
            underlyingAmount,
            0,
            [
              data.underlyingToken,
              tokenDataByNetwork[network][yearnParams.underlying],
            ],
            ADDRESS_0X0,
            Math.floor(new Date().getTime() / 1000) + 3600,
          ),
        );
      } else {
        calls.push(
          YearnV2Multicaller.connect(
            data.adapters[
              contractsByNetwork[network][yearnVault].toLowerCase()
            ],
          ).deposit(underlyingAmount),
        );
        return calls;
      }
    } else if (yearnParams.type === TokenType.YEARN_ON_CURVE_TOKEN) {
      const curveTokenParams = supportedTokens[
        yearnParams.underlying
      ] as CurveLPTokenData;
      const curvePool = curveTokenParams.pool;

      calls = CurveStrategies.underlyingToCurveLP(
        data,
        network,
        curvePool,
        underlyingAmount,
      );
    } else {
      throw new Error("Yearn vault type unknown");
    }

    calls.push(
      YearnV2Multicaller.connect(
        data.adapters[contractsByNetwork[network][yearnVault].toLowerCase()],
      ).deposit(),
    );

    return calls;
  }

  static yearnToUnderlying(
    data: CreditManagerData,
    network: NetworkType,
    yearnVault: YearnVaultContract,
    yearnSharesAmount: BigNumberish,
  ): MultiCallStruct[] {
    let calls: Array<MultiCallStruct> = [];
    const vaultParams = contractParams[yearnVault] as YearnParams;
    const yearnToken = vaultParams.shareToken;
    const yearnParams = supportedTokens[yearnToken];

    calls.push(
      YearnV2Multicaller.connect(
        data.adapters[contractsByNetwork[network][yearnVault].toLowerCase()],
      ).withdraw(yearnSharesAmount),
    );

    if (yearnParams.type === TokenType.YEARN_ON_NORMAL_TOKEN) {
      if (
        data.underlyingToken.toLowerCase() !==
        tokenDataByNetwork[network][yearnParams.underlying].toLowerCase()
      ) {
        // This should be a pathfinder call
        calls.push(
          UniswapV2Multicaller.connect(
            data.adapters[
              contractsByNetwork[network].UNISWAP_V2_ROUTER.toLowerCase()
            ],
          ).swapAllTokensForTokens(
            0,
            [
              tokenDataByNetwork[network][yearnParams.underlying],
              data.underlyingToken,
            ],
            Math.floor(new Date().getTime() / 1000) + 3600,
          ),
        );
      }
    } else if (yearnParams.type === TokenType.YEARN_ON_CURVE_TOKEN) {
      const curveTokenParams = supportedTokens[
        yearnParams.underlying
      ] as CurveLPTokenData;
      const curvePool = curveTokenParams.pool;

      calls = [
        ...calls,
        ...CurveStrategies.allCurveLPToUnderlying(data, network, curvePool),
      ];
    } else {
      throw new Error("Yearn vault type unknown");
    }

    return calls;
  }
}
