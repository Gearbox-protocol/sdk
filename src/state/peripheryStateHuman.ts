import type { Address } from "viem";

import type { PeripheryState, ZapperRegisterState } from "./peripheryState";
import type { BaseContractStateHuman } from "./stateHuman";
import { convertBaseContractState } from "./stateHuman";

export interface PeripheryStateHuman {
  dataCompressorV3?: BaseContractStateHuman;
  degenDistributor?: DegenDistributorStateHuman;
  multiPause: BaseContractStateHuman;
  zapperRegister: ZapperRegisterStateHuman;
}

export type DegenDistributorStateHuman = BaseContractStateHuman;

export interface ZapperInfoHuman {
  address: string;
  pool: string;
  tokenIn: string;
  tokenOut: string;
}

export interface ZapperRegisterStateHuman extends BaseContractStateHuman {
  zappers: Record<string, Array<ZapperInfoHuman>>;
}

export function convertPeripheryStateToHuman(
  state: PeripheryState,
  labelAddress: (address: Address) => string,
  raw = true,
): PeripheryStateHuman {
  return {
    dataCompressorV3: state.dataCompressorV3
      ? convertBaseContractState(state.dataCompressorV3, labelAddress)
      : undefined,
    degenDistributor: state.degenDistributor
      ? convertBaseContractState(state.degenDistributor, labelAddress)
      : undefined,
    multiPause: convertBaseContractState(state.multiPause, labelAddress),
    zapperRegister: convertZapperRegisterStateToHuman(
      state.zapperRegister,
      labelAddress,
    ),
  };
}

export function convertZapperRegisterStateToHuman(
  state: ZapperRegisterState,
  labelAddress: (address: Address) => string,
  raw = true,
): ZapperRegisterStateHuman {
  return {
    ...convertBaseContractState(state, labelAddress),
    zappers: Object.entries(state.zappers).reduce(
      (acc, [pool, zappers]) => ({
        ...acc,
        [labelAddress(pool as Address)]: zappers.map(zapper => ({
          address: labelAddress(zapper.address),
          pool: labelAddress(zapper.pool),
          tokenIn: labelAddress(zapper.tokenIn),
          tokenOut: labelAddress(zapper.tokenOut),
        })),
      }),
      {} as Record<string, Array<ZapperInfoHuman>>,
    ),
  };
}
