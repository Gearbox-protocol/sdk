import { TokenData } from "./token";
import { BigNumber } from "ethers";
import { formatBN } from "../utils/formatter";
import { LEVERAGE_DECIMALS } from "./constants";
import { EVMEvent, EVMTx } from "./eventOrTx";
import { getContractName } from "./contractsRegister";

export interface EventSerialized {
  type:
    | "EventAddLiquidity"
    | "EventRemoveLiquidity"
    | "EventOpenCreditAccount"
    | "EventCloseCreditAccount"
    | "EventLiquidateCreditAccount"
    | "EventRepayCreditAccount"
    | "EventAddCollateral"
    | "EventIncreaseBorrowAmount"
    | "EventCMNewParameters"
    | "EventTokenAllowed"
    | "EventTokenForbidden"
    | "EventContractAllowed"
    | "EventContractForbidden"
    | "EventNewFastCheckParameters"
    | "EventPriceOracleUpdated"
    | "EventTransferPluginAllowed"
    | "EventNewInterestRateModel"
    | "EventNewCreditManagerConnected"
    | "EventBorrowForbidden"
    | "EventNewExpectedLiquidityLimit"
    | "EventNewWithdrawFee"
    | "EventNewPriceFeed"
    | "EventTakeForever"
    | "EventPaused"
    | "EventUnPaused"
    | "EventPausableAdminAdded"
    | "EventPausableAdminRemoved"
    | "EventUnPausableAdminAdded"
    | "EventUnPausableAdminRemoved"
    | "EventTransferOwnership";

  content: any;
}

export class EventParser {
  static serialize(items: Array<EVMTx>): string {
    return JSON.stringify(items.map((i) => i.serialize()));
  }

  static deserialize(data: EventSerialized): EVMEvent {
    const params = data.content;
    switch (data.type) {
      case "EventAddLiquidity":
        return new EventAddLiquidity(params);
      case "EventRemoveLiquidity":
        return new EventRemoveLiquidity(params);
      case "EventOpenCreditAccount":
        return new EventOpenCreditAccount(params);
      case "EventCloseCreditAccount":
        return new EventCloseCreditAccount(params);
      case "EventLiquidateCreditAccount":
        return new EventLiquidateCreditAccount(params);
      case "EventRepayCreditAccount":
        return new EventRepayCreditAccount(params);
      case "EventAddCollateral":
        return new EventAddCollateral(params);
      case "EventIncreaseBorrowAmount":
        return new EventIncreaseBorrowAmount(params);
      case "EventCMNewParameters":
        return new EventCMNewParameters(params);
      case "EventTokenAllowed":
        return new EventTokenAllowed(params);
      case "EventTokenForbidden":
        return new EventTokenForbidden(params);
      case "EventContractAllowed":
        return new EventContractAllowed(params);
      case "EventContractForbidden":
        return new EventContractForbidden(params);
      case "EventNewFastCheckParameters":
        return new EventNewFastCheckParameters(params);
      case "EventPriceOracleUpdated":
        return new EventPriceOracleUpdated(params);
      case "EventTransferPluginAllowed":
        return new EventTransferPluginAllowed(params);
      case "EventNewInterestRateModel":
        return new EventNewInterestRateModel(params);
      case "EventNewCreditManagerConnected":
        return new EventNewCreditManagerConnected(params);
      case "EventBorrowForbidden":
        return new EventBorrowForbidden(params);
      case "EventNewExpectedLiquidityLimit":
        return new EventNewExpectedLiquidityLimit(params);
      case "EventNewWithdrawFee":
        return new EventNewWithdrawFee(params);
      case "EventNewPriceFeed":
        return new EventNewPriceFeed(params);
      case "EventTakeForever":
        return new EventTakeForever(params);
      case "EventPaused":
        return new EventPaused(params);
      case "EventUnPaused":
        return new EventUnPaused(params);
      case "EventPausableAdminAdded":
        return new EventPausableAdminAdded(params);
      case "EventPausableAdminRemoved":
        return new EventPausableAdminRemoved(params);
      case "EventUnPausableAdminAdded":
        return new EventUnPausableAdminAdded(params);
      case "EventUnPausableAdminRemoved":
        return new EventUnPausableAdminRemoved(params);
      case "EventTransferOwnership":
        return new EventTransferOwnership(params);

      default:
        throw new Error("Unknown transaction for parsing");
    }
  }

