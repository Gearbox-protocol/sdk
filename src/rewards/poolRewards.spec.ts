import { expect } from "chai";
import { BigNumber } from "ethers";

import { PoolRewards } from "./poolRewards";
import { RangedValue } from "./range";

describe("PoolRewards test", () => {
  it("computeReward works correctly", () => {
    const balances = new RangedValue();

    balances.addValue(1000, BigNumber.from(100));
    balances.addValue(2000, BigNumber.from(200));
    balances.addValue(3000, BigNumber.from(0));

    const totalSupply = new RangedValue();
    totalSupply.addValue(500, BigNumber.from(100));
    totalSupply.addValue(1000, BigNumber.from(200));
    totalSupply.addValue(1500, BigNumber.from(250));
    totalSupply.addValue(2000, BigNumber.from(400));
    totalSupply.addValue(3000, BigNumber.from(100));

    const rewards = new RangedValue();
    rewards.addValue(500, BigNumber.from(20));

    // Block: ----- 500 ------ 1000 ----- 1500 ----- 2000 ------ 2500 ----- 3000
    //
    // Balances:     0          100 ----------------  200 ------------------ 0
    // Total supply  100        200   --    250       300                    100
    // Rewards:      20
    //                           10 ------  8         10 -------------------- 0
    // Total: 10 * 500 + 8*500 + 10 * 1000 = 19000

    const result = PoolRewards.computeRewardInt(
      3000,
      balances,
      totalSupply,
      rewards,
    );

    expect(result.toNumber()).to.be.eq(19000);
  });
});
