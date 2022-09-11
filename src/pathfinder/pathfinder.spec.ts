import { expect } from "chai";

import { RAY } from "../core/constants";
import { CloseResult, PathFinder } from "./pathfinder";

describe("PathFinder test", () => {
  it("compare works correctly", () => {
    const r1: CloseResult = {
      amount: 2000,
      gasUsage: 1000,
    };

    const r2: CloseResult = {
      amount: 3000,
      gasUsage: 2000,
    };

    let result = PathFinder.compare(r1, r2, RAY);
    expect(result).to.be.eql(r2);

    result = PathFinder.compare(r1, r2, RAY.mul(2));
    expect(result).to.be.eql(r1);
  });
});
