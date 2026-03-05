import type {
  Abi,
  Address,
  ContractFunctionName,
  EncodeFunctionDataParameters,
  Hex,
} from "viem";
import {
  createPublicClient,
  custom,
  encodeFunctionData,
  getAddress,
  parseAbi,
  stringToHex,
} from "viem";
import { mainnet } from "viem/chains";
import { describe, expect, it } from "vitest";

import {
  iCreditFacadeMulticallV310Abi,
  iCreditFacadeV310Abi,
} from "../../../abi/310/generated.js";
import { iPausableAbi } from "../../../abi/iPausable.js";
import type { CreditSuiteState } from "../../base/index.js";
import { BaseContract } from "../../base/index.js";
import { ADDRESS_0X0 } from "../../constants/index.js";
import { CreditFacadeV310Contract } from "./CreditFacadeV310Contract.js";

const client = createPublicClient({
  chain: mainnet,
  transport: custom({
    request: async () => {
      throw new Error("not implemented");
    },
  }),
});

const FACADE_ADDR = getAddress("0xFACADE0000000000000000000000000000000310");
const ADAPTER_ADDR = getAddress("0xADAD000000000000000000000000000000000001");
const CREDIT_ACCOUNT = getAddress("0xCCA0000000000000000000000000000000000001");
const TOKEN_ADDR = getAddress("0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB");
const UNKNOWN_ADDR = getAddress("0xDEAD000000000000000000000000000000000000");
const ON_BEHALF_OF = getAddress("0x1111111111111111111111111111111111111111");
const LIQUIDATOR = getAddress("0x2222222222222222222222222222222222222222");

const facadeAbi = [
  ...iCreditFacadeV310Abi,
  ...iCreditFacadeMulticallV310Abi,
  ...iPausableAbi,
] as const;

const adapterAbi = parseAbi([
  "function swap(address tokenIn, address tokenOut, uint256 amountIn)",
]);

function encodeInnerCall<
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi>,
>(
  target: Address,
  parameters: EncodeFunctionDataParameters<abi, functionName>,
): { target: Address; callData: Hex } {
  return {
    target,
    callData: encodeFunctionData(parameters as EncodeFunctionDataParameters),
  };
}

const FACADE_NAME = "CreditFacadeV310(TestCM)";

function makeFacadeAndAdapter() {
  const options = { client };

  const facade = new CreditFacadeV310Contract(options, {
    creditFacade: {
      baseParams: {
        addr: FACADE_ADDR,
        version: 310n,
        contractType: stringToHex("CF", { size: 32 }),
        serializedParams: "0x",
      },
      degenNFT: ADDRESS_0X0,
      botList: ADDRESS_0X0,
      expirable: false,
      expirationDate: 0,
      maxDebtPerBlockMultiplier: 4,
      minDebt: 0n,
      maxDebt: 0n,
      forbiddenTokensMask: 0n,
      isPaused: false,
    },
    creditManager: {
      name: "TestCM",
      underlying: TOKEN_ADDR,
    },
  } as unknown as CreditSuiteState);

  const adapter = new BaseContract(options, {
    abi: adapterAbi,
    addr: ADAPTER_ADDR,
    name: "UniswapV3Adapter",
    version: 310,
    contractType: "AD_UNISWAP_V3",
  });

  return { facade, adapter };
}

function facadeCall(functionName: string, rawArgs: Record<string, unknown>) {
  return {
    chainId: 1,
    target: FACADE_ADDR,
    contractType: "CF",
    label: FACADE_NAME,
    version: 310,
    functionName,
    rawArgs,
  };
}

function adapterCall(functionName: string, rawArgs: Record<string, unknown>) {
  return {
    chainId: 1,
    target: ADAPTER_ADDR,
    contractType: "AD_UNISWAP_V3",
    label: "UniswapV3Adapter",
    version: 310,
    functionName,
    rawArgs,
  };
}

