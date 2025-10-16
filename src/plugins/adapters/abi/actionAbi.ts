import { type Hex, parseAbi, toFunctionSelector } from "viem";
import type { PartialRecord } from "../../../sdk/index.js";
import { AdapterType, type VersionedAbi } from "../types.js";

/**
 * Mapping from adapter type to ABI for decoding deploy params
 * These ABIs correspond to the constructor parameters used in each adapter's getDeployParams method
 * Based on the actual encodeAbiParameters calls in the adapter implementations
 */
export const adapterActionSignatures: PartialRecord<
  AdapterType,
  Record<number, string>
> = {
  [AdapterType.BALANCER_VAULT]: {
    310: "function setPoolStatus(bytes32,uint8)",
  },
  [AdapterType.BALANCER_V3_ROUTER]: {
    310: "function setPoolStatusBatch(address[],bool[])",
  },
  [AdapterType.CAMELOT_V3_ROUTER]: {
    310: "function setPoolStatusBatch((address,address,bool)[])",
  },
  [AdapterType.CVX_V1_BOOSTER]: {
    310: "function updateSupportedPids()",
  },
  [AdapterType.EQUALIZER_ROUTER]: {
    310: "function setPoolStatusBatch((address,address,bool,bool)[])",
  },
  [AdapterType.KODIAK_ISLAND_GATEWAY]: {
    310: "function setIslandStatusBatch((address,uint8)[])",
  },
  [AdapterType.MELLOW_CLAIMER]: {
    310: "function setMultiVaultStatusBatch((address,address,bool)[])",
  },
  [AdapterType.MELLOW_WRAPPER]: {
    310: "function setVaultStatusBatch((address,bool)[])",
  },
  [AdapterType.PENDLE_ROUTER]: {
    310: "function setPairStatusBatch((address,address,address,uint8)[])",
  },
  [AdapterType.TRADERJOE_ROUTER]: {
    310: "function setPoolStatusBatch((address,address,uint256,uint8,bool)[])",
  },
  [AdapterType.UNISWAP_V2_ROUTER]: {
    310: "function setPairStatusBatch((address,address,bool)[])",
  },
  [AdapterType.UNISWAP_V3_ROUTER]: {
    310: "function setPoolStatusBatch((address,address,uint24,bool)[])",
  },
  [AdapterType.VELODROME_V2_ROUTER]: {
    310: "function setPoolStatusBatch((address,address,bool,address,bool)[])",
  },
} as const;

/**
 * Mapping of adapter types to their parsed ABIs
 */
export const adapterActionAbi: PartialRecord<AdapterType, VersionedAbi> =
  Object.fromEntries(
    Object.entries(adapterActionSignatures).map(
      ([adapterType, versionedSignature]) => [
        adapterType,
        Object.fromEntries(
          Object.entries(versionedSignature).map(([version, signature]) => [
            version,
            parseAbi([signature]),
          ]),
        ),
      ],
    ),
  );

/**
 * Mapping of function selectors to their corresponding adapter types and signatures
 */
export const adapterActionSelectors: Record<
  Hex,
  { signature: string; version: number; adapterType: string }
> = Object.fromEntries(
  Object.entries(adapterActionSignatures).flatMap(
    ([adapterType, versionedSignature]) =>
      Object.entries(versionedSignature).map(([version, signature]) => [
        toFunctionSelector(signature),
        { version: +version, signature, adapterType },
      ]),
  ),
);
