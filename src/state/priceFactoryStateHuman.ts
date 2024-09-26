import { formatDuration } from "@gearbox-protocol/sdk-gov";

import { Address } from "viem";
import { PriceFeedContractType } from "../pricefeeds";
import { PriceFeedState, PriceOracleState } from "./priceFactoryState";
import { BaseContractStateHuman, convertBaseContractState } from "./stateHuman";

export interface PriceFactoryStateHuman {
  priceOracleV3: PriceOracleV3StateHuman;
  mainPriceFeeds: Record<string, PriceFeedStateHuman>;
  reservePriceFeeds: Record<string, PriceFeedStateHuman>;
}

export interface PriceOracleV3StateHuman extends BaseContractStateHuman {}

export type PriceFeedStateHuman =
  | BoundedOracleStateHuman
  | AssetPriceFeedStateHuman
  | RedstonePriceFeedStateHuman;

export interface BasePriceFeedStateHuman extends BaseContractStateHuman {
  stalenessPeriod: string;
  skipCheck: boolean;
  trusted?: boolean;
}

export interface BoundedOracleStateHuman extends BasePriceFeedStateHuman {
  contractType: "PF_BOUNDED_ORACLE";
  pricefeeds: Array<PriceFeedStateHuman>;
  upperBound: bigint;
}

export interface AssetPriceFeedStateHuman extends BasePriceFeedStateHuman {
  contractType: PriceFeedContractType;
  pricefeeds: Array<PriceFeedStateHuman>;
}

export interface RedstonePriceFeedStateHuman extends BasePriceFeedStateHuman {
  contractType: "PF_REDSTONE_ORACLE";
  dataId: string;
  signers: Array<string>;
  signersThreshold: number;
}

export function convertPriceOracleStateToHuman(
  state: PriceOracleState,
  labelAddress: (address: Address) => string,
  raw = true,
): PriceFactoryStateHuman {
  return {
    priceOracleV3: {
      ...convertBaseContractState(state.priceOracleV3, labelAddress),
    },
    mainPriceFeeds: Object.fromEntries(
      Object.entries(state.mainPriceFeeds).map(([k, v]) => [
        labelAddress(k as Address),
        convertPriceFeedStateToHuman(v!, labelAddress),
      ]),
    ),
    reservePriceFeeds: Object.fromEntries(
      Object.entries(state.reservePriceFeeds).map(([k, v]) => [
        labelAddress(k as Address),
        convertPriceFeedStateToHuman(v!, labelAddress),
      ]),
    ),
  };
}

export function convertPriceFeedStateToHuman(
  state: PriceFeedState,
  labelAddress: (address: Address) => string,
  raw = true,
): PriceFeedStateHuman {
  switch (state.contractType) {
    case "PF_BOUNDED_ORACLE": {
      return {
        ...state,
        ...convertBaseContractState(state, labelAddress),
        contractType: "PF_BOUNDED_ORACLE",
        pricefeeds: state.pricefeeds.map(pf =>
          convertPriceFeedStateToHuman(pf, labelAddress),
        ),
        stalenessPeriod: formatDuration(state.stalenessPeriod, raw),
      };
    }
    case "PF_REDSTONE_ORACLE": {
      return {
        ...state,
        ...convertBaseContractState(state, labelAddress),
        contractType: "PF_REDSTONE_ORACLE" as PriceFeedContractType,
        stalenessPeriod: formatDuration(state.stalenessPeriod, raw),
      } as RedstonePriceFeedStateHuman;
    }
    default: {
      return {
        ...state,
        ...convertBaseContractState(state, labelAddress),
        pricefeeds: state.pricefeeds.map(pf =>
          convertPriceFeedStateToHuman(pf, labelAddress),
        ),
        stalenessPeriod: formatDuration(state.stalenessPeriod, raw),
      } as AssetPriceFeedStateHuman;
    }
  }
}
