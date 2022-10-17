import { BigNumber } from "ethers";

import { getContractName } from "../contracts/contractsRegister";
import { extractTokenData } from "../tokens/token";
import { TokenData } from "../tokens/tokenData";
import { formatBN, formatDateTime } from "../utils/formatter";
import { LEVERAGE_DECIMALS, PERCENTAGE_DECIMALS } from "./constants";
import { EVMEvent, EVMEventProps, EVMTx } from "./eventOrTx";

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
    | "EventUnpausableAdminAdded"
    | "EventUnpausableAdminRemoved"
    | "EventOwnershipTransferred"
    | "EventTokenAllowedV2"
    | "EventLimitsUpdated"
    | "EventFeesUpdated"
    | "EventCreditFacadeUpgraded"
    | "EventNewConfigurator"
    | "EventIncreaseDebtForbiddenModeChanged"
    | "EventExpirationDateUpdated"
    | "EventMaxEnabledTokensUpdated"
    | "EventLimitPerBlockUpdated"
    | "EventAddedToUpgradeable"
    | "EventRemovedFromUpgradeable"
    | "EventEmergencyLiquidatorAdded"
    | "EventEmergencyLiquidatorRemoved"
    | "EventLTUpdated";

  content: any;
}

export class EventParser {
  static serialize(items: Array<EVMTx>): string {
    return JSON.stringify(items.map(i => i.serialize()));
  }

  // eslint-disable-next-line complexity
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
      case "EventUnpausableAdminAdded":
        return new EventUnPausableAdminAdded(params);
      case "EventUnpausableAdminRemoved":
        return new EventUnPausableAdminRemoved(params);
      case "EventOwnershipTransferred":
        return new EventTransferOwnership(params);

      case "EventTokenAllowedV2":
        return new EventTokenAllowedV2(params);
      case "EventLimitsUpdated":
        return new EventLimitsUpdated(params);
      case "EventFeesUpdated":
        return new EventFeesUpdated(params);
      case "EventCreditFacadeUpgraded":
        return new EventCreditFacadeUpgraded(params);
      case "EventNewConfigurator":
        return new EventNewConfigurator(params);
      case "EventLTUpdated":
        return new EventLTUpdated(params);

      case "EventIncreaseDebtForbiddenModeChanged":
        return new EventIncreaseDebtForbiddenModeChanged(params);
      case "EventExpirationDateUpdated":
        return new EventExpirationDateUpdated(params);
      case "EventMaxEnabledTokensUpdated":
        return new EventMaxEnabledTokensUpdated(params);
      case "EventLimitPerBlockUpdated":
        return new EventLimitPerBlockUpdated(params);
      case "EventAddedToUpgradeable":
        return new EventAddedToUpgradeable(params);
      case "EventRemovedFromUpgradeable":
        return new EventRemovedFromUpgradeable(params);
      case "EventEmergencyLiquidatorAdded":
        return new EventEmergencyLiquidatorAdded(params);
      case "EventEmergencyLiquidatorRemoved":
        return new EventEmergencyLiquidatorRemoved(params);

      default:
        throw new Error(`Unknown transaction for parsing ${data.type}`);
    }
  }

  static deserializeArray(data: Array<EventSerialized>): Array<EVMEvent> {
    return data.map(e => EventParser.deserialize(e));
  }
}

// POOL EVENTS
interface EventAddLiquidityProps extends EVMEventProps {
  amount: string;
  underlyingToken: string;
  pool: string;
}

export class EventAddLiquidity extends EVMEvent {
  public readonly amount: BigNumber;

  public readonly underlyingToken: string;

  public readonly pool: string;

  constructor(opts: EventAddLiquidityProps) {
    super(opts);
    this.amount = BigNumber.from(opts.amount);
    this.underlyingToken = opts.underlyingToken;
    this.pool = opts.pool;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const { decimals = 18, symbol } =
      tokenData[this.underlyingToken.toLowerCase()] || {};

    return `Pool ${getContractName(this.pool)}: Deposit ${formatBN(
      this.amount,
      decimals,
    )} ${symbol}`;
  }
}

interface RemoveLiquidityProps extends EVMEventProps {
  amount: string;
  underlyingToken: string;
  dieselToken: string;
  pool: string;
}

export class EventRemoveLiquidity extends EVMEvent {
  public readonly amount: BigNumber;

  public readonly underlyingToken: string;

  public readonly dieselToken: string;

  public readonly pool: string;

  constructor(opts: RemoveLiquidityProps) {
    super(opts);
    this.amount = BigNumber.from(opts.amount);
    this.underlyingToken = opts.underlyingToken;
    this.dieselToken = opts.dieselToken;
    this.pool = opts.pool;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const { decimals = 18, symbol } =
      tokenData[this.dieselToken.toLowerCase()] || {};

    return `Pool ${getContractName(this.pool)}: withdraw ${formatBN(
      this.amount,
      decimals,
    )} ${symbol}`;
  }
}

// CREDIT MANAGER EVENTS

interface OpenCreditAccountProps extends EVMEventProps {
  amount: string;
  underlyingToken: string;
  leverage: number;
  creditManager: string;
}

export class EventOpenCreditAccount extends EVMEvent {
  public readonly amount: BigNumber;

  public readonly underlyingToken: string;

  public readonly leverage: number;

  public readonly creditManager: string;

