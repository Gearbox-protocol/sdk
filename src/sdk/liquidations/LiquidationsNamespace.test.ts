import type { Address } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  DataResponse,
  LiquidatableAccount,
  LiquidationDetails,
  LiquidationPosition,
  TxCall,
} from "../../model/index.js";
import type { MultichainSDK, OnchainSDK } from "../../onchain/index.js";
import { toChainIds } from "../../onchain/index.js";
import { checkLiquidation } from "../../onchain/validation/checkLiquidation.js";
import { LiquidationsNamespace } from "./LiquidationsNamespace.js";

vi.mock("../../onchain/validation/checkLiquidation.js", () => ({
  checkLiquidation: vi.fn(),
}));

const checkLiquidationMock = vi.mocked(checkLiquidation);

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

const chainSdk = {} as OnchainSDK;
const chain = vi.fn(() => chainSdk);
const onchain = {
  chain,
  liquidations: {
    getLiquidatableAccounts,
    getLiquidationDetails,
    buildLiquidationTx,
    getLiquidationPositions,
  },
} as unknown as MultichainSDK;

beforeEach(() => {
  vi.resetAllMocks();
  chain.mockReturnValue(chainSdk);
  getLiquidatableAccounts.mockResolvedValue(accounts);
  getLiquidationDetails.mockResolvedValue(details);
  buildLiquidationTx.mockResolvedValue(tx);
  getLiquidationPositions.mockResolvedValue(positions);
  checkLiquidationMock.mockResolvedValue([]);
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

  it("checkLiquidation awaits ensureFresh for the details chain, then delegates", async () => {
    const order: string[] = [];
    const ensureFresh = vi.fn(async () => {
      order.push("fresh");
    });
    checkLiquidationMock.mockImplementation(async () => {
      order.push("check");
      return [];
    });

    const ns = new LiquidationsNamespace(onchain, {
      maxOffchainLagSeconds: 0,
      ensureFresh,
    });
    const liquidationDetails = { chainId: 1 } as LiquidationDetails;
    const options = { blockNumber: 99n };
    const result = await ns.checkLiquidation(
      { details: liquidationDetails, liquidator: LIQUIDATOR },
      options,
    );

    expect(result).toEqual([]);
    expect(ensureFresh).toHaveBeenCalledWith([1]);
    expect(chain).toHaveBeenCalledWith(1);
    expect(checkLiquidationMock).toHaveBeenCalledWith(
      chainSdk,
      { details: liquidationDetails, liquidator: LIQUIDATOR },
      options,
    );
    expect(order).toEqual(["fresh", "check"]);
  });

  describe("isEmergencyLiquidator", () => {
    const CREDIT_MANAGER =
      "0x0000000000000000000000000000000000000003" as Address;
    const isEmergencyLiquidator = vi.fn();
    const findByCreditManager = vi.fn();

    function namespace(): LiquidationsNamespace {
      chain.mockReturnValue({
        marketRegister: { findByCreditManager },
      } as unknown as OnchainSDK);
      findByCreditManager.mockReturnValue({ isEmergencyLiquidator });
      return new LiquidationsNamespace(onchain, { maxOffchainLagSeconds: 0 });
    }

    const props = {
      chainId: 1,
      creditManager: CREDIT_MANAGER,
      liquidator: LIQUIDATOR,
    };

    it("answers from the credit manager's market", () => {
      const ns = namespace();
      isEmergencyLiquidator.mockReturnValue(true);

      expect(ns.isEmergencyLiquidator(props)).toBe(true);
      expect(chain).toHaveBeenCalledWith(1);
      expect(findByCreditManager).toHaveBeenCalledWith(CREDIT_MANAGER);
      expect(isEmergencyLiquidator).toHaveBeenCalledWith(LIQUIDATOR);
    });

    it("is false for an unknown credit manager", () => {
      const ns = namespace();
      findByCreditManager.mockImplementation(() => {
        throw new Error("credit manager not found");
      });

      expect(ns.isEmergencyLiquidator(props)).toBe(false);
    });

    it("is false before the chain is attached", () => {
      const ns = namespace();
      chain.mockImplementation(() => {
        throw new Error("not attached");
      });

      expect(ns.isEmergencyLiquidator(props)).toBe(false);
    });
  });
});