describe("parseFunctionDataV2", () => {
  it("multicall with known inner calls returns ParsedCallV2[] in rawArgs.calls", () => {
    const { facade } = makeFacadeAndAdapter();

    const innerCalls = [
      encodeInnerCall(FACADE_ADDR, {
        abi: facadeAbi,
        functionName: "addCollateral",
        args: [TOKEN_ADDR, 1000n],
      }),
      encodeInnerCall(ADAPTER_ADDR, {
        abi: adapterAbi,
        functionName: "swap",
        args: [TOKEN_ADDR, CREDIT_ACCOUNT, 500n],
      }),
    ];

    const calldata = encodeFunctionData({
      abi: facadeAbi,
      functionName: "multicall",
      args: [CREDIT_ACCOUNT, innerCalls],
    });

    expect(facade.parseFunctionDataV2(calldata)).toEqual(
      facadeCall("multicall(address,(address,bytes)[])", {
        creditAccount: CREDIT_ACCOUNT,
        calls: [
          facadeCall("addCollateral(address,uint256)", {
            token: TOKEN_ADDR,
            amount: 1000n,
          }),
          adapterCall("swap(address,address,uint256)", {
            tokenIn: TOKEN_ADDR,
            tokenOut: CREDIT_ACCOUNT,
            amountIn: 500n,
          }),
        ],
      }),
    );
  });

  it("openCreditAccount parses multicall inner calls", () => {
    const { facade } = makeFacadeAndAdapter();

    const innerCalls = [
      encodeInnerCall(FACADE_ADDR, {
        abi: facadeAbi,
        functionName: "increaseDebt",
        args: [5000n],
      }),
    ];

    const calldata = encodeFunctionData({
      abi: facadeAbi,
      functionName: "openCreditAccount",
      args: [ON_BEHALF_OF, innerCalls, 0n],
    });

    expect(facade.parseFunctionDataV2(calldata)).toEqual(
      facadeCall("openCreditAccount(address,(address,bytes)[],uint256)", {
        onBehalfOf: ON_BEHALF_OF,
        calls: [facadeCall("increaseDebt(uint256)", { amount: 5000n })],
        referralCode: 0n,
      }),
    );
  });

  it("closeCreditAccount parses multicall inner calls", () => {
    const { facade } = makeFacadeAndAdapter();

    const innerCalls = [
      encodeInnerCall(FACADE_ADDR, {
        abi: facadeAbi,
        functionName: "addCollateral",
        args: [TOKEN_ADDR, 200n],
      }),
    ];

    const calldata = encodeFunctionData({
      abi: facadeAbi,
      functionName: "closeCreditAccount",
      args: [CREDIT_ACCOUNT, innerCalls],
    });

    expect(facade.parseFunctionDataV2(calldata)).toEqual(
      facadeCall("closeCreditAccount(address,(address,bytes)[])", {
        creditAccount: CREDIT_ACCOUNT,
        calls: [
          facadeCall("addCollateral(address,uint256)", {
            token: TOKEN_ADDR,
            amount: 200n,
          }),
        ],
      }),
    );
  });

  it("liquidateCreditAccount parses multicall inner calls", () => {
    const { facade } = makeFacadeAndAdapter();

    const innerCalls = [
      encodeInnerCall(ADAPTER_ADDR, {
        abi: adapterAbi,
        functionName: "swap",
        args: [TOKEN_ADDR, CREDIT_ACCOUNT, 1000n],
      }),
    ];

    const calldata = encodeFunctionData({
      abi: facadeAbi,
      functionName: "liquidateCreditAccount",
      args: [CREDIT_ACCOUNT, LIQUIDATOR, innerCalls],
    });

    expect(facade.parseFunctionDataV2(calldata)).toEqual(
      facadeCall("liquidateCreditAccount(address,address,(address,bytes)[])", {
        creditAccount: CREDIT_ACCOUNT,
        to: LIQUIDATOR,
        calls: [
          adapterCall("swap(address,address,uint256)", {
            tokenIn: TOKEN_ADDR,
            tokenOut: CREDIT_ACCOUNT,
            amountIn: 1000n,
          }),
        ],
      }),
    );
  });

  it("unknown inner call with strict=false returns fallback in array", () => {
    const { facade } = makeFacadeAndAdapter();

    const unknownCalldata =
      "0xdeadbeef0000000000000000000000000000000000000000000000000000000000000001" as Hex;

    const innerCalls = [
      encodeInnerCall(FACADE_ADDR, {
        abi: facadeAbi,
        functionName: "addCollateral",
        args: [TOKEN_ADDR, 100n],
      }),
      { target: UNKNOWN_ADDR, callData: unknownCalldata },
    ];

    const calldata = encodeFunctionData({
      abi: facadeAbi,
      functionName: "multicall",
      args: [CREDIT_ACCOUNT, innerCalls],
    });

    expect(facade.parseFunctionDataV2(calldata)).toEqual(
      facadeCall("multicall(address,(address,bytes)[])", {
        creditAccount: CREDIT_ACCOUNT,
        calls: [
          facadeCall("addCollateral(address,uint256)", {
            token: TOKEN_ADDR,
            amount: 100n,
          }),
          {
            chainId: 1,
            target: UNKNOWN_ADDR,
            contractType: "",
            label: UNKNOWN_ADDR,
            version: 0,
            functionName: "unknown function 0xdeadbeef",
            rawArgs: {
              _data:
                "0x0000000000000000000000000000000000000000000000000000000000000001",
            },
          },
        ],
      }),
    );
  });

  it("unknown inner call with strict=true throws", () => {
    const { facade } = makeFacadeAndAdapter();

    const innerCalls = [
      {
        target: UNKNOWN_ADDR,
        callData:
          "0xdeadbeef0000000000000000000000000000000000000000000000000000000000000001" as Hex,
      },
    ];

    const calldata = encodeFunctionData({
      abi: facadeAbi,
      functionName: "multicall",
      args: [CREDIT_ACCOUNT, innerCalls],
    });

    expect(() => facade.parseFunctionDataV2(calldata, true)).toThrow();
  });

  it("non-multicall function falls through to default parsing", () => {
    const { facade } = makeFacadeAndAdapter();

    const calldata = encodeFunctionData({
      abi: facadeAbi,
      functionName: "addCollateral",
      args: [TOKEN_ADDR, 999n],
    });

    expect(facade.parseFunctionDataV2(calldata)).toEqual(
      facadeCall("addCollateral(address,uint256)", {
        token: TOKEN_ADDR,
        amount: 999n,
      }),
    );
  });
});
