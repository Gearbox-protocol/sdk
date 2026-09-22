import {
  type Address,
  erc20Abi,
  getAddress,
  type Hex,
  isAddressEqual,
  type PublicClient,
  parseAbi,
  parseEther,
  type Transport,
  zeroAddress,
} from "viem";
import { iDSTokenAbi } from "../abi/rwa/iDSToken.js";
import {
  AddressSet,
  type GearboxChain,
  type ILogger,
  OnchainSDK,
} from "../onchain/index.js";
import type { AnvilClient } from "./createAnvilClient.js";
import { getSecuritizeAdmin, registerSecuritizeInvestor } from "./kycUtils.js";

/**
 * `COMPLIANCE_CONFIGURATION_SERVICE` id in the DS protocol service registry
 */
const COMPLIANCE_CONFIGURATION_SERVICE = 256n;

const iDSComplianceConfigurationServiceAbi = parseAbi([
  "function getUSLockPeriod() external view returns (uint256)",
  "function getNonUSLockPeriod() external view returns (uint256)",
  "function setUSLockPeriod(uint256) external",
  "function setNonUSLockPeriod(uint256) external",
  "function getDisallowBackDating() external view returns (bool)",
  "function setDisallowBackDating(bool) external",
]);

interface ClaimDSTokenProps {
  anvil: AnvilClient;
  investor: Address;
  /**
   * DSToken addresses
   */
  token: Address;
  /**
   * USD amount without decimals
   */
  usdAmount?: string;
  marketConfigurators?: Address[];
  rwaFactories?: Address[];
  logger?: ILogger;
}

type ClaimDSTokensProps = Omit<ClaimDSTokenProps, "token"> & {
  tokens: Address[];
};

interface IssueDSTokensProps {
  anvil: AnvilClient;
  account: Address;
  token: Address;
  investor: Address;
  amount: bigint;
  logger?: ILogger;
}

export interface EnableDSTokenBackDatingProps {
  anvil: AnvilClient;
  /**
   * DSToken addresses whose compliance configuration should allow back-dating
   */
  tokens: Address[];
  logger?: ILogger;
}

interface ComplianceServiceAdmin {
  service: Address;
  admin: Address;
}

/**
 * Restores `disallowBackDating` to its previous value on every compliance
 * configuration service that was changed. Safe to call more than once.
 */
export type RestoreDSTokenBackDating = () => Promise<void>;

type GetComplianceConfigurationServicesProps = Pick<
  EnableDSTokenBackDatingProps,
  "anvil" | "tokens" | "logger"
>;

/**
 * Returns the longest of US and non-US compliance lock periods, or `undefined`
 * when the token has no compliance configuration service (e.g. MockDSToken)
 */
async function getLockPeriod({
  anvil,
  token,
  logger,
}: Omit<IssueDSTokensProps, "account" | "investor" | "amount">): Promise<
  bigint | undefined
> {
  try {
    const complianceConfiguration = await anvil.readContract({
      address: token,
      abi: iDSTokenAbi,
      functionName: "getDSService",
      args: [COMPLIANCE_CONFIGURATION_SERVICE],
    });
    if (isAddressEqual(complianceConfiguration, zeroAddress)) {
      return undefined;
    }
    const [usLockPeriod, nonUSLockPeriod] = await anvil.multicall({
      contracts: [
        {
          address: complianceConfiguration,
          abi: iDSComplianceConfigurationServiceAbi,
          functionName: "getUSLockPeriod",
        },
        {
          address: complianceConfiguration,
          abi: iDSComplianceConfigurationServiceAbi,
          functionName: "getNonUSLockPeriod",
        },
      ],
      allowFailure: false,
    });
    logger?.debug(
      `Lock periods: US ${usLockPeriod}, non-US ${nonUSLockPeriod} (compliance configuration service ${complianceConfiguration})`,
    );
    return usLockPeriod > nonUSLockPeriod ? usLockPeriod : nonUSLockPeriod;
  } catch (e) {
    logger?.debug(`Failed to get compliance lock periods: ${e}`);
    return undefined;
  }
}

