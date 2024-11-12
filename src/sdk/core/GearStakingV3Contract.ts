import type { Address, DecodeFunctionDataReturnType } from "viem";

import { gearStakingV3Abi } from "../abi";
import type { PermitResult } from "../accounts";
import { BaseContract, VotingContractStatus } from "../base";
import { ADDRESS_0X0 } from "../constants";
import type { GearboxSDK } from "../GearboxSDK";
import type { GearStakingV3StateHuman, RawTx } from "../types";

type abi = typeof gearStakingV3Abi;

export interface MultiVote {
  votingContract: Address;
  voteAmount: bigint;
  isIncrease: boolean;
  extraData: Address;
}

export class GearStakingContract extends BaseContract<abi> {
  constructor(sdk: GearboxSDK, address: Address) {
    super(sdk, { addr: address, name: "GearStakingV3", abi: gearStakingV3Abi });
  }

  parseFunctionParams(
    params: DecodeFunctionDataReturnType<abi>,
  ): Array<string> | undefined {
    switch (params.functionName) {
      case "setVotingContractStatus": {
        const [address, status] = params.args;
        return [this.addressLabels.get(address), VotingContractStatus[status]];
      }
      default:
        return undefined;
    }
  }

  public override stateHuman(raw = true): GearStakingV3StateHuman {
    return {
      ...super.stateHuman(raw),
      successor: this.labelAddress(ADDRESS_0X0),
      migrator: this.labelAddress(ADDRESS_0X0),
    };
  }

  public deposit(amount: bigint, votes: Array<MultiVote>): RawTx {
    return this.createRawTx({
      functionName: "deposit",
      args: [amount, votes],
    });
  }
  public depositWithPermit(
    amount: bigint,
    votes: Array<MultiVote>,
    permit: PermitResult,
  ): RawTx {
    return this.createRawTx({
      functionName: "depositWithPermit",
      args: [amount, votes, permit.deadline, permit.v, permit.r, permit.s],
    });
  }
  public withdraw(amount: bigint, to: Address, votes: Array<MultiVote>): RawTx {
    return this.createRawTx({
      functionName: "withdraw",
      args: [amount, to, votes],
    });
  }
  public claimWithdrawals(to: Address): RawTx {
    return this.createRawTx({
      functionName: "claimWithdrawals",
      args: [to],
    });
  }
  public multivote(votes: Array<MultiVote>): RawTx {
    return this.createRawTx({
      functionName: "multivote",
      args: [votes],
    });
  }
}
