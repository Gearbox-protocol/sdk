import type { Address } from "viem";
import { erc20Abi, hexToString, parseAbi, parseEther } from "viem";
import { iWithdrawalCompressorV313Abi } from "../abi/IWithdrawalCompressorV313.js";
import type { ILogger } from "../onchain/index.js";
import {
  getNetworkType,
  getWithdrawalCompressorAddress,
} from "../onchain/index.js";
import type { AnvilClient } from "./createAnvilClient.js";
import {
  iMidasDataFeedAbi,
  iMidasRedemptionVaultAbi,
  midasGatewayAbi,
  midasRedeemerAbi,
  midasRedemptionVaultPhantomTokenAbi,
  securitizeRedeemerAbi,
  securitizeRedemptionGatewayAbi,
  securitizeRedemptionPhantomTokenAbi,
} from "./withdrawalAbi.js";

/**
 * Midas vault admin that is allowed to call safeApproveRequest (mainnet)
 */
const MIDAS_VAULT_ADMIN: Address = "0x2ACB4BdCbEf02f81BF713b696Ac26390d7f79A12";

const iVersionAbi = parseAbi([
  "function contractType() external view returns (bytes32)",
]);

/**
 * Common part of Midas and Securitize redeemers
 */
const iRedeemerAbi = parseAbi([
  "function gateway() external view returns (address)",
]);

/**
 * Functions of external Midas redemption vault contract that are not declared
 * in integrations-v3's IMidasRedemptionVault interface
 */
const iMidasRedemptionVaultExtAbi = parseAbi([
  "function requestRedeemer() external view returns (address)",
  "function safeApproveRequest(uint256 requestId, uint256 newMTokenRate) external",
]);

export interface MakePendingWithdrawalsClaimableOptions {
  logger?: ILogger;
}

/**
 * Makes pending delayed withdrawals claimable on an anvil fork.
 *
 * Accepts either a credit account, in which case all its pending withdrawals are
 * fulfilled, or a single redeemer. The latter is the only way to reach redeemers
 * that were transferred away from a credit account during a liquidation: they are
 * dropped from the gateway's pending sets, so the compressor no longer reports them.
 *
 * Replicates the `_fulfillWithdrawal` logic from periphery-v3 Foundry tests
 * (WithdrawalCompressorMidasRWA.t.sol, WithdrawalCompressorSecuritize.t.sol)
 * using anvil cheatcodes. Assumes the version 313 of WithdrawalCompressor.
 *
 * @param anvil
 * @param address credit account or redeemer
 * @param options
 */
export async function makePendingWithdrawalsClaimable(
  anvil: AnvilClient,
  address: Address,
  options?: MakePendingWithdrawalsClaimableOptions,
): Promise<void> {
  const { logger } = options || {};
  const cType = await getContractType(anvil, address);
  if (cType === "CREDIT_ACCOUNT") {
    await fulfillCreditAccountWithdrawals(anvil, address, logger);
  } else {
    await fulfillRedeemer(anvil, address, logger);
  }
}

/**
 * Returns the decoded `contractType` of a contract, or `undefined` when it does
 * not implement it (redeemers, for example)
 */
async function getContractType(
  anvil: AnvilClient,
  address: Address,
): Promise<string | undefined> {
  try {
    const cType = await anvil.readContract({
      address,
      abi: iVersionAbi,
      functionName: "contractType",
    });
    return hexToString(cType, { size: 32 });
  } catch {
    return undefined;
  }
}

/**
 * Fulfills all pending withdrawals of a credit account, as reported by the
 * withdrawal compressor
 */
