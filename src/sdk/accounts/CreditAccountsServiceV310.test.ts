import type { Address } from "viem";
import { decodeFunctionData } from "viem";
import { describe, expect, it } from "vitest";
import { iCreditFacadeMulticallV310Abi } from "../../abi/310/generated.js";
import { MAX_UINT256, MIN_INT96 } from "../constants/index.js";
import type { OnchainSDK } from "../OnchainSDK.js";
import type { MultiCall } from "../types/index.js";
import { CreditAccountsServiceV310 } from "./CreditAccountsServiceV310.js";
import type {
  AssembleCaOperationsProps,
  AssembleCaUpdateCallsProps,
} from "./types.js";

const FACADE: Address = "0xC78CF21A0f92929aC34ee86Cf94C15c9EE224adE";
const TOKEN_A: Address = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0";
const TOKEN_B: Address = "0xB908c9FE885369643adB5FBA4407d52bD726c72d";
const TO: Address = "0x1234567890123456789012345678901234567890";

function makeService() {
  return new CreditAccountsServiceV310({} as unknown as OnchainSDK);
}

function decode(call: MultiCall) {
  return decodeFunctionData({
    abi: iCreditFacadeMulticallV310Abi,
    data: call.callData,
  });
}

describe("CreditAccountsServiceV310.assembleCaOperations", () => {
  it("assembles debt, collateral and quota operations", () => {
    const service = makeService();
    const props: AssembleCaOperationsProps = {
      operations: [
        { type: "increaseDebt", amount: 100n },
        { type: "addCollateral", token: TOKEN_A, amount: 200n },
        {
          type: "changeQuota",
          quotaIncrease: [{ token: TOKEN_A, balance: 50n }],
          quotaDecrease: [],
        },
        { type: "withdrawCollateral", token: TOKEN_A, amount: 25n },
      ],
      creditFacade: FACADE,
      withdrawTo: TO,
    };

    const calls = service.assembleCaOperations(props);
    expect(calls).toHaveLength(4);

    expect(decode(calls[0]).functionName).toBe("increaseDebt");
    expect(decode(calls[1]).functionName).toBe("addCollateral");
    expect(decode(calls[2]).functionName).toBe("updateQuota");
    expect(decode(calls[3]).functionName).toBe("withdrawCollateral");
  });

  it("inlines swap and wrapRwaCollateral calls", () => {
    const service = makeService();
    const swapCall: MultiCall = {
      target: TOKEN_B,
      callData: "0x1234",
    };
    const wrapCall: MultiCall = {
      target: TOKEN_A,
      callData: "0x5678",
    };
    const props: AssembleCaOperationsProps = {
      operations: [
        { type: "wrapRwaCollateral", calls: [wrapCall] },
        { type: "swap", calls: [swapCall] },
      ],
      creditFacade: FACADE,
      withdrawTo: TO,
    };

    const calls = service.assembleCaOperations(props);
    expect(calls).toEqual([wrapCall, swapCall]);
  });
});

describe("CreditAccountsServiceV310.assembleCaUpdateCalls", () => {
  it("assembles debt, collateral and quota operations", () => {
    const service = makeService();
    const props: AssembleCaUpdateCallsProps = {
      operations: [
        { type: "increaseDebt", amount: 100n },
        { type: "addCollateral", token: TOKEN_A, amount: 200n },
        {
          type: "changeQuota",
          quotaIncrease: [{ token: TOKEN_A, balance: 50n }],
          quotaDecrease: [],
        },
        { type: "withdrawCollateral", token: TOKEN_A, amount: 25n },
      ],
      routerCallGroups: [],
      creditFacade: FACADE,
      withdrawTo: TO,
      creditAccount: { debt: 0n, assets: [], initialQuotas: {} },
      underlyingToken: TOKEN_A,
    };

    const calls = service.assembleCaUpdateCalls(props);
    expect(calls).toHaveLength(4);

    expect(decode(calls[0]).functionName).toBe("increaseDebt");
    expect(decode(calls[1]).functionName).toBe("addCollateral");
    expect(decode(calls[2]).functionName).toBe("updateQuota");
    expect(decode(calls[3]).functionName).toBe("withdrawCollateral");
  });

  it("consumes router call groups for swaps", () => {
    const service = makeService();
    const swapCall: MultiCall = {
      target: TOKEN_B,
      callData: "0x1234",
    };
    const props: AssembleCaUpdateCallsProps = {
      operations: [{ type: "swap" }, { type: "swap" }],
      routerCallGroups: [[swapCall], [swapCall]],
      creditFacade: FACADE,
      withdrawTo: TO,
      creditAccount: { debt: 0n, assets: [], initialQuotas: {} },
      underlyingToken: TOKEN_A,
    };

    const calls = service.assembleCaUpdateCalls(props);
    expect(calls).toHaveLength(2);
    expect(calls[0]).toEqual(swapCall);
    expect(calls[1]).toEqual(swapCall);
  });

  it("throws on router call group mismatch", () => {
    const service = makeService();
    const props: AssembleCaUpdateCallsProps = {
      operations: [{ type: "swap" }],
      routerCallGroups: [],
      creditFacade: FACADE,
      withdrawTo: TO,
      creditAccount: { debt: 0n, assets: [], initialQuotas: {} },
      underlyingToken: TOKEN_A,
    };

    expect(() => service.assembleCaUpdateCalls(props)).toThrow(
      "missing router calls for swap leg 0",
    );
  });

  it("assembles close credit account tail", () => {
    const service = makeService();
    const props: AssembleCaUpdateCallsProps = {
      operations: [{ type: "closeCreditAccount" }],
      routerCallGroups: [],
      creditFacade: FACADE,
      withdrawTo: TO,
      creditAccount: {
        debt: 100n,
        assets: [{ token: TOKEN_A, balance: 1n }],
        initialQuotas: {
          [TOKEN_A]: { quota: 10n },
        },
      },
      underlyingToken: TOKEN_A,
    };

    const calls = service.assembleCaUpdateCalls(props);
    expect(calls).toHaveLength(3);

    const disable = decode(calls[0]);
    expect(disable.functionName).toBe("updateQuota");
    expect(disable.args).toEqual([TOKEN_A, MIN_INT96, 0n]);

    const repay = decode(calls[1]);
    expect(repay.functionName).toBe("decreaseDebt");
    expect(repay.args).toEqual([MAX_UINT256]);

    const withdraw = decode(calls[2]);
    expect(withdraw.functionName).toBe("withdrawCollateral");
    expect(withdraw.args).toEqual([TOKEN_A, MAX_UINT256, TO]);
  });
});
