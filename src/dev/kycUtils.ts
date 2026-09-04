import {
  type Address,
  type Hex,
  isAddressEqual,
  type PrivateKeyAccount,
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
  AddressSet,
  type GearboxChain,
  type ILogger,
  MAX_UINT256,
  OnchainSDK,
} from "../onchain/index.js";
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
  investor: Address;
  /**
   * Private key of the DS registry admin, signs the registry writes
   */
  adminPrivateKey?: Hex;
  /**
   * DS registry admin, impersonated on the fork when no private key is given
   */
  admin?: Address;
  /**
   * DSToken address
   */
  token: Address;
  logger?: ILogger;
}

interface SecuritizeAdminSigner {
  /**
   * Account to pass to the registry writes
   */
  account: Address | PrivateKeyAccount;
  release: () => Promise<void>;
}

/**
 * Resolves the account that performs the DS registry writes: either the admin
 * private key, or the admin address impersonated on the fork
 */
async function useSecuritizeAdmin(
  props: RegisterSecuritizeInvestorProps,
): Promise<SecuritizeAdminSigner> {
  const { anvil, adminPrivateKey, admin, logger } = props;
  if (adminPrivateKey) {
    return {
      account: privateKeyToAccount(adminPrivateKey),
      release: async () => {},
    };
  }
  if (!admin) {
    throw new Error(
      "securitize: either adminPrivateKey or admin address is required",
    );
  }
  await anvil.impersonateAccount({ address: admin });
  await anvil.setBalance({ address: admin, value: parseEther("100") });
  logger?.debug(`securitize: impersonating registry admin ${admin}`);
  return {
    account: admin,
    release: async () => {
      await anvil.stopImpersonatingAccount({ address: admin });
    },
  };
}

/**
 * Registers a wallet as a Securitize investor (fake KYC) in the DS registry
 * service of a DSToken.
 * Works both for MockDSToken and real DSToken connected by securitize-deploy script
 */
export async function registerSecuritizeInvestor(
  props: RegisterSecuritizeInvestorProps,
): Promise<void> {
  const { investor, anvil, token, logger } = props;

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
        args: [investor],
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
      `Investor ${investor} is not a registered wallet, registering...`,
    );
    const investorId = `investor-${investor.toLowerCase()}`;
    const investorExists = await anvil.readContract({
      address: registryService,
      abi: iDSRegistryServiceAbi,
      functionName: "isInvestor",
      args: [investorId],
    });
    const { account, release } = await useSecuritizeAdmin(props);
    try {
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
        args: [investor, investorId],
      });
      logger?.debug(`Added wallet ${investor} for investor "${investorId}"`);

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
    } finally {
      await release();
    }
  } else {
    logger?.debug(`Investor ${investor} is already a registered wallet`);
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
  investor: Address;
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
  const { anvil, investor, admin, logger } = props;

  const gateway = await findMidasGateway(props);
  await greenlistMidasGateway({ anvil, investor, admin, gateway, logger });
}

export interface GreenlistMidasGatewayProps {
  anvil: AnvilClient;
  /**
   * Investor EOA to greenlist
   */
  investor: Address;
  /**
   * Midas access control admin, impersonated on the fork
   * (MIDAS_ACL_ADMIN in periphery-v3/router-v3 foundry tests)
   */
  admin: Address;
  /**
   * Midas gateway address
   */
  gateway: Address;
  logger?: ILogger;
}

/**
 * Greenlists an investor in the access control of a single Midas gateway
 */
export async function greenlistMidasGateway(
  props: GreenlistMidasGatewayProps,
): Promise<void> {
  const { anvil, investor, admin, gateway, logger } = props;

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
    grants.push([operatorRole, admin], [greenlistedRole, investor]);
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
      args: [greenlistedRole, investor],
    });
    if (!isGreenlisted) {
      throw new Error(`midas: failed to greenlist investor ${investor}`);
    }
    logger?.debug(`midas: investor ${investor} is greenlisted`);
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

  const candidates = collectMidasGateways(sdk);
  if (candidates.length === 0) {
    throw new Error("no midas gateway adapters found in loaded markets");
  }

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

