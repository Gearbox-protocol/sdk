import type { Address } from "viem";
import { getContract, hexToString } from "viem";
import { z } from "zod/v4";
import { iBytecodeRepositoryAbi } from "../../../abi/310/iBytecodeRepository.js";
import { iVersionAbi } from "../../../abi/iVersion.js";
import { type PeripheryState, peripheryStatus } from "../state/market/types.js";
import { isSameAddress, lowerAddress } from "../utils/addressUtils.js";
import { addressSchema } from "../validationSchemas.js";
import { actionError, incompleteCheck } from "./actionDiagnostics.js";
import type { BaseMarketAction } from "./actionTypes.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "./defineMarketAction.js";
import { resource } from "./utils/actionKeys.js";
import { contractRejected, readChain } from "./utils/chainReads.js";
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

export interface PeripheryResolution {
  repositoryEligible?: boolean;
  invalidContractType?: boolean;
  contractType?: string;
  version?: number;
}

export const addPeripheryContractActionData: MarketScopedDefinition<
  AddPeripheryContractAction,
  PeripheryResolution
> = defineMarketAction<AddPeripheryContractAction, PeripheryResolution>({
  type: "MARKET::addPeripheryContract",
  gas: () => 120_000,
  description:
    "Register a periphery contract (Degen NFT or Zapper) with the market configurator so it appears in periphery state.",
  schema: z.object({
    peripheryContract: addressSchema,
    domain: z.enum(peripheryContractDomains),
    type: z.string(),
  }),
  resolve: async ({ ctx, params }) => {
    const repository = await readChain(() =>
      ctx.marketConfigurator.contract.read.bytecodeRepository(),
    );
    const contract = getContract({
      address: params.peripheryContract,
      abi: iVersionAbi,
      client: ctx.client,
    });
    const [eligible, type, version] = await Promise.all([
      repository.value
        ? readChain(() =>
            ctx.client.readContract({
              address: repository.value!,
              abi: iBytecodeRepositoryAbi,
              functionName: "isDeployedFromRepository",
              args: [params.peripheryContract],
            }),
          )
        : undefined,
      readChain(() => contract.read.contractType()),
      readChain(() => contract.read.version()),
    ]);
    return {
      repositoryEligible: eligible?.value,
      invalidContractType: contractRejected(type),
      contractType: type.value
        ? hexToString(type.value, { size: 32 }).replace(/\0+$/, "")
        : undefined,
      version: version.value === undefined ? undefined : Number(version.value),
    };
  },
  check: ({ state, params, resolved }) => {
    const known = state.periphery?.find(entry =>
      isSameAddress(entry.address, params.peripheryContract),
    );
    if (!known && resolved.invalidContractType)
      return [
        actionError(
          "INVALID_PERIPHERY_CONTRACT",
          "Periphery contractType() must return a valid bytes32 contract type",
        ),
      ];
    const type = resolved.contractType || known?.type;
    const domain = type?.split("::")[0] ?? known?.domain;
    if (
      (domain && domain !== params.domain) ||
      (type && params.type && type !== params.type)
    )
      return [
        actionError(
          "PERIPHERY_TYPE_MISMATCH",
          "Periphery domain/type must match the contract's actual contractType()",
        ),
      ];
    if (!known && resolved.repositoryEligible === false)
      return [
        actionError(
          "PERIPHERY_NOT_FROM_REPOSITORY",
          "Periphery must be deployed through the Bytecode Repository",
        ),
      ];
    return known && peripheryStatus(known) === "registered"
      ? [
          noOp(
            `${params.peripheryContract} is already registered as ${params.domain}`,
            ["params", "peripheryContract"],
          ),
        ]
      : !known && (resolved.repositoryEligible === undefined || !type)
        ? [
            incompleteCheck(
              "peripheryProvenance",
              "Repository eligibility or contract type could not be read",
            ),
          ]
        : [];
  },
  apply: ({ state, params, resolved }) => {
    const periphery = state.periphery ?? [];
    const existing = periphery.find(entry =>
      isSameAddress(entry.address, params.peripheryContract),
    );
    const registered: PeripheryState = {
      address: lowerAddress(params.peripheryContract),
      domain: params.domain,
      type: resolved.contractType || existing?.type || params.type,
      version: resolved.version ?? existing?.version ?? 0,
      status: "registered",
    };
    return {
      ...state,
      periphery: existing
        ? periphery.map(entry => (entry === existing ? registered : entry))
        : [...periphery, registered],
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
