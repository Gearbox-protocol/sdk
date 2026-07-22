import type { Address, Hex } from "viem";
import {
  custom,
  encodeAbiParameters,
  getAddress,
  padHex,
  zeroAddress,
} from "viem";
import { describe, expect, it } from "vitest";
import {
  type CallTrace,
  EXECUTE_BYTES_SELECTOR,
} from "../common-utils/utils/trace.js";
import {
  Curve2AssetsAdapterContract,
  UniswapV3AdapterContract,
  WstETHV1AdapterContract,
} from "../plugins/adapters/index.js";
import type { TokenTransfer } from "../preview/parse/index.js";
import {
  AddressMap,
  type ChainContractsRegister,
  CreditFacadeV310BaseContract,
  OnchainSDK,
  type ParsedCallV2,
} from "../sdk/index.js";
import { classifyMulticallOperations } from "./classifyMulticallOperations.js";

const addr = (hex: string) => getAddress(padHex(hex as Address, { size: 20 }));

const ADAPTER_UNI = addr("0xA1");
const ADAPTER_CURVE = addr("0xA2");
const ADAPTER_WSTETH = addr("0xA3");
const FACADE = addr("0xFA");
const UNKNOWN = addr("0xDE");
const CA = addr("0xCA");
const DEX = addr("0xCC");
const TARGET = addr("0xDD");
const TOKEN_A = addr("0x01");
const TOKEN_B = addr("0x02");
const TOKEN_C = addr("0x03");
const UNDERLYING = addr("0x81");

/**
 * Builds a minimal adapter-level call trace shaped like a real one:
 * adapter -> `CreditManager.execute(bytes)` -> leaf CALL to `target`.
 *
 * `parseProtocolCall` resolves `target` from the leaf CALL whose input matches
 * the forwarded calldata. The calldata itself is intentionally not decodable by
 * the protocol ABIs here: this suite covers transfer/trace alignment, while the
 * decode path is covered by the integration snapshot and the per-adapter unit
 * test with real data.
 */
function makeAdapterTrace(
  target: Address,
  calldata: Hex = "0xdeadbeef",
): CallTrace {
  const executeInput = `${EXECUTE_BYTES_SELECTOR}${encodeAbiParameters(
    [{ type: "bytes" }],
    [calldata],
  ).slice(2)}` as Hex;
  const leaf: CallTrace = {
    from: CA,
    to: target,
    input: calldata,
    output: "0x",
    value: "0x0",
    type: "CALL",
  };
  const executeNode: CallTrace = {
    from: DEX,
    to: DEX,
    input: executeInput,
    output: "0x",
    value: "0x0",
    type: "CALL",
    calls: [leaf],
  };
  return {
    from: FACADE,
    to: DEX,
    input: "0x00000000",
    output: "0x",
    value: "0x0",
    type: "CALL",
    calls: [executeNode],
  };
}

function makeAdapterTraces(count: number): CallTrace[] {
  return Array.from({ length: count }, () => makeAdapterTrace(TARGET));
}

const adapterBase = {
  version: 310n,
  contractType: "0x" as `0x${string}`,
};

function makeParsed(
  target: Address,
  functionName: string,
  rawArgs: Record<string, unknown> = {},
): ParsedCallV2 {
  return {
    chainId: 1,
    target,
    contractType: "TEST",
    version: 310,
    functionName,
    calldata: "0x",
    rawArgs,
  };
}

function setupRegister(): ChainContractsRegister {
  // SDK stub
  const sdk = new OnchainSDK("Mainnet", {
    transport: custom({
      request: async () => {
        throw new Error("not implemented");
      },
    }),
  });
  sdk.resetContracts();

  new UniswapV3AdapterContract(sdk, {
    baseParams: { ...adapterBase, addr: ADAPTER_UNI },
  });

  new Curve2AssetsAdapterContract(sdk, {
    baseParams: { ...adapterBase, addr: ADAPTER_CURVE },
  });

  new WstETHV1AdapterContract(sdk, {
    baseParams: { ...adapterBase, addr: ADAPTER_WSTETH },
  });

  new CreditFacadeV310BaseContract(sdk, {
    addr: FACADE,
    name: "CreditFacade",
  });

  return sdk;
}

