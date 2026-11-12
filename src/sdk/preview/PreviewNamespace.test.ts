import type { Address, Hex } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AavePositionProjection,
  OperationPreview,
  PreviewOperationInput,
} from "../../model/index.js";
import { sdkOk } from "../../model/index.js";
import type {
  MultichainSDK,
  OnchainSDK,
  OperationState,
} from "../../onchain/index.js";
import { projectAavePosition } from "../../onchain/positions/projectAavePosition.js";
import { parseOperationCalldata } from "../../onchain/preview/parse/parseOperationCalldata.js";
import type { Operation } from "../../onchain/preview/parse/types.js";
import { previewOperation } from "../../onchain/preview/preview/previewOperation.js";
import { checkOperation } from "../../onchain/validation/checkOperation.js";
import { checkSimulation } from "../../onchain/validation/checkSimulation.js";
import { PreviewNamespace } from "./PreviewNamespace.js";

vi.mock("../../onchain/preview/preview/previewOperation.js", () => ({
  previewOperation: vi.fn(),
}));
vi.mock("../../onchain/positions/projectAavePosition.js", () => ({
  projectAavePosition: vi.fn(),
}));
vi.mock("../../onchain/preview/parse/parseOperationCalldata.js", () => ({
  parseOperationCalldata: vi.fn(),
}));
vi.mock("../../onchain/validation/checkOperation.js", () => ({
  checkOperation: vi.fn(),
}));
vi.mock("../../onchain/validation/checkSimulation.js", () => ({
  checkSimulation: vi.fn(),
}));

const previewOperationMock = vi.mocked(previewOperation);
const projectAavePositionMock = vi.mocked(projectAavePosition);
const parseOperationCalldataMock = vi.mocked(parseOperationCalldata);
const checkOperationMock = vi.mocked(checkOperation);
const checkSimulationMock = vi.mocked(checkSimulation);

const CHAIN_ID = 1;
const TO = "0x0000000000000000000000000000000000000001" as Address;
const SENDER = "0x0000000000000000000000000000000000000002" as Address;
const CALLDATA = "0xdead" as Hex;

const input: PreviewOperationInput = {
  chainId: CHAIN_ID,
  to: TO,
  calldata: CALLDATA,
  sender: SENDER,
  value: 10n,
};

const previewData: OperationPreview = {
  operation: "Deposit",
  pool: TO,
  holder: SENDER,
  name: "Test Pool",
  underlyingToken: {
    chainId: 1,
    address: TO,
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    wrappedAddress: null,
  },
  shareRate: 10n ** 27n,
  curator: { address: TO, url: null },
  netValue: {
    token: {
      chainId: 1,
      address: TO,
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
    },
    value: 1n,
    valueUsd: null,
  },
  tokenIn: {
    token: {
      chainId: 1,
      address: TO,
      symbol: "IN",
      name: "In",
      decimals: 18,
    },
    value: 1n,
    valueUsd: null,
  },
  tokenOut: {
    token: {
      chainId: 1,
      address: SENDER,
      symbol: "OUT",
      name: "Out",
      decimals: 18,
    },
    value: 2n,
    valueUsd: null,
  },
};

const chainSdk = {} as OnchainSDK;
const chain = vi.fn(() => chainSdk);
const onchain = { chain } as unknown as MultichainSDK;

beforeEach(() => {
  vi.resetAllMocks();
  chain.mockReturnValue(chainSdk);
  previewOperationMock.mockResolvedValue(sdkOk<OperationPreview>(previewData));
  checkOperationMock.mockResolvedValue([]);
  checkSimulationMock.mockReturnValue([]);
});

describe("PreviewNamespace.previewOperation", () => {
  it("awaits ensureFresh for the named chain, then delegates", async () => {
    const order: string[] = [];
    const ensureFresh = vi.fn(async () => {
      order.push("fresh");
    });
    previewOperationMock.mockImplementation(async () => {
      order.push("preview");
      return sdkOk<OperationPreview>(previewData);
    });

    const ns = new PreviewNamespace(onchain, {
      maxOffchainLagSeconds: 0,
      ensureFresh,
    });
    const result = await ns.previewOperation(input, { blockNumber: 99n });

    expect(result.ok && result.data).toBe(previewData);
    expect(ensureFresh).toHaveBeenCalledWith([CHAIN_ID]);
    expect(chain).toHaveBeenCalledWith(CHAIN_ID);
    expect(previewOperationMock).toHaveBeenCalledWith(chainSdk, input, {
      blockNumber: 99n,
    });
    expect(order).toEqual(["fresh", "preview"]);
  });
});

