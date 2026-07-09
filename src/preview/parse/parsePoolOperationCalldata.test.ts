import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { type Address, custom, encodeFunctionData, getAddress } from "viem";
import { beforeAll, describe, expect, it } from "vitest";
import { iPoolV310Abi } from "../../abi/310/generated.js";
import {
  json_parse,
  OnchainSDK,
  type PoolV310Contract,
} from "../../sdk/index.js";
import { parsePoolOperationCalldata } from "./parsePoolOperationCalldata.js";

// Scoped (single market configurator) snapshot, replayed via `hydrate` so the
// test runs fully offline. Regenerate with
// `tsx --env-file .env scripts/generate-pool-sim-fixture.ts`.
const FIXTURE = resolve(
  import.meta.dirname,
  "../__fixtures__/Mainnet-25274831-kpk.json",
);

const KPK_WETH_POOL: Address = getAddress(
  "0x9396DCbf78fc526bb003665337C5E73b699571EF",
);
const WETH: Address = getAddress("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");

const RECEIVER: Address = getAddress(
  "0x1111111111111111111111111111111111111111",
);
const OWNER: Address = getAddress("0x2222222222222222222222222222222222222222");

describe("parsePoolOperationCalldata", () => {
  let sdk: OnchainSDK;
  let pool: PoolV310Contract;

  beforeAll(() => {
    // Default client throws on any RPC request: hydration and calldata parsing
    // are fully offline.
    sdk = new OnchainSDK("Mainnet", {
      transport: custom({
        request: async () => {
          throw new Error("offline: parse test must not hit RPC");
        },
      }),
    });
    sdk.hydrate(json_parse(readFileSync(FIXTURE, "utf-8")));
    pool = sdk.marketRegister.findByPool(KPK_WETH_POOL).pool
      .pool as PoolV310Contract;
  });

  it("decodes depositWithReferral into a Deposit operation", () => {
    const assets = 1_500_000_000_000_000_000n;
    const referralCode = 42n;
    // Encode against the canonical pool ABI so the test pins the exact
    // selector/arg layout the parser decodes.
    const calldata = encodeFunctionData({
      abi: iPoolV310Abi,
      functionName: "depositWithReferral",
      args: [assets, RECEIVER, referralCode],
    });

    expect(parsePoolOperationCalldata(sdk, pool, calldata)).toEqual({
      operation: "Deposit",
      pool: KPK_WETH_POOL,
      receiver: RECEIVER,
      assets,
      underlying: WETH,
      tokenIn: WETH,
      tokenOut: KPK_WETH_POOL,
      zapper: undefined,
      referralCode,
    });
  });

  it("decodes redeem into a Redeem operation", () => {
    const shares = 750_000_000_000_000_000n;
    const calldata = encodeFunctionData({
      abi: iPoolV310Abi,
      functionName: "redeem",
      args: [shares, RECEIVER, OWNER],
    });

    expect(parsePoolOperationCalldata(sdk, pool, calldata)).toEqual({
      operation: "Redeem",
      pool: KPK_WETH_POOL,
      receiver: RECEIVER,
      owner: OWNER,
      shares,
      underlying: WETH,
      tokenIn: KPK_WETH_POOL,
      tokenOut: WETH,
      zapper: undefined,
    });
  });
});
