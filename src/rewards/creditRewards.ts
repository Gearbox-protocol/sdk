import { BigNumber, providers } from "ethers";

import { CreditManagerData } from "../core/creditManager";
import { ICreditFacade__factory } from "../types";
import {
  CloseCreditAccountEvent,
  IncreaseBorrowedAmountEvent,
  OpenCreditAccountEvent,
  TransferAccountEvent,
} from "../types/@gearbox-protocol/core-v2/contracts/interfaces/ICreditFacade.sol/ICreditFacade";
import { TypedEvent } from "../types/common";
import { creditRewardsPerBlock } from "./creditRewardParams";
import { Reward } from "./poolRewards";
import { RangedValue } from "./range";

export class CreditRewards {
  static async computeReward(
    creditManagerData: CreditManagerData,
    address: string,
    provider: providers.Provider,
    toBlock?: number,
  ): Promise<BigNumber> {
    const rewards = await CreditRewards.computeAllRewards(
      creditManagerData,
      provider,
      toBlock,
    );

    const rewardToAddress = rewards.filter(
      r => r.address === address.toLowerCase(),
    );

    return rewards.length === 0 ? BigNumber.from(0) : rewardToAddress[0].amount;
  }

  static async computeAllRewards(
    creditManagerData: CreditManagerData,
    provider: providers.Provider,
    toBlock?: number,
  ): Promise<Array<Reward>> {
    const toBlockQuery = toBlock || (await provider.getBlockNumber());
    const query = await CreditRewards.query(
      creditManagerData.creditFacade,
      provider,
      toBlockQuery,
    );

    const rewardPerBlock = CreditRewards.getRewardsRange(
      creditManagerData.address,
    );

    return CreditRewards.parseEvents(query, rewardPerBlock, toBlockQuery);
  }

  static parseEvents(
    events: Array<TypedEvent>,
    rewardPerBlock: RangedValue,
    toBlock: number,
  ): Array<Reward> {
    const borrowedRange: Record<string, RangedValue> = {};
    const totalBorrowedRange = new RangedValue();

    const borrowed: Record<string, BigNumber> = {};

    let totalBorrowed = BigNumber.from(0);

    const cfi = ICreditFacade__factory.createInterface();

    events.forEach(e => {
      const event = cfi.parseLog(e);
      switch (e.topics[0]) {
        case cfi.getEventTopic("OpenCreditAccount"): {
          const { onBehalfOf, borrowAmount } = (
            event as unknown as OpenCreditAccountEvent
          ).args;
          totalBorrowed = totalBorrowed.add(borrowAmount);
          totalBorrowedRange.addValue(e.blockNumber, totalBorrowed);

          borrowed[onBehalfOf] = borrowAmount;

          if (!borrowedRange[onBehalfOf]) {
            borrowedRange[onBehalfOf] = new RangedValue();
          }
          borrowedRange[onBehalfOf].addValue(e.blockNumber, borrowAmount);
          break;
        }
        case cfi.getEventTopic("CloseCreditAccount"):
        case cfi.getEventTopic("LiquidateCreditAccount"):
        case cfi.getEventTopic("LiquidateExpiredCreditAccount"): {
          // We need { borrower} only so, we can use any event to get it from args
          const { borrower } = (event as unknown as CloseCreditAccountEvent)
            .args;
          totalBorrowed = totalBorrowed.sub(borrowed[borrower]);
          totalBorrowedRange.addValue(e.blockNumber, totalBorrowed);

          borrowed[borrower] = BigNumber.from(0);
          borrowedRange[borrower].addValue(e.blockNumber, BigNumber.from(0));
          break;
        }
        case cfi.getEventTopic("IncreaseBorrowedAmount"): {
          const { borrower, amount } = (
            event as unknown as IncreaseBorrowedAmountEvent
          ).args;
          totalBorrowed = totalBorrowed.add(amount);
          totalBorrowedRange.addValue(e.blockNumber, totalBorrowed);

          borrowed[borrower] = borrowed[borrower].add(amount);
          borrowedRange[borrower].addValue(e.blockNumber, borrowed[borrower]);
          break;
        }
        case cfi.getEventTopic("DecreaseBorrowedAmount"): {
          const { borrower, amount } = (
            event as unknown as IncreaseBorrowedAmountEvent
          ).args;
          totalBorrowed = totalBorrowed.sub(amount);
          totalBorrowedRange.addValue(e.blockNumber, totalBorrowed);

          borrowed[borrower] = borrowed[borrower].sub(amount);
          borrowedRange[borrower].addValue(e.blockNumber, borrowed[borrower]);
          break;
        }
        case cfi.getEventTopic("TransferAccount"): {
          const { newOwner, oldOwner } = (
            event as unknown as TransferAccountEvent
          ).args;
          borrowed[newOwner] = borrowed[oldOwner];

          if (!borrowedRange[newOwner]) {
            borrowedRange[newOwner] = new RangedValue();
          }

          borrowed[oldOwner] = BigNumber.from(0);
          borrowedRange[newOwner].addValue(e.blockNumber, borrowed[newOwner]);
          borrowedRange[oldOwner].addValue(e.blockNumber, BigNumber.from(0));
          break;
        }
      }
    });

    return Object.keys(borrowed).map(address => ({
      address: address.toLowerCase(),
      amount: CreditRewards.computeRewardInt(
        toBlock,
        borrowedRange[address],
        totalBorrowedRange,
        rewardPerBlock,
      ),
    }));
  }

