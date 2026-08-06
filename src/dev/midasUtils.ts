import type { Address, PublicClient } from "viem";
import { encodeFunctionData, isAddressEqual, parseAbi, parseEther } from "viem";
import type {
  CreditSuite,
  IAdapterContract,
  ILogger,
  MultiCall,
} from "../sdk/index.js";
import type { AnvilClient } from "./createAnvilClient.js";
import { writeAndWait } from "./kycUtils.js";
import { midasGatewayAbi } from "./withdrawalAbi.js";

const ADAPTER_MIDAS_GATEWAY = "ADAPTER::MIDAS_GATEWAY";
const ADAPTER_MIDAS_ISSUANCE_VAULT = "ADAPTER::MIDAS_ISSUANCE_VAULT";

/**
 * Permissionless gateways have no greenlist and reject `receiveGreenlist`,
 * see MidasMode in integrations-v3
 */
const MIDAS_MODE_PERMISSIONLESS = 0;

/**
 * Gateways and issuance vaults both expose their mToken, but only on-chain:
 * without the adapters plugin the SDK represents adapters as placeholders that
 * expose nothing but their target contract
 */
const iMidasMTokenAbi = parseAbi([
  "function mToken() external view returns (address)",
]);

const iMidasGatewayAdapterExtAbi = parseAbi([
  "function receiveGreenlist() external returns (bool)",
]);

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

const receiveGreenlistCallData = encodeFunctionData({
  abi: iMidasGatewayAdapterExtAbi,
  functionName: "receiveGreenlist",
});

export interface PrependMidasReceiveGreenlistProps {
  /**
   * Credit manager the account is opened on
   */
  cm: CreditSuite;
  /**
   * Client to read gateway state with
   */
  client: PublicClient;
  /**
   * Calls to run in the credit facade multicall, as produced by the router
   */
  calls: MultiCall[];
  logger?: ILogger;
}

/**
 * Prepends `MidasGatewayAdapter.receiveGreenlist()` to a credit facade
 * multicall that mints an mToken through a Midas issuance vault.
 *
 * Permissioned and restricted-interface mTokens can only be held by greenlisted
 * accounts, and a freshly opened credit account is never greenlisted, so the
 * mint reverts with `WMAC: hasnt role` unless the account asks the gateway for
 * the greenlist first. Greenlisting the borrower (see `registerMidasInvestor`)
 * is not enough — the role is checked on the token holder, which is the credit
 * account.
 *
 * Returns `calls` unchanged when nothing has to be greenlisted: no issuance
 * vault is called, its mToken has no gateway adapter on this credit manager,
 * the gateway is permissionless, or the call is already there.
 */
export async function prependMidasReceiveGreenlist(
  props: PrependMidasReceiveGreenlistProps,
): Promise<MultiCall[]> {
  const { cm, client, calls, logger } = props;

  const gatewayAdapters: IAdapterContract[] = [];
  const issuanceAdapters: IAdapterContract[] = [];
  for (const adapter of cm.creditManager.adapters.values()) {
    switch (adapter.contractType) {
      case ADAPTER_MIDAS_GATEWAY:
        gatewayAdapters.push(adapter);
        break;
      case ADAPTER_MIDAS_ISSUANCE_VAULT:
        issuanceAdapters.push(adapter);
        break;
    }
  }
  if (gatewayAdapters.length === 0) {
    return calls;
  }
  const calledIssuanceAdapters = issuanceAdapters.filter(adapter =>
    calls.some(call => isAddressEqual(call.target, adapter.address)),
  );
  if (calledIssuanceAdapters.length === 0) {
    return calls;
  }

  const [gatewayMTokens, issuanceMTokens] = await Promise.all([
    readMTokens(client, gatewayAdapters),
    readMTokens(client, calledIssuanceAdapters),
  ]);

  // one gateway can back several issuance calls, and it only needs one greenlist
  const gateways: IAdapterContract[] = [];
  for (const [i, mToken] of issuanceMTokens.entries()) {
    const gateway = gatewayAdapters.find((_, j) =>
      isAddressEqual(gatewayMTokens[j], mToken),
    );
    if (!gateway) {
      logger?.debug(
        `midas: no gateway adapter for mToken ${mToken} minted by ${calledIssuanceAdapters[i].address} on ${cm.name}, cannot greenlist the credit account`,
      );
      continue;
    }
    if (gateways.some(g => isAddressEqual(g.address, gateway.address))) {
      continue;
    }
    if (
      calls.some(
        call =>
          isAddressEqual(call.target, gateway.address) &&
          call.callData === receiveGreenlistCallData,
      )
    ) {
      logger?.debug(
        `midas: gateway adapter ${gateway.address} already receives the greenlist`,
      );
      continue;
    }
    gateways.push(gateway);
  }
  if (gateways.length === 0) {
    return calls;
  }

  const modes = await client.multicall({
    allowFailure: false,
    contracts: gateways.map(({ targetContract }) => ({
      address: targetContract,
      abi: midasGatewayAbi,
      functionName: "mode" as const,
    })),
  });

  const prepended: MultiCall[] = [];
  for (const [i, gateway] of gateways.entries()) {
    if (modes[i] === MIDAS_MODE_PERMISSIONLESS) {
      logger?.debug(
        `midas: gateway ${gateway.targetContract} is permissionless, nothing to greenlist`,
      );
      continue;
    }
    logger?.debug(
      `midas: greenlisting the credit account via gateway adapter ${gateway.address}`,
    );
    prepended.push({
      target: gateway.address,
      callData: receiveGreenlistCallData,
    });
  }
  return prepended.length > 0 ? [...prepended, ...calls] : calls;
}

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

async function readMTokens(
  client: PublicClient,
  adapters: IAdapterContract[],
): Promise<Address[]> {
  return await client.multicall({
    allowFailure: false,
    contracts: adapters.map(({ targetContract }) => ({
      address: targetContract,
      abi: iMidasMTokenAbi,
      functionName: "mToken" as const,
    })),
  });
}
