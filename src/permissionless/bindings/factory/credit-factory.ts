import {
  adapterConstructorAbi,
  AdapterType,
  parseAdapterAction,
  parseAdapterDeployParams,
} from "../../../plugins/adapters/index.js";
import { Address, decodeFunctionData, Hex, hexToString } from "viem";
import { iCreditConfigureActionsAbi } from "../../abi";
import { DeployParams, SetExpirationDateParams, SetFeesParams } from "../types";
import { AbstractFactory } from "./abstract-factory";

const abi = iCreditConfigureActionsAbi;

export class CreditFactory extends AbstractFactory<typeof abi> {
  constructor() {
    super(abi);
  }

  pause(): Hex {
    return this.createCallData({
      functionName: "pause",
    });
  }

  unpause(): Hex {
    return this.createCallData({
      functionName: "unpause",
    });
  }

  addCollateralToken(args: {
    token: Address;
    liquidationThreshold: number;
  }): Hex {
    return this.createCallData({
      functionName: "addCollateralToken",
      args: [args.token, args.liquidationThreshold],
    });
  }

  allowAdapter(deployParams: DeployParams): Hex {
    return this.createCallData({
      functionName: "allowAdapter",
      args: [deployParams],
    });
  }

  allowToken(token: Address): Hex {
    return this.createCallData({
      functionName: "allowToken",
      args: [token],
    });
  }

  forbidToken(token: Address): Hex {
    return this.createCallData({
      functionName: "forbidToken",
      args: [token],
    });
  }

  configureAdapterFor(targetContract: Address, data: `0x${string}`): Hex {
    return this.createCallData({
      functionName: "configureAdapterFor",
      args: [targetContract, data],
    });
  }

  forbidAdapter(adapter: Address): Hex {
    return this.createCallData({
      functionName: "forbidAdapter",
      args: [adapter],
    });
  }

  rampLiquidationThreshold(args: {
    token: Address;
    liquidationThresholdFinal: number;
    rampStart: number;
    rampDuration: number;
  }): Hex {
    return this.createCallData({
      functionName: "rampLiquidationThreshold",
      args: [
        args.token,
        args.liquidationThresholdFinal,
        args.rampStart,
        args.rampDuration,
      ],
    });
  }

  setExpirationDate(params: SetExpirationDateParams): Hex {
    return this.createCallData({
      functionName: "setExpirationDate",
      args: [params.expirationDate],
    });
  }

  setFees(params: SetFeesParams): Hex {
    return this.createCallData({
      functionName: "setFees",
      args: [
        params.params.feeLiquidation,
        params.params.feeLiquidationPremium,
        params.params.feeLiquidationExpired,
        params.params.feeLiquidationPremiumExpired,
      ],
    });
  }

  setMaxDebtPerBlockMultiplier(newMaxDebtLimitPerBlockMultiplier: number): Hex {
    return this.createCallData({
      functionName: "setMaxDebtPerBlockMultiplier",
      args: [newMaxDebtLimitPerBlockMultiplier],
    });
  }

  upgradeCreditConfigurator(): Hex {
    return this.createCallData({
      functionName: "upgradeCreditConfigurator",
    });
  }

  upgradeCreditFacade(params: {
    degenNFT: Address;
    expirable: boolean;
    migrateBotList: boolean;
  }): Hex {
    return this.createCallData({
      functionName: "upgradeCreditFacade",
      args: [params],
    });
  }

  decodeConfig(
    calldata: Hex
  ): { functionName: string; args: Record<string, string> } | null {
    function getMaxVerBelowN(
      adapterPostfix: string,
      n: number
    ): number | undefined {
      const keys = Object.keys(
        adapterConstructorAbi[adapterPostfix as AdapterType]
      )
        .map(Number)
        .filter((k) => k < n);

      if (keys.length === 0) return undefined;
      return Math.max(...keys);
    }

    function parseAdapterParams(
      adapterPostfix: string,
      version: number,
      data: Hex
    ) {
      if (version < 310) return null;

      try {
        return parseAdapterDeployParams(adapterPostfix, version, data);
      } catch {
        const v = getMaxVerBelowN(adapterPostfix, version);
        if (v) return parseAdapterParams(adapterPostfix, v, data);
        else return null;
      }
    }

    try {
      const decoded = decodeFunctionData({
        abi: this.abi,
        data: calldata,
      });

      if (decoded.functionName === "allowAdapter") {
        const deployParams = decoded.args[0];
        const adapterType = hexToString(deployParams.postfix, {
          size: 32,
        });

        const latest = Math.max(
          ...Object.keys(adapterConstructorAbi[adapterType as AdapterType]).map(
            Number
          )
        );

        const constructorArgs = parseAdapterParams(
          adapterType as AdapterType,
          latest,
          deployParams.constructorParams
        );
        if (!constructorArgs) {
          return super.decodeConfig(calldata);
        }

        return {
          functionName: "allowAdapter",
          args: {
            adapterType,
            salt: deployParams.salt,
            constructorArgs: JSON.stringify(constructorArgs),
          },
        };
      }

      if (decoded.functionName === "configureAdapterFor") {
        const [targetContract, data] = decoded.args;
        const adapterAction = parseAdapterAction(data);
        if (!adapterAction) {
          return super.decodeConfig(calldata);
        }

        return {
          functionName: "configureAdapterFor",
          args: {
            targetContract,
            adapterAction: JSON.stringify(adapterAction),
          },
        };
      }

      return super.decodeConfig(calldata);
    } catch {
      return null;
    }
  }
}
