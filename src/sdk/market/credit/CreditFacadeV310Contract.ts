import type {
  Address,
  ContractEventName,
  DecodeFunctionDataReturnType,
  Log,
} from "viem";
import { encodeFunctionData } from "viem";

import {
  iCreditFacadeMulticallV310Abi,
  iCreditFacadeV310Abi,
  iPausableAbi,
} from "../../abi";
import type { CreditFacadeState, CreditManagerData } from "../../base";
import { BaseContract } from "../../base";
import { ADDRESS_0X0 } from "../../constants";
import type { GearboxSDK } from "../../GearboxSDK";
import type { CreditFacadeStateHuman, MultiCall, RawTx } from "../../types";
import { fmtBinaryMask, formatBNvalue } from "../../utils";
import type { OnDemandPriceUpdate } from "../oracle";

const abi = [
  ...iCreditFacadeV310Abi,
  ...iCreditFacadeMulticallV310Abi,
  ...iPausableAbi,
] as const;
type abi = typeof abi;

// Augmenting contract class with interface of compressor data object
export interface CreditFacadeV310Contract
  extends Omit<CreditFacadeState, "baseParams">,
    BaseContract<abi> {}

export class CreditFacadeV310Contract extends BaseContract<abi> {
  public readonly underlying: Address;

  constructor(
    sdk: GearboxSDK,
    { creditFacade, creditManager }: CreditManagerData,
  ) {
    const { baseParams, ...rest } = creditFacade;
    super(sdk, {
      ...baseParams,
      name: `CreditFacadeV310(${creditManager.name})`,
      abi,
    });
    Object.assign(this, rest);
    this.underlying = creditManager.underlying;
  }

  public override stateHuman(raw?: boolean): CreditFacadeStateHuman {
    const decimals = this.sdk.tokensMeta.decimals(this.underlying);
    return {
      ...super.stateHuman(raw),
      expirable: this.expirable,
      isDegenMode: this.degenNFT !== ADDRESS_0X0,
      degenNFT: this.labelAddress(this.degenNFT),
      expirationDate: this.expirationDate,
      maxDebtPerBlockMultiplier: this.maxDebtPerBlockMultiplier,
      botList: this.labelAddress(this.botList),
      minDebt: formatBNvalue(this.minDebt, decimals),
      maxDebt: formatBNvalue(this.maxDebt, decimals),
      currentCumulativeLoss: "0", // TODO
      maxCumulativeLoss: "0", // TODO
      forbiddenTokenMask: fmtBinaryMask(this.forbiddenTokenMask),
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

  public encodeOnDemandPriceUpdates(
    updates: OnDemandPriceUpdate[],
  ): MultiCall[] {
    return [
      {
        target: this.address,
        callData: encodeFunctionData({
          abi: iCreditFacadeMulticallV310Abi,
          functionName: "onDemandPriceUpdates",
          args: [
            updates.map(u => ({
              priceFeed: u.priceFeed,
              data: u.data,
            })),
          ],
        }),
      },
    ];
  }

  public liquidateCreditAccount(
    ca: Address,
    to: Address,
    calls: MultiCall[],
  ): RawTx {
    return this.createRawTx({
      functionName: "liquidateCreditAccount",
      args: [ca, to, calls],
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

  public parseFunctionParams(
    params: DecodeFunctionDataReturnType<abi>,
  ): string[] | undefined {
    switch (params.functionName) {
      case "openCreditAccount": {
        const [onBehalfOf, calls, referralCode] = params.args;
        return [
          this.labelAddress(onBehalfOf),
          this.sdk.parseMultiCall([...calls]).join(","),
          `${referralCode}`,
        ];
      }
      case "closeCreditAccount": {
        const [creditAccount, calls] = params.args;
        return [
          this.labelAddress(creditAccount),
          this.sdk.parseMultiCall([...calls]).join(","),
        ];
      }
      case "liquidateCreditAccount": {
        const [creditAccount, to, calls] = params.args;
        return [
          this.labelAddress(creditAccount),
          this.labelAddress(to),
          this.sdk.parseMultiCall([...calls]).join(","),
        ];
      }
      default:
        return undefined;
    }
  }
}
