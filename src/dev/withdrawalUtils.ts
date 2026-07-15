import type { Address } from "viem";
import { erc20Abi, hexToString, parseAbi, parseEther } from "viem";
import { iWithdrawalCompressorV313Abi } from "../abi/IWithdrawalCompressorV313.js";
import type { ILogger } from "../sdk/index.js";
import {
  getNetworkType,
  getWithdrawalCompressorAddress,
} from "../sdk/index.js";
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
 * Functions of external Midas redemption vault contract that are not declared
 * in integrations-v3's IMidasRedemptionVault interface
 */
const iMidasRedemptionVaultExtAbi = parseAbi([
  "function requestRedeemer() external view returns (address)",
  "function safeApproveRequest(uint256 requestId, uint256 newMTokenRate) external",
]);

export interface MakePendingWithdrawalsClaimableOptions {
  logger?: ILogger;
  timeWarp?: boolean;
}

/**
 * Makes pending delayed withdrawals of a credit account claimable on an anvil fork.
 *
 * Replicates the `_fulfillWithdrawal` logic from periphery-v3 Foundry tests
 * (WithdrawalCompressorMidasRWA.t.sol, WithdrawalCompressorSecuritize.t.sol)
 * using anvil cheatcodes. Assumes the version 313 of WithdrawalCompressor.
 *
 * @param anvil
 * @param creditAccount
 * @param logger
 */
export async function makePendingWithdrawalsClaimable(
  anvil: AnvilClient,
  creditAccount: Address,
  options?: MakePendingWithdrawalsClaimableOptions,
): Promise<void> {
  const { logger, timeWarp = false } = options || {};
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

  if (timeWarp) {
    const maxClaimableAt = pending.reduce(
      (max, p) => (p.claimableAt > max ? p.claimableAt : max),
      0n,
    );
    if (maxClaimableAt > 0n) {
      logger?.debug(`warping time to ${maxClaimableAt + 1n}`);
      await anvil.evmMineDetailed(maxClaimableAt + 1n);
    }
  }

  for (const w of pending) {
    const cType = hexToString(
      await anvil.readContract({
        address: w.withdrawalPhantomToken,
        abi: iVersionAbi,
        functionName: "contractType",
      }),
      { size: 32 },
    );
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
          `unsupported withdrawal phantom token type ${cType}, only time warp was applied`,
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
 * Fulfills a Midas redemption request:
 * funds the vault's request redeemer with tokenOut and approves the request
 * on the Midas redemption vault on behalf of the vault admin
 */
async function fulfillMidasWithdrawal(
  anvil: AnvilClient,
  creditAccount: Address,
  withdrawalPhantomToken: Address,
  logger?: ILogger,
): Promise<void> {
  const [gateway, tokenOut] = await anvil.multicall({
    allowFailure: false,
    contracts: [
      {
        address: withdrawalPhantomToken,
        abi: midasRedemptionVaultPhantomTokenAbi,
        functionName: "gateway",
      },
      {
        address: withdrawalPhantomToken,
        abi: midasRedemptionVaultPhantomTokenAbi,
        functionName: "tokenOut",
      },
    ],
  });
  const midasRedemptionVault = await anvil.readContract({
    address: gateway,
    abi: midasGatewayAbi,
    functionName: "midasRedemptionVault",
  });
  const [mTokenDataFeed, requestRedeemer, tokenOutDecimals, redeemers] =
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
        {
          address: gateway,
          abi: midasGatewayAbi,
          functionName: "pendingRedeemers",
          args: [creditAccount],
        },
      ],
    });
  const mTokenRate = await anvil.readContract({
    address: mTokenDataFeed,
    abi: iMidasDataFeedAbi,
    functionName: "getDataInBase18",
  });
  logger?.debug(
    `midas: gateway ${gateway}, vault ${midasRedemptionVault}, tokenOut ${tokenOut}, mToken rate ${mTokenRate}, ${redeemers.length} pending redeemers`,
  );

  for (const redeemer of redeemers) {
    // fund the vault's request redeemer with tokenOut so that it can pay out
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

    const requestId = await anvil.readContract({
      address: redeemer,
      abi: midasRedeemerAbi,
      functionName: "requestId",
    });
    logger?.debug(
      `midas: approving request ${requestId} of redeemer ${redeemer} as vault admin ${MIDAS_VAULT_ADMIN}`,
    );
    await anvil.impersonateAccount({ address: MIDAS_VAULT_ADMIN });
    await anvil.setBalance({
      address: MIDAS_VAULT_ADMIN,
      value: parseEther("100"),
    });
    await anvil.writeContract({
      chain: anvil.chain,
      address: midasRedemptionVault,
      account: MIDAS_VAULT_ADMIN,
      abi: iMidasRedemptionVaultExtAbi,
      functionName: "safeApproveRequest",
      args: [requestId, mTokenRate],
    });
    await anvil.stopImpersonatingAccount({ address: MIDAS_VAULT_ADMIN });
  }
}

/**
 * Fulfills a Securitize redemption request:
 * funds the first redeemer of the credit account with stablecoins
 */
async function fulfillSecuritizeWithdrawal(
  anvil: AnvilClient,
  creditAccount: Address,
  withdrawalPhantomToken: Address,
  logger?: ILogger,
): Promise<void> {
  const [redemptionGateway, stableCoinToken] = await anvil.multicall({
    allowFailure: false,
    contracts: [
      {
        address: withdrawalPhantomToken,
        abi: securitizeRedemptionPhantomTokenAbi,
        functionName: "redemptionGateway",
      },
      {
        address: withdrawalPhantomToken,
        abi: securitizeRedemptionPhantomTokenAbi,
        functionName: "stableCoinToken",
      },
    ],
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
    `securitize: gateway ${redemptionGateway}, stablecoin ${stableCoinToken}, ${redeemers.length} unclaimed redeemers`,
  );
  if (redeemers.length === 0) {
    logger?.warn(
      `securitize: no unclaimed redeemers found for credit account ${creditAccount}`,
    );
    return;
  }

  for (const redeemer of redeemers) {
    const [redemptionValue, redeemerBalance] = await anvil.multicall({
      allowFailure: false,
      contracts: [
        {
          address: redeemer,
          abi: securitizeRedeemerAbi,
          functionName: "getCurrentRedemptionValue",
        },
        {
          address: stableCoinToken,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [redeemer],
        },
      ],
    });
    if (redemptionValue === 0n) {
      logger?.debug(
        `securitize: skipping redeemer ${redeemer} with zero redemption value`,
      );
      continue;
    }
    logger?.debug(
      `securitize: dealing ${redemptionValue} of stablecoin ${stableCoinToken} to redeemer ${redeemer}`,
    );
    await anvil.deal({
      erc20: stableCoinToken,
      account: redeemer,
      amount: redeemerBalance + redemptionValue,
    });
  }
}
