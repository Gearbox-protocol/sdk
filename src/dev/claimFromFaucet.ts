import { type Address, type PrivateKeyAccount, parseAbi } from "viem";
import { readContract } from "viem/actions";
import { formatBN, type ILogger } from "../sdk/index.js";
import type { AnvilClient } from "./createAnvilClient.js";

interface ClaimFromFaucetOptions {
  anvil: AnvilClient;
  faucet: Address;
  claimer: PrivateKeyAccount;
  role?: string;
  amountUSD: bigint | ((minAmountUSD: bigint) => bigint);
  logger?: ILogger;
}

const faucetAbi = parseAbi([
  "function minAmountUSD() external view returns (uint256)",
  "function claim(uint256 amountUSD) external",
]);

export async function claimFromFaucet(
  opts: ClaimFromFaucetOptions,
): Promise<void> {
  const { anvil, faucet, claimer, role, amountUSD, logger } = opts;

  let toClaimUSD: bigint;
  if (typeof amountUSD === "function") {
    toClaimUSD = await readContract(anvil, {
      address: faucet,
      abi: faucetAbi,
      functionName: "minAmountUSD",
    });
    logger?.debug(`faucet min amount USD: ${toClaimUSD}`);
    toClaimUSD = amountUSD(toClaimUSD);
  } else {
    toClaimUSD = amountUSD;
  }

  if (toClaimUSD === 0n) {
    logger?.debug("amount is 0, skipping claim");
    return;
  }

  const [usr, amnt] = [
    [role, claimer.address].filter(Boolean).join(" "),
    formatBN(toClaimUSD, 8),
  ];

  logger?.debug(`${usr} claiming ${amnt} USD from faucet`);
  const hash = await anvil.writeContract({
    account: claimer,
    address: faucet,
    abi: [
      {
        type: "function",
        inputs: [
          { name: "amountUSD", internalType: "uint256", type: "uint256" },
        ],
        name: "claim",
        outputs: [],
        stateMutability: "nonpayable",
      },
    ],
    functionName: "claim",
    args: [toClaimUSD],
    chain: anvil.chain,
  });
  const receipt = await anvil.waitForTransactionReceipt({
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