const swapTransfers: TokenTransfer[] = [
  { token: TOKEN_A, amount: 100n, from: CA, to: DEX },
  { token: TOKEN_B, amount: 200n, from: DEX, to: CA },
];
const curveTransfers: TokenTransfer[] = [
  { token: TOKEN_A, amount: 50n, from: CA, to: DEX },
  { token: TOKEN_C, amount: 150n, from: DEX, to: CA },
];
const wrapTransfers: TokenTransfer[] = [
  { token: TOKEN_A, amount: 300n, from: CA, to: DEX },
  { token: TOKEN_B, amount: 300n, from: DEX, to: CA },
];

describe("classifyCreditAccountOperation", () => {
  describe("adapter-only multicall", () => {
    it("classifies 3 adapter calls with correct transfer alignment", () => {
      const register = setupRegister();
      const innerCalls = [
        makeParsed(ADAPTER_UNI, "exactInputSingle"),
        makeParsed(ADAPTER_CURVE, "exchange"),
        makeParsed(ADAPTER_WSTETH, "wrap"),
      ];

      const result = classifyMulticallOperations({
        innerCalls,
        executeTransfers: [swapTransfers, curveTransfers, wrapTransfers],
        adapterTraces: makeAdapterTraces(3),
        register,
        creditAccount: CA,
        underlying: UNDERLYING,
      });

      expect(result).toMatchObject([
        {
          adapter: ADAPTER_UNI,
          legacy: { operation: "Swap" },
        },
        {
          adapter: ADAPTER_CURVE,
          legacy: { operation: "CurveExchange" },
        },
        {
          adapter: ADAPTER_WSTETH,
          legacy: { operation: "WstETHWrap" },
        },
      ]);
    });
  });

  describe("mixed multicall", () => {
    it("interleaves adapter and facade calls, consuming transfers only for adapters", () => {
      const register = setupRegister();
      const innerCalls = [
        makeParsed(FACADE, "increaseDebt", { amount: 1000n }),
        makeParsed(ADAPTER_UNI, "exactInputSingle"),
        makeParsed(FACADE, "updateQuota", {
          token: TOKEN_A,
          quotaChange: 500n,
        }),
        makeParsed(ADAPTER_CURVE, "exchange"),
      ];

      const result = classifyMulticallOperations({
        innerCalls,
        executeTransfers: [swapTransfers, curveTransfers],
        adapterTraces: makeAdapterTraces(2),
        register,
        creditAccount: CA,
        underlying: UNDERLYING,
      });

      expect(result).toMatchObject([
        {
          operation: "IncreaseBorrowedAmount",
          token: UNDERLYING,
          amount: 1000n,
        },
        {
          adapter: ADAPTER_UNI,
          legacy: { operation: "Swap" },
        },
        { operation: "UpdateQuota", token: TOKEN_A, change: 500n },
        {
          adapter: ADAPTER_CURVE,
          legacy: { operation: "CurveExchange" },
        },
      ]);
    });
  });

  describe("facade inner call classification", () => {
    it("classifies increaseDebt", () => {
      const register = setupRegister();
      const [result] = classifyMulticallOperations({
        innerCalls: [makeParsed(FACADE, "increaseDebt", { amount: 5000n })],
        executeTransfers: [],
        adapterTraces: [],
        register,
        creditAccount: CA,
        underlying: UNDERLYING,
        strict: true,
      });
      expect(result).toEqual({
        operation: "IncreaseBorrowedAmount",
        token: UNDERLYING,
        amount: 5000n,
      });
    });

    it("classifies decreaseDebt", () => {
      const register = setupRegister();
      const [result] = classifyMulticallOperations({
        innerCalls: [makeParsed(FACADE, "decreaseDebt", { amount: 3000n })],
        executeTransfers: [],
        adapterTraces: [],
        register,
        creditAccount: CA,
        underlying: UNDERLYING,
        strict: true,
      });
      expect(result).toEqual({
        operation: "DecreaseBorrowedAmount",
        token: UNDERLYING,
        amount: 3000n,
      });
    });

    it("classifies addCollateral", () => {
      const register = setupRegister();
      const [result] = classifyMulticallOperations({
        innerCalls: [
          makeParsed(FACADE, "addCollateral", {
            token: TOKEN_A,
            amount: 100n,
          }),
        ],
        executeTransfers: [],
        adapterTraces: [],
        register,
        creditAccount: CA,
        underlying: UNDERLYING,
        strict: true,
      });
      expect(result).toEqual({
        operation: "AddCollateral",
        token: TOKEN_A,
        amount: 100n,
      });
    });

    it("classifies withdrawCollateral", () => {
      const register = setupRegister();
      const to = addr("0xCC");
      const [result] = classifyMulticallOperations({
        innerCalls: [
          makeParsed(FACADE, "withdrawCollateral", {
            token: TOKEN_B,
            amount: 200n,
            to,
          }),
        ],
        executeTransfers: [],
        adapterTraces: [],
        register,
        creditAccount: CA,
        underlying: UNDERLYING,
        strict: true,
      });
      expect(result).toEqual({
        operation: "WithdrawCollateral",
        token: TOKEN_B,
        amount: 200n,
        to,
      });
    });

    it("classifies updateQuota", () => {
      const register = setupRegister();
      const [result] = classifyMulticallOperations({
        innerCalls: [
          makeParsed(FACADE, "updateQuota", {
            token: TOKEN_C,
            quotaChange: -400n,
          }),
        ],
        executeTransfers: [],
        adapterTraces: [],
        register,
        creditAccount: CA,
        underlying: UNDERLYING,
        strict: true,
      });
      expect(result).toEqual({
        operation: "UpdateQuota",
        token: TOKEN_C,
        change: -400n,
      });
    });
  });

  it("no-op facade call is filtered out", () => {
    const register = setupRegister();
    const result = classifyMulticallOperations({
      innerCalls: [makeParsed(FACADE, "setBotPermissions")],
      executeTransfers: [],
      adapterTraces: [],
      register,
      creditAccount: CA,
      underlying: UNDERLYING,
      strict: true,
    });
    expect(result).toEqual([]);
  });

  describe("transfer alignment", () => {
    it("throws TransferAlignmentError when too many transfers", () => {
      const register = setupRegister();
      expect(() =>
        classifyMulticallOperations({
          innerCalls: [makeParsed(FACADE, "increaseDebt", { amount: 100n })],
          executeTransfers: [swapTransfers],
          adapterTraces: makeAdapterTraces(1),
          register,
          creditAccount: CA,
          underlying: UNDERLYING,
          strict: true,
        }),
      ).toThrow();
    });

    it("throws TransferAlignmentError when too few transfers", () => {
      const register = setupRegister();
      expect(() =>
        classifyMulticallOperations({
          innerCalls: [
            makeParsed(ADAPTER_UNI, "exactInputSingle"),
            makeParsed(ADAPTER_CURVE, "exchange"),
          ],
          executeTransfers: [swapTransfers],
          adapterTraces: makeAdapterTraces(1),
          register,
          creditAccount: CA,
          underlying: UNDERLYING,
        }),
      ).toThrow();
    });
  });

  describe("unknown contract fallback", () => {
    it("falls back to Swap for address not in register", () => {
      const register = setupRegister();
      const [result] = classifyMulticallOperations({
        innerCalls: [makeParsed(UNKNOWN, "doSomething")],
        executeTransfers: [swapTransfers],
        adapterTraces: makeAdapterTraces(1),
        register,
        creditAccount: CA,
        underlying: UNDERLYING,
      });
      expect(result).toMatchObject({
        adapter: UNKNOWN,
        protocol: undefined,
        legacy: {
          operation: "Swap",
          from: TOKEN_A,
          fromAmount: "100",
          to: TOKEN_B,
          toAmount: "200",
        },
      });
    });

    it("consumes a transfer entry for unknown contract", () => {
      const register = setupRegister();
      expect(() =>
        classifyMulticallOperations({
          innerCalls: [makeParsed(UNKNOWN, "doSomething")],
          executeTransfers: [],
          adapterTraces: [],
          register,
          creditAccount: CA,
          underlying: UNDERLYING,
          strict: true,
        }),
      ).toThrow();
    });

    it("throws UnknownAdapterError in strict mode", () => {
      const register = setupRegister();
      expect(() =>
        classifyMulticallOperations({
          innerCalls: [makeParsed(UNKNOWN, "doSomething")],
          executeTransfers: [swapTransfers],
          adapterTraces: makeAdapterTraces(1),
          register,
          creditAccount: CA,
          underlying: UNDERLYING,
          strict: true,
        }),
      ).toThrow();
    });
  });

  describe("empty transfers for adapter calls", () => {
    it("produces zero-valued operation when transfers are empty", () => {
      const register = setupRegister();
      const [result] = classifyMulticallOperations({
        innerCalls: [makeParsed(ADAPTER_UNI, "exactInputSingle")],
        executeTransfers: [[]],
        adapterTraces: makeAdapterTraces(1),
        register,
        creditAccount: CA,
        underlying: UNDERLYING,
      });
      expect(result).toMatchObject({
        adapter: ADAPTER_UNI,
        legacy: {
          operation: "MakerDeposit",
          token: zeroAddress,
          amount: "0",
        },
      });
    });
  });

  describe("phantom token withdrawal", () => {
    const PHANTOM = addr("0xF0");
    const DEPOSITED = addr("0xF1");

    it("resolves deposited token and sets phantomToken when phantom map provided", () => {
      const register = setupRegister();
      const to = addr("0xCC");
      const phantomTokens = new AddressMap([[PHANTOM, DEPOSITED]]);
      const [result] = classifyMulticallOperations({
        innerCalls: [
          makeParsed(FACADE, "withdrawCollateral", {
            token: PHANTOM,
            amount: 200n,
            to,
          }),
        ],
        executeTransfers: [],
        adapterTraces: [],
        register,
        creditAccount: CA,
        underlying: UNDERLYING,
        strict: true,
        phantomTokens,
      });
      expect(result).toEqual({
        operation: "WithdrawCollateral",
        token: DEPOSITED,
        amount: 200n,
        to,
        phantomToken: PHANTOM,
      });
    });

    it("leaves token unchanged when token is not in phantom map", () => {
      const register = setupRegister();
      const to = addr("0xCC");
      const phantomTokens = new AddressMap([[PHANTOM, DEPOSITED]]);
      const [result] = classifyMulticallOperations({
        innerCalls: [
          makeParsed(FACADE, "withdrawCollateral", {
            token: TOKEN_B,
            amount: 200n,
            to,
          }),
        ],
        executeTransfers: [],
        adapterTraces: [],
        register,
        creditAccount: CA,
        underlying: UNDERLYING,
        strict: true,
        phantomTokens,
      });
      expect(result).toEqual({
        operation: "WithdrawCollateral",
        token: TOKEN_B,
        amount: 200n,
        to,
      });
    });

    it("leaves token unchanged when phantom map is not provided", () => {
      const register = setupRegister();
      const to = addr("0xCC");
      const [result] = classifyMulticallOperations({
        innerCalls: [
          makeParsed(FACADE, "withdrawCollateral", {
            token: PHANTOM,
            amount: 200n,
            to,
          }),
        ],
        executeTransfers: [],
        adapterTraces: [],
        register,
        creditAccount: CA,
        underlying: UNDERLYING,
        strict: true,
      });
      expect(result).toEqual({
        operation: "WithdrawCollateral",
        token: PHANTOM,
        amount: 200n,
        to,
      });
    });
  });

  describe("withdrawCollateralEvents", () => {
    const PHANTOM = addr("0xF0");
    const DEPOSITED = addr("0xF1");
    const MAX_UINT256 =
      115792089237316195423570985008687907853269984665640564039457584007913129639935n;

    it("uses event amount over rawArgs.amount for regular withdrawal", () => {
      const register = setupRegister();
      const to = addr("0xCC");
      const [result] = classifyMulticallOperations({
        innerCalls: [
          makeParsed(FACADE, "withdrawCollateral", {
            token: TOKEN_B,
            amount: MAX_UINT256,
            to,
          }),
        ],
        executeTransfers: [],
        adapterTraces: [],
        register,
        creditAccount: CA,
        underlying: UNDERLYING,
        strict: true,
        withdrawCollateralEvents: [{ token: TOKEN_B, amount: 12345n, to }],
      });
      expect(result).toEqual({
        operation: "WithdrawCollateral",
        token: TOKEN_B,
        amount: 12345n,
        to,
      });
    });

    it("uses event amount in deposited-token units for phantom withdrawal", () => {
      const register = setupRegister();
      const to = addr("0xCC");
      const phantomTokens = new AddressMap([[PHANTOM, DEPOSITED]]);
      const [result] = classifyMulticallOperations({
        innerCalls: [
          makeParsed(FACADE, "withdrawCollateral", {
            token: PHANTOM,
            amount: MAX_UINT256,
            to,
          }),
        ],
        executeTransfers: [],
        adapterTraces: [],
        register,
        creditAccount: CA,
        underlying: UNDERLYING,
        strict: true,
        phantomTokens,
        withdrawCollateralEvents: [{ token: DEPOSITED, amount: 9876n, to }],
      });
      expect(result).toEqual({
        operation: "WithdrawCollateral",
        token: DEPOSITED,
        amount: 9876n,
        to,
        phantomToken: PHANTOM,
      });
    });

    it("consumes events in FIFO order across multiple withdrawCollateral calls", () => {
      const register = setupRegister();
      const to = addr("0xCC");
      const result = classifyMulticallOperations({
        innerCalls: [
          makeParsed(FACADE, "withdrawCollateral", {
            token: TOKEN_A,
            amount: MAX_UINT256,
            to,
          }),
          makeParsed(FACADE, "increaseDebt", { amount: 1n }),
          makeParsed(FACADE, "withdrawCollateral", {
            token: TOKEN_B,
            amount: MAX_UINT256,
            to,
          }),
        ],
        executeTransfers: [],
        adapterTraces: [],
        register,
        creditAccount: CA,
        underlying: UNDERLYING,
        strict: true,
        withdrawCollateralEvents: [
          { token: TOKEN_A, amount: 111n, to },
          { token: TOKEN_B, amount: 222n, to },
        ],
      });
      expect(result).toMatchObject([
        { operation: "WithdrawCollateral", token: TOKEN_A, amount: 111n, to },
        { operation: "IncreaseBorrowedAmount", amount: 1n },
        { operation: "WithdrawCollateral", token: TOKEN_B, amount: 222n, to },
      ]);
    });

    it("falls back to rawArgs.amount when events are empty", () => {
      const register = setupRegister();
      const to = addr("0xCC");
      const [result] = classifyMulticallOperations({
        innerCalls: [
          makeParsed(FACADE, "withdrawCollateral", {
            token: TOKEN_B,
            amount: 200n,
            to,
          }),
        ],
        executeTransfers: [],
        adapterTraces: [],
        register,
        creditAccount: CA,
        underlying: UNDERLYING,
        strict: true,
        withdrawCollateralEvents: [],
      });
      expect(result).toEqual({
        operation: "WithdrawCollateral",
        token: TOKEN_B,
        amount: 200n,
        to,
      });
    });

    it("throws when more events than withdrawCollateral inner calls", () => {
      const register = setupRegister();
      const to = addr("0xCC");
      expect(() =>
        classifyMulticallOperations({
          innerCalls: [
            makeParsed(FACADE, "withdrawCollateral", {
              token: TOKEN_B,
              amount: MAX_UINT256,
              to,
            }),
          ],
          executeTransfers: [],
          adapterTraces: [],
          register,
          creditAccount: CA,
          underlying: UNDERLYING,
          strict: true,
          withdrawCollateralEvents: [
            { token: TOKEN_B, amount: 1n, to },
            { token: TOKEN_B, amount: 2n, to },
          ],
        }),
      ).toThrow(/withdrawCollateral event alignment mismatch/);
    });
  });
});
