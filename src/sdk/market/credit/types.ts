import type { Address } from "abitype";

import type { CreditManagerState, IBaseContract } from "../../base";
import type {
  CreditConfiguratorStateHuman,
  CreditManagerStateHuman,
} from "../../types";
import type { AddressMap } from "../../utils";
import type { CreditFacadeV300Contract, CreditFacadeV310Contract } from "..";
import type { IAdapterContract } from "../adapters";
import type { RampEvent } from "./CreditConfiguratorV300Contract";

export interface ICreditConfiguratorContract extends IBaseContract {
  adapters: Address[];
  isPaused: boolean;

  checkRamps: () => Promise<RampEvent[]>;
  stateHuman: (raw?: boolean) => CreditConfiguratorStateHuman;
}

export interface ICreditManagerContract
  extends IBaseContract,
    Omit<CreditManagerState, "baseParams" | "collateralTokens"> {
  /**
   * Mapping targetContract => adapter
   */
  adapters: AddressMap<IAdapterContract>;
  /**
   * Mapping collateral token address => liquidation threshold
   */
  liquidationThresholds: AddressMap<number>;
  /**
   * List of collateral tokens
   */
  collateralTokens: Address[];

  stateHuman: (raw?: boolean) => CreditManagerStateHuman;
}

export type CreditFacadeContract =
  | CreditFacadeV300Contract
  | CreditFacadeV310Contract;