  static deserializeArray(data: Array<EventSerialized>): Array<EVMEvent> {
    return data.map((e) => EventParser.deserialize(e));
  }
}

// POOL EVENTS
export class EventAddLiquidity extends EVMEvent {
  public readonly amount: BigNumber;
  public readonly underlyingToken: string;
  public readonly pool: string;

  constructor(opts: {
    block: number;
    txHash: string;
    amount: BigNumber;
    underlyingToken: string;
    pool: string;
  }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.amount = opts.amount;
    this.underlyingToken = opts.underlyingToken;
    this.pool = opts.pool;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.underlyingToken];
    return `Pool ${getContractName(this.pool)}: Deposit ${formatBN(
      this.amount,
      token?.decimals || 18
    )} ${token?.symbol || ""}`;
  }
}

export class EventRemoveLiquidity extends EVMEvent {
  public readonly amount: BigNumber;
  public readonly underlyingToken: string;
  public readonly dieselToken: string;
  public readonly pool: string;

  constructor(opts: {
    block: number;
    txHash: string;
    amount: BigNumber;
    underlyingToken: string;
    dieselToken: string;
    pool: string;
  }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.amount = opts.amount;
    this.underlyingToken = opts.underlyingToken;
    this.dieselToken = opts.dieselToken;
    this.pool = opts.pool;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const dtoken = tokenData[this.dieselToken];
    return `Pool ${getContractName(this.pool)}: withdraw ${formatBN(
      this.amount,
      dtoken?.decimals || 18
    )} ${dtoken?.symbol || ""}`;
  }
}

// CREDIT MANAGER EVENTS

export class EventOpenCreditAccount extends EVMEvent {
  public readonly amount: BigNumber;
  public readonly underlyingToken: string;
  public readonly leverage: number;
  public readonly creditManager: string;

  constructor(opts: {
    block: number;
    txHash: string;
    amount: BigNumber;
    underlyingToken: string;
    leverage: number;
    creditManager: string;
  }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.amount = opts.amount;
    this.underlyingToken = opts.underlyingToken;
    this.leverage = opts.leverage;
    this.creditManager = opts.creditManager;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.underlyingToken];
    return `Credit account ${getContractName(
      this.creditManager
    )}: open ${formatBN(this.amount, token?.decimals || 18)} ${
      token?.symbol
    } x ${this.leverage.toFixed(2)} ⇒ 
    ${formatBN(
      this.amount
        .mul(Math.floor(this.leverage * LEVERAGE_DECIMALS))
        .div(LEVERAGE_DECIMALS),
      token?.decimals || 18
    )} ${token?.symbol}`;
  }
}

export class EventCloseCreditAccount extends EVMEvent {
  public readonly amount: BigNumber;
  public readonly underlyingToken: string;
  public readonly creditManager: string;

  constructor(opts: {
    block: number;
    txHash: string;
    amount: BigNumber;
    underlyingToken: string;
    creditManager: string;
  }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.amount = opts.amount;
    this.underlyingToken = opts.underlyingToken;
    this.creditManager = opts.creditManager;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.underlyingToken];
    return `Credit account ${getContractName(
      this.creditManager
    )}: was closed and got ${formatBN(this.amount, token?.decimals || 18)} ${
      token?.symbol
    } as remaining funds`;
  }
}

export class EventLiquidateCreditAccount extends EVMEvent {
  public readonly amount: BigNumber;
  public readonly underlyingToken: string;
  public readonly creditManager: string;

  constructor(opts: {
    block: number;
    txHash: string;
    amount: BigNumber;
    underlyingToken: string;
    creditManager: string;
  }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.amount = opts.amount;
    this.underlyingToken = opts.underlyingToken;
    this.creditManager = opts.creditManager;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.underlyingToken];
    return `Credit account ${getContractName(
      this.creditManager
    )}: was liquidated. ${formatBN(this.amount, token?.decimals || 18)} ${
      token?.symbol
    } were paid back as remaining funds`;
  }
}