  constructor(opts: OpenCreditAccountProps) {
    super(opts);
    this.amount = BigNumber.from(opts.amount);
    this.underlyingToken = opts.underlyingToken;
    this.leverage = opts.leverage;
    this.creditManager = opts.creditManager;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const { decimals = 18, symbol } =
      tokenData[this.underlyingToken.toLowerCase()] || {};

    return `Credit account ${getContractName(
      this.creditManager,
    )}: open ${formatBN(
      this.amount,
      decimals,
    )} ${symbol} x ${this.leverage.toFixed(2)} ⇒ 
    ${formatBN(
      this.amount
        .mul(Math.floor(this.leverage + LEVERAGE_DECIMALS))
        .div(LEVERAGE_DECIMALS),
      decimals + 2,
    )} ${symbol}`;
  }
}

interface CloseCreditAccountProps extends EVMEventProps {
  amount: string;
  underlyingToken: string;
  creditManager: string;
}

export class EventCloseCreditAccount extends EVMEvent {
  public readonly amount: BigNumber;

  public readonly underlyingToken: string;

  public readonly creditManager: string;

  constructor(opts: CloseCreditAccountProps) {
    super(opts);
    this.amount = BigNumber.from(opts.amount);
    this.underlyingToken = opts.underlyingToken;
    this.creditManager = opts.creditManager;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const { decimals = 18, symbol } =
      tokenData[this.underlyingToken.toLowerCase()] || {};

    return `Credit account ${getContractName(
      this.creditManager,
    )}: was closed and got ${formatBN(
      this.amount,
      decimals,
    )} ${symbol} as remaining funds`;
  }
}

interface LiquidateCreditAccountProps extends EVMEventProps {
  amount: string;
  underlyingToken: string;
  creditManager: string;
}

export class EventLiquidateCreditAccount extends EVMEvent {
  public readonly amount: BigNumber;

  public readonly underlyingToken: string;

  public readonly creditManager: string;

  constructor(opts: LiquidateCreditAccountProps) {
    super(opts);
    this.amount = BigNumber.from(opts.amount);
    this.underlyingToken = opts.underlyingToken;
    this.creditManager = opts.creditManager;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const { decimals = 18, symbol } =
      tokenData[this.underlyingToken.toLowerCase()] || {};

    return `Credit account ${getContractName(
      this.creditManager,
    )}: was liquidated. ${formatBN(
      this.amount,
      decimals,
    )} ${symbol} were paid back as remaining funds`;
  }
}

interface RepayCreditAccountProps extends EVMEventProps {
  underlyingToken: string;
  creditManager: string;
}

export class EventRepayCreditAccount extends EVMEvent {
  public readonly underlyingToken: string;

  public readonly creditManager: string;

  constructor(opts: RepayCreditAccountProps) {
    super(opts);
    this.underlyingToken = opts.underlyingToken;
    this.creditManager = opts.creditManager;
  }

  toString(): string {
    return `Credit account ${getContractName(this.creditManager)}: was repaid`;
  }
}

interface AddCollateralProps extends EVMEventProps {
  amount: string;
  addedToken: string;
  creditManager: string;
}

export class EventAddCollateral extends EVMEvent {
  public readonly amount: BigNumber;

  public readonly addedToken: string;

  public readonly creditManager: string;

  constructor(opts: AddCollateralProps) {
    super(opts);
    this.amount = BigNumber.from(opts.amount);

    this.addedToken = opts.addedToken;
    this.creditManager = opts.creditManager;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const { decimals = 18, symbol } =
      tokenData[this.addedToken.toLowerCase()] || {};

    return `Credit account ${getContractName(
      this.creditManager,
    )}: added ${formatBN(this.amount, decimals)} ${symbol} as collateral`;
  }
}

interface IncreaseBorrowAmountProps extends EVMEventProps {
  amount: string;
  underlyingToken: string;
  creditManager: string;
}

export class EventIncreaseBorrowAmount extends EVMEvent {
  public readonly amount: BigNumber;

  public readonly underlyingToken: string;

  public readonly creditManager: string;

