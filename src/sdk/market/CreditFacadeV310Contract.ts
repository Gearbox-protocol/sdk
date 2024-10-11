import type { Address, DecodeFunctionDataReturnType } from "viem";
import { encodeFunctionData } from "viem";

import { iCreditFacadeV310Abi, iCreditFacadeV310MulticallAbi } from "../abi";
import { BaseContract, type CreditManagerData } from "../base";
import { ADDRESS_0X0 } from "../constants";
import type { GearboxSDK } from "../GearboxSDK";
import type { CreditFacadeState } from "../state";
import type { MultiCall, RawTx } from "../types";
import type { OnDemandPriceUpdate } from "./PriceOracleContract";

type abi = typeof iCreditFacadeV310Abi;

export class CreditFacadeV310Contract extends BaseContract<abi> {
  public readonly state: CreditFacadeState;

  constructor(
    sdk: GearboxSDK,
    { creditFacade, creditManager }: CreditManagerData,
  ) {
    super(sdk, {
      ...creditFacade.baseParams,
      name: `CreditFacadeV310(${creditManager.name})`,
      // Add multicall strictly for parsing, but use only creditFacadeV3Abi in types, so only this part is visible to typescript elsewhere
      abi: [...iCreditFacadeV310Abi, ...iCreditFacadeV310MulticallAbi] as any,
    });

    this.state = {
      ...this.contractData,
      maxQuotaMultiplier: Number(creditFacade.maxQuotaMultiplier),
      expirable: creditFacade.expirable,
      isDegenMode: creditFacade.degenNFT !== ADDRESS_0X0,
      degenNFT: creditFacade.degenNFT,
      expirationDate: Number(creditFacade.expirationDate),
      maxDebtPerBlockMultiplier: Number(creditFacade.maxDebtPerBlockMultiplier),
      botList: creditFacade.botList,
      minDebt: creditFacade.minDebt,
      maxDebt: creditFacade.maxDebt,
      currentCumulativeLoss: 0n,
      maxCumulativeLoss: 0n,
      forbiddenTokenMask: creditFacade.forbiddenTokenMask,
      isPaused: creditFacade.isPaused,
    };
  }

  public encodeOnDemandPriceUpdates(
    updates: OnDemandPriceUpdate[],
  ): MultiCall[] {
    return [
      {
        target: this.address,
        callData: encodeFunctionData({
          abi: iCreditFacadeV310MulticallAbi,
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

  public parseFunctionParams(
    params: DecodeFunctionDataReturnType<abi>,
  ): string[] | undefined {
    switch (params.functionName) {
      case "openCreditAccount": {
        const [onBehalfOf, calls, referralCode] = params.args;
        return [
          this.addressLabels.get(onBehalfOf),
          this.sdk.parseMultiCall([...calls]).join(","),
          `${referralCode}`,
        ];
      }
      case "closeCreditAccount": {
        const [creditAccount, calls] = params.args;
        return [
          this.addressLabels.get(creditAccount),
          this.sdk.parseMultiCall([...calls]).join(","),
        ];
      }
      case "liquidateCreditAccount": {
        const [creditAccount, to, calls] = params.args;
        return [
          this.addressLabels.get(creditAccount),
          this.addressLabels.get(to),
          this.sdk.parseMultiCall([...calls]).join(","),
        ];
      }
      default:
        return undefined;
    }
  }
}
