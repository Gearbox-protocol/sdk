import {
  formatBN,
  type GearboxChain,
  type ILogger,
  MAX_UINT256,
  OnchainSDK,
} from "@gearbox-protocol/sdk";
import { iDSRegistryServiceAbi } from "@gearbox-protocol/sdk/abi/kyc/iDSRegistryService";
import { iDSTokenAbi } from "@gearbox-protocol/sdk/abi/kyc/iDSToken";
import type { AnvilClient } from "@gearbox-protocol/sdk/dev";
import {
  type Address,
  erc20Abi,
  type Hex,
  type PublicClient,
  type Transport,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

async function writeAndWait(
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

interface ClaimDSTokenProps {
  anvil: AnvilClient;
  claimer: Address;
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
  kycFactories?: Address[];
  logger?: ILogger;
}

type ClaimDSTokensProps = Omit<ClaimDSTokenProps, "token"> & {
  tokens: Address[];
};

export async function registerInvestor(
  props: ClaimDSTokenProps,
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

export async function claimDSToken(props: ClaimDSTokenProps): Promise<void> {
  const {
    anvil,
    claimer,
    adminPrivateKey,
    token,
    marketConfigurators,
    kycFactories,
    usdAmount: usdAmountProp = "100000",
  } = props;

  const account = privateKeyToAccount(adminPrivateKey);
  const symbol = await anvil.readContract({
    address: token,
    abi: erc20Abi,
    functionName: "symbol",
    args: [],
  });
  const logger = props.logger?.child?.({ symbol }) ?? console;

  const usdAmount = BigInt(usdAmountProp) * 10n ** 8n;
  const sdk = new OnchainSDK((anvil.chain as GearboxChain).network, {
    client: anvil as unknown as PublicClient<Transport, GearboxChain>,
    timeout: 120_000,
  });
  await sdk.attach({ marketConfigurators, kycFactories });
  let amount = 0n;
  for (const market of sdk.marketRegister.markets) {
    try {
      amount = market.priceOracle.convertFromUSD(token, usdAmount);
    } catch {}
  }
  if (amount === 0n) {
    throw new Error(`No market found for token ${token}`);
  }
  logger.debug(`${usdAmountProp} USD === ${amount} ${symbol}`);

  await registerInvestor({ ...props, logger });

  logger.debug(`Issuing ${amount} tokens to ${claimer}...`);
  const mintHash = await writeAndWait(anvil, {
    account,
    chain: anvil.chain,
    address: token,
    abi: iDSTokenAbi,
    functionName: "issueTokens",
    args: [claimer, amount],
  });
  logger.debug(`Done! tx: ${mintHash}`);
  const balance = await anvil.readContract({
    address: token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [claimer],
  });
  logger.debug(
    `Balance of ${claimer}: ${sdk.tokensMeta.formatBN(token, balance)}`,
  );
}

/**
 * Helper function to claim DSToken from the faucet.
 * Works both for MockDStoken and real DSToken connected by securitize-deploy script
 * @param forkStatus
 * @param publicClient
 * @param claimer
 * @returns
 */
export async function claimDSTokens(props: ClaimDSTokensProps): Promise<void> {
  const { tokens, ...rest } = props;
  for (const token of tokens) {
    await claimDSToken({ ...rest, token });
  }
}