  constructor(opts: IncreaseBorrowAmountProps) {
    super(opts);
    this.amount = BigNumber.from(opts.amount);
    this.underlyingToken = opts.underlyingToken;
    this.creditManager = opts.creditManager;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const { decimals = 18, symbol } =
      tokenData[this.underlyingToken.toLowerCase()] || {};

    return `Credit account ${getContractName(
      this.creditManager,
    )}: borrowed amount was increased for ${formatBN(
      this.amount,
      decimals,
    )} ${symbol}`;
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

interface CMNewParametersProps extends EVMEventProps {
  creditManager: string;
  underlyingToken: string;
  minAmount: string;
  maxAmount: string;
  maxLeverage: number;
  feeInterest: number;
  feeLiquidation: number;
  liquidationDiscount: number;
  prevMinAmount: string;
  prevMaxAmount: string;
  prevMaxLeverage: number;
  prevFeeInterest: number;
  prevFeeLiquidation: number;
  prevLiquidationDiscount: number;
}

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

  constructor(opts: CMNewParametersProps) {
    super(opts);
    this.creditManager = opts.creditManager;
    this.underlyingToken = opts.underlyingToken;
    this.minAmount = BigNumber.from(opts.minAmount);
    this.maxAmount = BigNumber.from(opts.maxAmount);
    this.maxLeverage = opts.maxLeverage;
    this.feeInterest = opts.feeInterest;
    this.feeLiquidation = opts.feeLiquidation;
    this.liquidationDiscount = opts.liquidationDiscount;

    this.prevMinAmount = BigNumber.from(opts.prevMinAmount);
    this.prevMaxAmount = BigNumber.from(opts.prevMaxAmount);
    this.prevMaxLeverage = opts.prevMaxLeverage;
    this.prevFeeInterest = opts.prevFeeInterest;
    this.prevFeeLiquidation = opts.prevFeeLiquidation;
    this.prevLiquidationDiscount = opts.prevLiquidationDiscount;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.underlyingToken.toLowerCase()];
    let msg = `Credit manager ${getContractName(this.creditManager)} updated: `;

    if (this.minAmount !== this.prevMinAmount) {
      msg += `min amount: ${formatBN(
        this.prevMinAmount,
        token.decimals,
      )} => ${formatBN(this.minAmount, token.decimals)} ${token.symbol}, `;
    }

    if (this.maxAmount !== this.prevMaxAmount) {
      msg += `max amount: ${formatBN(
        this.prevMaxAmount,
        token.decimals,
      )} => ${formatBN(this.maxAmount, token.decimals)} ${token.symbol}, `;
    }

    if (this.maxLeverage !== this.prevMaxLeverage) {
      msg += `max leverage: ${
        this.prevMaxLeverage / LEVERAGE_DECIMALS + 1
      } => ${this.maxLeverage / LEVERAGE_DECIMALS + 1}, `;
    }

    if (this.feeInterest !== this.prevFeeInterest) {
      msg += `interest fee: ${this.prevFeeInterest / PERCENTAGE_DECIMALS}% => ${
        this.feeInterest / PERCENTAGE_DECIMALS
      }%, `;
    }

    if (this.feeLiquidation !== this.prevFeeLiquidation) {
      msg += `liquidation fee: ${
        this.prevFeeLiquidation / PERCENTAGE_DECIMALS
      }% => ${this.feeLiquidation / PERCENTAGE_DECIMALS}%, `;
    }

    if (this.liquidationDiscount !== this.prevLiquidationDiscount) {
      msg += `liquidation premium: ${
        PERCENTAGE_DECIMALS - this.prevLiquidationDiscount / PERCENTAGE_DECIMALS
      }% => ${
        PERCENTAGE_DECIMALS - this.liquidationDiscount / PERCENTAGE_DECIMALS
      }%, `;
    }

    return msg.slice(0, msg.length - 2);
  }
}

// // Emits each time token is allowed or liquidation threshold changed
//     event TokenAllowed(address indexed token, uint256 liquidityThreshold);

export type TokenAllowanceType = "NewToken" | "LTUpdated" | "Allowed";

interface TokenAllowedProps extends EVMEventProps {
  creditManager: string;
  token: string;
  liquidityThreshold: number;
  prevLiquidationThreshold?: number;
  status: TokenAllowanceType;
}

export class EventTokenAllowed extends EVMEvent {
  public readonly creditManager: string;

  public readonly token: string;

  public readonly liquidityThreshold: number;

  public readonly prevLiquidationThreshold?: number;

  public readonly status: TokenAllowanceType;

  constructor(opts: TokenAllowedProps) {
    super(opts);
    this.creditManager = opts.creditManager;
    this.token = opts.token;
    this.liquidityThreshold = opts.liquidityThreshold;
    this.prevLiquidationThreshold = opts.prevLiquidationThreshold;
    this.status = opts.status;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.token.toLowerCase()];
    const msg = `Credit manager ${getContractName(
      this.creditManager,
    )} updated `;
    switch (this.status) {
      case "NewToken":
        return `${msg}: New token allowed: ${
          token.symbol
        }, liquidation threshold: ${
          this.liquidityThreshold / PERCENTAGE_DECIMALS
        }%`;
      case "Allowed":
        return `${msg}: ${
          token.symbol
        } is allowed now, liquidation threshold: ${
          this.liquidityThreshold / PERCENTAGE_DECIMALS
        }%`;
      case "LTUpdated":
        return `${msg}: ${token.symbol} liquidation threshold: ${
          (this.prevLiquidationThreshold || 0) / PERCENTAGE_DECIMALS
        } => ${this.liquidityThreshold / PERCENTAGE_DECIMALS}%`;
      default:
        return "Error: TokenAllowedProps";
    }
  }
}

//    // Emits each time token is allowed or liquidtion threshold changed
//     event TokenForbidden(address indexed token);

interface TokenForbiddenProps extends EVMEventProps {
  creditManager: string;
  token: string;
}

export class EventTokenForbidden extends EVMEvent {
  public readonly creditManager: string;

  public readonly token: string;

  constructor(opts: TokenForbiddenProps) {
    super(opts);
    this.creditManager = opts.creditManager;
    this.token = opts.token;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.token.toLowerCase()];
    return `Credit manager ${getContractName(this.creditManager)} updated ${
      token.symbol
    } forbidden`;
  }
}

//
//     // Emits each time contract is allowed or adapter changed
//     event ContractAllowed(address indexed protocol, address indexed adapter);

export type EventContractAllowedStatus = "Connected" | "AdapterUpdate";

interface ContractAllowedProps extends EVMEventProps {
  creditManager: string;
  protocol: string;
  adapter: string;
  status: EventContractAllowedStatus;
}

export class EventContractAllowed extends EVMEvent {
  public readonly creditManager: string;

  public readonly protocol: string;

  public readonly adapter: string;

  public readonly status: EventContractAllowedStatus;

  constructor(opts: ContractAllowedProps) {
    super(opts);
    this.creditManager = opts.creditManager;
    this.protocol = opts.protocol;
    this.adapter = opts.adapter;
    this.status = opts.status;
  }

  toString(): string {
    const msg = `Credit manager ${getContractName(this.creditManager)} updated`;

    switch (this.status) {
      case "Connected":
        return `${msg} : ${getContractName(
          this.protocol,
        )} was connected. Adapter at: ${this.adapter}`;
      case "AdapterUpdate":
        return `${msg} : ${getContractName(
          this.protocol,
        )} adapter was updated. New adapter:  ${this.adapter}`;
      default:
        return "Error: EventContractAllowed";
    }
  }
}

