import { BigNumber, providers } from "ethers";

import { CreditManagersV2 } from "../contracts/contractsRegister";
import { CreditManagerData } from "../core/creditManager";
import { ICreditFacade__factory } from "../types";
import {
  CloseCreditAccountEvent,
  DecreaseBorrowedAmountEvent,
  IncreaseBorrowedAmountEvent,
  LiquidateCreditAccountEvent,
  OpenCreditAccountEvent,
  TransferAccountEvent,
} from "../types/@gearbox-protocol/core-v2/contracts/interfaces/ICreditFacade.sol/ICreditFacade";
import { creditRewardsPerBlock } from "./creditRewardParams";
import { RangedValue } from "./range";

export interface Reward {
  address: string;
  amount: BigNumber;
}

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
      r => r.address.toLowerCase() === address.toLowerCase(),
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

    const borrowedRange: Record<string, RangedValue> = {};
    const totalSupplyRange = new RangedValue();
    const rewardPerBlock = CreditRewards.getRewardsRange(
      creditManagerData.creditFacade,
    );

    const borrowed: Record<string, BigNumber> = {};

    let totalBorrowed = BigNumber.from(0);

    const cfi = ICreditFacade__factory.connect(
      creditManagerData.creditFacade,
      provider,
    ).interface;

    query.forEach(e => {
      switch (e.topics[0]) {
        case cfi.getEventTopic("OpenCreditAccount"): {
          const { onBehalfOf, borrowAmount } = (e as OpenCreditAccountEvent)
            .args;
          totalBorrowed = totalBorrowed.add(borrowAmount);
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
          const { borrower } = (e as CloseCreditAccountEvent).args;
          totalBorrowed = totalBorrowed.sub(borrowed[borrower]);
          borrowed[borrower] = BigNumber.from(0);
          borrowedRange[borrower].addValue(e.blockNumber, BigNumber.from(0));
          break;
        }
        case cfi.getEventTopic("IncreaseBorrowedAmount"): {
          const { borrower, amount } = (e as IncreaseBorrowedAmountEvent).args;
          totalBorrowed = totalBorrowed.add(amount);
          borrowed[borrower] = borrowed[borrower].add(amount);
          borrowedRange[borrower].addValue(e.blockNumber, borrowed[borrower]);
          break;
        }
        case cfi.getEventTopic("DecreaseBorrowedAmount"): {
          const { borrower, amount } = (e as IncreaseBorrowedAmountEvent).args;
          totalBorrowed = totalBorrowed.sub(amount);
          borrowed[borrower] = borrowed[borrower].sub(amount);
          borrowedRange[borrower].addValue(e.blockNumber, borrowed[borrower]);
          break;
        }
        case cfi.getEventTopic("TransferAccount"): {
          const { newOwner, oldOwner } = (e as TransferAccountEvent).args;
          borrowed[newOwner] = borrowed[oldOwner];

          if (!borrowed[newOwner]) {
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
      address,
      amount: CreditRewards.computeRewardInt(
        toBlockQuery,
        borrowedRange[address],
        totalSupplyRange,
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
  ): Promise<
    Array<
      | OpenCreditAccountEvent
      | CloseCreditAccountEvent
      | LiquidateCreditAccountEvent
      | IncreaseBorrowedAmountEvent
      | DecreaseBorrowedAmountEvent
      | TransferAccountEvent
    >
  > {
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
    const rewardPerBlock =
      creditRewardsPerBlock[creditManager as CreditManagersV2];

    if (!rewardPerBlock)
      throw new Error(`Unknown credit manager token ${creditManager}`);
    return rewardPerBlock;
  }
}
