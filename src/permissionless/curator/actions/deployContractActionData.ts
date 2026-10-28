import { type Address, type Hex, toBytes } from "viem";
import { z } from "zod/v4";
import type { RawTx } from "../../../onchain/index.js";
import { BytecodeRepositoryContract } from "../../bindings/bytecode-repository.js";
import { BYTECODE_REPOSITORY } from "../../utils/literals.js";
import { isSameAddress, lowerAddress } from "../utils/addressUtils.js";
import { bytes32IdSchema, nonZeroAddressSchema } from "../validationSchemas.js";
import { actionError } from "./actionDiagnostics.js";
import type { BaseMarketAction } from "./actionTypes.js";
import {
  type PeripheryContractDomain,
  peripheryContractDomains,
} from "./addPeripheryContractActionData.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "./defineMarketAction.js";
import type { GipMarketAction } from "./types.js";
import { resource } from "./utils/actionKeys.js";
import { noOp } from "./utils/checkHelpers.js";

/**
 * Everything needed to rebuild the Bytecode Repository `deploy()` call, plus
 * the CREATE2 address it is expected to produce.
 *
 * @dev the deployed address is derived from the *caller* of `deploy()`. Every
 * transaction of a GIP is executed by `MarketConfigurator.admin()` (the
 * TimeLock), so {@link DeployContractParams.expectedAddress} must be derived
 * with the TimeLock as owner — see `rwaPeripherySetup.ts`.
 **/
export interface DeployContractParams {
  /**
   * Bytecode Repository contract type of a periphery contract, e.g.
   * `ZAPPER::ERC4626_UNDERLYING`; its prefix is the periphery domain.
   **/
  contractType: string;
  /** Contract version, e.g. `310`. **/
  version: number;
  /** ABI-encoded constructor parameters. **/
  constructorParams: Hex;
  /** CREATE2 salt. **/
  salt: Hex;
  /** Address the deployment is expected to land on. **/
  expectedAddress: Address;
}

export type DeployContractAction = BaseMarketAction<
  "BCR::deployContract",
  DeployContractParams
>;

/** Periphery domain of a contract type: `ZAPPER::ERC4626_UNDERLYING` → `ZAPPER`. **/
export function peripheryDomainOf(
  contractType: string,
): PeripheryContractDomain | undefined {
  const domain = contractType.split("::")[0];
  return (peripheryContractDomains as readonly string[]).includes(domain)
    ? (domain as PeripheryContractDomain)
    : undefined;
}

const deployContractParamsSchema = z.object({
  contractType: z
    .string()
    .min(1, "Contract type cannot be empty")
    .refine(
      value => toBytes(value).length <= 32,
      "Contract type must fit in bytes32",
    )
    .refine(
      value => peripheryDomainOf(value) !== undefined,
      `Only periphery contracts (${peripheryContractDomains.join(", ")}) are deployed by a GIP`,
    ),
  version: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  constructorParams: z
    .string()
    .regex(
      /^0x([a-fA-F0-9]{2})*$/,
      "Invalid ABI-encoded constructor params",
    ) as z.ZodType<Hex, string>,
  salt: bytes32IdSchema,
  expectedAddress: nonZeroAddressSchema,
});

/** The deployment call, the address it computes to, and what is there now. **/
export interface DeployContractResolution {
  tx: RawTx;
  /** CREATE2 address of the deployment for the current TimeLock. **/
  computedAddress: Address;
  /** Whether `expectedAddress` already holds code at the source block. **/
  alreadyDeployed: boolean;
}

export const deployContractActionData: MarketScopedDefinition<
  DeployContractAction,
  DeployContractResolution
> = defineMarketAction<DeployContractAction, DeployContractResolution>({
  type: "BCR::deployContract",
  // @dev depends on the size of the deployed contract's init code
  gas: () => 3_000_000,
  name: "Deploy contract",
  description:
    "Deploy a periphery contract of the market (a Degen NFT or a zapper) through the Bytecode Repository at its deterministic CREATE2 address. " +
    "The contract type, version, constructor params and salt fully determine the resulting address.",
  schema: deployContractParamsSchema,
  resolve: async ({ ctx, params }) => {
    const mc = ctx.marketConfigurator;
    const addressProvider = await mc.getAddressProvider();
    const bytecodeRepository = new BytecodeRepositoryContract(
      await addressProvider.getAddressOrRevert(BYTECODE_REPOSITORY),
      mc.client,
    );

    // The TimeLock is the caller when the governance batch executes this
    // transaction, and BCR includes that caller in its CREATE2 derivation.
    const deployer = await mc.contract.read.admin();
    const computedAddress = await bytecodeRepository.computeAddress({
      contractType: params.contractType,
      version: params.version,
      encodedParams: params.constructorParams,
      salt: params.salt,
      owner: deployer,
    });
    const code = await mc.client.getCode({ address: params.expectedAddress });

    const tx = bytecodeRepository.deployTx({
      contractType: params.contractType,
      version: BigInt(params.version),
      encodedParams: params.constructorParams,
      salt: params.salt,
    });
    return {
      tx,
      computedAddress,
      alreadyDeployed: code !== undefined && code !== "0x",
    };
  },
  check: ({ state, params, resolved }) => {
    const path = ["params", "expectedAddress"];
    if (!isSameAddress(resolved.computedAddress, params.expectedAddress)) {
      return [
        actionError(
          "EXPECTED_ADDRESS_MISMATCH",
          `The deployment lands on ${resolved.computedAddress}, not on ${params.expectedAddress}`,
          path,
        ),
      ];
    }
    // @dev a second CREATE2 deployment at the same address reverts
    if (resolved.alreadyDeployed) {
      return [
        actionError(
          "ALREADY_DEPLOYED",
          `${params.expectedAddress} is already deployed`,
          path,
        ),
      ];
    }
    return (state.periphery ?? []).some(entry =>
      isSameAddress(entry.address, params.expectedAddress),
    )
      ? [
          noOp(
            `${params.expectedAddress} is already deployed by this GIP`,
            path,
          ),
        ]
      : [];
  },
  apply: ({ state, params }) => ({
    ...state,
    periphery: [
      // @dev states persisted before periphery was tracked have no such field
      ...(state.periphery ?? []),
      {
        address: lowerAddress(params.expectedAddress),
        // `peripheryDomainOf` is checked by the schema
        domain: peripheryDomainOf(params.contractType) as string,
        type: params.contractType,
        version: params.version,
        status: "deployed",
      },
    ],
  }),
  encode: ({ resolved }) => resolved.tx,
  deployedContract: ({ params }) => params.expectedAddress,
  provides: params => [resource.contract(params.expectedAddress)],
  key: params => params.expectedAddress.toLowerCase(),
});

/**
 * Whether a deployment producing `expectedAddress` is already queued.
 *
 * Pass the actions of every market touched by the GIP: the Bytecode Repository
 * is global, so a deployment queued for one market also covers another.
 **/
export function isContractDeploymentQueued(args: {
  expectedAddress: Address;
  actions: readonly GipMarketAction[];
}): boolean {
  return args.actions.some(
    action =>
      action.type === "BCR::deployContract" &&
      isSameAddress(action.params.expectedAddress, args.expectedAddress),
  );
}