  static computeRewardInt(
    toBlock: number,
    balance: RangedValue,
    totalSupply: RangedValue,
    rewardPerBlock: RangedValue,
  ): BigNumber {
    const keys = Array.from(
      new Set([
        ...balance.keys,
        ...totalSupply.keys,
        ...rewardPerBlock.keys,
        toBlock,
      ]),
    ).sort((a, b) => (a > b ? 1 : -1));

    let total = BigNumber.from(0);

    const balancesArr = balance.getValues(keys);
    const totalSupplyArr = totalSupply.getValues(keys);
    const rewardsArr = rewardPerBlock.getValues(keys);

    for (let i = 0; i < keys.length; i++) {
      const curBlock = keys[i];
      const nextBlock = i === keys.length - 1 ? toBlock : keys[i + 1];
      if (!totalSupplyArr[i].isZero()) {
        total = total.add(
          balancesArr[i]
            .mul(nextBlock - curBlock)
            .mul(rewardsArr[i])
            .div(totalSupplyArr[i]),
        );
      }
    }

    return total;
  }

  protected static async query(
    creditFacade: string,
    provider: providers.Provider,
    toBlock: number,
  ): Promise<Array<TypedEvent>> {
    const cf = ICreditFacade__factory.connect(creditFacade, provider);
    const topics = {
      OpenCreditAccount: cf.interface.getEventTopic("OpenCreditAccount"),
      CloseCreditAccount: cf.interface.getEventTopic("CloseCreditAccount"),
      LiquidateCreditAccount: cf.interface.getEventTopic(
        "LiquidateCreditAccount",
      ),
      LiquidateExpiredCreditAccount: cf.interface.getEventTopic(
        "LiquidateExpiredCreditAccount",
      ),
      TransferAccount: cf.interface.getEventTopic("TransferAccount"),
      IncreaseBorrowedAmount: cf.interface.getEventTopic(
        "IncreaseBorrowedAmount",
      ),
      DecreaseBorrowedAmount: cf.interface.getEventTopic(
        "DecreaseBorrowedAmount",
      ),
    };

    const logs = await cf.queryFilter(
      {
        address: cf.address,
        topics: [Object.values(topics)],
      },
      undefined,
      toBlock,
    );

    return logs;
  }

  protected static getRewardsRange(creditManager: string): RangedValue {
    const rewardPerBlock = creditRewardsPerBlock[creditManager];

    if (!rewardPerBlock)
      throw new Error(`Unknown credit manager token ${creditManager}`);
    return rewardPerBlock;
  }
}
