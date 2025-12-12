import type { Address, ContractEventName, Log } from "viem";

import { iCreditManagerV300Abi } from "../../../abi/v300.js";
import type { CreditManagerState, CreditSuiteState } from "../../base/index.js";
import { BaseContract } from "../../base/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import type { CreditManagerStateHuman } from "../../types/index.js";
import { AddressMap, fmtBinaryMask, percentFmt } from "../../utils/index.js";
import type { IAdapterContract } from "../adapters/index.js";
import { createAdapter } from "../adapters/index.js";
import type { ICreditManagerContract } from "./types.js";

type abi = typeof iCreditManagerV300Abi;
const abi = iCreditManagerV300Abi;

// Augmenting contract class with interface of compressor data object
export interface CreditManagerV300Contract
  extends Omit<
      CreditManagerState,
      "baseParams" | "collateralTokens" | "liquidationThresholds" | "name"
    >,
    BaseContract<abi> {}

// biome-ignore lint/suspicious/noUnsafeDeclarationMerging: -
export class CreditManagerV300Contract
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

  constructor(sdk: GearboxSDK, { creditManager, adapters }: CreditSuiteState) {
    const { baseParams, collateralTokens, ...rest } = creditManager;
    super(sdk, {
      ...baseParams,
      name: `CreditManagerV300(${creditManager.name})`,
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
        const adapter = createAdapter(sdk, adapterData);
        this.adapters.upsert(adapter.targetContract, adapter);
        this.register.setAddressLabel(
          adapter.address,
          `${adapter.name}(${this.name})`,
        );
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
