import { decimals, getTokenSymbol } from "@gearbox-protocol/sdk-gov";
import type { Address } from "viem";

import { fmtBinaryMask, formatBNvalue, percentFmt } from "../utils";
import type {
  CreditConfiguratorState,
  CreditFacadeState,
  CreditFactoryState,
  CreditManagerState,
} from "./creditState";
import type { BaseContractStateHuman } from "./stateHuman";
import { convertBaseContractState } from "./stateHuman";

export interface CreditFacadeStateHuman extends BaseContractStateHuman {
  maxQuotaMultiplier: number;
  expirable: boolean;
  isDegenMode: boolean;
  degenNFT: string;
  expirationDate: number;
  maxDebtPerBlockMultiplier: number;
  botList: string;
  minDebt: string;
  maxDebt: string;
  currentCumulativeLoss: string;
  maxCumulativeLoss: string;
  forbiddenTokenMask: string;
  isPaused: boolean;
}

function convertCreditFacadeStateToHuman(
  state: CreditFacadeState,
  decimals: number,
  labelAddress: (address: Address) => string,
  _raw = true,
): CreditFacadeStateHuman {
  return {
    ...convertBaseContractState(state, labelAddress),
    maxQuotaMultiplier: state.maxQuotaMultiplier,
    expirable: state.expirable,
    isDegenMode: state.isDegenMode,
    degenNFT: labelAddress(state.degenNFT),
    expirationDate: state.expirationDate,
    maxDebtPerBlockMultiplier: state.maxDebtPerBlockMultiplier,
    botList: labelAddress(state.botList),
    minDebt: formatBNvalue(state.minDebt, decimals),
    maxDebt: formatBNvalue(state.maxDebt, decimals),
    currentCumulativeLoss: formatBNvalue(state.currentCumulativeLoss, decimals),
    maxCumulativeLoss: formatBNvalue(state.maxCumulativeLoss, decimals),
    forbiddenTokenMask: fmtBinaryMask(state.forbiddenTokenMask),
    isPaused: state.isPaused,
  };
}

export interface CreditManagerStateHuman extends BaseContractStateHuman {
  name: string;
  accountFactory: string;
  underlying: string;
  pool: string;
  creditFacade: string;
  creditConfigurator: string;
  priceOracle: string;
  maxEnabledTokens: number;
  collateralTokens: Record<string, string>;
  feeInterest: string;
  feeLiquidation: string;
  liquidationDiscount: string;
  feeLiquidationExpired: string;
  liquidationDiscountExpired: string;
  quotedTokensMask: string;
  contractsToAdapters: Record<string, string>;
  creditAccounts: Array<Address>;
}

function convertCreditManagerStateToHuman(
  state: CreditManagerState,
  labelAddress: (address: Address) => string,
  raw = true,
): CreditManagerStateHuman {
  return {
    ...convertBaseContractState(state, labelAddress),
    name: state.name,
    accountFactory: labelAddress(state.accountFactory),
    underlying: labelAddress(state.underlying),
    pool: labelAddress(state.pool),
    creditFacade: labelAddress(state.creditFacade),
    creditConfigurator: labelAddress(state.creditConfigurator),
    priceOracle: labelAddress(state.priceOracle),
    maxEnabledTokens: state.maxEnabledTokens,
    collateralTokens: Object.fromEntries(
      Object.entries(state.collateralTokens).map(([k, v]) => [
        labelAddress(k as Address),
        percentFmt(v, raw),
      ]),
    ) as Record<Address, string>,
    feeInterest: percentFmt(state.feeInterest, raw),
    feeLiquidation: percentFmt(state.feeLiquidation, raw),
    liquidationDiscount: percentFmt(state.liquidationDiscount, raw),
    feeLiquidationExpired: percentFmt(state.feeLiquidationExpired, raw),
    liquidationDiscountExpired: percentFmt(
      state.liquidationDiscountExpired,
      raw,
    ),
    quotedTokensMask: fmtBinaryMask(state.quotedTokensMask),
    contractsToAdapters: Object.fromEntries(
      Object.entries(state.contractsToAdapters).map(([k, v]) => [
        labelAddress(k as Address),
        labelAddress(v),
      ]),
    ),
    creditAccounts: state.creditAccounts,
  };
}

export interface CreditConfiguratorStateHuman extends BaseContractStateHuman {
  emergencyLiquidators: Array<string>;
}

function convertCreditConfiguratorStateToHuman(
  state: CreditConfiguratorState,
  labelAddress: (address: Address) => string,
  _raw = true,
): CreditConfiguratorStateHuman {
  return {
    ...convertBaseContractState(state, labelAddress),
    emergencyLiquidators: state.emergencyLiquidators.map(labelAddress),
  };
}

export interface CreditFactoryStateHuman {
  creditFacade: CreditFacadeStateHuman;
  creditManager: CreditManagerStateHuman;
  creditConfigurator: CreditConfiguratorStateHuman;
}

export function convertCreditFactoryStateToHuman(
  state: CreditFactoryState,
  labelAddress: (address: Address) => string,
  _raw = true,
): CreditFactoryStateHuman {
  return {
    // TODO: avoid reading decimals from sdk-gov
    creditFacade: convertCreditFacadeStateToHuman(
      state.creditFacade,
      decimals[getTokenSymbol(state.creditManager.underlying as Address)!],
      labelAddress,
    ),
    creditManager: convertCreditManagerStateToHuman(
      state.creditManager,
      labelAddress,
    ),
    creditConfigurator: convertCreditConfiguratorStateToHuman(
      state.creditConfigurator,
      labelAddress,
    ),
  };
}