export class EventRepayCreditAccount extends EVMEvent {
  public readonly underlyingToken: string;
  public readonly creditManager: string;

  constructor(opts: {
    block: number;
    txHash: string;
    underlyingToken: string;
    creditManager: string;
  }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.underlyingToken = opts.underlyingToken;
    this.creditManager = opts.creditManager;
  }

  toString(_tokenData: Record<string, TokenData>): string {
    return `Credit account ${getContractName(this.creditManager)}: was repaid`;
  }
}

export class EventAddCollateral extends EVMEvent {
  public readonly amount: BigNumber;
  public readonly addedToken: string;
  public readonly creditManager: string;

  constructor(opts: {
    block: number;
    txHash: string;
    amount: BigNumber;
    addedToken: string;
    creditManager: string;
  }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.amount = opts.amount;

    this.addedToken = opts.addedToken;
    this.creditManager = opts.creditManager;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const addedToken = tokenData[this.addedToken];
    return `Credit account ${getContractName(
      this.creditManager
    )}: added ${formatBN(this.amount, addedToken.decimals)} ${
      addedToken.symbol
    } as collateral`;
  }
}

export class EventIncreaseBorrowAmount extends EVMEvent {
  public readonly amount: BigNumber;
  public readonly underlyingToken: string;
  public readonly creditManager: string;

  constructor(opts: {
    block: number;
    txHash: string;
    amount: BigNumber;
    underlyingToken: string;
    creditManager: string;
  }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.amount = opts.amount;
    this.underlyingToken = opts.underlyingToken;
    this.creditManager = opts.creditManager;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.underlyingToken];
    return `Credit account ${getContractName(
      this.creditManager
    )}: borrowed amount was increased for ${formatBN(
      this.amount,
      token?.decimals || 18
    )} ${token?.symbol}`;
  }
}

// // Emits each time when new fees are set
//     event NewParameters(
//         uint256 minAmount,
//         uint256 maxAmount,
//         uint256 maxLeverage,
//         uint256 feeInterest,
//         uint256 feeLiquidation,
//         uint256 liquidationDiscount
//     );

export class EventCMNewParameters extends EVMEvent {
  public readonly creditManager: string;
  public readonly underlyingToken: string;
  public readonly minAmount: BigNumber;
  public readonly maxAmount: BigNumber;
  public readonly maxLeverage: number;
  public readonly feeInterest: number;
  public readonly feeLiquidation: number;
  public readonly liquidationDiscount: number;
  public readonly prevMinAmount: BigNumber;
  public readonly prevMaxAmount: BigNumber;
  public readonly prevMaxLeverage: number;
  public readonly prevFeeInterest: number;
  public readonly prevFeeLiquidation: number;
  public readonly prevLiquidationDiscount: number;

  constructor(opts: {
    block: number;
    txHash: string;
    creditManager: string;
    underlyingToken: string;
    minAmount: BigNumber;
    maxAmount: BigNumber;
    maxLeverage: number;
    feeInterest: number;
    feeLiquidation: number;
    liquidationDiscount: number;
    prevMinAmount: BigNumber;
    prevMaxAmount: BigNumber;
    prevMaxLeverage: number;
    prevFeeInterest: number;
    prevFeeLiquidation: number;
    prevLiquidationDiscount: number;
  }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.creditManager = opts.creditManager;
    this.underlyingToken = opts.underlyingToken;
    this.minAmount = opts.minAmount;
    this.maxAmount = opts.maxAmount;
    this.maxLeverage = opts.maxLeverage;
    this.feeInterest = opts.feeInterest;
    this.feeLiquidation = opts.feeLiquidation;
    this.liquidationDiscount = opts.liquidationDiscount;

    this.prevMinAmount = opts.prevMinAmount;
    this.prevMaxAmount = opts.prevMaxAmount;
    this.prevMaxLeverage = opts.prevMaxLeverage;
    this.prevFeeInterest = opts.prevFeeInterest;
    this.prevFeeLiquidation = opts.prevFeeLiquidation;
    this.prevLiquidationDiscount = opts.prevLiquidationDiscount;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.underlyingToken];
    let msg = `Credit manager ${getContractName(this.creditManager)} updated: `;

