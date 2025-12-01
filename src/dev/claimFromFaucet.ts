import type {
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";
import {
  type Account,
  type Address,
  type PublicClient,
  parseAbi,
  type WalletClient,
} from "viem";
import { readContract } from "viem/actions";
import { formatBN, type GearboxSDK, type ILogger } from "../sdk/index.js";

interface TokenClaim {
  token: Address;
  amount: bigint;
}

interface ClaimFromFaucetOptions {
  sdk: GearboxSDK;
  publicClient: PublicClient;
  wallet: WalletClient;
  faucet: Address;
  claimer: Account;
  role?: string;
  /**
   * Either:
   * - List of tokens with exact amounts to claim
   * - Amount in USD
   * - Function that returns amount in USD
   * - Undefined (will claim default amount)
   */
  amount?: TokenClaim[] | bigint | ((minAmountUSD: bigint) => bigint);
  gasMultiplier?: bigint;
  logger?: ILogger;
}

const faucetAbi = parseAbi([
  "function minAmountUSD() external view returns (uint256)",
  "function claim() external",
  "function claim(uint256 amountUSD) external",
  "function claim((address token, uint256 amount)[] claims) external",
]);

export async function claimFromFaucet(
  opts: ClaimFromFaucetOptions,
): Promise<void> {
  const {
    sdk,
    publicClient,
    wallet,
    faucet,
    claimer,
    role,
    amount,
    logger,
    gasMultiplier = 10n,
  } = opts;

  let amnt = "default amount";
  let args: AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof faucetAbi, "claim">["inputs"]
  >;
  if (Array.isArray(amount)) {
    args = [amount];
    amnt = amount
      .map(v => {
        try {
          return sdk.tokensMeta.formatBN(v.token, v.amount, { symbol: true });
        } catch {
          return `${v.amount} of ${v.token}`;
        }
      })
      .join(", ");
  } else if (typeof amount === "bigint") {
    args = [amount];
    amnt = `${formatBN(args[0], 8)} USD`;
  } else if (typeof amount === "function") {
    const minAmountUSD = await readContract(publicClient, {
      address: faucet,
      abi: faucetAbi,
      functionName: "minAmountUSD",
    });
    logger?.debug(`faucet min amount USD: ${minAmountUSD}`);
    args = [amount(minAmountUSD)];
    amnt = `${formatBN(args[0], 8)} USD`;
  } else {
    args = [];
  }

  if (args[0] === 0n) {
    logger?.debug("amount is 0, skipping claim");
    return;
  }

  const usr = [role, claimer.address].filter(Boolean).join(" ");

  logger?.debug(`${usr} claiming ${amnt} from faucet`);

  const gas = await publicClient.estimateContractGas({
    account: claimer,
    address: faucet,
    abi: faucetAbi,
    functionName: "claim",
    args,
  });
  const hash = await wallet.writeContract({
    account: claimer,
    address: faucet,
    abi: faucetAbi,
    functionName: "claim",
    args,
    chain: wallet.chain,
    gas: gas * gasMultiplier,
  });
  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
  });
  if (receipt.status === "reverted") {
    throw new Error(
      `${usr} failed to claimed ${amnt} from faucet, tx: ${hash}`,
    );
  }
  logger?.debug(`${usr} claimed ${amnt} from faucet, tx: ${hash}`);
}
