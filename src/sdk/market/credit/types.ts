import type { Address } from "abitype";

import type { CreditManagerState, IBaseContract } from "../../base/index.js";
import type {
  CreditConfiguratorStateHuman,
  CreditManagerStateHuman,
} from "../../types/index.js";
import type { AddressMap } from "../../utils/index.js";
import type { IAdapterContract } from "../adapters/index.js";
import type {
  CreditFacadeV300Contract,
  CreditFacadeV310Contract,
} from "../index.js";
import type { RampEvent } from "./CreditConfiguratorV300Contract.js";

export interface ICreditConfiguratorContract extends IBaseContract {
  isPaused: boolean;

  checkRamps: () => Promise<RampEvent[]>;
  stateHuman: (raw?: boolean) => CreditConfiguratorStateHuman;
}

export interface ICreditManagerContract
  extends IBaseContract,
    Omit<CreditManagerState, "baseParams" | "collateralTokens" | "name"> {
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
