import type { Address } from "viem";
import type { NetworkType } from "../../../../sdk/index.js";
import type { StrategyConfigPayload } from "../../../static/strategy.js";

export type ExtraCollateralConfig = { token: Address; cm: Address } | Address;

export type ExtraCollaterals = Record<Address, Array<ExtraCollateralConfig>>;

export interface NotValidatedStrategy
  extends Omit<StrategyConfigPayload, "additionalCollaterals"> {
  additionalCollaterals?: ExtraCollaterals;
}

export interface Strategy extends Omit<NotValidatedStrategy, "network" | "id"> {
  id: string;
  network: NetworkType;
}

export type StrategyRecord = Record<number, Record<Strategy["id"], Strategy>>;