//
//     // Emits each time contract is forbidden
//     event ContractForbidden(address indexed protocol);

interface ContractForbiddenProps extends EVMEventProps {
  creditManager: string;
  protocol: string;
}

export class EventContractForbidden extends EVMEvent {
  public readonly creditManager: string;

  public readonly protocol: string;

  constructor(opts: ContractForbiddenProps) {
    super(opts);
    this.creditManager = opts.creditManager;
    this.protocol = opts.protocol;
  }

  toString(): string {
    return `Credit manager ${getContractName(
      this.creditManager,
    )} updated: ${getContractName(this.protocol)}`;
  }
}

//
//     // Emits each time when fast check parameters are updated
//     event NewFastCheckParameters(uint256 chiThreshold, uint256 fastCheckDelay);

interface NewFastCheckParametersProps extends EVMEventProps {
  creditManager: string;
  chiThreshold: number;
  fastCheckDelay: number;
  prevChiThreshold?: number;
  prevFastCheckDelay?: number;
}

export class EventNewFastCheckParameters extends EVMEvent {
  public readonly creditManager: string;

  public readonly chiThreshold: number;

  public readonly fastCheckDelay: number;

  public readonly prevChiThreshold?: number;

  public readonly prevFastCheckDelay?: number;

  constructor(opts: NewFastCheckParametersProps) {
    super(opts);
    this.creditManager = opts.creditManager;
    this.chiThreshold = opts.chiThreshold;
    this.fastCheckDelay = opts.fastCheckDelay;
    this.prevChiThreshold = opts.prevChiThreshold;
    this.prevFastCheckDelay = opts.prevFastCheckDelay;
  }

  toString(): string {
    let msg = `Credit manager ${getContractName(this.creditManager)} updated: `;

    if (this.chiThreshold !== this.prevChiThreshold) {
      msg += `Chi threshold: ${this.prevChiThreshold} => ${this.chiThreshold}, `;
    }

    if (this.fastCheckDelay !== this.prevFastCheckDelay) {
      msg += `fast check delay: ${this.prevFastCheckDelay} => ${this.fastCheckDelay}, `;
    }

    return msg.slice(0, msg.length - 2);
  }
}

// event PriceOracleUpdated(address indexed newPriceOracle);

interface PriceOracleUpdatedProps extends EVMEventProps {
  creditManager: string;
  priceOracle: string;
}

export class EventPriceOracleUpdated extends EVMEvent {
  public readonly creditManager: string;

  public readonly priceOracle: string;

  constructor(opts: PriceOracleUpdatedProps) {
    super(opts);
    this.creditManager = opts.creditManager;
    this.priceOracle = opts.priceOracle;
  }

  toString(): string {
    return `Credit manager ${getContractName(
      this.creditManager,
    )} updated: price oracle was updated. New price oracle ${getContractName(
      this.priceOracle,
    )}`;
  }
}

// event TransferPluginAllowed(
//         address indexed plugin,
//         bool state
//     );

interface TransferPluginAllowedProps extends EVMEventProps {
  creditManager: string;
  priceOracle: string;
  state: boolean;
}

export class EventTransferPluginAllowed extends EVMEvent {
  public readonly creditManager: string;

  public readonly plugin: string;

  public readonly state: boolean;

  constructor(opts: TransferPluginAllowedProps) {
    super(opts);
    this.creditManager = opts.creditManager;
    this.plugin = opts.priceOracle;
    this.state = opts.state;
  }

  toString(): string {
    return `Credit manager ${getContractName(
      this.creditManager,
    )} updated: transfer plugin  ${getContractName(this.plugin)} was ${
      this.state ? "allowed" : "forbidden"
    }`;
  }
}

// // Emits each time when Interest Rate model was changed
//     event NewInterestRateModel(address indexed newInterestRateModel);

interface NewInterestRateModelProps extends EVMEventProps {
  pool: string;
  newInterestRateModel: string;
}

export class EventNewInterestRateModel extends EVMEvent {
  public readonly pool: string;

  public readonly newInterestRateModel: string;

  constructor(opts: NewInterestRateModelProps) {
    super(opts);
    this.pool = opts.pool;
    this.newInterestRateModel = opts.newInterestRateModel;
  }

  toString(): string {
    return `Pool ${getContractName(
      this.pool,
    )} updated: interest rate model was updated. New model: ${getContractName(
      this.newInterestRateModel,
    )}`;
  }
}

//
//     // Emits each time when new credit Manager was connected
//     event NewCreditManagerConnected(address indexed creditManager);

interface NewCreditManagerConnectedProps extends EVMEventProps {
  pool: string;
  creditManager: string;
}

export class EventNewCreditManagerConnected extends EVMEvent {
  public readonly pool: string;

  public readonly creditManager: string;

  constructor(opts: NewCreditManagerConnectedProps) {
    super(opts);
    this.pool = opts.pool;
    this.creditManager = opts.creditManager;
  }

  toString(): string {
    return `Pool ${getContractName(
      this.pool,
    )} updated: new credit manager ${getContractName(
      this.creditManager,
    )} was connected`;
  }
}

//
//     // Emits each time when borrow forbidden for credit manager
//     event BorrowForbidden(address indexed creditManager);

interface BorrowForbiddenProps extends EVMEventProps {
  pool: string;
  creditManager: string;
}

export class EventBorrowForbidden extends EVMEvent {
  public readonly pool: string;

  public readonly creditManager: string;

