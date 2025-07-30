import {
  type Account,
  type Address,
  type PublicClient,
  parseAbi,
  type WalletClient,
} from "viem";
import { readContract } from "viem/actions";
import { formatBN, type ILogger } from "../sdk/index.js";

interface ClaimFromFaucetOptions {
  publicClient: PublicClient;
  wallet: WalletClient;
  faucet: Address;
  claimer: Account;
  role?: string;
  amountUSD?: bigint | ((minAmountUSD: bigint) => bigint);
  gasMultiplier?: bigint;
  logger?: ILogger;
}

const faucetAbi = parseAbi([
  "function minAmountUSD() external view returns (uint256)",
  "function claim() external",
  "function claim(uint256 amountUSD) external",
]);

export async function claimFromFaucet(
  opts: ClaimFromFaucetOptions,
): Promise<void> {
  const {
    publicClient,
    wallet,
    faucet,
    claimer,
    role,
    amountUSD,
    logger,
    gasMultiplier = 10n,
  } = opts;

  let toClaimUSD: bigint | undefined;
  if (typeof amountUSD === "bigint") {
    toClaimUSD = amountUSD;
  } else if (typeof amountUSD === "function") {
    toClaimUSD = await readContract(publicClient, {
      address: faucet,
      abi: faucetAbi,
      functionName: "minAmountUSD",
    });
    logger?.debug(`faucet min amount USD: ${toClaimUSD}`);
    toClaimUSD = amountUSD(toClaimUSD);
  }

  if (toClaimUSD === 0n) {
    logger?.debug("amount is 0, skipping claim");
    return;
  }

  const [usr, amnt] = [
    [role, claimer.address].filter(Boolean).join(" "),
    toClaimUSD ? formatBN(toClaimUSD, 8) : "default amount",
  ];

  logger?.debug(`${usr} claiming ${amnt} USD from faucet`);

  const gas = await publicClient.estimateContractGas({
    account: claimer,
    address: faucet,
    abi: faucetAbi,
    functionName: "claim",
    args: toClaimUSD ? [toClaimUSD] : [],
  });
  const hash = await wallet.writeContract({
    account: claimer,
    address: faucet,
    abi: faucetAbi,
    functionName: "claim",
    args: toClaimUSD ? [toClaimUSD] : [],
    chain: wallet.chain,
    gas: gas * gasMultiplier,
  });
  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
  });
  if (receipt.status === "reverted") {
    throw new Error(
      `${usr} failed to claimed equivalent of ${amnt} USD from faucet, tx: ${hash}`,
    );
  }
  logger?.debug(
    `${usr} claimed equivalent of ${amnt} USD from faucet, tx: ${hash}`,
  );
}
