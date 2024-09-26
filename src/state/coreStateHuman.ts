import type { Address } from "viem";

import type { CoreState } from "./coreState";
import type { BaseContractStateHuman } from "./stateHuman";
import { convertBaseContractState } from "./stateHuman";

export interface AddressProviderV3StateHuman extends BaseContractStateHuman {
  addresses: Record<string, Record<number, string>>;
}

export interface ACLStateHuman extends BaseContractStateHuman {
  owner: string;
  pausableAdmins: Array<string>;
  unpausableAdmins: Array<string>;
}

export interface PolicyStructHuman {
  enabled: boolean;
  admin: string;
  delay: string;
  flags: string;
  exactValue: string;
  minValue: string;
  maxValue: string;
  referencePoint: string;
  referencePointUpdatePeriod: string;
  referencePointTimestampLU: string;
  minPctChangeDown: string;
  minPctChangeUp: string;
  maxPctChangeDown: string;
  maxPctChangeUp: string;
  minChange: string;
  maxChange: string;
}

export interface ControllerTimelockV3StateHuman extends BaseContractStateHuman {
  policies: Record<string, PolicyStructHuman>;
  groups: Record<string, Array<string>>;
}

export type DegenNFT2StateHuman = BaseContractStateHuman;

export interface GearStakingV3StateHuman extends BaseContractStateHuman {
  successor: string;
  migrator: string;
}

export type AccountFactoryStateHuman = BaseContractStateHuman;
export type BotListStateHuman = BaseContractStateHuman;
export type ContractsRegisterStateHuman = BaseContractStateHuman;

export interface CoreStateHuman {
  addressProviderV3: AddressProviderV3StateHuman;
  botList: BotListStateHuman;
  gearStakingV3: GearStakingV3StateHuman;
}

export function convertCoreStateToHuman(
  state: CoreState,
  labelAddress: (address: Address) => string,
  raw = true,
): CoreStateHuman {
  return {
    addressProviderV3: {
      ...convertBaseContractState(state.addressProviderV3, labelAddress),
      addresses: Object.entries(state.addressProviderV3.addresses)
        .map(([key, value]) => {
          return Object.entries(value).map(([version, address]) => {
            return {
              key,
              version,
              address: labelAddress(address),
            };
          });
        })
        .reduce(
          (acc, vals) => {
            for (const val of vals) {
              if (!acc[val.key]) {
                acc[val.key] = {};
              }
              acc[val.key][val.version as unknown as number] = val.address;
            }
            return acc;
          },
          {} as Record<string, Record<number, string>>,
        ),
    },

    botList: {
      ...convertBaseContractState(state.botList, labelAddress),
    },

    gearStakingV3: {
      ...convertBaseContractState(state.gearStakingV3, labelAddress),
      successor: labelAddress(state.gearStakingV3.successor),
      migrator: labelAddress(state.gearStakingV3.migrator),
    },
  };
}
