import { Address, decimals, getTokenSymbol } from "@gearbox-protocol/sdk-gov";
import { ControllerTraitContract } from "../../core/controllerTrait";
import { PoolFactory } from "../../factories/PoolFactory";
import { poolQuotaKeeperV3Abi } from "../../generated";
import { MarketDataStruct, PoolDataStruct } from "../base/types";
import { PoolQuotaKeeperState } from "../state/poolState";

type abi = typeof poolQuotaKeeperV3Abi;

export class PoolQuotaKeeperContract extends ControllerTraitContract<abi> {
  decimals: number;
  state: PoolQuotaKeeperState;

  public static attach(args: {
    poolData: PoolDataStruct;
    factory: PoolFactory;
  }): PoolQuotaKeeperContract {
    const contract = new PoolQuotaKeeperContract({
      address: args.poolData.poolQuotaKeeper as Address,
      factory: args.factory,
      name: args.poolData.name,
      underlying: args.poolData.underlying as Address,
    });

    return PoolQuotaKeeperContract.attachInt(args.poolData, contract);
  }

  public static attachInt<T extends PoolQuotaKeeperContract>(
    poolData: PoolDataStruct,
    contract: T,
  ): T {
    contract.state = {
      ...contract.contractData,
      quotas: Object.fromEntries(
        poolData.quotas.map(q => {
          const qi = q;
          return [
            q.token,
            {
              rate: qi.rate,
              quotaIncreaseFee: qi.quotaIncreaseFee,
              totalQuoted: qi.totalQuoted,
              limit: qi.limit,
              isActive: qi.isActive,
            },
          ];
        }),
      ),
    };

    return contract;
  }

  public static attachMarketInt<T extends PoolQuotaKeeperContract>(
    marketData: MarketDataStruct,
    contract: T,
  ): T {
    contract.state = {
      ...contract.contractData,
      quotas: Object.fromEntries(
        marketData.poolQuotaKeeper.quotas.map(q => {
          return [q.token, q];
        }),
      ),
    };

    return contract;
  }

  protected constructor(args: {
    address: Address;
    factory: PoolFactory;
    name: string;
    underlying: Address;
  }) {
    super({
      ...args,
      name: `PoolQuotaKeeper(${args.name})`,
      abi: poolQuotaKeeperV3Abi,
      chainClient: args.factory.sdk.v3,
    });

    // TODO: avoid reading decimals from sdk-gov
    this.decimals = decimals[getTokenSymbol(args.underlying)!];
  }
}
