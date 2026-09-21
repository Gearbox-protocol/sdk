import type { Address } from "viem";
import { parseAbi, toFunctionSelector } from "viem";
import {
  AddressSet,
  type ILogger,
  MidasGatewayAdapterContract,
  type OnchainSDK,
} from "../onchain/index.js";
import { type AnvilClient, withImpersonation } from "./createAnvilClient.js";

/**
 * Midas vaults inherit their own `Pausable`, whose global pause is guarded by
 * `pauseAdminRole()` in the vault's access control instead of `Ownable`
 */
const iMidasPausableVaultAbi = parseAbi([
  "function paused() external view returns (bool)",
  "function pause() external",
  "function unpause() external",
  "function fnPaused(bytes4 fn) external view returns (bool)",
  "function pauseFn(bytes4 fn) external",
  "function unpauseFn(bytes4 fn) external",
  "function pauseAdminRole() external view returns (bytes32)",
  "function accessControl() external view returns (address)",
]);

const iMidasAccessControlAbi = parseAbi([
  "function hasRole(bytes32 role, address account) external view returns (bool)",
  "function grantRole(bytes32 role, address account) external",
]);

/**
 * Selector for `DepositVault.depositInstant(address,uint256,uint256,bytes32)`,
 * the 4-arg mint Gearbox adapters encode. Distinct from the custom-recipient
 * overload.
 */
const DEPOSIT_INSTANT_SELECTOR = toFunctionSelector(
  "depositInstant(address,uint256,uint256,bytes32)",
);

export interface UnpauseMidasIssuanceVaultProps {
  anvil: AnvilClient;
  /**
   * Midas issuance vault (deposit vault) to unpause
   */
  vault: Address;
  /**
   * Midas access control admin, impersonated on the fork
   * (MIDAS_ACL_ADMIN in periphery-v3/router-v3 foundry tests)
   */
  admin: Address;
  logger?: ILogger;
}

/**
 * Pauses the vault back when it was unpaused by `unpauseMidasIssuanceVault`,
 * and does nothing otherwise. Safe to call more than once.
 */
export type RestoreMidasIssuanceVaultPause = () => Promise<void>;

interface MidasPauseChanges {
  global: boolean;
  depositInstant: boolean;
}

async function restoreMidasIssuanceVaultPause(
  { anvil, vault, admin, logger }: UnpauseMidasIssuanceVaultProps,
  changes: MidasPauseChanges,
): Promise<void> {
  if (!changes.global && !changes.depositInstant) return;

  const failures: unknown[] = [];
  try {
    await withImpersonation(anvil, admin, async () => {
      // Restore in reverse order of setup and attempt both layers even if the
      // first write fails.
      if (changes.depositInstant) {
        try {
          await anvil.writeContractSync({
            account: admin,
            chain: anvil.chain,
            address: vault,
            abi: iMidasPausableVaultAbi,
            functionName: "pauseFn",
            args: [DEPOSIT_INSTANT_SELECTOR],
            throwOnReceiptRevert: true,
          });
        } catch (error) {
          failures.push(
            new Error(`failed to restore depositInstant pause on ${vault}`, {
              cause: error,
            }),
          );
        }
      }
      if (changes.global) {
        try {
          await anvil.writeContractSync({
            account: admin,
            chain: anvil.chain,
            address: vault,
            abi: iMidasPausableVaultAbi,
            functionName: "pause",
            throwOnReceiptRevert: true,
          });
        } catch (error) {
          failures.push(
            new Error(`failed to restore global pause on ${vault}`, {
              cause: error,
            }),
          );
        }
      }
    });
  } catch (error) {
    failures.push(
      new Error(`failed to act as pause admin ${admin} during restoration`, {
        cause: error,
      }),
    );
  }

  if (failures.length > 0) {
    throw new AggregateError(
      failures,
      `failed to restore issuance-vault pause state for ${vault}`,
    );
  }
  logger?.debug(`midas: restored issuance vault ${vault} pause state`);
}

/**
 * Unpauses a Midas issuance vault on an anvil fork so that `depositInstant`
 * stops reverting with `Pausable: paused` (global) or `Pausable: fn paused`
 * (per-selector), and returns a callback that restores the original pause
 * state of each layer that was cleared.
 *
 * Impersonates `admin` and grants it `pauseAdminRole()` when missing, same as
 * `greenlistMidasGateway` does with the greenlist roles. The grant is not
 * reverted by the callback, only the pause state is.
 */
