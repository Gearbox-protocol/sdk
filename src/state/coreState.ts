import { Address } from "viem";
import { BaseContractState } from "./state";

export interface AddressProviderV3State extends BaseContractState {
  addresses: Record<string, Record<number, Address>>;
}

export interface ACLState extends BaseContractState {
  owner: Address;
  pausableAdmins: Array<Address>;
  unpausableAdmins: Array<Address>;
}

export interface PolicyStruct {
  enabled: boolean;
  admin: Address;
  delay: number;
  flags: bigint;
  exactValue: bigint;
  minValue: bigint;
  maxValue: bigint;
  referencePoint: bigint;
  referencePointUpdatePeriod: number;
  referencePointTimestampLU: number;
  minPctChangeDown: number;
  minPctChangeUp: number;
  maxPctChangeDown: number;
  maxPctChangeUp: number;
  minChange: bigint;
  maxChange: bigint;
}

export interface ControllerTimelockV3State extends BaseContractState {
  policies: Record<string, PolicyStruct>;
  groups: Record<string, Array<Address>>;
}

export type DegenNFT2State = BaseContractState;

export interface GearStakingV3State extends BaseContractState {
  successor: Address;
  migrator: Address;
}

export type ContractsRegisterState = BaseContractState;
export type BotListState = BaseContractState;

export interface CoreState {
  addressProviderV3: AddressProviderV3State;
  botList: BotListState;
  gearStakingV3: GearStakingV3State;
}