/**
 * Issues tokens to investor via `issueTokensCustom` with issuance time that
 * bypasses compliance lock periods, falling back to plain `issueTokens` for
 * tokens that do not support it (e.g. MockDSToken)
 *
 * ACRED tokens do not have this lock, but STAC has
 */
async function issueDSTokens(props: IssueDSTokensProps): Promise<Hex> {
  const { anvil, account, token, investor, amount, logger } = props;
  const lockPeriod = await getLockPeriod(props);
  if (lockPeriod !== undefined) {
    const { timestamp } = await anvil.getBlock();
    const issuanceTime = timestamp - lockPeriod - 1n;
    try {
      const receipt = await anvil.writeContractSync({
        account,
        chain: anvil.chain,
        address: token,
        abi: iDSTokenAbi,
        functionName: "issueTokensCustom",
        args: [investor, amount, issuanceTime, 0n, "", 0n],
        throwOnReceiptRevert: true,
      });
      logger?.debug(
        { issuanceTime, investor, amount },
        "issueTokensCustom successful",
      );
      return receipt.transactionHash;
    } catch (e) {
      logger?.debug(`issueTokensCustom failed: ${e}`);
    }
  }
  logger?.debug({ investor, amount }, "Falling back to issueTokens");
  const receipt = await anvil.writeContractSync({
    account,
    chain: anvil.chain,
    address: token,
    abi: iDSTokenAbi,
    functionName: "issueTokens",
    args: [investor, amount],
    throwOnReceiptRevert: true,
  });
  return receipt.transactionHash;
}

/**
 * Resolves unique compliance configuration services of `tokens`: several
 * DSTokens can share one service, and it's the service that holds the flags.
 * Tokens without one (e.g. MockDSToken) are skipped
 */
async function getComplianceConfigurationServices({
  anvil,
  tokens,
  logger,
}: GetComplianceConfigurationServicesProps): Promise<ComplianceServiceAdmin[]> {
  const services = new Map<Address, Address>();
  for (const token of new AddressSet(tokens)) {
    try {
      const service = await anvil.readContract({
        address: token,
        abi: iDSTokenAbi,
        functionName: "getDSService",
        args: [COMPLIANCE_CONFIGURATION_SERVICE],
      });
      if (isAddressEqual(service, zeroAddress)) {
        logger?.debug(`${token} has no compliance configuration service`);
        continue;
      }
      const checksummed = getAddress(service);
      if (services.has(checksummed)) {
        continue;
      }
      services.set(checksummed, await getSecuritizeAdmin(anvil, token, logger));
    } catch (e) {
      logger?.debug(
        `Failed to get compliance configuration service of ${token}: ${e}`,
      );
    }
  }
  return [...services].map(([service, admin]) => ({ service, admin }));
}

/**
 * Sets `disallowBackDating` to false on compliance configuration services of
 * `tokens`, so that the issuance time passed to `issueTokensCustom` is
 * honoured: DS protocol silently replaces it with `block.timestamp` otherwise,
 * and freshly minted tokens stay under lock-up.
 *
 * Impersonates the DS trust-service admin of each token. Ownable `owner()` of
 * the compliance configuration service alone is not enough.
 *
 * The flag is only read while tokens are issued, so restoring it does not
 * re-lock tokens minted in the meantime.
 */
