import type { Address, Hex } from "viem";
import type { IBaseContract } from "../../base/index.js";
import type { BaseContractStateHuman } from "../../types/index.js";

export interface ILossPolicyContract extends IBaseContract {
  stateHuman(raw?: boolean): BaseContractStateHuman;
  /**
   * Returns lossPolicyData that is passed to CreditFacade.liquidateCreditAccount
   * Returns undefined if lossPolicyData is not supported
   * @param creditAccount
   * @param blockNumber
   */
  getLiquidationData(
    creditAccount: Address,
    blockNumber?: bigint,
  ): Promise<Hex | undefined>;
}
