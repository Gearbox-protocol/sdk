import { expect } from "chai";
import { BigNumber } from "ethers";

import { RangedValue } from "./range";

describe("RangedValue test", () => {
  it("addValue and getValue works correctly", () => {
    const r = new RangedValue(BigNumber.from(5));

    expect(r.getValue(5).toNumber()).to.be.eq(5);

    r.addValue(100, BigNumber.from(8));
    r.addValue(10, BigNumber.from(18));

    expect(r.getValue(9).toNumber()).to.be.eq(5);
    expect(r.getValue(10).toNumber()).to.be.eq(18);
    expect(r.getValue(1000).toNumber()).to.be.eq(8);

    expect(r.keys).to.be.eql([10, 100]);
  });

  it("getValues works correctly", () => {
    const r = new RangedValue();
    r.addValue(4, BigNumber.from(3));
    r.addValue(2, BigNumber.from(5));
    r.addValue(10, BigNumber.from(1));
    r.addValue(6, BigNumber.from(8));
    r.addValue(8, BigNumber.from(7));

    const keys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const expected = [0, 0, 5, 5, 3, 3, 8, 8, 7, 7, 1, 1];
    const result = r.getValues(keys).map(e => e.toNumber());

    expect(result).to.be.eql(expected);
  });
});