    if (this.minAmount !== this.prevMinAmount) {
      msg += `min amount: ${formatBN(
        this.prevMinAmount,
        token.decimals
      )} => ${formatBN(this.minAmount, token.decimals)} ${token.symbol}, `;
    }

    if (this.maxAmount !== this.prevMaxAmount) {
      msg += `max amount: ${formatBN(
        this.prevMinAmount,
        token.decimals
      )} => ${formatBN(this.minAmount, token.decimals)} ${token.symbol}, `;
    }

    if (this.maxLeverage !== this.prevMaxLeverage) {
      msg += `max leverage: ${this.prevMaxLeverage / 100 + 1} => ${
        this.maxLeverage / 100 + 1
      }, `;
    }

    if (this.feeInterest !== this.prevFeeInterest) {
      msg += `interest fee: ${this.prevFeeInterest / 100}% => ${
        this.feeInterest / 100
      }, `;
    }

    if (this.feeLiquidation !== this.prevFeeLiquidation) {
      msg += `liquidation fee: ${this.prevFeeLiquidation / 100}% => ${
        this.feeLiquidation / 100
      }, `;
    }

    if (this.liquidationDiscount !== this.prevLiquidationDiscount) {
      msg += `liquidation premium: ${
        100 - this.prevLiquidationDiscount / 100
      }% => ${100 - this.liquidationDiscount / 100}, `;
    }

    // Remove trailing comma
    msg = msg.trimRight();

    return msg.slice(0, msg.length - 2);
  }
}

// // Emits each time token is allowed or liquidation threshold changed
//     event TokenAllowed(address indexed token, uint256 liquidityThreshold);

export type TokenAllowanceType = "NewToken" | "LTUpdated" | "Allowed";

export class EventTokenAllowed extends EVMEvent {
  public readonly creditManager: string;
  public readonly token: string;
  public readonly liquidityThreshold: number;
  public readonly prevLiquidationThreshold?: number;
  public readonly status: TokenAllowanceType;

  constructor(opts: {
    block: number;
    txHash: string;
    creditManager: string;
    token: string;
    liquidityThreshold: number;
    prevLiquidationThreshold?: number;
    status: TokenAllowanceType;
  }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.creditManager = opts.creditManager;
    this.token = opts.token;
    this.liquidityThreshold = opts.liquidityThreshold;
    this.prevLiquidationThreshold = opts.prevLiquidationThreshold;
    this.status = opts.status;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.token];
    let msg = `Credit manager ${getContractName(this.creditManager)} updated `;
    switch (this.status) {
      case "NewToken":
        return `${msg}: New token allowed: ${
          token.symbol
        }, liquidation threshold: ${this.liquidityThreshold / 100}`;
      case "Allowed":
        return `${msg}: ${
          token.symbol
        } is allowed now, liquidation threshold: ${
          this.liquidityThreshold / 100
        }`;
      case "LTUpdated":
        return `${msg}: ${token.symbol} liquidation threshold: ${
          (this.prevLiquidationThreshold || 0) / 100
        } => ${this.liquidityThreshold / 100}`;
    }
  }
}

//    // Emits each time token is allowed or liquidtion threshold changed
//     event TokenForbidden(address indexed token);

export class EventTokenForbidden extends EVMEvent {
  public readonly creditManager: string;
  public readonly token: string;

  constructor(opts: {
    block: number;
    txHash: string;
    creditManager: string;
    token: string;
  }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.creditManager = opts.creditManager;
    this.token = opts.token;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.token];
    return `Credit manager ${getContractName(this.creditManager)} updated ${
      token.symbol
    } forbidden`;
  }
}

//
//     // Emits each time contract is allowed or adapter changed
//     event ContractAllowed(address indexed protocol, address indexed adapter);

export type EventContractAllowedStatus = "Connected" | "AdapterUpdate";

export class EventContractAllowed extends EVMEvent {
  public readonly creditManager: string;
  public readonly protocol: string;
  public readonly adapter: string;
  public readonly status: EventContractAllowedStatus;

