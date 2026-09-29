import type { Address } from "viem";
import { z } from "zod";
import type { MarketState } from "../market-state/types.js";
import { addressSchema } from "../validation.js";
import type { BaseMarketAction, MarketActionData } from "./types.js";

/** Matches configurator periphery buckets (see SDK `PeripheryDomain`). */
export const peripheryContractDomains = ["DEGEN_NFT", "ZAPPER"] as const;
export type PeripheryContractDomain = (typeof peripheryContractDomains)[number];

export interface AddPeripheryContractParams {
  peripheryContract: Address;
  domain: PeripheryContractDomain;
  /** Contract type label (e.g. zapper `contractType()`); empty for Degen NFT is fine. */
  type: string;
}

export type AddPeripheryContractAction = BaseMarketAction<
  "MARKET::addPeripheryContract",
  AddPeripheryContractParams
>;

export const addPeripheryContractActionData: MarketActionData<AddPeripheryContractAction> =
  {
    type: "MARKET::addPeripheryContract",
    description:
      "Register a periphery contract (Degen NFT or Zapper) with the market configurator so it appears in periphery state.",
    schema: z.object({
      peripheryContract: addressSchema,
      domain: z.enum(peripheryContractDomains),
      type: z.string(),
    }),
    stateTransition: (args: {
      state: MarketState;
      params: AddPeripheryContractParams;
    }): MarketState => {
      const { state, params } = args;
      const addr = params.peripheryContract.toLowerCase() as Address;
      // @dev states persisted before periphery was tracked have no such field
      const periphery = state.periphery ?? [];
      if (
        periphery.some(
          p => p.address.toLowerCase() === addr && p.domain === params.domain,
        )
      ) {
        return { ...state, periphery };
      }
      return {
        ...state,
        periphery: [
          ...periphery,
          {
            address: addr,
            domain: params.domain,
            type: params.type,
            version: 0,
          },
        ],
      };
    },
    getRawTx: async ({ ctx, action }) => {
      const mc = ctx.marketConfigurator;
      const tx = mc.addPeripheryContract(action.params.peripheryContract);
      return { tx: { tx, action } };
    },
    replace: (a, b) =>
      a.peripheryContract.toLowerCase() === b.peripheryContract.toLowerCase() &&
      a.domain === b.domain,
    replaceKeep: "first",
  };
