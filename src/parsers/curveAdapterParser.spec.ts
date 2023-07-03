import { expect } from "chai";

import { RAY, WAD } from "../core/constants";
import { ICurveV1_2AssetsAdapter__factory } from "../types";
import { CurveAdapterParser } from "./curveAdapterParser";

describe("CurveAdapterParser test", () => {
  it("stake / withdraw functions works well", () => {
    let parser = new CurveAdapterParser("CURVE_FRAX_POOL", false);

    const ifc = ICurveV1_2AssetsAdapter__factory.createInterface();

    let parsed = parser.parse(
      ifc.encodeFunctionData("exchange", [0, 1, WAD * 3n, WAD * 32n]),
    );
    expect(parsed).to.be.eq(
      "Curve2AssetsAdapter[CURVE_FRAX_POOL].exchange(i ,j: FRAX => 3Crv, dx: 3.00 [3000000000000000000], min_dy: 32.00 [32000000000000000000])",
      "Curve2AssetsAdapter: Incorrect parse exchange",
    );

    parsed = parser.parse(
      ifc.encodeFunctionData("exchange_underlying", [
        0,
        1,
        WAD * 3n,
        WAD * 32n,
      ]),
    );
    expect(parsed).to.be.eq(
      "Curve2AssetsAdapter[CURVE_FRAX_POOL].exchange_underlying(i ,j: FRAX => DAI, dx: 3.00 [3000000000000000000], min_dy: 32.00 [32000000000000000000])",
      "Curve2AssetsAdapter: Incorrect parse exchange_underlying",
    );

    parsed = parser.parse(
      ifc.encodeFunctionData("add_liquidity_one_coin", [WAD * 3n, 0, WAD * 2n]),
    );
    expect(parsed).to.be.eq(
      "Curve2AssetsAdapter[CURVE_FRAX_POOL].add_liquidity_one_coin(amount: 3.00 [3000000000000000000], i: FRAX, minAmount: 2.00 [2000000000000000000])",
      "Curve2AssetsAdapter: Incorrect parse add_liquidity_one_coin",
    );

    parsed = parser.parse(
      ifc.encodeFunctionData("add_all_liquidity_one_coin", [0, RAY * 912n]),
    );
    expect(parsed).to.be.eq(
      "Curve2AssetsAdapter[CURVE_FRAX_POOL].add_all_liquidity_one_coin(i: FRAX, rateMinRAY: 912.00)",
      "Curve2AssetsAdapter: Incorrect parse add_all_liquidity_one_coin",
    );

    parsed = parser.parse(
      ifc.encodeFunctionData("remove_all_liquidity_one_coin", [0, RAY * 721n]),
    );
    expect(parsed).to.be.eq(
      "Curve2AssetsAdapter[CURVE_FRAX_POOL].remove_all_liquidity_one_coin(i: FRAX, rateMinRAY: 721.00)",
      "Curve2AssetsAdapter: Incorrect parse remove_all_liquidity_one_coin",
    );

    parsed = parser.parse(
      ifc.encodeFunctionData("add_liquidity", [
        [WAD * 100n, WAD * 100n],
        WAD * 80n,
      ]),
    );
    expect(parsed).to.be.eq(
      "Curve2AssetsAdapter[CURVE_FRAX_POOL].add_liquidity(amounts: [FRAX: 100.00 [100000000000000000000], 3Crv: 100.00 [100000000000000000000]], minAmount: 80.00 [80000000000000000000])",
      "Curve2AssetsAdapter: Incorrect parse add_liquidity",
    );

    parsed = parser.parse(
      ifc.encodeFunctionData("remove_liquidity", [
        WAD * 120n,
        [WAD * 100n, WAD * 100n],
      ]),
    );
    expect(parsed).to.be.eq(
      "Curve2AssetsAdapter[CURVE_FRAX_POOL].remove_liquidity(amount: 120.00 [120000000000000000000], min_amounts: [FRAX: 100.00 [100000000000000000000], 3Crv: 100.00 [100000000000000000000]])",
      "Curve2AssetsAdapter: Incorrect parse remove_liquidity",
    );

    parsed = parser.parse(
      ifc.encodeFunctionData("remove_liquidity_imbalance", [
        [WAD * 100n, WAD * 100n],
        WAD * 80n,
      ]),
    );
    expect(parsed).to.be.eq(
      "Curve2AssetsAdapter[CURVE_FRAX_POOL].remove_liquidity_imbalance(amounts: [FRAX: 100.00 [100000000000000000000], 3Crv: 100.00 [100000000000000000000]], max_burn_amount: 80.00 [80000000000000000000])",
      "Curve2AssetsAdapter: Incorrect parse remove_liquidity_imbalance",
    );
  });
});