  constructor(opts: {
    block: number;
    txHash: string;
    creditManager: string;
    protocol: string;
    adapter: string;
    status: EventContractAllowedStatus;
  }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.creditManager = opts.creditManager;
    this.protocol = opts.protocol;
    this.adapter = opts.adapter;
    this.status = opts.status;
  }

  toString(_: Record<string, TokenData>): string {
    let msg = `Credit manager ${getContractName(this.creditManager)} updated `;

    switch (this.status) {
      case "Connected":
        return `${msg}: ${getContractName(
          this.protocol
        )} was connected. Adapter at: ${this.adapter}`;
      case "AdapterUpdate":
        return `${msg}: ${getContractName(
          this.protocol
        )} adapter was updated. New adapter:  ${this.adapter}`;
    }
  }
}

//
//     // Emits each time contract is forbidden
//     event ContractForbidden(address indexed protocol);

export class EventContractForbidden extends EVMEvent {
  public readonly creditManager: string;
  public readonly protocol: string;

  constructor(opts: {
    block: number;
    txHash: string;
    creditManager: string;
    protocol: string;
  }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.creditManager = opts.creditManager;
    this.protocol = opts.protocol;
  }

  toString(_: Record<string, TokenData>): string {
    return `Credit manager ${getContractName(
      this.creditManager
    )} updated: ${getContractName(this.protocol)} `;
  }
}

//
//     // Emits each time when fast check parameters are updated
//     event NewFastCheckParameters(uint256 chiThreshold, uint256 fastCheckDelay);

export class EventNewFastCheckParameters extends EVMEvent {
  public readonly creditManager: string;
  public readonly chiThreshold: number;
  public readonly fastCheckDelay: number;
  public readonly prevChiThreshold?: number;
  public readonly prevFastCheckDelay?: number;

  constructor(opts: {
    block: number;
    txHash: string;
    creditManager: string;
    chiThreshold: number;
    fastCheckDelay: number;
    prevChiThreshold?: number;
    prevFastCheckDelay?: number;
  }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.creditManager = opts.creditManager;
    this.chiThreshold = opts.chiThreshold;
    this.fastCheckDelay = opts.fastCheckDelay;
    this.prevChiThreshold = opts.prevChiThreshold;
    this.prevFastCheckDelay = opts.prevFastCheckDelay;
  }

  toString(_: Record<string, TokenData>): string {
    let msg = `Credit manager ${getContractName(this.creditManager)} updated: `;

    if (this.chiThreshold !== this.prevChiThreshold) {
      msg += `Chi threshold: ${this.prevChiThreshold} => ${this.chiThreshold}, `;
    }

    if (this.fastCheckDelay !== this.prevFastCheckDelay) {
      msg += `fast check delay: ${this.prevFastCheckDelay} => ${this.fastCheckDelay}, `;
    }

    // Remove trailing comma
    msg = msg.trimRight();

    return msg.slice(0, msg.length - 2);
  }
}

// event PriceOracleUpdated(address indexed newPriceOracle);

export class EventPriceOracleUpdated extends EVMEvent {
  public readonly creditManager: string;
  public readonly priceOracle: string;

  constructor(opts: {
    block: number;
    txHash: string;
    creditManager: string;
    priceOracle: string;
  }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.creditManager = opts.creditManager;
    this.priceOracle = opts.priceOracle;
  }

  toString(_: Record<string, TokenData>): string {
    return `Credit manager ${getContractName(
      this.creditManager
    )} updated: price oracle was updated. New price oracle ${getContractName(
      this.priceOracle
    )} `;
  }
}

// event TransferPluginAllowed(
//         address indexed plugin,
//         bool state
//     );

export class EventTransferPluginAllowed extends EVMEvent {
  public readonly creditManager: string;
  public readonly plugin: string;
  public readonly state: boolean;

  constructor(opts: {
    block: number;
    txHash: string;
    creditManager: string;
    priceOracle: string;
    state: boolean;
  }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.creditManager = opts.creditManager;
    this.plugin = opts.priceOracle;
    this.state = opts.state;
  }