export async function enableDSTokenBackDating(
  props: EnableDSTokenBackDatingProps,
): Promise<RestoreDSTokenBackDating> {
  const { anvil, logger } = props;
  const services = await getComplianceConfigurationServices(props);

  let toRestore: ComplianceServiceAdmin[] = [];
  for (const { service, admin } of services) {
    let disallowBackDating: boolean;
    try {
      disallowBackDating = await anvil.readContract({
        address: service,
        abi: iDSComplianceConfigurationServiceAbi,
        functionName: "getDisallowBackDating",
      });
    } catch (e) {
      logger?.debug(`Failed to read disallowBackDating of ${service}: ${e}`);
      continue;
    }
    if (!disallowBackDating) {
      logger?.debug(`Back-dating is already allowed by ${service}`);
      continue;
    }
    logger?.info(`Allowing back-dating on ${service}`);
    await anvil.impersonateAccount({ address: admin });
    try {
      await anvil.setBalance({ address: admin, value: parseEther("100") });
      await anvil.writeContractSync({
        account: admin,
        chain: anvil.chain,
        address: service,
        abi: iDSComplianceConfigurationServiceAbi,
        functionName: "setDisallowBackDating",
        args: [false],
        throwOnReceiptRevert: true,
      });
    } finally {
      await anvil.stopImpersonatingAccount({ address: admin });
    }
    toRestore.push({ service, admin });
  }

  return async () => {
    const services = toRestore;
    toRestore = [];
    for (const { service, admin } of services) {
      logger?.info(`Disallowing back-dating on ${service}`);
      try {
        await anvil.impersonateAccount({ address: admin });
        try {
          await anvil.setBalance({ address: admin, value: parseEther("100") });
          await anvil.writeContractSync({
            account: admin,
            chain: anvil.chain,
            address: service,
            abi: iDSComplianceConfigurationServiceAbi,
            functionName: "setDisallowBackDating",
            args: [true],
            throwOnReceiptRevert: true,
          });
        } finally {
          await anvil.stopImpersonatingAccount({ address: admin });
        }
      } catch (e) {
        // never mask the error that interrupted the bracketed work
        logger?.warn(
          `Failed to restore disallowBackDating on ${service}: ${e}`,
        );
      }
    }
  };
}

export async function claimDSToken(props: ClaimDSTokenProps): Promise<void> {
  const {
    anvil,
    investor,
    token,
    marketConfigurators,
    rwaFactories,
    usdAmount: usdAmountProp = "100000",
  } = props;

  const symbol = await anvil.readContract({
    address: token,
    abi: erc20Abi,
    functionName: "symbol",
    args: [],
  });
  const logger = props.logger?.child?.({ symbol });

  const usdAmount = BigInt(usdAmountProp) * 10n ** 8n;
  const sdk = new OnchainSDK((anvil.chain as GearboxChain).network, {
    client: anvil as unknown as PublicClient<Transport, GearboxChain>,
    timeout: 120_000,
  });
  await sdk.attach({ marketConfigurators, rwaFactories });
  let amount = 0n;
  for (const market of sdk.marketRegister.markets) {
    try {
      amount = market.priceOracle.convertFromUSD(token, usdAmount);
    } catch {}
  }
  if (amount === 0n) {
    throw new Error(`No market found for token ${token}`);
  }
  logger?.debug(`${usdAmountProp} USD === ${amount} ${symbol}`);

  await registerSecuritizeInvestor({ anvil, investor, token, logger });

  const admin = await getSecuritizeAdmin(anvil, token, logger);
  logger?.debug(`Issuing ${amount} tokens to ${investor}...`);
  await anvil.impersonateAccount({ address: admin });
  let mintHash: Hex;
  try {
    await anvil.setBalance({ address: admin, value: parseEther("100") });
    mintHash = await issueDSTokens({
      anvil,
      account: admin,
      token,
      investor,
      amount,
      logger,
    });
  } finally {
    await anvil.stopImpersonatingAccount({ address: admin });
  }
  logger?.debug(`Done! tx: ${mintHash}`);
  const balance = await anvil.readContract({
    address: token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [investor],
  });
  logger?.debug(
    `Balance of ${investor}: ${sdk.tokensMeta.formatBN(token, balance)}`,
  );
}

/**
 * Helper function to claim DSToken from the faucet.
 * Works both for MockDStoken and real DSToken connected by securitize-deploy script
 * @param forkStatus
 * @param publicClient
 * @param investor
 * @returns
 */
export async function claimDSTokens(props: ClaimDSTokensProps): Promise<void> {
  const { tokens, ...rest } = props;
  for (const token of tokens) {
    await claimDSToken({ ...rest, token });
  }
}