  constructor(opts: BorrowForbiddenProps) {
    super(opts);
    this.pool = opts.pool;
    this.creditManager = opts.creditManager;
  }

  toString(): string {
    return `Pool ${getContractName(
      this.pool,
    )} updated: credit manager ${getContractName(
      this.creditManager,
    )} was forbidden to borrow`;
  }
}

//     // Emits after expected liquidity limit update
//     event NewExpectedLiquidityLimit(uint256 newLimit);

interface NewExpectedLiquidityLimitProps extends EVMEventProps {
  pool: string;
  underlyingToken: string;
  newLimit: string;
  oldLimit: string;
}

export class EventNewExpectedLiquidityLimit extends EVMEvent {
  public readonly pool: string;

  public readonly underlyingToken: string;

  public readonly newLimit: BigNumber;

  public readonly prevLimit: BigNumber;

  constructor(opts: NewExpectedLiquidityLimitProps) {
    super(opts);
    this.pool = opts.pool;
    this.underlyingToken = opts.underlyingToken;
    this.newLimit = BigNumber.from(opts.newLimit);
    this.prevLimit = BigNumber.from(opts.oldLimit);
  }

  toString(tokenData: Record<string, TokenData>): string {
    const { decimals = 18, symbol } =
      tokenData[this.underlyingToken.toLowerCase()] || {};

    return this.prevLimit.isZero()
      ? `Pool ${getContractName(
          this.pool,
        )} updated: expected liquidity limit was set to ${formatBN(
          this.newLimit,
          decimals,
        )} ${symbol}`
      : `Pool ${getContractName(
          this.pool,
        )} updated: expected liquidity limit was ${
          this.newLimit.gt(this.prevLimit) ? "increased" : "decreased"
        }: ${formatBN(this.prevLimit, decimals)} ${symbol} => ${formatBN(
          this.newLimit,
          decimals,
        )} ${symbol}`;
  }
}

//     // Emits each time when withdraw fee is udpated
//     event NewWithdrawFee(uint256 fee);

interface NewWithdrawFeeProps extends EVMEventProps {
  pool: string;
  underlyingToken: string;
  newFee: string;
  oldFee: string;
}

export class EventNewWithdrawFee extends EVMEvent {
  public readonly pool: string;

  public readonly underlyingToken: string;

  public readonly newFee: number;

  public readonly prevFee: number;

  constructor(opts: NewWithdrawFeeProps) {
    super(opts);
    this.pool = opts.pool;
    this.underlyingToken = opts.underlyingToken;
    this.newFee = Number(opts.newFee);
    this.prevFee = Number(opts.oldFee);
  }

  toString(): string {
    return this.prevFee === 0
      ? `Pool ${getContractName(this.pool)} updated: withdraw fee was set to: ${
          this.newFee / PERCENTAGE_DECIMALS
        }%`
      : `Pool ${getContractName(this.pool)} updated: withdraw fee was ${
          this.newFee > this.prevFee ? "increased" : "decreased"
        }: ${this.prevFee / PERCENTAGE_DECIMALS}% => ${
          this.newFee / PERCENTAGE_DECIMALS
        }%`;
  }
}

//  // Emits each time new configurator is set up
//     event NewPriceFeed(address indexed token, address indexed priceFeed);

interface NewPriceFeedProps extends EVMEventProps {
  token: string;
  priceFeed: string;
}

export class EventNewPriceFeed extends EVMEvent {
  public readonly token: string;

  public readonly priceFeed: string;

  constructor(opts: NewPriceFeedProps) {
    super(opts);
    this.token = opts.token;
    this.priceFeed = opts.priceFeed;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const { symbol } = tokenData[this.token.toLowerCase()] || {};

    return `PriceOracle: oracle for ${symbol} was updated to ${getContractName(
      this.priceFeed,
    )}`;
  }
}

// // emits each time when DAO takes account from account factory forever
//     event TakeForever(address indexed creditAccount, address indexed to);

interface TakeForeverProps extends EVMEventProps {
  creditAccount: string;
  to: string;
}

export class EventTakeForever extends EVMEvent {
  public readonly creditAccount: string;

  public readonly to: string;

  constructor(opts: TakeForeverProps) {
    super(opts);
    this.creditAccount = opts.creditAccount;
    this.to = opts.to;
  }

  toString(): string {
    return `AccountFactory: account ${this.creditAccount} was taken forever and transferred to ${this.to}`;
  }
}

// Paused / Unpaused event (!)

interface PausedProps extends EVMEventProps {
  contract: string;
}

export class EventPaused extends EVMEvent {
  public readonly contract: string;

  constructor(opts: PausedProps) {
    super(opts);
    this.contract = opts.contract;
  }

  toString(): string {
    return `${getContractName(this.contract)} was paused`;
  }
}

interface UnPausedProps extends EVMEventProps {
  contract: string;
}

export class EventUnPaused extends EVMEvent {
  public readonly contract: string;

  constructor(opts: UnPausedProps) {
    super(opts);
    this.contract = opts.contract;
  }

  toString(): string {
    return `${getContractName(this.contract)} was unpaused`;
  }
}

// // emits each time when new pausable admin added
//     event PausableAdminAdded(address indexed newAdmin);

interface PausableAdminAddedProps extends EVMEventProps {
  admin: string;
}

export class EventPausableAdminAdded extends EVMEvent {
  public readonly admin: string;

  constructor(opts: PausableAdminAddedProps) {
    super(opts);
    this.admin = opts.admin;
  }

  toString(): string {
    return `ACL: pausable admin ${this.admin} was added`;
  }
}

// emits each time when pausable admin removed
// event PausableAdminRemoved(address indexed admin);

