import type { Address, Hex } from "viem";
import { iZapperAbi } from "../../../abi/iZapper.js";
import type { BaseContractArgs, ConstructOptions } from "../../base/index.js";
import { BaseContract } from "../../base/index.js";
import type { RawTx } from "../../types/index.js";

const abi = iZapperAbi;
type abi = typeof abi;

export class IZapperContract extends BaseContract<abi> {
  constructor(
    options: ConstructOptions,
    args: Omit<BaseContractArgs<abi>, "abi">,
  ) {
    super(options, { ...args, abi });
  }

  /**
   * Redeems pool shares (diesel tokens) for the underlying asset via this zapper.
   */
  public redeem(tokenInAmount: bigint, receiver: Address): RawTx {
    return this.createRawTx({
      functionName: "redeem",
      args: [tokenInAmount, receiver],
    });
  }

  /**
   * Redeems pool shares via this zapper with an EIP-2612 permit signature,
   * skipping a separate approve transaction.
   */
  public redeemWithPermit(
    tokenInAmount: bigint,
    receiver: Address,
    deadline: bigint,
    v: number,
    r: Hex,
    s: Hex,
  ): RawTx {
    return this.createRawTx({
      functionName: "redeemWithPermit",
      args: [tokenInAmount, receiver, deadline, v, r, s],
    });
  }
}
