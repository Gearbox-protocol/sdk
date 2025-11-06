import type { IBaseContract } from "../../base/index.js";
import type { BaseContractStateHuman } from "../../types/index.js";

export interface ILossPolicyContract extends IBaseContract {
  stateHuman(raw?: boolean): BaseContractStateHuman;
}
