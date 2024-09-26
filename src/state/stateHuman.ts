import { Address } from "viem";
import { CoreStateHuman, convertCoreStateToHuman } from "./coreStateHuman";
import { convertCreditFactoryStateToHuman } from "./creditStateHuman";
import { MarketStateHuman } from "./marketStateHuman";
import {
  PeripheryStateHuman,
  convertPeripheryStateToHuman,
} from "./peripheryStateHuman";
import { convertPoolFactoryStateToHuman } from "./poolStateHuman";
import { convertPriceOracleStateToHuman } from "./priceFactoryStateHuman";
import {
  RouterStateHuman,
  convertRouterStateToHuman,
} from "./routerStateHuman";
import { BaseContractState, GearboxState } from "./state";

export interface BaseContractStateHuman {
  address: string;
  version: number;
  contractType?: string;
}

export function convertBaseContractState(
  state: BaseContractState,
  labelAddress: (address: Address) => string,
): BaseContractStateHuman {
  return {
    address: labelAddress(state.address),
    version: state.version,
  };
}

export interface GearboxStateHuman {
  block: number;
  timestamp: number;
  core: CoreStateHuman;
  markets: Array<MarketStateHuman>;
  routerState?: RouterStateHuman;
}

export function convertGearboxStateToHuman(
  state: GearboxState,
  raw = true,
): GearboxStateHuman {
  const labelAddress = (address: Address) => {
    const label = state.contractLabels[address.toLowerCase() as Address];
    return label ? `${address} [${label}]` : address;
  };

  return convertGearboxStateToHumanLA(state, labelAddress, raw);
}

export function convertGearboxStateToHumanLA(
  state: GearboxState,
  labelAddress: (address: Address) => string,
  raw = true,
): GearboxStateHuman {
  return {
    block: state.block,
    timestamp: state.timestamp,
    core: convertCoreStateToHuman(state.core, labelAddress, raw),
    markets: state.markets.map(m => ({
      pool: convertPoolFactoryStateToHuman(m.pool, labelAddress, raw),
      creditManagers: m.creditManagers
        .filter(cm => cm.creditManager.pool === m.pool.pool.address)
        .map(cm => convertCreditFactoryStateToHuman(cm, labelAddress, raw)),
      priceOracle: convertPriceOracleStateToHuman(
        m.priceOracle,
        labelAddress,
        raw,
      ),
    })),

    // poolState: state.poolState.map(p =>
    //   convertPoolFactoryStateToHuman(p, labelAddress, raw),
    // ),
    // creditState: state.creditState.map(cm =>
    //   convertCreditFactoryStateToHuman(cm, labelAddress, raw),
    // ),
    routerState: state.routerState
      ? convertRouterStateToHuman(state.routerState, labelAddress, raw)
      : undefined,
  };
}
