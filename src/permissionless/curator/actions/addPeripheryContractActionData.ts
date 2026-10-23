import type { Address } from "viem";
import { z } from "zod/v4";
import {
  type MarketState,
  type PeripheryState,
  type PeripheryStatus,
  peripheryStatus,
} from "../state/market/types.js";
import { isSameAddress, lowerAddress } from "../utils/addressUtils.js";
import { addressSchema } from "../validationSchemas.js";
import type { BaseMarketAction } from "./actionTypes.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "./defineMarketAction.js";
import { resource } from "./utils/actionKeys.js";
import { noOp } from "./utils/checkHelpers.js";

/** Matches configurator periphery buckets (see SDK `PeripheryDomain`). **/
export const peripheryContractDomains = ["DEGEN_NFT", "ZAPPER"] as const;
export type PeripheryContractDomain = (typeof peripheryContractDomains)[number];

export interface AddPeripheryContractParams {
  peripheryContract: Address;
  domain: PeripheryContractDomain;
  /** Contract type label (e.g. zapper `contractType()`); empty for Degen NFT is fine. **/
  type: string;
}

export type AddPeripheryContractAction = BaseMarketAction<
  "MARKET::addPeripheryContract",
  AddPeripheryContractParams
>;

/** The market's periphery entry for the params' address and domain, if any. **/
function peripheryEntry(
  state: MarketState,
  params: AddPeripheryContractParams,
): { entry: PeripheryState; status: PeripheryStatus } | undefined {
  const entry = (state.periphery ?? []).find(
    candidate =>
      isSameAddress(candidate.address, params.peripheryContract) &&
      candidate.domain === params.domain,
  );
  return entry ? { entry, status: peripheryStatus(entry) } : undefined;
}

export const addPeripheryContractActionData: MarketScopedDefinition<AddPeripheryContractAction> =
  defineMarketAction<AddPeripheryContractAction>({
    type: "MARKET::addPeripheryContract",
    gas: () => 120_000,
    description:
      "Register a periphery contract (Degen NFT or Zapper) with the market configurator so it appears in periphery state.",
    schema: z.object({
      peripheryContract: addressSchema,
      domain: z.enum(peripheryContractDomains),
      type: z.string(),
    }),
    check: ({ state, params }) =>
      peripheryEntry(state, params)?.status === "registered"
        ? [
            noOp(
              `${params.peripheryContract} is already registered as ${params.domain}`,
              ["params", "peripheryContract"],
            ),
          ]
        : [],
    apply: ({ state, params }) => {
      // @dev states persisted before periphery was tracked have no such field
      const periphery = state.periphery ?? [];
      const deployed = peripheryEntry(state, params);
      if (deployed) {
        // A contract the GIP deployed keeps its type and version.
        return {
          ...state,
          periphery: periphery.map(entry =>
            entry === deployed.entry
              ? { ...entry, status: "registered" as const }
              : entry,
          ),
        };
      }
      return {
        ...state,
        periphery: [
          ...periphery,
          {
            address: lowerAddress(params.peripheryContract),
            domain: params.domain,
            type: params.type,
            version: 0,
            status: "registered" as const,
          },
        ],
      };
    },
    encode: ({ ctx, params }) =>
      ctx.marketConfigurator.addPeripheryContract(params.peripheryContract),
    provides: params => [
      resource.periphery(params.domain, params.peripheryContract),
    ],
    // @dev a contract deployed by the same GIP must exist before it is registered
    requires: params => [resource.contract(params.peripheryContract)],
    key: params => `${params.domain}:${params.peripheryContract.toLowerCase()}`,
  });
