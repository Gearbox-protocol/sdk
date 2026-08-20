import type { Address } from "viem";
import { describe, expectTypeOf, it } from "vitest";
import type {
  DataResponse,
  LiquidatableAccount,
  LiquidationDetails,
  LiquidationPosition,
  TxCall,
} from "../../model/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { Mode } from "../types.js";
import type { Liquidations } from "./types.js";

const CREDIT_ACCOUNT = "0x0000000000000000000000000000000000000001" as Address;
const LIQUIDATOR = "0x0000000000000000000000000000000000000002" as Address;

describe("mode gates liquidations existence", () => {
  it("exists where a chain does", () => {
    expectTypeOf<
      GearboxSDK<"onchain">["liquidations"]
    >().toEqualTypeOf<Liquidations>();
    expectTypeOf<
      GearboxSDK<"both">["liquidations"]
    >().toEqualTypeOf<Liquidations>();
    expectTypeOf<
      GearboxSDK<"offchain">["liquidations"]
    >().toEqualTypeOf<undefined>();
  });

  it("a widened mode cannot tell whether liquidations is there", () => {
    expectTypeOf<GearboxSDK<Mode>["liquidations"]>().toEqualTypeOf<
      Liquidations | undefined
    >();
  });
});

describe("the public surface is the four on-chain reads", () => {
  it("does not expose loadRWALiquidators", () => {
    expectTypeOf<Liquidations>().not.toHaveProperty("loadRWALiquidators");
  });

  it("lists accounts, details, a tx, and delayed-withdrawal positions", () => {
    const liquidations = {} as Liquidations;
    expectTypeOf(liquidations.getLiquidatableAccounts).toBeCallableWith();
    expectTypeOf(liquidations.getLiquidatableAccounts).toBeCallableWith({
      chainIds: [1],
    });
    expectTypeOf(
      liquidations.getLiquidatableAccounts,
    ).returns.resolves.toEqualTypeOf<DataResponse<LiquidatableAccount[]>>();

    expectTypeOf(liquidations.getLiquidationDetails).toBeCallableWith({
      network: "Mainnet",
      creditAccount: CREDIT_ACCOUNT,
    });
    expectTypeOf(
      liquidations.getLiquidationDetails,
    ).returns.resolves.toEqualTypeOf<DataResponse<LiquidationDetails>>();

    expectTypeOf(liquidations.buildLiquidationTx).toBeCallableWith({
      network: "Mainnet",
      creditAccount: CREDIT_ACCOUNT,
      liquidator: LIQUIDATOR,
    });
    expectTypeOf(
      liquidations.buildLiquidationTx,
    ).returns.resolves.toEqualTypeOf<DataResponse<TxCall>>();

    expectTypeOf(liquidations.getLiquidationPositions).toBeCallableWith({
      liquidator: LIQUIDATOR,
    });
    expectTypeOf(
      liquidations.getLiquidationPositions,
    ).returns.resolves.toEqualTypeOf<DataResponse<LiquidationPosition[]>>();
  });
});
