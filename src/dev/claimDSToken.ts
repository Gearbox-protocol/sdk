import {
  type Address,
  erc20Abi,
  type Hex,
  isAddressEqual,
  type PrivateKeyAccount,
  type PublicClient,
  parseAbi,
  type Transport,
  zeroAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { iDSTokenAbi } from "../abi/rwa/iDSToken.js";
import { type GearboxChain, type ILogger, OnchainSDK } from "../sdk/index.js";
import type { AnvilClient } from "./createAnvilClient.js";
import { registerSecuritizeInvestor, writeAndWait } from "./kycUtils.js";

/**
 * `COMPLIANCE_CONFIGURATION_SERVICE` id in the DS protocol service registry
 */
const COMPLIANCE_CONFIGURATION_SERVICE = 256n;

const iDSComplianceConfigurationServiceAbi = parseAbi([
  "function getUSLockPeriod() external view returns (uint256)",
  "function getNonUSLockPeriod() external view returns (uint256)",
]);

interface ClaimDSTokenProps {
  anvil: AnvilClient;
  investor: Address;
  adminPrivateKey: Hex;
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
  account: PrivateKeyAccount;
  token: Address;
  investor: Address;
  amount: bigint;
  logger?: ILogger;
}

/**
 * Returns issuance time that is old enough for the issued tokens to be past
 * both US and non-US compliance lock periods, or `undefined` when the token
 * has no compliance configuration service (e.g. MockDSToken)
 */
async function getUnlockedIssuanceTime({
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
    const lockPeriod =
      usLockPeriod > nonUSLockPeriod ? usLockPeriod : nonUSLockPeriod;
    const { timestamp } = await anvil.getBlock();
    logger?.debug(
      `Lock periods: US ${usLockPeriod}, non-US ${nonUSLockPeriod} (compliance configuration service ${complianceConfiguration})`,
    );
    return timestamp > lockPeriod ? timestamp - lockPeriod : 0n;
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
  const issuanceTime = await getUnlockedIssuanceTime(props);
  if (issuanceTime !== undefined) {
    try {
      return await writeAndWait(anvil, {
        account,
        chain: anvil.chain,
        address: token,
        abi: iDSTokenAbi,
        functionName: "issueTokensCustom",
        args: [investor, amount, issuanceTime, 0n, "", 0n],
      });
    } catch (e) {
      logger?.debug(`issueTokensCustom failed: ${e}`);
    }
  }
  logger?.debug("Falling back to issueTokens");
  return writeAndWait(anvil, {
    account,
    chain: anvil.chain,
    address: token,
    abi: iDSTokenAbi,
    functionName: "issueTokens",
    args: [investor, amount],
  });
}

export async function claimDSToken(props: ClaimDSTokenProps): Promise<void> {
  const {
    anvil,
    investor,
    adminPrivateKey,
    token,
    marketConfigurators,
    rwaFactories,
    usdAmount: usdAmountProp = "100000",
  } = props;

  const account = privateKeyToAccount(adminPrivateKey);
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

  await registerSecuritizeInvestor({ ...props, logger });

  logger?.debug(`Issuing ${amount} tokens to ${investor}...`);
  const mintHash = await issueDSTokens({
    anvil,
    account,
    token,
    investor,
    amount,
    logger,
  });
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
