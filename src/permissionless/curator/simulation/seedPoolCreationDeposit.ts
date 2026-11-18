import {
  type Address,
  erc20Abi,
  erc4626Abi,
  type Hash,
  hexToString,
} from "viem";
import { iVersionAbi } from "../../../abi/iVersion.js";
import type { AnvilClient } from "../../../dev/createAnvilClient.js";
import { createMinter } from "../../../dev/mint/factory.js";
import type { OnchainSDK } from "../../../onchain/index.js";
import { waitForAnvilReceipt } from "./waitForAnvilReceipt.js";

async function ensureTokenMeta(
  sdk: OnchainSDK,
  anvil: AnvilClient,
  token: Address,
): Promise<void> {
  if (sdk.tokensMeta.has(token)) return;

  const [symbol, name, decimals] = await Promise.all([
    anvil.readContract({
      address: token,
      abi: erc20Abi,
      functionName: "symbol",
    }),
    anvil.readContract({ address: token, abi: erc20Abi, functionName: "name" }),
    anvil.readContract({
      address: token,
      abi: erc20Abi,
      functionName: "decimals",
    }),
  ]);

  sdk.tokensMeta.upsert(token, { addr: token, symbol, name, decimals });
}

/** Sends a transaction and waits for it to succeed; `failure` names a revert. **/
async function confirm(
  anvil: AnvilClient,
  send: () => Promise<Hash>,
  failure: string,
): Promise<void> {
  const receipt = await waitForAnvilReceipt(anvil, await send());
  if (receipt.status !== "success") throw new Error(failure);
}

export interface SeedPoolCreationDepositParams {
  sdk: OnchainSDK;
  anvil: AnvilClient;
  admin: Address;
  marketConfigurator: Address;
  underlying: Address;
  amount: bigint;
}

/**
 * Gives the Market Configurator the underlying needed to mint a new pool's dead
 * shares. RWA underlyings are ERC-4626 wrappers, so they must be funded by
 * depositing their backing asset instead of minting wrapper shares directly.
 **/
export async function seedPoolCreationDeposit({
  sdk,
  anvil,
  admin,
  marketConfigurator,
  underlying,
  amount,
}: SeedPoolCreationDepositParams): Promise<void> {
  const contractType = await anvil
    .readContract({
      address: underlying,
      abi: iVersionAbi,
      functionName: "contractType",
    })
    .then(value => hexToString(value, { size: 32 }))
    .catch(() => null);

  const isRwaUnderlying = contractType?.startsWith("RWA_UNDERLYING::") ?? false;
  // The token to mint: the wrapper's backing asset for an RWA underlying.
  const asset = isRwaUnderlying
    ? await anvil.readContract({
        address: underlying,
        abi: erc4626Abi,
        functionName: "asset",
      })
    : underlying;

  await ensureTokenMeta(sdk, anvil, asset);
  const minter = createMinter(sdk, anvil, asset);

  if (!isRwaUnderlying) {
    await minter.mint(asset, marketConfigurator, amount);
    return;
  }

  // Mirrors the Securitize deployment scripts: obtain the backing asset, then
  // deposit it for the Market Configurator.
  await minter.mint(asset, admin, amount);
  await confirm(
    anvil,
    () =>
      anvil.writeContract({
        account: admin,
        address: asset,
        abi: erc20Abi,
        functionName: "approve",
        args: [underlying, amount],
        chain: anvil.chain,
      }),
    `failed to approve ${amount} raw units of ${asset} for RWA underlying ${underlying}`,
  );
  await confirm(
    anvil,
    () =>
      anvil.writeContract({
        account: admin,
        address: underlying,
        abi: erc4626Abi,
        functionName: "deposit",
        args: [amount, marketConfigurator],
        chain: anvil.chain,
      }),
    `failed to deposit ${amount} raw units of ${asset} into RWA underlying ${underlying}`,
  );
}