async function fulfillCreditAccountWithdrawals(
  anvil: AnvilClient,
  creditAccount: Address,
  logger?: ILogger,
): Promise<void> {
  const compressor = getWithdrawalCompressorAddress(
    getNetworkType(anvil.chain.id),
  );
  if (!compressor) {
    throw new Error(`no withdrawal compressor for chain ${anvil.chain.id}`);
  }
  if (compressor.version !== 313) {
    logger?.warn(
      `withdrawal compressor version is ${compressor.version}, this helper assumes 313`,
    );
  }

  const [, pending] = await anvil.readContract({
    address: compressor.address,
    abi: iWithdrawalCompressorV313Abi,
    functionName: "getCurrentWithdrawals",
    args: [creditAccount],
  });
  logger?.debug(
    `found ${pending.length} pending withdrawals for credit account ${creditAccount}`,
  );
  if (pending.length === 0) {
    return;
  }

  for (const w of pending) {
    const cType = await getContractType(anvil, w.withdrawalPhantomToken);
    logger?.debug(
      `fulfilling withdrawal in phantom token ${w.withdrawalPhantomToken} with contract type ${cType}`,
    );

    switch (cType) {
      case "PHANTOM_TOKEN::MIDAS_REDEMPTION":
        await fulfillMidasWithdrawal(
          anvil,
          creditAccount,
          w.withdrawalPhantomToken,
          logger,
        );
        break;
      case "PHANTOM_TOKEN::SECURITIZE_RD":
        await fulfillSecuritizeWithdrawal(
          anvil,
          creditAccount,
          w.withdrawalPhantomToken,
          logger,
        );
        break;
      default:
        logger?.warn(
          `unsupported withdrawal phantom token type ${cType}, skipping`,
        );
    }
  }

  // verify that withdrawals became claimable
  const [claimableAfter, pendingAfter] = await anvil.readContract({
    address: compressor.address,
    abi: iWithdrawalCompressorV313Abi,
    functionName: "getCurrentWithdrawals",
    args: [creditAccount],
  });
  logger?.debug(
    `after fulfillment: ${claimableAfter.length} claimable, ${pendingAfter.length} still pending withdrawals`,
  );
}

/**
 * Fulfills the redemption request held by a single redeemer, dispatching on the
 * type of the gateway that deployed it
 */
async function fulfillRedeemer(
  anvil: AnvilClient,
  redeemer: Address,
  logger?: ILogger,
): Promise<void> {
  const gateway = await anvil.readContract({
    address: redeemer,
    abi: iRedeemerAbi,
    functionName: "gateway",
  });
  const cType = await getContractType(anvil, gateway);
  logger?.debug(
    `fulfilling redeemer ${redeemer} of gateway ${gateway} with contract type ${cType}`,
  );

  switch (cType) {
    case "GATEWAY::MIDAS":
      await fulfillMidasRedeemer(anvil, redeemer, logger);
      break;
    case "GATEWAY::SECURITIZE_REDEMPTION":
      await fulfillSecuritizeRedeemer(anvil, redeemer, logger);
      break;
    default:
      throw new Error(
        `unsupported gateway type ${cType} of redeemer ${redeemer}`,
      );
  }
}

/**
 * Fulfills all pending Midas redemption requests of a credit account
 */
async function fulfillMidasWithdrawal(
  anvil: AnvilClient,
  creditAccount: Address,
  withdrawalPhantomToken: Address,
  logger?: ILogger,
): Promise<void> {
  const gateway = await anvil.readContract({
    address: withdrawalPhantomToken,
    abi: midasRedemptionVaultPhantomTokenAbi,
    functionName: "gateway",
  });
  const redeemers = await anvil.readContract({
    address: gateway,
    abi: midasGatewayAbi,
    functionName: "pendingRedeemers",
    args: [creditAccount],
  });
  logger?.debug(
    `midas: gateway ${gateway}, ${redeemers.length} pending redeemers`,
  );

  for (const redeemer of redeemers) {
    await fulfillMidasRedeemer(anvil, redeemer, logger);
  }
}

/**
 * Fulfills a single Midas redemption request:
 * funds the vault's request redeemer with tokenOut and approves the request
 * on the Midas redemption vault on behalf of the vault admin
 */