interface PausableAdminRemovedProps extends EVMEventProps {
  admin: string;
}

export class EventPausableAdminRemoved extends EVMEvent {
  public readonly admin: string;

  constructor(opts: PausableAdminRemovedProps) {
    super(opts);
    this.admin = opts.admin;
  }

  toString(): string {
    return `ACL: pausable admin ${this.admin} was removed`;
  }
}

//     // emits each time when new unpausable admin added
//     event UnpausableAdminAdded(address indexed newAdmin);

interface UnPausableAdminAddedProps extends EVMEventProps {
  admin: string;
}

export class EventUnPausableAdminAdded extends EVMEvent {
  public readonly admin: string;

  constructor(opts: UnPausableAdminAddedProps) {
    super(opts);
    this.admin = opts.admin;
  }

  toString(): string {
    return `ACL: unpausable admin ${this.admin} was added`;
  }
}

// emits each times when unpausable admin removed
// event UnpausableAdminRemoved(address indexed admin);

interface UnPausableAdminRemovedProps extends EVMEventProps {
  admin: string;
}

export class EventUnPausableAdminRemoved extends EVMEvent {
  public readonly admin: string;

  constructor(opts: UnPausableAdminRemovedProps) {
    super(opts);
    this.admin = opts.admin;
  }

  toString(): string {
    return `ACL: unpausable admin ${this.admin} was removed`;
  }
}

interface TransferOwnershipProps extends EVMEventProps {
  admin: string;
}

// ACL: Transfer ownership
export class EventTransferOwnership extends EVMEvent {
  public readonly newOwner: string;

  constructor(opts: TransferOwnershipProps) {
    super(opts);
    this.newOwner = opts.admin;
  }

  toString(): string {
    return `ACL: configurator was changed to ${this.newOwner}`;
  }
}

// ICreditConfigurator

export interface TokenAllowedV2Props extends EVMEventProps {
  creditManager: string;
  token: string;
  liquidityThreshold: number;
  prevLiquidationThreshold?: number;
  status: TokenAllowanceType;
}

export class EventTokenAllowedV2 extends EVMEvent {
  public readonly creditManager: string;

  public readonly token: string;

  public readonly liquidityThreshold: number;

  public readonly prevLiquidationThreshold?: number;

  public readonly status: TokenAllowanceType;

  constructor(opts: TokenAllowedV2Props) {
    super(opts);
    this.creditManager = opts.creditManager;
    this.token = opts.token;
    this.liquidityThreshold = opts.liquidityThreshold;
    this.prevLiquidationThreshold = opts.prevLiquidationThreshold;
    this.status = opts.status;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.token.toLowerCase()];
    const msg = `Credit manager ${getContractName(
      this.creditManager,
    )} updated `;
    switch (this.status) {
      case "NewToken":
        return `${msg}: New token allowed: ${
          token.symbol
        }, liquidation threshold: ${
          this.liquidityThreshold / PERCENTAGE_DECIMALS
        }%`;
      case "Allowed":
        return `${msg}: ${
          token.symbol
        } is allowed now, liquidation threshold: ${
          this.liquidityThreshold / PERCENTAGE_DECIMALS
        }%`;
      case "LTUpdated":
        return `${msg}: ${token.symbol} liquidation threshold: ${
          (this.prevLiquidationThreshold || 0) / PERCENTAGE_DECIMALS
        } => ${this.liquidityThreshold / PERCENTAGE_DECIMALS}%`;
      default:
        return "Error: TokenAllowedV2Props";
    }
  }
}

export interface LimitsUpdatedEventProps extends EVMEventProps {
  minBorrowedAmount: string;
  maxBorrowedAmount: string;

  prevMinBorrowedAmount: string;
  prevMaxBorrowedAmount: string;

  underlyingToken: string;
  creditManager: string;
}

export class EventLimitsUpdated extends EVMEvent {
  public readonly minBorrowedAmount: BigNumber;
  public readonly maxBorrowedAmount: BigNumber;

  public readonly prevMinBorrowedAmount: BigNumber;
  public readonly prevMaxBorrowedAmount: BigNumber;

  public readonly underlyingToken: string;
  public readonly creditManager: string;

  constructor(opts: LimitsUpdatedEventProps) {
    super(opts);
    this.minBorrowedAmount = BigNumber.from(opts.minBorrowedAmount);
    this.maxBorrowedAmount = BigNumber.from(opts.maxBorrowedAmount);

    this.prevMinBorrowedAmount = BigNumber.from(opts.prevMinBorrowedAmount);
    this.prevMaxBorrowedAmount = BigNumber.from(opts.prevMaxBorrowedAmount);

    this.underlyingToken = opts.underlyingToken;
    this.creditManager = opts.creditManager;
  }

  toString(): string {
    const [symbol, decimals = 18] = extractTokenData(this.underlyingToken);
    let msg = `Credit manager ${getContractName(this.creditManager)} updated: `;

    if (this.minBorrowedAmount !== this.prevMinBorrowedAmount) {
      msg += `min amount: ${formatBN(
        this.prevMinBorrowedAmount,
        decimals,
      )} => ${formatBN(this.minBorrowedAmount, decimals)} ${symbol}, `;
    }

    if (this.maxBorrowedAmount !== this.prevMaxBorrowedAmount) {
      msg += `max amount: ${formatBN(
        this.prevMaxBorrowedAmount,
        decimals,
      )} => ${formatBN(this.maxBorrowedAmount, decimals)} ${symbol}, `;
    }

    return msg.slice(0, msg.length - 2);
  }
}

