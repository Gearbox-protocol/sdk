import type { Address, Hex } from "viem";
import {
  createPublicClient,
  custom,
  getAddress,
  padHex,
  zeroAddress,
} from "viem";
import { mainnet } from "viem/chains";
import { describe, expect, it } from "vitest";
import {
  Curve2AssetsAdapterContract,
  type TokenTransfer,
  UniswapV3AdapterContract,
  WstETHV1AdapterContract,
} from "../plugins/adapters/index.js";
import {
  AddressMap,
  ChainContractsRegister,
  CreditFacadeV310BaseContract,
  type ParsedCallV2,
} from "../sdk/index.js";
import { classifyMulticallOperations } from "./classifyMulticallOperations.js";
import type { ExecuteResult } from "./internal-types.js";

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

function toExecuteResults(
  transferArrays: TokenTransfer[][],
  protocol: Address = TARGET,
): ExecuteResult[] {
  return transferArrays.map(transfers => ({
    transfers,
    targetContract: protocol,
  }));
}

const DUMMY_CALLDATA = "0x00000000" as Hex;

function dummyProtocolCalldatas(count: number): Hex[] {
  return Array.from({ length: count }, () => DUMMY_CALLDATA);
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
    rawArgs,
  };
}

function setupRegister(): ChainContractsRegister {
  const client = createPublicClient({
    chain: mainnet,
    transport: custom({
      request: () => {
        throw new Error("not implemented");
      },
    }),
  });

  const register = new ChainContractsRegister(client);
  register.resetContracts();

  new UniswapV3AdapterContract(
    { register },
    {
      baseParams: { ...adapterBase, addr: ADAPTER_UNI },
    },
  );

  new Curve2AssetsAdapterContract(
    { register },
    {
      baseParams: { ...adapterBase, addr: ADAPTER_CURVE },
    },
  );

  new WstETHV1AdapterContract(
    { register },
    {
      baseParams: { ...adapterBase, addr: ADAPTER_WSTETH },
    },
  );

  new CreditFacadeV310BaseContract(
    { register },
    {
      addr: FACADE,
      name: "CreditFacade",
    },
  );

  return register;
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
        executeResults: toExecuteResults([
          swapTransfers,
          curveTransfers,
          wrapTransfers,
        ]),
        protocolCalldatas: dummyProtocolCalldatas(3),
        register,
        creditAccount: CA,
        underlying: UNDERLYING,
      });

      expect(result).toMatchObject([
        {
          adapter: ADAPTER_UNI,
          protocol: TARGET,
          legacy: { operation: "Swap" },
        },
        {
          adapter: ADAPTER_CURVE,
          protocol: TARGET,
          legacy: { operation: "CurveExchange" },
        },
        {
          adapter: ADAPTER_WSTETH,
          protocol: TARGET,
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
        executeResults: toExecuteResults([swapTransfers, curveTransfers]),
        protocolCalldatas: dummyProtocolCalldatas(2),
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
          protocol: TARGET,
          legacy: { operation: "Swap" },
        },
        { operation: "UpdateQuota", token: TOKEN_A, change: 500n },
        {
          adapter: ADAPTER_CURVE,
          protocol: TARGET,
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
        executeResults: [],
        protocolCalldatas: [],
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
        executeResults: [],
        protocolCalldatas: [],
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
        executeResults: [],
        protocolCalldatas: [],
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
        executeResults: [],
        protocolCalldatas: [],
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
        executeResults: [],
        protocolCalldatas: [],
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
      executeResults: [],
      protocolCalldatas: [],
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
          executeResults: toExecuteResults([swapTransfers]),
          protocolCalldatas: dummyProtocolCalldatas(1),
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
          executeResults: toExecuteResults([swapTransfers]),
          protocolCalldatas: dummyProtocolCalldatas(1),
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
        executeResults: toExecuteResults([swapTransfers]),
        protocolCalldatas: dummyProtocolCalldatas(1),
        register,
        creditAccount: CA,
        underlying: UNDERLYING,
      });
      expect(result).toMatchObject({
        adapter: UNKNOWN,
        protocol: TARGET,
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
          executeResults: [],
          protocolCalldatas: [],
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
          executeResults: toExecuteResults([swapTransfers]),
          protocolCalldatas: dummyProtocolCalldatas(1),
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
        executeResults: toExecuteResults([[]]),
        protocolCalldatas: dummyProtocolCalldatas(1),
        register,
        creditAccount: CA,
        underlying: UNDERLYING,
      });
      expect(result).toMatchObject({
        adapter: ADAPTER_UNI,
        protocol: TARGET,
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
        executeResults: [],
        protocolCalldatas: [],
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
        executeResults: [],
        protocolCalldatas: [],
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
        executeResults: [],
        protocolCalldatas: [],
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
});
