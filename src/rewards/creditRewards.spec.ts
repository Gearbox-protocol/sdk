import { expect } from "chai";
import { BigNumber } from "ethers";

import { DUMB_ADDRESS, DUMB_ADDRESS2, DUMB_ADDRESS3 } from "../core/constants";
import { TypedEvent } from "../types/common";
import { CreditRewards } from "./creditRewards";
import {
  closeCreditAccountEvent,
  decreaseBorrowedAmountEvent,
  increaseBorrowedAmountEvent,
  liquidateCreditAccountEvent,
  openCreditAccountEvent,
  transferAccountEvent,
} from "./creditRewardsHelper.spec";
import { RangedValue } from "./range";

describe("CreditRewards test", () => {
  it("one acccount only", () => {
    const cfacade = DUMB_ADDRESS;
    const user = DUMB_ADDRESS2.toLowerCase();
    const events = [
      openCreditAccountEvent(cfacade, 1000, user, BigNumber.from(100)),
    ] as Array<TypedEvent>;

    const rewardPerBlock = new RangedValue();
    rewardPerBlock.addValue(1000, BigNumber.from(1000));
    const r = CreditRewards.parseEvents(events, rewardPerBlock, 2000);

    expect(r).to.be.eql([
      {
        address: user,
        amount: BigNumber.from(1000).mul(1000),
      },
    ]);
  });

  it("one acccoun only with closure", () => {
    const cfacade = DUMB_ADDRESS;
    const user = DUMB_ADDRESS2.toLowerCase();
    const events = [
      openCreditAccountEvent(cfacade, 1000, user, BigNumber.from(100)),
      closeCreditAccountEvent(cfacade, 1500, user),
    ] as Array<TypedEvent>;

    const rewardPerBlock = new RangedValue();
    rewardPerBlock.addValue(1000, BigNumber.from(1000));
    const r = CreditRewards.parseEvents(events, rewardPerBlock, 2000);

    expect(r).to.be.eql([
      {
        address: user,
        amount: BigNumber.from(1000).mul(500),
      },
    ]);
  });

  it("two accounts with one liquidation", () => {
    const cfacade = DUMB_ADDRESS;
    const user = DUMB_ADDRESS2.toLowerCase();
    const user2 = DUMB_ADDRESS3.toLowerCase();
    const events = [
      openCreditAccountEvent(cfacade, 1000, user, BigNumber.from(100)),
      liquidateCreditAccountEvent(cfacade, 1500, user),
      openCreditAccountEvent(cfacade, 1500, user2, BigNumber.from(200)),
    ] as Array<TypedEvent>;

    const rewardPerBlock = new RangedValue();
    rewardPerBlock.addValue(1000, BigNumber.from(1000));
    const r = CreditRewards.parseEvents(events, rewardPerBlock, 2000);

    expect(r).to.be.eql([
      {
        address: user,
        amount: BigNumber.from(1000).mul(500),
      },
      {
        address: user2,
        amount: BigNumber.from(1000).mul(500),
      },
    ]);
  });

  it("two accounts with increase borrowed amount", () => {
    const cfacade = DUMB_ADDRESS;
    const user = DUMB_ADDRESS2.toLowerCase();
    const user2 = DUMB_ADDRESS3.toLowerCase();
    const events = [
      openCreditAccountEvent(cfacade, 1000, user, BigNumber.from(100)),
      openCreditAccountEvent(cfacade, 1000, user2, BigNumber.from(100)),
      increaseBorrowedAmountEvent(cfacade, 1500, user2, BigNumber.from(200)),
    ] as Array<TypedEvent>;

    const rewardPerBlock = new RangedValue();
    rewardPerBlock.addValue(1000, BigNumber.from(1000));
    const r = CreditRewards.parseEvents(events, rewardPerBlock, 2000);

    expect(r).to.be.eql([
      {
        address: user,
        amount: BigNumber.from(500).mul(500).add(BigNumber.from(250).mul(500)),
      },
      {
        address: user2,
        amount: BigNumber.from(500).mul(500).add(BigNumber.from(750).mul(500)),
      },
    ]);
  });

  it("two accounts with decrease borrowed amount", () => {
    const cfacade = DUMB_ADDRESS;
    const user = DUMB_ADDRESS2.toLowerCase();
    const user2 = DUMB_ADDRESS3.toLowerCase();
    const events = [
      openCreditAccountEvent(cfacade, 1000, user, BigNumber.from(200)),
      openCreditAccountEvent(cfacade, 1000, user2, BigNumber.from(200)),
      decreaseBorrowedAmountEvent(cfacade, 1500, user, BigNumber.from(100)),
      increaseBorrowedAmountEvent(cfacade, 1500, user2, BigNumber.from(100)),
    ] as Array<TypedEvent>;

    const rewardPerBlock = new RangedValue();
    rewardPerBlock.addValue(1000, BigNumber.from(1000));
    const r = CreditRewards.parseEvents(events, rewardPerBlock, 2000);

    expect(r).to.be.eql([
      {
        address: user,
        amount: BigNumber.from(500).mul(500).add(BigNumber.from(250).mul(500)),
      },
      {
        address: user2,
        amount: BigNumber.from(500).mul(500).add(BigNumber.from(750).mul(500)),
      },
    ]);
  });

  it("transfer works correctly ", () => {
    const cfacade = DUMB_ADDRESS;
    const user = DUMB_ADDRESS2.toLowerCase();
    const user2 = DUMB_ADDRESS3.toLowerCase();
    const events = [
      openCreditAccountEvent(cfacade, 1000, user, BigNumber.from(200)),
      transferAccountEvent(cfacade, 1500, user, user2),
    ] as Array<TypedEvent>;

    const rewardPerBlock = new RangedValue();
    rewardPerBlock.addValue(1000, BigNumber.from(1000));
    const r = CreditRewards.parseEvents(events, rewardPerBlock, 2000);

    expect(r).to.be.eql([
      {
        address: user,
        amount: BigNumber.from(500).mul(1000),
      },
      {
        address: user2,
        amount: BigNumber.from(500).mul(1000),
      },
    ]);
  });
});