export interface FeesUpdatedEventProps extends EVMEventProps {
  feeInterest: number;
  feeLiquidation: number;
  liquidationPremium: number;
  feeLiquidationExpired: number;
  liquidationPremiumExpired: number;

  prevFeeInterest: number;
  prevFeeLiquidation: number;
  prevLiquidationPremium: number;
  prevFeeLiquidationExpired: number;
  prevLiquidationPremiumExpired: number;

  creditManager: string;
}

export class EventFeesUpdated extends EVMEvent {
  public readonly feeInterest: number;
  public readonly feeLiquidation: number;
  public readonly liquidationPremium: number;
  public readonly feeLiquidationExpired: number;
  public readonly liquidationPremiumExpired: number;

  public readonly prevFeeInterest: number;
  public readonly prevFeeLiquidation: number;
  public readonly prevLiquidationPremium: number;
  public readonly prevFeeLiquidationExpired: number;
  public readonly prevLiquidationPremiumExpired: number;

  public readonly creditManager: string;

  constructor(opts: FeesUpdatedEventProps) {
    super(opts);
    this.feeInterest = opts.feeInterest;
    this.feeLiquidation = opts.feeLiquidation;
    this.liquidationPremium = opts.liquidationPremium;
    this.feeLiquidationExpired = opts.feeLiquidationExpired;
    this.liquidationPremiumExpired = opts.liquidationPremiumExpired;

    this.prevFeeInterest = opts.prevFeeInterest;
    this.prevFeeLiquidation = opts.prevFeeLiquidation;
    this.prevLiquidationPremium = opts.prevLiquidationPremium;
    this.prevFeeLiquidationExpired = opts.prevFeeLiquidationExpired;
    this.prevLiquidationPremiumExpired = opts.prevLiquidationPremiumExpired;

    this.creditManager = opts.creditManager;
  }

  toString(): string {
    let msg = `Credit manager ${getContractName(this.creditManager)} updated: `;

    if (this.feeInterest !== this.prevFeeInterest) {
      msg += `interest fee: ${this.prevFeeInterest / PERCENTAGE_DECIMALS}% => ${
        this.feeInterest / PERCENTAGE_DECIMALS
      }%, `;
    }

    if (this.feeLiquidation !== this.prevFeeLiquidation) {
      msg += `liquidation fee: ${
        this.prevFeeLiquidation / PERCENTAGE_DECIMALS
      }% => ${this.feeLiquidation / PERCENTAGE_DECIMALS}%, `;
    }

    if (this.liquidationPremium !== this.prevLiquidationPremium) {
      msg += `liquidation premium: ${
        this.prevLiquidationPremium / PERCENTAGE_DECIMALS
      }% => ${this.liquidationPremium / PERCENTAGE_DECIMALS}%, `;
    }

    if (this.feeLiquidationExpired !== this.prevFeeLiquidationExpired) {
      msg += `liquidation expired: ${formatDateTime(
        this.prevFeeLiquidationExpired,
      )} => ${formatDateTime(this.feeLiquidationExpired)}, `;
    }

    if (this.liquidationPremiumExpired !== this.prevLiquidationPremiumExpired) {
      msg += `liquidation premium expired: ${formatDateTime(
        this.prevLiquidationPremiumExpired,
      )} => ${formatDateTime(this.liquidationPremiumExpired)}, `;
    }

    return msg.slice(0, msg.length - 2);
  }
}

export interface CreditFacadeUpgradedEventProps extends EVMEventProps {
  newCreditFacade: string;
  prevCreditFacade: string;

  creditManager: string;
}

export class EventCreditFacadeUpgraded extends EVMEvent {
  public readonly newCreditFacade: string;
  public readonly prevCreditFacade: string;

  public readonly creditManager: string;

  constructor(opts: CreditFacadeUpgradedEventProps) {
    super(opts);
    this.newCreditFacade = opts.newCreditFacade;
    this.prevCreditFacade = opts.prevCreditFacade;

    this.creditManager = opts.creditManager;
  }

  toString(): string {
    return `Credit manager ${getContractName(
      this.creditManager,
    )} updated: Credit Facade ${this.prevCreditFacade} => ${
      this.newCreditFacade
    }`;
  }
}

// ICreditManagerV2

export interface NewConfiguratorEventProps extends EVMEventProps {
  newConfigurator: string;
  prevConfigurator: string;

  creditManager: string;
}

export class EventNewConfigurator extends EVMEvent {
  public readonly newConfigurator: string;
  public readonly prevConfigurator: string;

  public readonly creditManager: string;

  constructor(opts: NewConfiguratorEventProps) {
    super(opts);
    this.newConfigurator = opts.newConfigurator;
    this.prevConfigurator = opts.prevConfigurator;

    this.creditManager = opts.creditManager;
  }

  toString(): string {
    return `Credit manager ${getContractName(
      this.creditManager,
    )} updated: Credit Configurator ${this.prevConfigurator} => ${
      this.newConfigurator
    }`;
  }
}

export interface LTUpdatedEventProps extends EVMEventProps {
  lt: number;
  prevLt: number;

  creditManager: string;
}

export class EventLTUpdated extends EVMEvent {
  public readonly creditManager: string;
  public readonly lt: number;
  public readonly prevLt: number;

  constructor(opts: LTUpdatedEventProps) {
    super(opts);
    this.creditManager = opts.creditManager;
    this.lt = opts.lt;
    this.prevLt = opts.prevLt;
  }

  toString(): string {
    return `Credit manager ${getContractName(
      this.creditManager,
    )} updated: liquidation fee: ${this.prevLt / PERCENTAGE_DECIMALS}% => ${
      this.lt / PERCENTAGE_DECIMALS
    }%`;
  }
}