  toString(_: Record<string, TokenData>): string {
    return `Credit manager ${getContractName(
      this.creditManager
    )} updated: transfer plugin  ${getContractName(this.plugin)} was ${
      this.state ? "allowed" : "forbidden"
    }`;
  }
}

// // Emits each time when Interest Rate model was changed
//     event NewInterestRateModel(address indexed newInterestRateModel);

export class EventNewInterestRateModel extends EVMEvent {
  public readonly pool: string;
  public readonly newInterestRateModel: string;

  constructor(opts: {
    block: number;
    txHash: string;
    pool: string;
    newInterestRateModel: string;
  }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.pool = opts.pool;
    this.newInterestRateModel = opts.newInterestRateModel;
  }

  toString(_: Record<string, TokenData>): string {
    return `Pool ${getContractName(
      this.pool
    )} updated: interest rate model was updated. New model: ${getContractName(
      this.newInterestRateModel
    )}`;
  }
}

//
//     // Emits each time when new credit Manager was connected
//     event NewCreditManagerConnected(address indexed creditManager);

export class EventNewCreditManagerConnected extends EVMEvent {
  public readonly pool: string;
  public readonly creditManager: string;

  constructor(opts: {
    block: number;
    txHash: string;
    pool: string;
    creditManager: string;
  }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.pool = opts.pool;
    this.creditManager = opts.creditManager;
  }

  toString(_: Record<string, TokenData>): string {
    return `Pool ${getContractName(
      this.pool
    )} updated: new credit manager ${getContractName(
      this.creditManager
    )} was connected`;
  }
}

//
//     // Emits each time when borrow forbidden for credit manager
//     event BorrowForbidden(address indexed creditManager);

export class EventBorrowForbidden extends EVMEvent {
  public readonly pool: string;
  public readonly creditManager: string;

  constructor(opts: {
    block: number;
    txHash: string;
    pool: string;
    creditManager: string;
  }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.pool = opts.pool;
    this.creditManager = opts.creditManager;
  }

  toString(_: Record<string, TokenData>): string {
    return `Pool ${getContractName(
      this.pool
    )} updated: credit manager ${getContractName(
      this.creditManager
    )} was forbidden to borrow`;
  }
}

//     // Emits after expected liquidity limit update
//     event NewExpectedLiquidityLimit(uint256 newLimit);

export class EventNewExpectedLiquidityLimit extends EVMEvent {
  public readonly pool: string;
  public readonly underlyingToken: string;
  public readonly newLimit: BigNumber;
  public readonly prevLimit: BigNumber;

  constructor(opts: {
    block: number;
    txHash: string;
    pool: string;
    underlyingToken: string;
    newLimit: BigNumber;
    prevLimit: BigNumber;
  }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.pool = opts.pool;
    this.underlyingToken = opts.underlyingToken;
    this.newLimit = opts.newLimit;
    this.prevLimit = opts.prevLimit;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.underlyingToken];

    return `Pool ${getContractName(
      this.pool
    )} updated: expected liquidity limit was ${
      this.newLimit.gt(this.prevLimit) ? "increased" : "decreased"
    }: ${formatBN(this.prevLimit, token.decimals)} ${
      token.symbol
    } => ${formatBN(this.newLimit, token.decimals)} ${token.symbol} => `;
  }
}

//     // Emits each time when withdraw fee is udpated
//     event NewWithdrawFee(uint256 fee);

export class EventNewWithdrawFee extends EVMEvent {
  public readonly pool: string;
  public readonly underlyingToken: string;
  public readonly newFee: BigNumber;
  public readonly prevFee: BigNumber;

  constructor(opts: {
    block: number;
    txHash: string;
    pool: string;
    underlyingToken: string;
    newLimit: BigNumber;
    prevLimit: BigNumber;
  }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.pool = opts.pool;
    this.underlyingToken = opts.underlyingToken;
    this.newFee = opts.newLimit;
    this.prevFee = opts.prevLimit;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.underlyingToken];

