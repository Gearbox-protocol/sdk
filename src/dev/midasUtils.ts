import type { Address } from "viem";
import { parseAbi, parseEther } from "viem";
import type { ILogger } from "../sdk/index.js";
import type { AnvilClient } from "./createAnvilClient.js";
import { writeAndWait } from "./kycUtils.js";

/**
 * Midas vaults inherit their own `Pausable`, whose global pause is guarded by
 * `pauseAdminRole()` in the vault's access control instead of `Ownable`
 */
const iMidasPausableVaultAbi = parseAbi([
  "function paused() external view returns (bool)",
  "function pause() external",
  "function unpause() external",
  "function pauseAdminRole() external view returns (bytes32)",
  "function accessControl() external view returns (address)",
]);

const iMidasAccessControlAbi = parseAbi([
  "function hasRole(bytes32 role, address account) external view returns (bool)",
  "function grantRole(bytes32 role, address account) external",
]);

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

/**
 * Unpauses a globally paused Midas issuance vault on an anvil fork, so that
 * `depositInstant` stops reverting with `Pausable: paused`, and returns a
 * callback that restores the original pause state.
 *
 * Impersonates `admin` and grants it `pauseAdminRole()` when missing, same as
 * `greenlistMidasGateway` does with the greenlist roles. The grant is not
 * reverted by the callback, only the pause state is.
 */
export async function unpauseMidasIssuanceVault(
  props: UnpauseMidasIssuanceVaultProps,
): Promise<RestoreMidasIssuanceVaultPause> {
  const { anvil, vault, admin, logger } = props;

  const paused = await anvil.readContract({
    address: vault,
    abi: iMidasPausableVaultAbi,
    functionName: "paused",
  });
  if (!paused) {
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
    `midas: unpausing issuance vault ${vault} as ${admin}, access control ${accessControl}, pause admin role ${pauseAdminRole}`,
  );

  await anvil.impersonateAccount({ address: admin });
  try {
    await anvil.setBalance({ address: admin, value: parseEther("100") });
    if (!isPauseAdmin) {
      await writeAndWait(anvil, {
        account: admin,
        chain: anvil.chain,
        address: accessControl,
        abi: iMidasAccessControlAbi,
        functionName: "grantRole",
        args: [pauseAdminRole, admin],
      });
      logger?.debug(`midas: granted pause admin role to ${admin}`);
    }
    await writeAndWait(anvil, {
      account: admin,
      chain: anvil.chain,
      address: vault,
      abi: iMidasPausableVaultAbi,
      functionName: "unpause",
    });
  } finally {
    await anvil.stopImpersonatingAccount({ address: admin });
  }

  let toRestore = true;
  return async () => {
    if (!toRestore) {
      return;
    }
    toRestore = false;
    logger?.debug(`midas: pausing issuance vault ${vault} back`);
    await anvil.impersonateAccount({ address: admin });
    try {
      await anvil.setBalance({ address: admin, value: parseEther("100") });
      await writeAndWait(anvil, {
        account: admin,
        chain: anvil.chain,
        address: vault,
        abi: iMidasPausableVaultAbi,
        functionName: "pause",
      });
    } catch (e) {
      // never mask the error that interrupted the bracketed work
      logger?.warn(`midas: failed to pause issuance vault ${vault} back: ${e}`);
    } finally {
      await anvil.stopImpersonatingAccount({ address: admin });
    }
  };
}
