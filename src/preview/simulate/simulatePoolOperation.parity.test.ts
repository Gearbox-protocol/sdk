import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { type Address, encodeFunctionData, getAddress, type Hex } from "viem";
import { beforeAll, describe, expect, it } from "vitest";
import { iPoolV310Abi } from "../../abi/310/generated.js";
import {
  json_parse,
  OnchainSDK,
  type PoolV310Contract,
} from "../../sdk/index.js";
import { parsePoolOperationCalldata } from "../parse/index.js";
import { simulatePoolOpMulticall } from "./simulatePoolOpMulticall.js";
import { simulatePoolOpV1 } from "./simulatePoolOpV1.js";
import type { AddressBalanceChanges } from "./types.js";

const PINNED_BLOCK = 25_274_831n;
const FIXTURE = resolve(
  import.meta.dirname,
  `../__fixtures__/Mainnet-${PINNED_BLOCK}-kpk.json`,
);

const KPK_WETH_POOL: Address = getAddress(
  "0x9396DCbf78fc526bb003665337C5E73b699571EF",
);
// An address holding kpkWETH shares at PINNED_BLOCK (discovered by the fixture
// script). Using it as owner == caller means redeem/withdraw need no allowance.
const LP_HOLDER: Address = getAddress(
  "0xcB528a7C1e10B737953Ad1e64227DE94f153a14d",
);

const RPC_URL = process.env.RPC_URL;

/**
 * Sorts balance changes (addresses, and tokens within each address) so two
 * results can be compared with `toEqual` regardless of the order each flow
 * happens to emit them in.
 */
function sortChanges(
  changes: AddressBalanceChanges[],
): AddressBalanceChanges[] {
  return changes
    .map(entry => ({
      address: getAddress(entry.address),
      changes: [...entry.changes]
        .map(change => ({ ...change, token: getAddress(change.token) }))
        .sort((a, b) => a.token.localeCompare(b.token)),
    }))
    .sort((a, b) => a.address.localeCompare(b.address));
}

describe.skipIf(!!process.env.CI || !RPC_URL)(
  "simulatePoolOperation parity (real RPC, pinned block)",
  () => {
    let sdk: OnchainSDK;
    let pool: PoolV310Contract;
    let lpShares: bigint;

    beforeAll(async () => {
      sdk = new OnchainSDK("Mainnet", {
        rpcURLs: [RPC_URL as string],
        timeout: 120_000,
      });
      // Hydrate metadata from the committed snapshot; the client still uses the
      // real RPC for the simulation reads.
      sdk.hydrate(json_parse(readFileSync(FIXTURE, "utf-8")));
      pool = sdk.marketRegister.findByPool(KPK_WETH_POOL).pool
        .pool as PoolV310Contract;

      lpShares = await sdk.client.readContract({
        address: KPK_WETH_POOL,
        abi: iPoolV310Abi,
        functionName: "balanceOf",
        args: [LP_HOLDER],
        blockNumber: PINNED_BLOCK,
      });
      expect(lpShares).toBeGreaterThan(0n);
    }, 120_000);

    async function runFlows(calldata: Hex) {
      const operation = parsePoolOperationCalldata({ sdk, pool, calldata });
      const input = {
        sdk,
        operation,
        to: KPK_WETH_POOL,
        calldata,
        wallet: LP_HOLDER,
      };
      const [v1, multicall] = await Promise.all([
        // eth_simulateV1 builds the *next* block on top of its parent, so
        // simulating at PINNED_BLOCK - 1 reproduces PINNED_BLOCK's block
        // environment (timestamp, and thus the interest-accrued conversion
        // rate). That makes the executed result identical to the multicall
        // `previewX` read at PINNED_BLOCK.
        simulatePoolOpV1(input, { blockNumber: PINNED_BLOCK - 1n }),
        simulatePoolOpMulticall(input, { blockNumber: PINNED_BLOCK }),
      ]);
      return { operation, input, v1, multicall };
    }

    it("redeem: v1 and multicall produce identical balance changes", async () => {
      const shares = lpShares / 2n;
      // ABI order: redeem(shares, receiver, owner). owner == caller == holder.
      const calldata = encodeFunctionData({
        abi: iPoolV310Abi,
        functionName: "redeem",
        args: [shares, LP_HOLDER, LP_HOLDER],
      });

      const { v1, multicall } = await runFlows(calldata);

      expect(sortChanges(v1.balanceChanges)).toEqual(
        sortChanges(multicall.balanceChanges),
      );
      expect(v1.transfers, "v1 should recover transfers").toBeDefined();
      expect(v1.transfers?.length ?? 0).toBeGreaterThan(0);
      expect(multicall.transfers).toBeUndefined();
    }, 120_000);

    it("withdraw: v1 and multicall produce identical balance changes", async () => {
      // Withdraw an asset amount the holder can cover: previewRedeem of a quarter
      // of their shares, then withdraw exactly that many assets.
      const assets = await sdk.client.readContract({
        address: KPK_WETH_POOL,
        abi: iPoolV310Abi,
        functionName: "previewRedeem",
        args: [lpShares / 4n],
        blockNumber: PINNED_BLOCK,
      });
      expect(assets).toBeGreaterThan(0n);

      // ABI order: withdraw(assets, receiver, owner). owner == caller == holder.
      const calldata = encodeFunctionData({
        abi: iPoolV310Abi,
        functionName: "withdraw",
        args: [assets, LP_HOLDER, LP_HOLDER],
      });

      const { v1, multicall } = await runFlows(calldata);

      expect(sortChanges(v1.balanceChanges)).toEqual(
        sortChanges(multicall.balanceChanges),
      );
      expect(v1.transfers?.length ?? 0).toBeGreaterThan(0);
      expect(multicall.transfers).toBeUndefined();
    }, 120_000);
  },
);