async function fulfillMidasRedeemer(
  anvil: AnvilClient,
  redeemer: Address,
  logger?: ILogger,
): Promise<void> {
  // tokenOut is the quote token received when the redemption is claimed
  const [midasRedemptionVault, tokenOut, requestId] = await anvil.multicall({
    allowFailure: false,
    contracts: [
      {
        address: redeemer,
        abi: midasRedeemerAbi,
        functionName: "midasRedemptionVault",
      },
      {
        address: redeemer,
        abi: midasRedeemerAbi,
        functionName: "quoteToken",
      },
      {
        address: redeemer,
        abi: midasRedeemerAbi,
        functionName: "requestId",
      },
    ],
  });
  const [mTokenDataFeed, requestRedeemer, tokenOutDecimals] =
    await anvil.multicall({
      allowFailure: false,
      contracts: [
        {
          address: midasRedemptionVault,
          abi: iMidasRedemptionVaultAbi,
          functionName: "mTokenDataFeed",
        },
        {
          address: midasRedemptionVault,
          abi: iMidasRedemptionVaultExtAbi,
          functionName: "requestRedeemer",
        },
        {
          address: tokenOut,
          abi: erc20Abi,
          functionName: "decimals",
        },
      ],
    });
  const mTokenRate = await anvil.readContract({
    address: mTokenDataFeed,
    abi: iMidasDataFeedAbi,
    functionName: "getDataInBase18",
  });
  logger?.debug(
    `midas: redeemer ${redeemer}, vault ${midasRedemptionVault}, tokenOut ${tokenOut}, mToken rate ${mTokenRate}`,
  );

  // fund the vault's request redeemer with tokenOut so that it can settle
  // on request approval (additive to its current balance)
  const topUp = 1_000_000n * 10n ** BigInt(tokenOutDecimals);
  const requestRedeemerBalance = await anvil.readContract({
    address: tokenOut,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [requestRedeemer],
  });
  logger?.debug(
    `midas: dealing ${topUp} of tokenOut ${tokenOut} to request redeemer ${requestRedeemer}`,
  );
  await anvil.deal({
    erc20: tokenOut,
    account: requestRedeemer,
    amount: requestRedeemerBalance + topUp,
  });

  logger?.debug(
    `midas: approving request ${requestId} of redeemer ${redeemer} as vault admin ${MIDAS_VAULT_ADMIN}`,
  );
  await anvil.impersonateAccount({ address: MIDAS_VAULT_ADMIN });
  await anvil.setBalance({
    address: MIDAS_VAULT_ADMIN,
    value: parseEther("100"),
  });
  const hash = await anvil.writeContract({
    chain: anvil.chain,
    address: midasRedemptionVault,
    account: MIDAS_VAULT_ADMIN,
    abi: iMidasRedemptionVaultExtAbi,
    functionName: "safeApproveRequest",
    args: [requestId, mTokenRate],
  });
  // the shared fork may mine on an interval: without waiting, subsequent
  // withdrawal reads race ahead of the approval and still see it pending
  const receipt = await anvil.waitForTransactionReceipt({
    hash,
    pollingInterval: 100,
  });
  if (receipt.status !== "success") {
    throw new Error(`midas: safeApproveRequest tx ${hash} reverted`);
  }
  await anvil.stopImpersonatingAccount({ address: MIDAS_VAULT_ADMIN });
}

/**
 * Fulfills all unclaimed Securitize redemption requests of a credit account
 */
async function fulfillSecuritizeWithdrawal(
  anvil: AnvilClient,
  creditAccount: Address,
  withdrawalPhantomToken: Address,
  logger?: ILogger,
): Promise<void> {
  const redemptionGateway = await anvil.readContract({
    address: withdrawalPhantomToken,
    abi: securitizeRedemptionPhantomTokenAbi,
    functionName: "redemptionGateway",
  });
  // claimed redeemers stay in `getRedeemers` forever with zero redemption
  // value, so only unclaimed ones matter here (matches the subcompressor's
  // `_getPendingWithdrawals` which iterates `getUnclaimedRedeemers`)
  const redeemers = await anvil.readContract({
    address: redemptionGateway,
    abi: securitizeRedemptionGatewayAbi,
    functionName: "getUnclaimedRedeemers",
    args: [creditAccount],
  });
  logger?.debug(
    `securitize: gateway ${redemptionGateway}, ${redeemers.length} unclaimed redeemers`,
  );
  if (redeemers.length === 0) {
    logger?.warn(
      `securitize: no unclaimed redeemers found for credit account ${creditAccount}`,
    );
    return;
  }

  for (const redeemer of redeemers) {
    await fulfillSecuritizeRedeemer(anvil, redeemer, logger);
  }
}

/**
 * Fulfills a single Securitize redemption request:
 * funds the redeemer with stablecoins
 */
async function fulfillSecuritizeRedeemer(
  anvil: AnvilClient,
  redeemer: Address,
  logger?: ILogger,
): Promise<void> {
  const [stableCoinToken, redemptionValue] = await anvil.multicall({
    allowFailure: false,
    contracts: [
      {
        address: redeemer,
        abi: securitizeRedeemerAbi,
        functionName: "stableCoinToken",
      },
      {
        address: redeemer,
        abi: securitizeRedeemerAbi,
        functionName: "getCurrentRedemptionValue",
      },
    ],
  });
  if (redemptionValue === 0n) {
    logger?.debug(
      `securitize: skipping redeemer ${redeemer} with zero redemption value`,
    );
    return;
  }
  const redeemerBalance = await anvil.readContract({
    address: stableCoinToken,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [redeemer],
  });
  logger?.debug(
    `securitize: dealing ${redemptionValue} of stablecoin ${stableCoinToken} to redeemer ${redeemer}`,
  );
  await anvil.deal({
    erc20: stableCoinToken,
    account: redeemer,
    amount: redeemerBalance + redemptionValue,
  });
}