/**
 * Collects the target contracts of all Midas gateway adapters of the loaded
 * credit managers, same as the foundry tests do with
 * `ICreditConfiguratorV3.allowedAdapters`
 */
function collectMidasGateways(sdk: OnchainSDK): Address[] {
  const gateways = new AddressSet();
  for (const cm of sdk.marketRegister.creditManagers) {
    for (const adapter of cm.creditManager.adapters.values()) {
      if (adapter.contractType === "ADAPTER::MIDAS_GATEWAY") {
        gateways.add(adapter.targetContract);
      }
    }
  }
  return gateways.asArray();
}

export interface RegisterRWAInvestorProps {
  anvil: AnvilClient;
  /**
   * Attached SDK, markets and RWA factories are read from it
   */
  sdk: OnchainSDK;
  /**
   * Wallet to pass the KYC of every RWA token
   */
  investor: Address;
  /**
   * Private key of the Securitize registry admin, DSTokens are skipped when
   * neither this nor `securitizeAdmin` is set
   */
  adminPrivateKey?: Hex;
  /**
   * Securitize registry admin, impersonated on the fork
   */
  securitizeAdmin?: Address;
  /**
   * Override midas access control admin address
   */
  midasAdmin?: Address;
  logger?: ILogger;
}

export interface RWAKycFailure {
  /**
   * DSToken or Midas gateway that failed
   */
  target: Address;
  error: unknown;
}

export interface RegisterRWAInvestorResult {
  /**
   * DSTokens the investor was registered in
   */
  securitizeTokens: Address[];
  /**
   * Midas gateways the investor was greenlisted in
   */
  midasGateways: Address[];
  failed: RWAKycFailure[];
}

/**
 * Registers a wallet as an investor (fake KYC) in every Securitize DSToken and
 * every Midas gateway of the markets loaded by `sdk`.
 *
 * Failures of a single token or gateway are collected and reported in the
 * result instead of aborting the whole run.
 */
export async function registerRWAInvestor(
  props: RegisterRWAInvestorProps,
): Promise<RegisterRWAInvestorResult> {
  const {
    anvil,
    sdk,
    investor,
    adminPrivateKey,
    securitizeAdmin,
    midasAdmin = "0xd4195CF4df289a4748C1A7B6dDBE770e27bA1227",
    logger,
  } = props;

  const securitizeTokens: Address[] = [];
  const midasGateways: Address[] = [];
  const failed: RWAKycFailure[] = [];

  const dsTokens = new AddressSet(
    sdk.rwa.factories.flatMap(factory => factory.getTokens()),
  );
  if (adminPrivateKey || securitizeAdmin) {
    // sequential: every write mines a block on the same anvil
    for (const token of dsTokens) {
      try {
        await registerSecuritizeInvestor({
          anvil,
          investor: investor,
          adminPrivateKey,
          admin: securitizeAdmin,
          token,
          logger,
        });
        securitizeTokens.push(token);
      } catch (e) {
        logger?.error(`securitize: failed to register ${investor} in ${token}`);
        logger?.error(e);
        failed.push({ target: token, error: e });
      }
    }
  } else if (dsTokens.size > 0) {
    logger?.warn(
      `securitize: no registry admin, skipping ${dsTokens.size} DSToken(s)`,
    );
  }

  const gateways = collectMidasGateways(sdk);
  for (const gateway of gateways) {
    try {
      await greenlistMidasGateway({
        anvil,
        investor: investor,
        admin: midasAdmin,
        gateway,
        logger,
      });
      midasGateways.push(gateway);
    } catch (e) {
      logger?.error(`midas: failed to greenlist ${investor} in ${gateway}`);
      logger?.error(e);
      failed.push({ target: gateway, error: e });
    }
  }

  logger?.debug(
    `${investor} passed KYC on ${securitizeTokens.length} DSToken(s) and ${midasGateways.length} midas gateway(s), ${failed.length} failure(s)`,
  );
  return { securitizeTokens, midasGateways, failed };
}
