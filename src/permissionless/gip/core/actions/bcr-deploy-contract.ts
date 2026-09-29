import { type Address, type Hex, toBytes } from "viem";
import { z } from "zod";
import {
  BYTECODE_REPOSITORY,
  BytecodeRepositoryContract,
} from "../../../index.js";
import type { MarketState } from "../market-state/types.js";
import { bytes32IdSchema, nonZeroAddressSchema } from "../validation.js";
import type { MarketActions } from "./index.js";
import type { BaseMarketAction, MarketActionData } from "./types.js";

/**
 * Everything needed to rebuild the Bytecode Repository `deploy()` call, plus
 * the CREATE2 address it is expected to produce.
 *
 * @dev the deployed address is derived from the *caller* of `deploy()`. Every
 * transaction of a GIP is executed by `MarketConfigurator.admin()` (the
 * TimeLock), so {@link DeployContractParams.expectedAddress} must be derived
 * with the TimeLock as owner — see `core/rwa.ts`.
 */
export interface DeployContractParams {
  /** Bytecode Repository contract type, e.g. `ZAPPER::ERC4626_UNDERLYING`. */
  contractType: string;
  /** Contract version, e.g. `310`. */
  version: number;
  /** ABI-encoded constructor parameters. */
  constructorParams: Hex;
  /** CREATE2 salt. */
  salt: Hex;
  /** Address the deployment is expected to land on. */
  expectedAddress: Address;
}

export type DeployContractAction = BaseMarketAction<
  "BCR::deployContract",
  DeployContractParams
>;

export const deployContractParamsSchema = z.object({
  contractType: z
    .string()
    .min(1, "Contract type cannot be empty")
    .refine(
      value => toBytes(value).length <= 32,
      "Contract type must fit in bytes32",
    ),
  version: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  constructorParams: z
    .string()
    .regex(/^0x([a-fA-F0-9]{2})*$/, "Invalid ABI-encoded constructor params"),
  salt: bytes32IdSchema,
  expectedAddress: nonZeroAddressSchema,
});

export const deployContractActionData: MarketActionData<DeployContractAction> =
  {
    type: "BCR::deployContract",
    name: "Deploy contract",
    description:
      "Deploy a contract through the Bytecode Repository at its deterministic CREATE2 address. " +
      "The contract type, version, constructor params and salt fully determine the resulting address.",
    schema: deployContractParamsSchema,
    // @dev deploying a contract changes nothing in the market state; whatever
    // the contract is used for is expressed by the actions that follow it
    stateTransition: ({ state }: { state: MarketState }): MarketState => state,
    getRawTx: async ({ ctx, action }) => {
      const mc = ctx.marketConfigurator;
      const { params } = action;
      const addressProvider = await mc.getAddressProvider();
      const bytecodeRepository = new BytecodeRepositoryContract(
        await addressProvider.getAddressOrRevert(BYTECODE_REPOSITORY),
        mc.client,
      );

      // The TimeLock is the caller when the governance batch executes this
      // transaction, and BCR includes that caller in its CREATE2 derivation.
      const deployer = await mc.client.readContract({
        address: mc.address,
        abi: [
          {
            type: "function",
            inputs: [],
            name: "admin",
            outputs: [{ type: "address" }],
            stateMutability: "view",
          },
        ] as const,
        functionName: "admin",
      });
      const computedAddress = await bytecodeRepository.computeAddress({
        contractType: params.contractType,
        version: params.version,
        encodedParams: params.constructorParams,
        salt: params.salt,
        owner: deployer,
      });

      if (
        computedAddress.toLowerCase() !== params.expectedAddress.toLowerCase()
      ) {
        throw new Error(
          `BCR deployment address ${computedAddress} does not match expected address ${params.expectedAddress}`,
        );
      }

      const tx = bytecodeRepository.deployTx({
        contractType: params.contractType,
        version: BigInt(params.version),
        encodedParams: params.constructorParams,
        salt: params.salt,
      });

      return {
        tx: { tx, action, newContract: params.expectedAddress },
      };
    },
    // @dev `getRawTx` verifies that this address is derived from the persisted
    // deployment descriptor and the current TimeLock
    replace: (a, b) =>
      a.expectedAddress.toLowerCase() === b.expectedAddress.toLowerCase(),
  };

/**
 * Whether a deployment producing `expectedAddress` is already queued.
 *
 * Pass the actions of every market touched by the GIP: the Bytecode Repository
 * is global, so a deployment queued for one market also covers another.
 */
export function isContractDeploymentQueued(args: {
  expectedAddress: Address;
  actions: readonly MarketActions[];
}): boolean {
  const expected = args.expectedAddress.toLowerCase();
  return args.actions.some(
    action =>
      action.type === "BCR::deployContract" &&
      action.params.expectedAddress.toLowerCase() === expected,
  );
}
