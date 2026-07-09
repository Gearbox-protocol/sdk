import type { Address } from "viem";
import { decodeFunctionData } from "viem";
import { describe, expect, it } from "vitest";
import { iCreditFacadeMulticallV310Abi } from "../../abi/310/generated.js";
import type { OnchainSDK } from "../OnchainSDK.js";
import type { MultiCall } from "../types/index.js";
import { CreditAccountsServiceV310 } from "./CreditAccountsServiceV310.js";
import type { AssembleCaOperationsProps } from "./types.js";

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

  it("inlines swap, wrapRwaCollateral and unwrapRwaCollateral calls", () => {
    const service = makeService();
    const swapCall: MultiCall = {
      target: TOKEN_B,
      callData: "0x1234",
    };
    const wrapCall: MultiCall = {
      target: TOKEN_A,
      callData: "0x5678",
    };
    const unwrapCall: MultiCall = {
      target: TOKEN_A,
      callData: "0x9abc",
    };
    const props: AssembleCaOperationsProps = {
      operations: [
        { type: "wrapRwaCollateral", calls: [wrapCall] },
        { type: "unwrapRwaCollateral", calls: [unwrapCall] },
        { type: "swap", calls: [swapCall] },
      ],
      creditFacade: FACADE,
      withdrawTo: TO,
    };

    const calls = service.assembleCaOperations(props);
    expect(calls).toEqual([wrapCall, unwrapCall, swapCall]);
  });
});
