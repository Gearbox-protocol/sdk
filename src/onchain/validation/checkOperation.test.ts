import type { Address } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AaveBridgeBorrow,
  InsufficientBorrowAllowanceError,
  OperationPreview,
} from "../../model/index.js";
import type { OnchainSDK } from "../OnchainSDK.js";
import { checkAaveDelegation } from "./bundles/checkAaveDelegation.js";
import { checkOperation } from "./checkOperation.js";
import { CM, OWNER, SPENDER, UND } from "./testing/tokens.js";

vi.mock("./bundles/checkAaveDelegation.js", () => ({
  checkAaveDelegation: vi.fn(),
}));
vi.mock("./bundles/checkCollateralFunding.js", () => ({
  checkCollateralFunding: vi.fn(async () => []),
}));
vi.mock("./bundles/checkRWAOpening.js", () => ({
  checkRWAOpening: vi.fn(async () => []),
}));
vi.mock("./bundles/checkMarket.js", () => ({ checkMarket: () => [] }));
vi.mock("./bundles/checkAccountQuotas.js", () => ({
  checkAccountQuotas: () => [],
}));
vi.mock("./bundles/checkHealthFactors.js", () => ({
  checkHealthFactors: () => [],
}));
vi.mock("./bundles/checkIncreaseDebt.js", () => ({
  checkIncreaseDebt: () => [],
}));
vi.mock("./bundles/checkIncreaseQuota.js", () => ({
  checkIncreaseQuota: () => [],
}));
vi.mock("./bundles/checkObtained.js", () => ({ checkObtained: () => [] }));
vi.mock("./bundles/checkQuotaUpdates.js", () => ({
  checkQuotaUpdates: () => [],
}));
vi.mock("./checks/index.js", () => ({ checkDebtLimits: () => [] }));
vi.mock("./helpers/index.js", () => ({ toToken: () => UND }));

const checkAaveDelegationMock = vi.mocked(checkAaveDelegation);

const BRIDGE = SPENDER;
const amount = (value: bigint) => ({ token: UND, value, valueUsd: null });
const borrow: AaveBridgeBorrow = { bridge: BRIDGE, amount: amount(1_001n) };
const missing = {
  code: "insufficientBorrowAllowance",
} as InsufficientBorrowAllowanceError;

const sdk = {
  marketRegister: {
    findCreditManager: () => ({
      market: { pool: { underlying: UND.address } },
      creditFacade: { minDebt: 0n, maxDebt: 0n },
      maxBorrowAmount: () => 0n,
    }),
  },
} as unknown as OnchainSDK;

const base = {
  creditManager: CM,
  creditAccount: "0x0000000000000000000000000000000000000ca0" as Address,
  totalDebt: amount(1_000n),
  collateralAdded: [],
  quotas: [],
};

const check = (preview: unknown) =>
  checkOperation({ sdk, preview: preview as OperationPreview, sender: OWNER });

describe("checkOperation — the owner's Aave delegation", () => {
  beforeEach(() => {
    checkAaveDelegationMock.mockReset();
    checkAaveDelegationMock.mockResolvedValue([missing]);
  });

  it("weighs an Aave opening against the whole debt its move borrows", async () => {
    const errors = await check({
      ...base,
      operation: "OpenCreditAccount",
      aave: { bridge: BRIDGE, totalDebt: amount(1_010n) },
    });

    expect(checkAaveDelegationMock).toHaveBeenCalledWith({
      sdk,
      owner: OWNER,
      borrow: { bridge: BRIDGE, amount: amount(1_010n) },
      blockNumber: undefined,
    });
    expect(errors).toEqual([missing]);
  });

  it("weighs the loans an adjustment takes through the bridge", async () => {
    const errors = await check({
      ...base,
      operation: "AdjustCreditAccount",
      aaveBorrows: [borrow],
    });

    expect(checkAaveDelegationMock).toHaveBeenCalledWith(
      expect.objectContaining({ owner: OWNER, borrow }),
    );
    expect(errors).toEqual([missing]);
  });

  it("weighs the loans a repayment takes through the bridge, as a move to Aave does", async () => {
    const errors = await check({
      ...base,
      operation: "RepayCreditAccount",
      aaveBorrows: [borrow],
    });

    expect(checkAaveDelegationMock).toHaveBeenCalledWith(
      expect.objectContaining({ owner: OWNER, borrow }),
    );
    expect(errors).toEqual([missing]);
  });

  it("reads nothing for an operation the bridge takes no part in", async () => {
    await check({ ...base, operation: "OpenCreditAccount" });
    await check({ ...base, operation: "RepayCreditAccount" });

    expect(checkAaveDelegationMock).not.toHaveBeenCalled();
  });
});
