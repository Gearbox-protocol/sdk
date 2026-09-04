import type { Address } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  DataResponse,
  LiquidatableAccount,
  LiquidationDetails,
  LiquidationPosition,
  TxCall,
} from "../../model/index.js";
import type { MultichainSDK } from "../../onchain/index.js";
import { toChainIds } from "../../onchain/index.js";
import { LiquidationsNamespace } from "./LiquidationsNamespace.js";

const CREDIT_ACCOUNT = "0x0000000000000000000000000000000000000001" as Address;
const LIQUIDATOR = "0x0000000000000000000000000000000000000002" as Address;
const CHAIN_IDS = [1, 42161];

function response<T>(data: T): DataResponse<T> {
  return { data, meta: { chains: [] } };
}

const accounts = response([] as LiquidatableAccount[]);
const details = response({} as LiquidationDetails);
const tx = response({} as TxCall);
const positions = response([] as LiquidationPosition[]);

const getLiquidatableAccounts = vi.fn();
const getLiquidationDetails = vi.fn();
const buildLiquidationTx = vi.fn();
const getLiquidationPositions = vi.fn();

const onchain = {
  liquidations: {
    getLiquidatableAccounts,
    getLiquidationDetails,
    buildLiquidationTx,
    getLiquidationPositions,
  },
} as unknown as MultichainSDK;

beforeEach(() => {
  vi.resetAllMocks();
  getLiquidatableAccounts.mockResolvedValue(accounts);
  getLiquidationDetails.mockResolvedValue(details);
  buildLiquidationTx.mockResolvedValue(tx);
  getLiquidationPositions.mockResolvedValue(positions);
});

describe("LiquidationsNamespace", () => {
  it("getLiquidatableAccounts awaits ensureFresh for the named chains, then delegates", async () => {
    const order: string[] = [];
    const ensureFresh = vi.fn(async () => {
      order.push("fresh");
    });
    getLiquidatableAccounts.mockImplementation(async () => {
      order.push("read");
      return accounts;
    });

    const ns = new LiquidationsNamespace(onchain, {
      maxOffchainLagSeconds: 0,
      ensureFresh,
    });
    const props = { chainIds: CHAIN_IDS };
    const result = await ns.getLiquidatableAccounts(props);

    expect(result).toBe(accounts);
    expect(ensureFresh).toHaveBeenCalledWith(CHAIN_IDS);
    expect(getLiquidatableAccounts).toHaveBeenCalledWith(props);
    expect(order).toEqual(["fresh", "read"]);
  });

  it("getLiquidationDetails awaits ensureFresh for the named network, then delegates", async () => {
    const ensureFresh = vi.fn(async () => {});
    const ns = new LiquidationsNamespace(onchain, {
      maxOffchainLagSeconds: 0,
      ensureFresh,
    });
    const props = {
      network: "Mainnet" as const,
      creditAccount: CREDIT_ACCOUNT,
      liquidator: LIQUIDATOR,
    };
    const result = await ns.getLiquidationDetails(props);

    expect(result).toBe(details);
    expect(ensureFresh).toHaveBeenCalledWith(toChainIds(["Mainnet"]));
    expect(getLiquidationDetails).toHaveBeenCalledWith(props);
  });

  it("buildLiquidationTx awaits ensureFresh for the named network, then delegates", async () => {
    const ensureFresh = vi.fn(async () => {});
    const ns = new LiquidationsNamespace(onchain, {
      maxOffchainLagSeconds: 0,
      ensureFresh,
    });
    const props = {
      network: "Mainnet" as const,
      creditAccount: CREDIT_ACCOUNT,
      liquidator: LIQUIDATOR,
    };
    const result = await ns.buildLiquidationTx(props);

    expect(result).toBe(tx);
    expect(ensureFresh).toHaveBeenCalledWith(toChainIds(["Mainnet"]));
    expect(buildLiquidationTx).toHaveBeenCalledWith(props);
  });

  it("getLiquidationPositions awaits ensureFresh for the named chains, then delegates", async () => {
    const ensureFresh = vi.fn(async () => {});
    const ns = new LiquidationsNamespace(onchain, {
      maxOffchainLagSeconds: 0,
      ensureFresh,
    });
    const props = { liquidator: LIQUIDATOR, chainIds: CHAIN_IDS };
    const result = await ns.getLiquidationPositions(props);

    expect(result).toBe(positions);
    expect(ensureFresh).toHaveBeenCalledWith(CHAIN_IDS);
    expect(getLiquidationPositions).toHaveBeenCalledWith(props);
  });
});
