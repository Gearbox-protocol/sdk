import type { Address, ContractEventName, Hex, Log } from "viem";

import type {
  ConstructOptions,
  CreditFacadeState,
  CreditSuiteState,
} from "../../base/index.js";
import { ADDRESS_0X0 } from "../../constants/index.js";
import type {
  CreditFacadeStateHuman,
  MultiCall,
  RawTx,
} from "../../types/index.js";
import {
  fmtBinaryMask,
  formatBNvalue,
  formatTimestamp,
} from "../../utils/index.js";
import type { PriceUpdate } from "../pricefeeds/index.js";
import type { CreditFacadeV310Abi } from "./CreditFacadeV310BaseContract.js";
import { CreditFacadeV310BaseContract } from "./CreditFacadeV310BaseContract.js";
import type { ICreditFacadeContract } from "./types.js";

type abi = CreditFacadeV310Abi;

// Augmenting contract class with interface of compressor data object so that
// the abi-inferred `CreditFacadeState` fields are grafted onto the instance
// type (they are populated at runtime via `Object.assign` in the constructor).
export interface CreditFacadeV310Contract
  extends Omit<CreditFacadeState, "baseParams">,
    CreditFacadeV310BaseContract {}

// biome-ignore lint/suspicious/noUnsafeDeclarationMerging: typing for Object.assign
export class CreditFacadeV310Contract
  extends CreditFacadeV310BaseContract
  implements ICreditFacadeContract
{
  public readonly underlying: Address;

  constructor(
    options: ConstructOptions,
    { creditFacade, creditManager }: CreditSuiteState,
  ) {
    const { baseParams, ...rest } = creditFacade;
    super(options, {
      ...baseParams,
      name: `CreditFacadeV310(${creditManager.name})`,
    });
    Object.assign(this, rest);
    this.underlying = creditManager.underlying;
  }

  public override stateHuman(raw?: boolean): CreditFacadeStateHuman {
    const decimals = this.tokensMeta.decimals(this.underlying);
    return {
      ...super.stateHuman(raw),
      expirable: this.expirable,
      isDegenMode: this.degenNFT !== ADDRESS_0X0,
      degenNFT: this.labelAddress(this.degenNFT),
      expirationDate: formatTimestamp(this.expirationDate),
      maxDebtPerBlockMultiplier: this.maxDebtPerBlockMultiplier,
      botList: this.labelAddress(this.botList),
      minDebt: formatBNvalue(this.minDebt, decimals),
      maxDebt: formatBNvalue(this.maxDebt, decimals),
      forbiddenTokensMask: fmtBinaryMask(this.forbiddenTokensMask),
      isPaused: this.isPaused,
    };
  }

  public override processLog(
    log: Log<
      bigint,
      number,
      false,
      undefined,
      undefined,
      abi,
      ContractEventName<abi>
    >,
  ): void {
    switch (log.eventName) {
      case "Paused":
        this.isPaused = true;
        break;
      case "Unpaused":
        this.isPaused = false;
        break;
      case "AddCollateral":
      case "CloseCreditAccount":
      case "Execute":
      case "FinishMultiCall":
      case "LiquidateCreditAccount":
      case "OpenCreditAccount":
      case "PartiallyLiquidateCreditAccount":
      case "StartMultiCall":
      case "WithdrawCollateral":
      case "WithdrawPhantomToken":
        this.dirty = true;
        break;
    }
  }

  public liquidateCreditAccount(
    ca: Address,
    to: Address,
    calls: MultiCall[],
    lossPolicyData?: Hex,
  ): RawTx {
    return this.createRawTx({
      functionName: "liquidateCreditAccount",
      args: lossPolicyData ? [ca, to, calls, lossPolicyData] : [ca, to, calls],
    });
  }

  public partiallyLiquidateCreditAccount(
    ca: Address,
    token: Address,
    repaidAmount: bigint,
    minSeizedAmount: bigint,
    to: Address,
    updates: PriceUpdate[],
  ): RawTx {
    return this.createRawTx({
      functionName: "partiallyLiquidateCreditAccount",
      args: [ca, token, repaidAmount, minSeizedAmount, to, updates],
    });
  }

  public closeCreditAccount(ca: Address, calls: MultiCall[]): RawTx {
    return this.createRawTx({
      functionName: "closeCreditAccount",
      args: [ca, calls],
    });
  }

  public multicall(ca: Address, calls: MultiCall[]): RawTx {
    return this.createRawTx({
      functionName: "multicall",
      args: [ca, calls],
    });
  }

  public botMulticall(ca: Address, calls: MultiCall[]): RawTx {
    return this.createRawTx({
      functionName: "botMulticall",
      args: [ca, calls],
    });
  }

  public openCreditAccount(
    to: Address,
    calls: MultiCall[],
    referralCode: bigint,
  ): RawTx {
    return this.createRawTx({
      functionName: "openCreditAccount",
      args: [to, calls, referralCode],
    });
  }
}