export interface IncreaseDebtForbiddenModeChangedEventProps
  extends EVMEventProps {
  forbidden: boolean;

  creditManager: string;
}

export class EventIncreaseDebtForbiddenModeChanged extends EVMEvent {
  public readonly forbidden: boolean;

  public readonly creditManager: string;

  constructor(opts: IncreaseDebtForbiddenModeChangedEventProps) {
    super(opts);
    this.forbidden = opts.forbidden;

    this.creditManager = opts.creditManager;
  }

  toString(): string {
    return `Credit manager ${getContractName(
      this.creditManager,
    )} updated: Increase Debt ${this.forbidden ? "forbidden" : "allowed"}`;
  }
}

export interface ExpirationDateUpdatedEventProps extends EVMEventProps {
  date: number;
  prevDate: number;

  creditManager: string;
}

export class EventExpirationDateUpdated extends EVMEvent {
  public readonly date: number;
  public readonly prevDate: number;

  public readonly creditManager: string;

  constructor(opts: ExpirationDateUpdatedEventProps) {
    super(opts);
    this.date = opts.date;
    this.prevDate = opts.prevDate;

    this.creditManager = opts.creditManager;
  }

  toString(): string {
    return `Credit manager ${getContractName(
      this.creditManager,
    )}: Expiration Date Updated ${formatDateTime(
      this.prevDate,
    )} => ${formatDateTime(this.date)}`;
  }
}

export interface MaxEnabledTokensUpdatedEventProps extends EVMEventProps {
  tokensEnabled: number;
  prevTokensEnabled: number;

  creditManager: string;
}

export class EventMaxEnabledTokensUpdated extends EVMEvent {
  public readonly tokensEnabled: number;
  public readonly prevTokensEnabled: number;

  public readonly creditManager: string;

  constructor(opts: MaxEnabledTokensUpdatedEventProps) {
    super(opts);
    this.tokensEnabled = opts.tokensEnabled;
    this.prevTokensEnabled = opts.prevTokensEnabled;

    this.creditManager = opts.creditManager;
  }

  toString(): string {
    return `Credit manager ${getContractName(
      this.creditManager,
    )}: Enabled Tokens Updated ${this.tokensEnabled} => ${
      this.prevTokensEnabled
    }`;
  }
}

export interface LimitPerBlockUpdatedEventProps extends EVMEventProps {
  limit: string;
  prevLimit: string;

  token: string;
  creditManager: string;
}

export class EventLimitPerBlockUpdated extends EVMEvent {
  public readonly limit: BigNumber;
  public readonly prevLimit: BigNumber;

  public readonly token: string;
  public readonly creditManager: string;

  constructor(opts: LimitPerBlockUpdatedEventProps) {
    super(opts);
    this.limit = BigNumber.from(opts.limit);
    this.prevLimit = BigNumber.from(opts.prevLimit);

    this.token = opts.token;
    this.creditManager = opts.creditManager;
  }

  toString(): string {
    const [symbol, decimals = 18] = extractTokenData(this.token);

    return `Credit manager ${getContractName(
      this.creditManager,
    )}: Limit Per Block Updated ${formatBN(
      this.prevLimit,
      decimals,
    )} => ${formatBN(this.limit, decimals)} ${symbol}`;
  }
}

export interface AddedToUpgradeableEventProps extends EVMEventProps {
  added: string;

  creditManager: string;
}

export class EventAddedToUpgradeable extends EVMEvent {
  public readonly added: string;

  public readonly creditManager: string;

  constructor(opts: AddedToUpgradeableEventProps) {
    super(opts);
    this.added = opts.added;

    this.creditManager = opts.creditManager;
  }

  toString(): string {
    return `Credit manager ${getContractName(
      this.creditManager,
    )}: Added To Upgradeable ${this.added}`;
  }
}

export interface RemovedFromUpgradeableEventProps extends EVMEventProps {
  removed: string;

  creditManager: string;
}

export class EventRemovedFromUpgradeable extends EVMEvent {
  public readonly removed: string;

  public readonly creditManager: string;

  constructor(opts: RemovedFromUpgradeableEventProps) {
    super(opts);
    this.removed = opts.removed;

    this.creditManager = opts.creditManager;
  }

  toString(): string {
    return `Credit manager ${getContractName(
      this.creditManager,
    )}: Removed From Upgradeable ${this.removed}`;
  }
}

export interface EmergencyLiquidatorAddedEventProps extends EVMEventProps {
  added: string;

  creditManager: string;
}

export class EventEmergencyLiquidatorAdded extends EVMEvent {
  public readonly added: string;

  public readonly creditManager: string;

  constructor(opts: EmergencyLiquidatorAddedEventProps) {
    super(opts);
    this.added = opts.added;

    this.creditManager = opts.creditManager;
  }

  toString(): string {
    return `Credit manager ${getContractName(
      this.creditManager,
    )}: Emergency Liquidator Added ${this.added}`;
  }
}

export interface EmergencyLiquidatorRemovedEventProps extends EVMEventProps {
  removed: string;

  creditManager: string;
}

export class EventEmergencyLiquidatorRemoved extends EVMEvent {
  public readonly removed: string;

  public readonly creditManager: string;

  constructor(opts: EmergencyLiquidatorRemovedEventProps) {
    super(opts);
    this.removed = opts.removed;

    this.creditManager = opts.creditManager;
  }

  toString(): string {
    return `Credit manager ${getContractName(
      this.creditManager,
    )}: Emergency Liquidator Removed ${this.removed}`;
  }
}