    return `Pool ${getContractName(this.pool)} updated: withdraw fee was ${
      this.newFee.gt(this.prevFee) ? "increased" : "decreased"
    }: ${formatBN(this.prevFee, token.decimals)} ${token.symbol} => ${formatBN(
      this.newFee,
      token.decimals
    )} ${token.symbol} => `;
  }
}

//  // Emits each time new configurator is set up
//     event NewPriceFeed(address indexed token, address indexed priceFeed);

export class EventNewPriceFeed extends EVMEvent {
  public readonly token: string;
  public readonly priceFeed: string;

  constructor(opts: {
    block: number;
    txHash: string;
    token: string;
    priceFeed: string;
  }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.token = opts.token;
    this.priceFeed = opts.priceFeed;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.token];

    return `PriceOracle: oracle for ${
      token.symbol
    } was updated to ${getContractName(this.priceFeed)} `;
  }
}

// // emits each time when DAO takes account from account factory forever
//     event TakeForever(address indexed creditAccount, address indexed to);

export class EventTakeForever extends EVMEvent {
  public readonly creditAccount: string;
  public readonly to: string;

  constructor(opts: {
    block: number;
    txHash: string;
    creditAccount: string;
    to: string;
  }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.creditAccount = opts.creditAccount;
    this.to = opts.to;
  }

  toString(_tokenData: Record<string, TokenData>): string {
    return `AccountFactory: account ${this.creditAccount} was taken forever and transferred to ${this.to} `;
  }
}

// Paused / Unpaused event (!)
export class EventPaused extends EVMEvent {
  public readonly contract: string;

  constructor(opts: { block: number; txHash: string; contract: string }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.contract = opts.contract;
  }

  toString(_tokenData: Record<string, TokenData>): string {
    return `${getContractName(this.contract)} was paused `;
  }
}

export class EventUnPaused extends EVMEvent {
  public readonly contract: string;

  constructor(opts: { block: number; txHash: string; contract: string }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.contract = opts.contract;
  }

  toString(_tokenData: Record<string, TokenData>): string {
    return `${getContractName(this.contract)} was unpaused `;
  }
}

// // emits each time when new pausable admin added
//     event PausableAdminAdded(address indexed newAdmin);

export class EventPausableAdminAdded extends EVMEvent {
  public readonly admin: string;

  constructor(opts: { block: number; txHash: string; admin: string }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.admin = opts.admin;
  }

  toString(_tokenData: Record<string, TokenData>): string {
    return `ACL: pausable admin ${this.admin} was added `;
  }
}

// emits each time when pausable admin removed
// event PausableAdminRemoved(address indexed admin);

export class EventPausableAdminRemoved extends EVMEvent {
  public readonly admin: string;

  constructor(opts: { block: number; txHash: string; admin: string }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.admin = opts.admin;
  }

  toString(_tokenData: Record<string, TokenData>): string {
    return `ACL: pausable admin ${this.admin} was removed `;
  }
}

//     // emits each time when new unpausable admin added
//     event UnpausableAdminAdded(address indexed newAdmin);

export class EventUnPausableAdminAdded extends EVMEvent {
  public readonly admin: string;

  constructor(opts: { block: number; txHash: string; admin: string }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.admin = opts.admin;
  }

  toString(_tokenData: Record<string, TokenData>): string {
    return `ACL: unpausable admin ${this.admin} was added `;
  }
}

// emits each times when unpausable admin removed
// event UnpausableAdminRemoved(address indexed admin);
export class EventUnPausableAdminRemoved extends EVMEvent {
  public readonly admin: string;

  constructor(opts: { block: number; txHash: string; admin: string }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.admin = opts.admin;
  }

  toString(_tokenData: Record<string, TokenData>): string {
    return `ACL: unpausable admin ${this.admin} was removed `;
  }
}

// ACL: Transfer ownership
export class EventTransferOwnership extends EVMEvent {
  public readonly newOwner: string;

  constructor(opts: { block: number; txHash: string; admin: string }) {
    super({ block: opts.block, txHash: opts.txHash });
    this.newOwner = opts.admin;
  }

  toString(_tokenData: Record<string, TokenData>): string {
    return `ACL: configurator was changed to ${this.newOwner} `;
  }
}
