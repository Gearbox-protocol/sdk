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
    // Total supply  100        200   --    250       400                    100
    // Rewards:      20
    //                           10 ------  8         10 -------------------- 0
    // Total: 10 * 500 + 8*500 + 10 * 1000 = 19000

    const result = PoolRewards.computeRewardInt(
      4000,
      balances,
      totalSupply,
      rewards,
    );

    expect(result.toNumber()).to.be.eq(19000);
  });

  it("sum of rewards is equal to total distributed", () => {
    const balances0 = new RangedValue();
    const balances1 = new RangedValue();

    balances0.addValue(1000, BigNumber.from(100));
    balances0.addValue(2000, BigNumber.from(200));
    balances0.addValue(3000, BigNumber.from(0));

    balances1.addValue(500, BigNumber.from(100));
    balances1.addValue(1500, BigNumber.from(300));
    balances1.addValue(2500, BigNumber.from(200));
    balances1.addValue(3000, BigNumber.from(100));

    const totalSupply = new RangedValue();
    totalSupply.addValue(500, BigNumber.from(100));
    totalSupply.addValue(1000, BigNumber.from(200));
    totalSupply.addValue(1500, BigNumber.from(400));
    totalSupply.addValue(2000, BigNumber.from(500));
    totalSupply.addValue(2500, BigNumber.from(400));
    totalSupply.addValue(3000, BigNumber.from(100));

    const rewards = new RangedValue();
    rewards.addValue(500, BigNumber.from(20));
    rewards.addValue(1500, BigNumber.from(10));
    rewards.addValue(2000, BigNumber.from(0));
    rewards.addValue(2500, BigNumber.from(5));

    const result0 = PoolRewards.computeRewardInt(
      3000,
      balances0,
      totalSupply,
      rewards,
    );

    const result1 = PoolRewards.computeRewardInt(
      3000,
      balances1,
      totalSupply,
      rewards,
    );

    expect(result0.toNumber() + result1.toNumber()).to.be.eq(
      20 * 1000 + 10 * 500 + 5 * 500,
    );
  });
});
