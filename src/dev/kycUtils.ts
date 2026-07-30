import {
  type Address,
  type Hex,
  isAddressEqual,
  type PublicClient,
  parseAbi,
  parseEther,
  type Transport,
  zeroAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { iDSRegistryServiceAbi } from "../abi/rwa/iDSRegistryService.js";
import { iDSTokenAbi } from "../abi/rwa/iDSToken.js";
import {
  type GearboxChain,
  type ILogger,
  MAX_UINT256,
  OnchainSDK,
} from "../sdk/index.js";
import type { AnvilClient } from "./createAnvilClient.js";
import { midasGatewayAbi } from "./withdrawalAbi.js";

/**
 * Writes to a contract, mines a block and waits for the receipt
 */
export async function writeAndWait(
  anvil: AnvilClient,
  params: Parameters<AnvilClient["writeContract"]>[0],
): Promise<Hex> {
  const hash = await anvil.writeContract(params);
  await anvil.mine({ blocks: 1 });
  await anvil.waitForTransactionReceipt({
    hash,
    pollingInterval: 100,
  });
  return hash;
}

export interface RegisterSecuritizeInvestorProps {
  anvil: AnvilClient;
  /**
   * Wallet to register in the Securitize DS registry
   */
  claimer: Address;
  adminPrivateKey: Hex;
  /**
   * DSToken address
   */
  token: Address;
  logger?: ILogger;
}

/**
 * Registers a wallet as a Securitize investor (fake KYC) in the DS registry
 * service of a DSToken.
 * Works both for MockDSToken and real DSToken connected by securitize-deploy script
 */
export async function registerSecuritizeInvestor(
  props: RegisterSecuritizeInvestorProps,
): Promise<void> {
  const { claimer, anvil, token, adminPrivateKey, logger } = props;
  const account = privateKeyToAccount(adminPrivateKey);

  const registryServiceId = await anvil.readContract({
    address: token,
    abi: iDSTokenAbi,
    functionName: "REGISTRY_SERVICE",
  });

  const registryService = await anvil.readContract({
    address: token,
    abi: iDSTokenAbi,
    functionName: "getDSService",
    args: [registryServiceId],
  });
  logger?.debug(`Registry service: ${registryService} (${registryServiceId})`);
  const [isRegistered, ACCREDITED, APPROVED] = await anvil.multicall({
    contracts: [
      {
        address: registryService,
        abi: iDSRegistryServiceAbi,
        functionName: "isWallet",
        args: [claimer],
      },
      {
        address: registryService,
        abi: iDSRegistryServiceAbi,
        functionName: "ACCREDITED",
        args: [],
      },
      {
        address: registryService,
        abi: iDSRegistryServiceAbi,
        functionName: "APPROVED",
        args: [],
      },
    ],
    allowFailure: false,
  });
  if (!isRegistered) {
    logger?.debug(
      `Claimer ${claimer} is not a registered wallet, registering...`,
    );
    const investorId = `investor-${claimer.toLowerCase()}`;
    const investorExists = await anvil.readContract({
      address: registryService,
      abi: iDSRegistryServiceAbi,
      functionName: "isInvestor",
      args: [investorId],
    });
    if (!investorExists) {
      await writeAndWait(anvil, {
        account,
        chain: anvil.chain,
        address: registryService,
        abi: iDSRegistryServiceAbi,
        functionName: "registerInvestor",
        args: [investorId, investorId],
      });
      logger?.debug(`Registered investor "${investorId}"`);
    }
    await writeAndWait(anvil, {
      account,
      chain: anvil.chain,
      address: registryService,
      abi: iDSRegistryServiceAbi,
      functionName: "addWallet",
      args: [claimer, investorId],
    });
    logger?.debug(`Added wallet ${claimer} for investor "${investorId}"`);

    try {
      await writeAndWait(anvil, {
        account,
        chain: anvil.chain,
        address: registryService,
        abi: iDSRegistryServiceAbi,
        functionName: "setCountry",
        args: [investorId, "US"],
      });
      logger?.debug(`Set country for investor "${investorId}" to "US"`);

      await writeAndWait(anvil, {
        account,
        chain: anvil.chain,
        address: registryService,
        abi: iDSRegistryServiceAbi,
        functionName: "setAttribute",
        args: [
          investorId,
          ACCREDITED,
          BigInt(APPROVED),
          MAX_UINT256,
          "fake proof",
        ],
      });
      logger?.debug(`Set attributes for investor "${investorId}"`);
    } catch (e) {
      // is not implemented on mock tokens
      logger?.error(e);
    }
  } else {
    logger?.debug(`Claimer ${claimer} is already a registered wallet`);
  }
}

/**
 * Access mode of a Midas gateway, see MidasMode in integrations-v3
 */
const MIDAS_MODE_PERMISSIONED = 2;

/**
 * Functions of the Midas gateway that are not declared in the ABI extracted
 * from integrations-v3 forge artifacts
 */
const iMidasGatewayExtAbi = parseAbi([
  "function greenlistedRole() external view returns (bytes32)",
]);

const iMidasAccessControlAbi = parseAbi([
  "function hasRole(bytes32 role, address account) external view returns (bool)",
  "function getRoleAdmin(bytes32 role) external view returns (bytes32)",
  "function grantRole(bytes32 role, address account) external",
]);

export interface RegisterMidasInvestorProps {
  anvil: AnvilClient;
  /**
   * Investor EOA to greenlist
   */
  claimer: Address;
  /**
   * Midas access control admin, impersonated on the fork
   * (MIDAS_ACL_ADMIN in periphery-v3/router-v3 foundry tests)
   */
  admin: Address;
  /**
   * mToken address, the gateway is resolved from it
   */
  token: Address;
  /**
   * Attached SDK, created from `anvil` when omitted
   */
  sdk?: OnchainSDK;
  marketConfigurators?: Address[];
  logger?: ILogger;
}

/**
 * Greenlists an investor in Midas access control (fake KYC) on an anvil fork.
 *
 * Replicates the `_grantGreenlistAdmin` / `_grantGreenlist` logic from the
 * foundry tests (periphery-v3's WithdrawalCompressorMidasRWA.t.sol and
 * router-v3's RouterLiveTestMidas.sol) by impersonating the Midas access
 * control admin instead of pranking it.
 */
export async function registerMidasInvestor(
  props: RegisterMidasInvestorProps,
): Promise<void> {
  const { anvil, claimer, admin, logger } = props;

  const gateway = await findMidasGateway(props);
  const [accessControl, mode, greenlistedRole] = await anvil.multicall({
    allowFailure: false,
    contracts: [
      {
        address: gateway,
        abi: midasGatewayAbi,
        functionName: "accessControl",
      },
      {
        address: gateway,
        abi: midasGatewayAbi,
        functionName: "mode",
      },
      {
        address: gateway,
        abi: iMidasGatewayExtAbi,
        functionName: "greenlistedRole",
      },
    ],
  });
  if (isAddressEqual(accessControl, zeroAddress)) {
    logger?.debug(
      `midas: gateway ${gateway} is permissionless, nothing to greenlist`,
    );
    return;
  }

  const operatorRole = await anvil.readContract({
    address: accessControl,
    abi: iMidasAccessControlAbi,
    functionName: "getRoleAdmin",
    args: [greenlistedRole],
  });
  logger?.debug(
    `midas: gateway ${gateway}, access control ${accessControl}, mode ${mode}, greenlisted role ${greenlistedRole}, operator role ${operatorRole}`,
  );

  // the gateway grants the greenlist to credit accounts and redeemers itself,
  // it needs the operator role in every non-permissionless mode
  const grants: [Hex, Address][] = [[operatorRole, gateway]];
  if (mode === MIDAS_MODE_PERMISSIONED) {
    // admin holds the admin role of the operator role, but must hold the
    // operator role itself to grant the greenlist
    grants.push([operatorRole, admin], [greenlistedRole, claimer]);
  } else {
    logger?.debug(
      `midas: gateway ${gateway} does not require greenlisted borrowers, only granting the operator role to the gateway`,
    );
  }

  const granted = await anvil.multicall({
    allowFailure: false,
    contracts: grants.map(([role, account]) => ({
      address: accessControl,
      abi: iMidasAccessControlAbi,
      functionName: "hasRole" as const,
      args: [role, account] as const,
    })),
  });

  await anvil.impersonateAccount({ address: admin });
  try {
    await anvil.setBalance({ address: admin, value: parseEther("100") });
    for (const [i, [role, account]] of grants.entries()) {
      if (granted[i]) {
        logger?.debug(`midas: ${account} already has role ${role}`);
        continue;
      }
      await writeAndWait(anvil, {
        account: admin,
        chain: anvil.chain,
        address: accessControl,
        abi: iMidasAccessControlAbi,
        functionName: "grantRole",
        args: [role, account],
      });
      logger?.debug(`midas: granted role ${role} to ${account}`);
    }
  } finally {
    await anvil.stopImpersonatingAccount({ address: admin });
  }

  if (mode === MIDAS_MODE_PERMISSIONED) {
    const isGreenlisted = await anvil.readContract({
      address: accessControl,
      abi: iMidasAccessControlAbi,
      functionName: "hasRole",
      args: [greenlistedRole, claimer],
    });
    if (!isGreenlisted) {
      throw new Error(`midas: failed to greenlist claimer ${claimer}`);
    }
    logger?.debug(`midas: claimer ${claimer} is greenlisted`);
  }
}

/**
 * Finds the Midas gateway that issues `token` by scanning the Midas gateway
 * adapters of all loaded credit managers, same as the foundry tests do with
 * `ICreditConfiguratorV3.allowedAdapters`
 */
async function findMidasGateway(
  props: RegisterMidasInvestorProps,
): Promise<Address> {
  const { anvil, token, marketConfigurators, logger } = props;

  let sdk = props.sdk;
  if (!sdk) {
    sdk = new OnchainSDK((anvil.chain as GearboxChain).network, {
      client: anvil as unknown as PublicClient<Transport, GearboxChain>,
      timeout: 120_000,
    });
    await sdk.attach({ marketConfigurators });
  }

  const gateways = new Set<Address>();
  for (const cm of sdk.marketRegister.creditManagers) {
    for (const adapter of cm.creditManager.adapters.values()) {
      if (adapter.contractType === "ADAPTER::MIDAS_GATEWAY") {
        gateways.add(adapter.targetContract);
      }
    }
  }
  if (gateways.size === 0) {
    throw new Error("no midas gateway adapters found in loaded markets");
  }

  const candidates = Array.from(gateways);
  const mTokens = await anvil.multicall({
    allowFailure: false,
    contracts: candidates.map(address => ({
      address,
      abi: midasGatewayAbi,
      functionName: "mToken" as const,
    })),
  });
  const index = mTokens.findIndex(mToken => isAddressEqual(mToken, token));
  if (index === -1) {
    throw new Error(`no midas gateway found for token ${token}`);
  }
  logger?.debug(`midas: gateway for ${token} is ${candidates[index]}`);
  return candidates[index];
}
