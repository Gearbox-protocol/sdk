import { ControllerTraitContract } from "../../core/controllerTrait";
import { PoolFactory } from "../../factories/PoolFactory";
import { gaugeV3Abi } from "../../generated";
import { GaugeInfoStruct, MarketDataStruct } from "../base/types";
import { Address, decodeAbiParameters, Hex } from "viem";
import { GaugeParams, GaugeState } from "../state/poolState";

type abi = typeof gaugeV3Abi;

export class GaugeContract extends ControllerTraitContract<abi> {
  state: GaugeState;

  public static attach(args: {
    gaugeData: GaugeInfoStruct;
    factory: PoolFactory;
    name: string;
  }): GaugeContract {
    const { factory, gaugeData } = args;

    const contract = new GaugeContract({
      address: gaugeData.addr as Address,
      name: args.name,
      factory,
    });

    return GaugeContract.attachInt(gaugeData, contract);
  }

  protected static attachInt<T extends GaugeContract>(
    gaugeData: GaugeInfoStruct,
    contract: T,
  ): T {
    contract.state = {
      ...contract.contractData,
      currentEpoch: Number(gaugeData.currentEpoch),
      epochFrozen: gaugeData.epochFrozen,
      quotaParams: Object.fromEntries(
        gaugeData.quotaParams.map(g => [
          g.token as Address,
          {
            minRate: g.minRate,
            maxRate: g.maxRate,
            totalVotesLpSide: Number(g.totalVotesLpSide),
            totalVotesCaSide: Number(g.totalVotesCaSide),
            rate: g.rate,
          },
        ]) as [Address, GaugeParams][],
      ),
    };

    return contract;
  }

  protected static attachMarketInt<T extends GaugeContract>(
    marketData: MarketDataStruct,
    contract: T,
  ): T {
    const [voter, currentEpoch, epochFrozen, gaugeParams] = decodeAbiParameters(
      [
        { name: "voter", type: "address" },
        { name: "currentEpoch", type: "uint256" },
        { name: "epochFrozen", type: "bool" },
        {
          name: "quotaParams",
          type: "tuple[]",
          components: [
            { name: "token", type: "address" },
            { name: "minRate", type: "uint256" },
            { name: "maxRate", type: "uint256" },
            { name: "totalVotesLpSide", type: "uint256" },
            { name: "totalVotesCaSide", type: "uint256" },
          ],
        },
      ],
      marketData.rateKeeper.baseParams.serializedParams as Hex,
    );

    const rates = Object.fromEntries(
      marketData.rateKeeper.rates.map(r => [r.token, r.rate]),
    );

    const quotaParams: Record<Address, GaugeParams> = {};

    for (const g of gaugeParams) {
      quotaParams[g.token] = {
        minRate: Number(g.minRate),
        maxRate: Number(g.maxRate),
        totalVotesLpSide: Number(g.totalVotesLpSide),
        totalVotesCaSide: Number(g.totalVotesCaSide),
        rate: rates[g.token] ?? 0,
      };
    }

    contract.state = {
      ...contract.contractData,
      currentEpoch: Number(currentEpoch),
      epochFrozen,
      quotaParams,
    };

    return contract;
  }

  protected constructor(args: {
    address: Address;
    factory: PoolFactory;
    name: string;
  }) {
    super({
      ...args,
      chainClient: args.factory.sdk.v3,
      name: `Gauge(${args.name})`,
      abi: gaugeV3Abi,
    });
  }
}
