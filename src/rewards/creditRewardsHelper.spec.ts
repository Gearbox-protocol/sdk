import { expect } from "chai";
import { BigNumber } from "ethers";

import { CREDIT_MANAGER_DAI_V2_MAINNET } from "../contracts/contractsRegister";
import { DUMB_ADDRESS, DUMB_ADDRESS2 } from "../core/constants";
import { ICreditFacade__factory } from "../types";
import {
  CloseCreditAccountEvent,
  DecreaseBorrowedAmountEvent,
  IncreaseBorrowedAmountEvent,
  LiquidateCreditAccountEvent,
  OpenCreditAccountEvent,
  TransferAccountEvent,
} from "../types/@gearbox-protocol/core-v2/contracts/interfaces/ICreditFacade.sol/ICreditFacade";

const cfi = ICreditFacade__factory.createInterface();

const bnToU256 = (bn: BigNumber) => {
  const hexValue = bn.toHexString().replaceAll("0x", "");
  return `${"0".repeat(64 - hexValue.length)}${hexValue}`;
};

const addrToU256 = (addr: string) =>
  `0x000000000000000000000000${addr.replaceAll("0x", "")}`;

const commonEventFields = {
  blockHash:
    "0xb77353a688104b25b14a3caf018b48d601f67fd08b748206b97930a90cee45c9",
  transactionIndex: 49,
  removed: false,
  transactionHash:
    "0x03f85b59b3641f863ac687e7c09e38777d42c5640ae0a74cc62f5667c74109d4",
  logIndex: 114,
};

export const openCreditAccountEvent = (
  address: string,
  blockNumber: number,
  onBehalf: string,
  borrowAmount: BigNumber,
) => {
  const data = `0x${bnToU256(borrowAmount)}${bnToU256(BigNumber.from(0))}`;

  return {
    blockNumber,
    address,
    data,
    topics: [
      cfi.getEventTopic("OpenCreditAccount"),
      addrToU256(onBehalf),
      addrToU256(DUMB_ADDRESS),
    ],
    ...commonEventFields,
  };
};

export const closeCreditAccountEvent = (
  address: string,
  blockNumber: number,
  borrower: string,
) => {
  return {
    blockNumber,
    address,
    data: "0x",
    topics: [
      cfi.getEventTopic("CloseCreditAccount"),
      addrToU256(borrower),
      addrToU256(borrower),
    ],
    ...commonEventFields,
  };
};

export const liquidateCreditAccountEvent = (
  address: string,
  blockNumber: number,
  borrower: string,
  expired = false,
) => {
  return {
    blockNumber,
    address,
    data: `0x${bnToU256(BigNumber.from(1))}`,
    topics: [
      expired
        ? cfi.getEventTopic("LiquidateExpiredCreditAccount")
        : cfi.getEventTopic("LiquidateCreditAccount"),
      addrToU256(borrower),
      addrToU256(DUMB_ADDRESS2),
      addrToU256(borrower),
    ],
    ...commonEventFields,
  };
};

export const increaseBorrowedAmountEvent = (
  address: string,
  blockNumber: number,
  borrower: string,
  amount: BigNumber,
) => {
  return {
    blockNumber,
    address,
    data: `0x${bnToU256(amount)}`,
    topics: [cfi.getEventTopic("IncreaseBorrowedAmount"), addrToU256(borrower)],
    ...commonEventFields,
  };
};

export const decreaseBorrowedAmountEvent = (
  address: string,
  blockNumber: number,
  borrower: string,
  amount: BigNumber,
) => {
  return {
    blockNumber,
    address,
    data: `0x${bnToU256(amount)}`,
    topics: [cfi.getEventTopic("DecreaseBorrowedAmount"), addrToU256(borrower)],
    ...commonEventFields,
  };
};

export const transferAccountEvent = (
  address: string,
  blockNumber: number,
  oldOwner: string,
  newOwner: string,
) => {
  return {
    blockNumber,
    address,
    data: `0x`,
    topics: [
      cfi.getEventTopic("TransferAccount"),
      addrToU256(oldOwner),
      addrToU256(newOwner),
    ],
    ...commonEventFields,
  };
};

describe("CreditRewards helper test", () => {
  it("test events generated correctly", () => {
    let e = openCreditAccountEvent(
      CREDIT_MANAGER_DAI_V2_MAINNET,
      15902535,
      DUMB_ADDRESS,
      BigNumber.from(1500),
    );
    let openEvent = cfi.parseLog(e) as unknown as OpenCreditAccountEvent;

    expect(openEvent.args.onBehalfOf).to.be.eq(DUMB_ADDRESS);
    expect(openEvent.args.borrowAmount.toNumber()).to.be.eq(1500);

    e = closeCreditAccountEvent(
      CREDIT_MANAGER_DAI_V2_MAINNET,
      15902535,
      DUMB_ADDRESS,
    );
    const closeEvent = cfi.parseLog(e) as unknown as CloseCreditAccountEvent;
    expect(closeEvent.args.borrower).to.be.eq(DUMB_ADDRESS);

    for (let expired of [false, true]) {
      e = liquidateCreditAccountEvent(
        CREDIT_MANAGER_DAI_V2_MAINNET,
        15902535,
        DUMB_ADDRESS,
        expired,
      );

      const liquidateEvent = cfi.parseLog(
        e,
      ) as unknown as LiquidateCreditAccountEvent;
      expect(liquidateEvent.args.borrower).to.be.eq(DUMB_ADDRESS);
    }

    e = increaseBorrowedAmountEvent(
      CREDIT_MANAGER_DAI_V2_MAINNET,
      15902535,
      DUMB_ADDRESS,
      BigNumber.from(1898),
    );
    const increaseEvent = cfi.parseLog(
      e,
    ) as unknown as IncreaseBorrowedAmountEvent;
    expect(increaseEvent.args.borrower).to.be.eq(DUMB_ADDRESS);
    expect(increaseEvent.args.amount.toNumber()).to.be.eq(1898);

    e = decreaseBorrowedAmountEvent(
      CREDIT_MANAGER_DAI_V2_MAINNET,
      15902535,
      DUMB_ADDRESS,
      BigNumber.from(1898),
    );
    const decreaseEvent = cfi.parseLog(
      e,
    ) as unknown as DecreaseBorrowedAmountEvent;
    expect(decreaseEvent.args.borrower).to.be.eq(DUMB_ADDRESS);
    expect(decreaseEvent.args.amount.toNumber()).to.be.eq(1898);

    e = transferAccountEvent(
      CREDIT_MANAGER_DAI_V2_MAINNET,
      15902535,
      DUMB_ADDRESS,
      DUMB_ADDRESS2,
    );
    const transferEvent = cfi.parseLog(e) as unknown as TransferAccountEvent;
    expect(transferEvent.args.oldOwner).to.be.eq(DUMB_ADDRESS);
    expect(transferEvent.args.newOwner).to.be.eq(DUMB_ADDRESS2);
  });
});
