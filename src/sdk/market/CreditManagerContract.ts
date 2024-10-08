import type { Address } from "viem";

import { creditManagerV3Abi } from "../abi";
import type { CreditManagerData, PoolData } from "../base";
import { BaseContract } from "../base";
import type { GearboxSDK } from "../GearboxSDK";
import type { CreditManagerState } from "../state";
import type { IAdapterContract } from "./adapters";
import { createAdapter } from "./adapters";

type abi = typeof creditManagerV3Abi;

export class CreditManagerContract extends BaseContract<abi> {
  public readonly state: CreditManagerState;
  /**
   * Mapping targetContract => adapter
   */
  public readonly adapters: Record<Address, IAdapterContract>;

  constructor(
    sdk: GearboxSDK,
    { creditManager, creditFacade, adapters }: CreditManagerData,
    pool: PoolData,
  ) {
    super(sdk, {
      ...creditManager.baseParams,
      name: `CreditManagerV3(${creditManager.name})`,
      abi: creditManagerV3Abi,
    });
    const { collateralTokens, liquidationThresholds } = creditManager;
    this.adapters = {};
    for (const adapterData of adapters) {
      const adapter = createAdapter(sdk, adapterData);
      adapter.name = `${adapter.name}(${creditManager.name})`;
      this.adapters[adapter.targetContract] = adapter;
    }

    this.state = {
      ...this.contractData,
      accountFactory: creditManager.accountFactory,
      underlying: pool.underlying,
      pool: pool.baseParams.addr,
      creditFacade: creditFacade.baseParams.addr,
      creditConfigurator: creditManager.creditConfigurator,
      priceOracle: creditManager.priceOracle,
      maxEnabledTokens: creditManager.maxEnabledTokens,
      collateralTokens: Object.fromEntries(
        collateralTokens.map((t, i) => [t, liquidationThresholds[i]]),
      ),

      feeInterest: creditManager.feeInterest,
      feeLiquidation: creditManager.feeLiquidation,
      liquidationDiscount: creditManager.liquidationDiscount,
      feeLiquidationExpired: creditManager.feeLiquidationExpired,
      liquidationDiscountExpired: creditManager.liquidationDiscountExpired,
      quotedTokensMask: 0n,
      contractsToAdapters: Object.fromEntries(
        adapters.map(a => [a.targetContract, a.baseParams.addr]),
      ),
      creditAccounts: [], // [...result[5].result!],
      name: creditManager.name,
    };
  }

  public get collateralTokens(): Address[] {
    return Object.keys(this.state.collateralTokens) as Address[];
  }
}