export async function unpauseMidasIssuanceVault(
  props: UnpauseMidasIssuanceVaultProps,
): Promise<RestoreMidasIssuanceVaultPause> {
  const { anvil, vault, admin, logger } = props;

  const [paused, depositInstantPaused] = await anvil.multicall({
    allowFailure: false,
    contracts: [
      {
        address: vault,
        abi: iMidasPausableVaultAbi,
        functionName: "paused" as const,
      },
      {
        address: vault,
        abi: iMidasPausableVaultAbi,
        functionName: "fnPaused" as const,
        args: [DEPOSIT_INSTANT_SELECTOR] as const,
      },
    ],
  });
  if (!paused && !depositInstantPaused) {
    logger?.debug(`midas: issuance vault ${vault} is not paused`);
    return async () => {};
  }

  const [accessControl, pauseAdminRole] = await anvil.multicall({
    allowFailure: false,
    contracts: [
      {
        address: vault,
        abi: iMidasPausableVaultAbi,
        functionName: "accessControl" as const,
      },
      {
        address: vault,
        abi: iMidasPausableVaultAbi,
        functionName: "pauseAdminRole" as const,
      },
    ],
  });
  const isPauseAdmin = await anvil.readContract({
    address: accessControl,
    abi: iMidasAccessControlAbi,
    functionName: "hasRole",
    args: [pauseAdminRole, admin],
  });
  logger?.debug(
    `midas: unpausing issuance vault ${vault} as ${admin}, access control ${accessControl}, pause admin role ${pauseAdminRole}` +
      (paused ? ", global" : "") +
      (depositInstantPaused ? ", depositInstant" : ""),
  );

  const changes: MidasPauseChanges = {
    global: false,
    depositInstant: false,
  };
  try {
    await withImpersonation(anvil, admin, async () => {
      if (!isPauseAdmin) {
        await anvil.writeContractSync({
          account: admin,
          chain: anvil.chain,
          address: accessControl,
          abi: iMidasAccessControlAbi,
          functionName: "grantRole",
          args: [pauseAdminRole, admin],
          throwOnReceiptRevert: true,
        });
        logger?.debug(`midas: granted pause admin role to ${admin}`);
      }
      if (paused) {
        await anvil.writeContractSync({
          account: admin,
          chain: anvil.chain,
          address: vault,
          abi: iMidasPausableVaultAbi,
          functionName: "unpause",
          throwOnReceiptRevert: true,
        });
        changes.global = true;
      }
      if (depositInstantPaused) {
        await anvil.writeContractSync({
          account: admin,
          chain: anvil.chain,
          address: vault,
          abi: iMidasPausableVaultAbi,
          functionName: "unpauseFn",
          args: [DEPOSIT_INSTANT_SELECTOR],
          throwOnReceiptRevert: true,
        });
        changes.depositInstant = true;
      }
    });
  } catch (error) {
    const setupError = new Error(`failed to unpause issuance vault ${vault}`, {
      cause: error,
    });
    try {
      await restoreMidasIssuanceVaultPause(props, changes);
    } catch (cleanupError) {
      throw new AggregateError(
        [setupError, cleanupError],
        `failed to set up and restore issuance vault ${vault}`,
        { cause: setupError },
      );
    }
    throw setupError;
  }

  let toRestore = true;
  return async () => {
    if (!toRestore) {
      return;
    }
    toRestore = false;
    logger?.debug(`midas: pausing issuance vault ${vault} back`);
    await restoreMidasIssuanceVaultPause(props, changes);
  };
}

function* midasGatewayAdapters(
  sdk: OnchainSDK,
): Generator<MidasGatewayAdapterContract> {
  for (const cm of sdk.marketRegister.creditManagers) {
    for (const adapter of cm.creditManager.adapters.values()) {
      if (adapter instanceof MidasGatewayAdapterContract) {
        yield adapter;
      }
    }
  }
}

/**
 * Target contracts of all Midas gateway adapters of the loaded credit managers,
 * same as the foundry tests do with `ICreditConfiguratorV3.allowedAdapters`
 */
export function collectMidasGateways(sdk: OnchainSDK): Address[] {
  const gateways = new AddressSet();
  for (const adapter of midasGatewayAdapters(sdk)) {
    gateways.add(adapter.targetContract);
  }
  return gateways.asArray();
}

/**
 * mTokens of all Midas gateway adapters of the loaded credit managers
 */
export function collectMidasMTokens(sdk: OnchainSDK): Address[] {
  const mTokens = new AddressSet();
  for (const adapter of midasGatewayAdapters(sdk)) {
    mTokens.add(adapter.mToken);
  }
  return mTokens.asArray();
}