describe("PreviewNamespace.openAavePosition", () => {
  const CREDIT_MANAGER =
    "0x0000000000000000000000000000000000000003" as Address;
  const TARGET = "0x0000000000000000000000000000000000000004" as Address;
  const amountOf = (address: Address, value: bigint) => ({
    token: { address },
    value,
  });
  const opening = {
    operation: "OpenCreditAccount",
    creditManager: CREDIT_MANAGER,
    estAssets: [amountOf(TARGET, 300n)],
    quotas: [amountOf(TARGET, 270n)],
    totalDebt: amountOf(TO, 200n),
    estTotalValue: amountOf(TO, 300n),
  } as unknown as OperationPreview;
  const aave = { healthFactor: 11_000 } as AavePositionProjection;
  const OWNER = "0x0000000000000000000000000000000000000005" as Address;
  const snapshot = {
    creditManager: CREDIT_MANAGER,
    assets: [{ token: TARGET, balance: 300n }],
    quotas: [{ token: TARGET, balance: 270n }],
    totalDebt: 200n,
    totalValue: 300n,
  };

  it("reports the opening with the Aave half projected from its floor balances, for its onBehalfOf", async () => {
    previewOperationMock.mockResolvedValue(sdkOk(opening));
    parseOperationCalldataMock.mockReturnValue(
      sdkOk({ operation: "OpenCreditAccount", onBehalfOf: OWNER } as Operation),
    );
    projectAavePositionMock.mockResolvedValue({ aave, maxDebt: 1000n });

    const ns = new PreviewNamespace(onchain, { maxOffchainLagSeconds: 0 });
    const result = await ns.openAavePosition(input);

    expect(result.ok && result.data).toEqual({ ...opening, aave });
    expect(projectAavePositionMock).toHaveBeenCalledWith(
      chainSdk,
      snapshot,
      OWNER,
    );
  });

  it("weighs a reopening against the sender's Aave position, its owner", async () => {
    previewOperationMock.mockResolvedValue(sdkOk(opening));
    parseOperationCalldataMock.mockReturnValue(
      sdkOk({ operation: "MultiCall" } as Operation),
    );
    projectAavePositionMock.mockResolvedValue({ aave, maxDebt: 1000n });

    const ns = new PreviewNamespace(onchain, { maxOffchainLagSeconds: 0 });
    await ns.openAavePosition(input);

    expect(projectAavePositionMock).toHaveBeenCalledWith(
      chainSdk,
      snapshot,
      SENDER,
    );
  });

  it("refuses an opening on a credit manager that cannot move it to Aave", async () => {
    previewOperationMock.mockResolvedValue(sdkOk(opening));
    parseOperationCalldataMock.mockReturnValue(
      sdkOk({ operation: "OpenCreditAccount", onBehalfOf: OWNER } as Operation),
    );
    projectAavePositionMock.mockResolvedValue(undefined);

    const ns = new PreviewNamespace(onchain, { maxOffchainLagSeconds: 0 });
    const result = await ns.openAavePosition(input);

    if (result.ok) throw new Error("unreachable");
    expect(result.error.code).toBe("unsupportedOperation");
  });

  it("refuses calldata that is not an account opening", async () => {
    const ns = new PreviewNamespace(onchain, { maxOffchainLagSeconds: 0 });
    const result = await ns.openAavePosition(input);

    if (result.ok) throw new Error("unreachable");
    expect(result.error.code).toBe("unsupportedOperation");
    expect(projectAavePositionMock).not.toHaveBeenCalled();
  });
});

describe("PreviewNamespace.checkOperation", () => {
  it("awaits ensureFresh for the named chain, then delegates", async () => {
    const order: string[] = [];
    const ensureFresh = vi.fn(async () => {
      order.push("fresh");
    });
    checkOperationMock.mockImplementation(async () => {
      order.push("check");
      return [];
    });

    const ns = new PreviewNamespace(onchain, {
      maxOffchainLagSeconds: 0,
      ensureFresh,
    });
    const props = {
      chainId: CHAIN_ID,
      preview: previewData,
      sender: SENDER,
    };
    const options = { blockNumber: 99n };
    const result = await ns.checkOperation(props, options);

    expect(result).toEqual([]);
    expect(ensureFresh).toHaveBeenCalledWith([CHAIN_ID]);
    expect(chain).toHaveBeenCalledWith(CHAIN_ID);
    expect(checkOperationMock).toHaveBeenCalledWith(
      { sdk: chainSdk, preview: previewData, sender: SENDER },
      options,
    );
    expect(order).toEqual(["fresh", "check"]);
  });
});

describe("PreviewNamespace.checkSimulation", () => {
  it("awaits ensureFresh for the named chain, then delegates", async () => {
    const order: string[] = [];
    const ensureFresh = vi.fn(async () => {
      order.push("fresh");
    });
    checkSimulationMock.mockImplementation(() => {
      order.push("check");
      return [];
    });

    const ns = new PreviewNamespace(onchain, {
      maxOffchainLagSeconds: 0,
      ensureFresh,
    });
    const state = {} as OperationState;
    const options = { minHealthFactor: 10_000 };
    const result = await ns.checkSimulation(
      { chainId: CHAIN_ID, state },
      options,
    );

    expect(result).toEqual([]);
    expect(ensureFresh).toHaveBeenCalledWith([CHAIN_ID]);
    expect(chain).toHaveBeenCalledWith(CHAIN_ID);
    expect(checkSimulationMock).toHaveBeenCalledWith(
      chainSdk,
      { chainId: CHAIN_ID, state },
      options,
    );
    expect(order).toEqual(["fresh", "check"]);
  });
});
