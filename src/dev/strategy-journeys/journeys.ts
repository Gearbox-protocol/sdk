import type { BaseStrategyJourney } from "./BaseStrategyJourney.js";
import { AddCollateralJourney } from "./journeys/AddCollateralJourney.js";
import { AdjustLeverageJourney } from "./journeys/AdjustLeverageJourney.js";
import { DepositJourney } from "./journeys/DepositJourney.js";
import { ExitJourney } from "./journeys/ExitJourney.js";
import { OpenJourney } from "./journeys/OpenJourney.js";
import { RepayJourney } from "./journeys/RepayJourney.js";
import { ReuseAccountJourney } from "./journeys/ReuseAccountJourney.js";
import { WithdrawCollateralJourney } from "./journeys/WithdrawCollateralJourney.js";
import { WithdrawJourney } from "./journeys/WithdrawJourney.js";

export { AddCollateralJourney } from "./journeys/AddCollateralJourney.js";
export { AdjustLeverageJourney } from "./journeys/AdjustLeverageJourney.js";
export { DepositJourney } from "./journeys/DepositJourney.js";
export { ExitJourney } from "./journeys/ExitJourney.js";
export { OpenJourney } from "./journeys/OpenJourney.js";
export { RepayJourney } from "./journeys/RepayJourney.js";
export { ReuseAccountJourney } from "./journeys/ReuseAccountJourney.js";
export { WithdrawCollateralJourney } from "./journeys/WithdrawCollateralJourney.js";
export { WithdrawJourney } from "./journeys/WithdrawJourney.js";

/** Variants of one behavior (full vs partial, leverage direction) are constructor flags. */
export const CORE_JOURNEYS = {
  open: new OpenJourney(),
  deposit: new DepositJourney(),
  "deposit-and-leverage": new DepositJourney({ raiseLeverage: true }),
  "increase-leverage": new AdjustLeverageJourney("up"),
  "decrease-leverage": new AdjustLeverageJourney("down"),
  "add-collateral": new AddCollateralJourney(),
  repay: new RepayJourney(),
  withdraw: new WithdrawJourney(),
  "withdraw-collateral": new WithdrawCollateralJourney(),
  "repay-all": new RepayJourney({ all: true }),
  "delever-to-one": new AdjustLeverageJourney("debtFree"),
  exit: new ExitJourney(),
  "reuse-account": new ReuseAccountJourney(),
} satisfies Record<string, BaseStrategyJourney>;

export type CoreJourney = keyof typeof CORE_JOURNEYS;
