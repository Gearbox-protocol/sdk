import type { Address, ContractEventName, Hex, Log } from "viem";
import { encodeFunctionData } from "viem";

import type {
  Asset,
  ConstructOptions,
  CreditFacadeState,
  CreditSuiteState,
  PermitResult,
} from "../../base/index.js";
import { ADDRESS_0X0, MAX_UINT256, MIN_INT96 } from "../../constants/index.js";
import type {
  CreditFacadeStateHuman,
  MultiCall,
  RawTx,
} from "../../types/index.js";
import {
  AssetsMap,
  fmtBinaryMask,
  formatBNvalue,
  formatTimestamp,
} from "../../utils/index.js";
import type { PriceUpdate } from "../pricefeeds/index.js";
import type { CreditFacadeV310Abi } from "./CreditFacadeV310BaseContract.js";
import { CreditFacadeV310BaseContract } from "./CreditFacadeV310BaseContract.js";
import type {
  BalanceDelta,
  CreditAccountTokenQuota,
  ICreditFacadeContract,
  PrepareUpdateQuotasProps,
} from "./types.js";

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

  /**
   * {@inheritDoc ICreditFacadeContract.prepareIncreaseDebt}
   */
  public prepareIncreaseDebt(amount: bigint): MultiCall {
    return {
      target: this.address,
      callData: encodeFunctionData({
        abi: this.abi,
        functionName: "increaseDebt",
        args: [amount],
      }),
    };
  }

  /**
   * {@inheritDoc ICreditFacadeContract.prepareChangeDebt}
   */
  public prepareChangeDebt(change: bigint, isDecrease: boolean): MultiCall {
    return {
      target: this.address,
      callData: encodeFunctionData({
        abi: this.abi,
        functionName: isDecrease ? "decreaseDebt" : "increaseDebt",
        args: [change],
      }),
    };
  }

  /**
   * {@inheritDoc ICreditFacadeContract.prepareDecreaseDebtFull}
   */
  public prepareDecreaseDebtFull(): MultiCall {
    return {
      target: this.address,
      callData: encodeFunctionData({
        abi: this.abi,
        functionName: "decreaseDebt",
        args: [MAX_UINT256],
      }),
    };
  }

  /**
   * {@inheritDoc ICreditFacadeContract.prepareWithdrawCollateral}
   */
  public prepareWithdrawCollateral(
    token: Address,
    amount: bigint,
    to: Address,
  ): MultiCall {
    return {
      target: this.address,
      callData: encodeFunctionData({
        abi: this.abi,
        functionName: "withdrawCollateral",
        args: [token, amount, to],
      }),
    };
  }

  /**
   * {@inheritDoc ICreditFacadeContract.prepareAddCollateral}
   */
  public prepareAddCollateral(
    assets: Asset[],
    permits: Record<string, PermitResult>,
  ): MultiCall[] {
    return assets.map(({ token, balance }) => {
      const p = permits[token];

      if (p) {
        return {
          target: this.address,
          callData: encodeFunctionData({
            abi: this.abi,
            functionName: "addCollateralWithPermit",
            args: [token, balance, p.deadline, p.v, p.r, p.s],
          }),
        };
      }

      return {
        target: this.address,
        callData: encodeFunctionData({
          abi: this.abi,
          functionName: "addCollateral",
          args: [token, balance],
        }),
      };
    });
  }

  /**
   * {@inheritDoc ICreditFacadeContract.prepareUpdateQuotas}
   */
  public prepareUpdateQuotas({
    averageQuota,
    minQuota,
  }: PrepareUpdateQuotasProps): MultiCall[] {
    const minRecord = new AssetsMap(minQuota);

    return averageQuota.map(q => {
      const minBalance = minRecord.get(q.token);
      const min = minBalance && minBalance > 0n ? minBalance : 0n;

      return {
        target: this.address,
        callData: encodeFunctionData({
          abi: this.abi,
          functionName: "updateQuota",
          args: [q.token, q.balance, min],
        }),
      };
    });
  }

  /**
   * {@inheritDoc ICreditFacadeContract.prepareDisableQuotas}
   */
  public prepareDisableQuotas(tokens: CreditAccountTokenQuota[]): MultiCall[] {
    return tokens
      .filter(t => t.quota > 0n)
      .map(t => ({
        target: this.address,
        callData: encodeFunctionData({
          abi: this.abi,
          functionName: "updateQuota",
          args: [t.token, MIN_INT96, 0n],
        }),
      }));
  }

  /**
   * {@inheritDoc ICreditFacadeContract.prepareSetBotPermissions}
   */
  public prepareSetBotPermissions(
    bot: Address,
    permissions: bigint,
  ): MultiCall {
    return {
      target: this.address,
      callData: encodeFunctionData({
        abi: this.abi,
        functionName: "setBotPermissions",
        args: [bot, permissions],
      }),
    };
  }

  /**
   * {@inheritDoc ICreditFacadeContract.prepareOnDemandPriceUpdates}
   */
  public prepareOnDemandPriceUpdates(updates: PriceUpdate[]): MultiCall {
    return {
      target: this.address,
      callData: encodeFunctionData({
        abi: this.abi,
        functionName: "onDemandPriceUpdates",
        args: [updates],
      }),
    };
  }

  /**
   * {@inheritDoc ICreditFacadeContract.prepareStoreExpectedBalances}
   */
  public prepareStoreExpectedBalances(deltas: BalanceDelta[]): MultiCall {
    return {
      target: this.address,
      callData: encodeFunctionData({
        abi: this.abi,
        functionName: "storeExpectedBalances",
        args: [deltas],
      }),
    };
  }

  /**
   * {@inheritDoc ICreditFacadeContract.prepareCompareBalances}
   */
  public prepareCompareBalances(): MultiCall {
    return {
      target: this.address,
      callData: encodeFunctionData({
        abi: this.abi,
        functionName: "compareBalances",
        args: [],
      }),
    };
  }

  /**
   * {@inheritDoc ICreditFacadeContract.prepareWithBalanceCheck}
   */
  public prepareWithBalanceCheck(
    deltas: BalanceDelta[],
    calls: MultiCall[],
  ): MultiCall[] {
    return [
      this.prepareStoreExpectedBalances(deltas),
      ...calls,
      this.prepareCompareBalances(),
    ];
  }
}
