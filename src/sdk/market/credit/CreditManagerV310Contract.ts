import type { Address, ContractEventName, Log } from "viem";

import { iCreditManagerV310Abi } from "../../../abi/v310";
import type { CreditManagerData, CreditManagerState } from "../../base";
import { BaseContract } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import type { CreditManagerStateHuman } from "../../types";
import { AddressMap, fmtBinaryMask, percentFmt } from "../../utils";
import type { IAdapterContract } from "../adapters";
import { createAdapter } from "../adapters";
import type { ICreditManagerContract } from "./types";

const abi = iCreditManagerV310Abi;
type abi = typeof iCreditManagerV310Abi;

// Augmenting contract class with interface of compressor data object
export interface CreditManagerV310Contract
  extends Omit<
      CreditManagerState,
      "baseParams" | "collateralTokens" | "liquidationThresholds"
    >,
    BaseContract<abi> {}

export class CreditManagerV310Contract
  extends BaseContract<abi>
  implements ICreditManagerContract
{
  /**
   * Mapping targetContract => adapter
   */
  public readonly adapters: AddressMap<IAdapterContract>;
  /**
   * Mapping token address => liquidation threshold
   */
  public readonly liquidationThresholds: AddressMap<number>;

  constructor(sdk: GearboxSDK, { creditManager, adapters }: CreditManagerData) {
    const { baseParams, collateralTokens, ...rest } = creditManager;
    super(sdk, {
      ...baseParams,
      name: `CreditManagerV310(${creditManager.name})`,
      abi,
    });
    Object.assign(this, rest);
    this.liquidationThresholds = new AddressMap(
      collateralTokens.map(ct => [ct.token, ct.liquidationThreshold]),
      "liquidationThresholds",
    );

    this.adapters = new AddressMap(undefined, "adapters");
    for (const adapterData of adapters) {
      try {
        const adapter = createAdapter(this.sdk, adapterData);
        adapter.name = `${adapter.name}(${this.name})`;
        this.adapters.upsert(adapter.targetContract, adapter);
      } catch (e) {
        throw new Error(`cannot attach adapter: ${e}`, { cause: e });
      }
    }
  }

  public override stateHuman(raw?: boolean): CreditManagerStateHuman {
    return {
      ...super.stateHuman(raw),
      name: this.name,
      accountFactory: this.labelAddress(this.accountFactory),
      underlying: this.labelAddress(this.underlying),
      pool: this.labelAddress(this.pool),
      creditFacade: this.labelAddress(this.creditFacade),
      creditConfigurator: this.labelAddress(this.creditConfigurator),
      maxEnabledTokens: this.maxEnabledTokens,
      collateralTokens: Object.fromEntries(
        this.liquidationThresholds
          .entries()
          .map(([k, v]) => [
            this.labelAddress(k as Address),
            percentFmt(v, raw),
          ]),
      ) as Record<Address, string>,
      feeInterest: percentFmt(this.feeInterest, raw),
      feeLiquidation: percentFmt(this.feeLiquidation, raw),
      liquidationDiscount: percentFmt(this.liquidationDiscount, raw),
      feeLiquidationExpired: percentFmt(this.feeLiquidationExpired, raw),
      liquidationDiscountExpired: percentFmt(
        this.liquidationDiscountExpired,
        raw,
      ),
      quotedTokensMask: fmtBinaryMask(0n), // TODO: ?
      contractsToAdapters: Object.fromEntries(
        this.adapters
          .entries()
          .map(([k, v]) => [
            this.labelAddress(k),
            this.labelAddress(v.address),
          ]),
      ),
      creditAccounts: [], // TODO: ?
    };
  }

  public get collateralTokens(): Address[] {
    return this.liquidationThresholds.keys();
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
      case "SetCreditConfigurator":
        this.dirty = true;
        break;
    }
  }
}
