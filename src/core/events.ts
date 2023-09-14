import {
  extractTokenData,
  LEVERAGE_DECIMALS,
  PERCENTAGE_DECIMALS,
  toBigInt,
} from "@gearbox-protocol/sdk-gov";

import { getContractName } from "../contracts/contractsRegister";
import { formatBN, formatDateTime } from "../utils/formatter";
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
    | "EventLTUpdated"
    | "EventDecreaseBorrowAmount";

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
      case "EventDecreaseBorrowAmount":
        return new EventDecreaseBorrowAmount(params);

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
  readonly amount: bigint;
  readonly underlyingToken: string;
  readonly pool: string;

  constructor(opts: EventAddLiquidityProps) {
    super(opts);
    this.amount = toBigInt(opts.amount || 0);
    this.underlyingToken = opts.underlyingToken;
    this.pool = opts.pool;
  }

  toString(): string {
    const [symbol, decimals = 18] = extractTokenData(this.underlyingToken);

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
  readonly amount: bigint;
  readonly underlyingToken: string;
  readonly dieselToken: string;
  readonly pool: string;

  constructor(opts: RemoveLiquidityProps) {
    super(opts);
    this.amount = toBigInt(opts.amount || 0);
    this.underlyingToken = opts.underlyingToken;
    this.dieselToken = opts.dieselToken;
    this.pool = opts.pool;
  }

  toString(): string {
    const [symbol, decimals = 18] = extractTokenData(this.dieselToken);

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
  creditManager: string;
}

export class EventOpenCreditAccount extends EVMEvent {
  readonly amount: bigint;
  readonly underlyingToken: string;
  readonly creditManager: string;

  constructor(opts: OpenCreditAccountProps) {
    super(opts);
    this.amount = toBigInt(opts.amount || 0);
    this.underlyingToken = opts.underlyingToken;
    this.creditManager = opts.creditManager;
  }

  toString(): string {
    const [symbol, decimals = 18] = extractTokenData(this.underlyingToken);

    return `Credit account ${getContractName(
      this.creditManager,
    )}: opened with debt ${formatBN(this.amount, decimals)} ${symbol}`;
  }
}

interface CloseCreditAccountProps extends EVMEventProps {
  underlyingToken: string;
  creditManager: string;
}

export class EventCloseCreditAccount extends EVMEvent {
  readonly underlyingToken: string;
  readonly creditManager: string;

  constructor(opts: CloseCreditAccountProps) {
    super(opts);
    this.underlyingToken = opts.underlyingToken;
    this.creditManager = opts.creditManager;
  }

  toString(): string {
    return `Credit account ${getContractName(this.creditManager)}: was closed`;
  }
}

interface LiquidateCreditAccountProps extends EVMEventProps {
  amount: string;
  underlyingToken: string;
  creditManager: string;
}

export class EventLiquidateCreditAccount extends EVMEvent {
  readonly amount: bigint;
  readonly underlyingToken: string;
  readonly creditManager: string;

  constructor(opts: LiquidateCreditAccountProps) {
    super(opts);
    this.amount = toBigInt(opts.amount || 0);
    this.underlyingToken = opts.underlyingToken;
    this.creditManager = opts.creditManager;
  }

  toString(): string {
    const [symbol, decimals = 18] = extractTokenData(this.underlyingToken);

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
  readonly underlyingToken: string;
  readonly creditManager: string;

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
  readonly amount: bigint;
  readonly addedToken: string;
  readonly creditManager: string;

  constructor(opts: AddCollateralProps) {
    super(opts);
    this.amount = toBigInt(opts.amount || 0);

    this.addedToken = opts.addedToken;
    this.creditManager = opts.creditManager;
  }

  toString(): string {
    const [symbol, decimals = 18] = extractTokenData(this.addedToken);

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
  readonly amount: bigint;
  readonly underlyingToken: string;
  readonly creditManager: string;

  constructor(opts: IncreaseBorrowAmountProps) {
    super(opts);
    this.amount = toBigInt(opts.amount || 0);
    this.underlyingToken = opts.underlyingToken;
    this.creditManager = opts.creditManager;
  }

  toString(): string {
    const [symbol, decimals = 18] = extractTokenData(this.underlyingToken);

    return `Credit account ${getContractName(
      this.creditManager,
    )}: borrowed amount was increased for ${formatBN(
      this.amount,
      decimals,
    )} ${symbol}`;
  }
}

interface DecreaseBorrowAmountProps extends EVMEventProps {
  amount: string;
  underlyingToken: string;
  creditManager: string;
}

export class EventDecreaseBorrowAmount extends EVMEvent {
  readonly amount: bigint;
  readonly underlyingToken: string;
  readonly creditManager: string;

  constructor(opts: DecreaseBorrowAmountProps) {
    super(opts);
    this.amount = toBigInt(opts.amount || 0);
    this.underlyingToken = opts.underlyingToken;
    this.creditManager = opts.creditManager;
  }

  toString(): string {
    const [symbol, decimals = 18] = extractTokenData(this.underlyingToken);

    return `Credit account ${getContractName(
      this.creditManager,
    )}: borrowed amount was decreased for ${formatBN(
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
  readonly creditManager: string;
  readonly underlyingToken: string;
  readonly minAmount: bigint;
  readonly maxAmount: bigint;
  readonly maxLeverage: number;
  readonly feeInterest: number;
  readonly feeLiquidation: number;
  readonly liquidationDiscount: number;
  readonly prevMinAmount: bigint;
  readonly prevMaxAmount: bigint;
  readonly prevMaxLeverage: number;
  readonly prevFeeInterest: number;
  readonly prevFeeLiquidation: number;
  readonly prevLiquidationDiscount: number;

  constructor(opts: CMNewParametersProps) {
    super(opts);
    this.creditManager = opts.creditManager;
    this.underlyingToken = opts.underlyingToken;
    this.minAmount = toBigInt(opts.minAmount || 0);
    this.maxAmount = toBigInt(opts.maxAmount || 0);
    this.maxLeverage = opts.maxLeverage;
    this.feeInterest = opts.feeInterest;
    this.feeLiquidation = opts.feeLiquidation;
    this.liquidationDiscount = opts.liquidationDiscount;

    this.prevMinAmount = toBigInt(opts.prevMinAmount || 0);
    this.prevMaxAmount = toBigInt(opts.prevMaxAmount || 0);
    this.prevMaxLeverage = opts.prevMaxLeverage;
    this.prevFeeInterest = opts.prevFeeInterest;
    this.prevFeeLiquidation = opts.prevFeeLiquidation;
    this.prevLiquidationDiscount = opts.prevLiquidationDiscount;
  }

  toString(): string {
    const [symbol, decimals = 18] = extractTokenData(this.underlyingToken);

    let msg = `Credit manager ${getContractName(this.creditManager)} updated: `;

    if (this.minAmount !== this.prevMinAmount) {
      msg += `min amount: ${formatBN(
        this.prevMinAmount,
        decimals,
      )} => ${formatBN(this.minAmount, decimals)} ${symbol}, `;
    }

    if (this.maxAmount !== this.prevMaxAmount) {
      msg += `max amount: ${formatBN(
        this.prevMaxAmount,
        decimals,
      )} => ${formatBN(this.maxAmount, decimals)} ${symbol}, `;
    }

    if (this.maxLeverage !== this.prevMaxLeverage) {
      msg += `max leverage: ${
        this.prevMaxLeverage / Number(LEVERAGE_DECIMALS) + 1
      } => ${this.maxLeverage / Number(LEVERAGE_DECIMALS) + 1}, `;
    }

    if (this.feeInterest !== this.prevFeeInterest) {
      msg += `interest fee: ${
        this.prevFeeInterest / Number(PERCENTAGE_DECIMALS)
      }% => ${this.feeInterest / Number(PERCENTAGE_DECIMALS)}%, `;
    }

    if (this.feeLiquidation !== this.prevFeeLiquidation) {
      msg += `liquidation fee: ${
        this.prevFeeLiquidation / Number(PERCENTAGE_DECIMALS)
      }% => ${this.feeLiquidation / Number(PERCENTAGE_DECIMALS)}%, `;
    }

    if (this.liquidationDiscount !== this.prevLiquidationDiscount) {
      msg += `liquidation premium: ${
        Number(PERCENTAGE_DECIMALS) -
        this.prevLiquidationDiscount / Number(PERCENTAGE_DECIMALS)
      }% => ${
        Number(PERCENTAGE_DECIMALS) -
        this.liquidationDiscount / Number(PERCENTAGE_DECIMALS)
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
  readonly creditManager: string;
  readonly token: string;
  readonly liquidityThreshold: number;
  readonly prevLiquidationThreshold?: number;
  readonly status: TokenAllowanceType;

  constructor(opts: TokenAllowedProps) {
    super(opts);
    this.creditManager = opts.creditManager;
    this.token = opts.token;
    this.liquidityThreshold = opts.liquidityThreshold;
    this.prevLiquidationThreshold = opts.prevLiquidationThreshold;
    this.status = opts.status;
  }

  toString(): string {
    const [symbol] = extractTokenData(this.token);

    const msg = `Credit manager ${getContractName(
      this.creditManager,
    )} updated `;
    switch (this.status) {
      case "NewToken":
        return `${msg}: New token allowed: ${symbol}, liquidation threshold: ${
          this.liquidityThreshold / Number(PERCENTAGE_DECIMALS)
        }%`;
      case "Allowed":
        return `${msg}: ${symbol} is allowed now, liquidation threshold: ${
          this.liquidityThreshold / Number(PERCENTAGE_DECIMALS)
        }%`;
      case "LTUpdated":
        return `${msg}: ${symbol} liquidation threshold: ${
          (this.prevLiquidationThreshold || 0) / Number(PERCENTAGE_DECIMALS)
        } => ${this.liquidityThreshold / Number(PERCENTAGE_DECIMALS)}%`;
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
  readonly creditManager: string;
  readonly token: string;

  constructor(opts: TokenForbiddenProps) {
    super(opts);
    this.creditManager = opts.creditManager;
    this.token = opts.token;
  }

  toString(): string {
    const [symbol] = extractTokenData(this.token);
    return `Credit manager ${getContractName(
      this.creditManager,
    )} updated ${symbol} forbidden`;
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
  readonly creditManager: string;
  readonly protocol: string;
  readonly adapter: string;
  readonly status: EventContractAllowedStatus;

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
  readonly creditManager: string;
  readonly protocol: string;

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
  readonly creditManager: string;
  readonly chiThreshold: number;
  readonly fastCheckDelay: number;
  readonly prevChiThreshold?: number;
  readonly prevFastCheckDelay?: number;

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
  readonly creditManager: string;
  readonly priceOracle: string;

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
  readonly creditManager: string;
  readonly plugin: string;
  readonly state: boolean;

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
  readonly pool: string;
  readonly newInterestRateModel: string;

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
  readonly pool: string;
  readonly creditManager: string;

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
  readonly pool: string;
  readonly creditManager: string;

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
  readonly pool: string;
  readonly underlyingToken: string;
  readonly newLimit: bigint;
  readonly prevLimit: bigint;

  constructor(opts: NewExpectedLiquidityLimitProps) {
    super(opts);
    this.pool = opts.pool;
    this.underlyingToken = opts.underlyingToken;
    this.newLimit = toBigInt(opts.newLimit || 0);
    this.prevLimit = toBigInt(opts.oldLimit || 0);
  }

  toString(): string {
    const [symbol, decimals = 18] = extractTokenData(this.underlyingToken);

    return this.prevLimit === 0n
      ? `Pool ${getContractName(
          this.pool,
        )} updated: expected liquidity limit was set to ${formatBN(
          this.newLimit,
          decimals,
        )} ${symbol}`
      : `Pool ${getContractName(
          this.pool,
        )} updated: expected liquidity limit was ${
          this.newLimit > this.prevLimit ? "increased" : "decreased"
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
  readonly pool: string;
  readonly underlyingToken: string;
  readonly newFee: number;
  readonly prevFee: number;

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
          this.newFee / Number(PERCENTAGE_DECIMALS)
        }%`
      : `Pool ${getContractName(this.pool)} updated: withdraw fee was ${
          this.newFee > this.prevFee ? "increased" : "decreased"
        }: ${this.prevFee / Number(PERCENTAGE_DECIMALS)}% => ${
          this.newFee / Number(PERCENTAGE_DECIMALS)
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
  readonly token: string;
  readonly priceFeed: string;

  constructor(opts: NewPriceFeedProps) {
    super(opts);
    this.token = opts.token;
    this.priceFeed = opts.priceFeed;
  }

  toString(): string {
    const [symbol] = extractTokenData(this.token);

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
  readonly creditAccount: string;
  readonly to: string;

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
  readonly contract: string;

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
  readonly contract: string;

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
  readonly admin: string;

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
  readonly admin: string;

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
  readonly admin: string;

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
  readonly admin: string;

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
  readonly newOwner: string;

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
  readonly creditManager: string;
  readonly token: string;
  readonly liquidityThreshold: number;
  readonly prevLiquidationThreshold?: number;
  readonly status: TokenAllowanceType;

  constructor(opts: TokenAllowedV2Props) {
    super(opts);
    this.creditManager = opts.creditManager;
    this.token = opts.token;
    this.liquidityThreshold = opts.liquidityThreshold;
    this.prevLiquidationThreshold = opts.prevLiquidationThreshold;
    this.status = opts.status;
  }

  toString(): string {
    const [symbol] = extractTokenData(this.token);

    const msg = `Credit manager ${getContractName(
      this.creditManager,
    )} updated `;
    switch (this.status) {
      case "NewToken":
        return `${msg}: New token allowed: ${symbol}, liquidation threshold: ${
          this.liquidityThreshold / Number(PERCENTAGE_DECIMALS)
        }%`;
      case "Allowed":
        return `${msg}: ${symbol} is allowed now, liquidation threshold: ${
          this.liquidityThreshold / Number(PERCENTAGE_DECIMALS)
        }%`;
      case "LTUpdated":
        return `${msg}: ${symbol} liquidation threshold: ${
          (this.prevLiquidationThreshold || 0) / Number(PERCENTAGE_DECIMALS)
        } => ${this.liquidityThreshold / Number(PERCENTAGE_DECIMALS)}%`;
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
  readonly minBorrowedAmount: bigint;
  readonly maxBorrowedAmount: bigint;

  readonly prevMinBorrowedAmount: bigint;
  readonly prevMaxBorrowedAmount: bigint;

  readonly underlyingToken: string;
  readonly creditManager: string;

  constructor(opts: LimitsUpdatedEventProps) {
    super(opts);
    this.minBorrowedAmount = toBigInt(opts.minBorrowedAmount || 0);
    this.maxBorrowedAmount = toBigInt(opts.maxBorrowedAmount || 0);

    this.prevMinBorrowedAmount = toBigInt(opts.prevMinBorrowedAmount || 0);
    this.prevMaxBorrowedAmount = toBigInt(opts.prevMaxBorrowedAmount || 0);

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
  readonly feeInterest: number;
  readonly feeLiquidation: number;
  readonly liquidationPremium: number;
  readonly feeLiquidationExpired: number;
  readonly liquidationPremiumExpired: number;

  readonly prevFeeInterest: number;
  readonly prevFeeLiquidation: number;
  readonly prevLiquidationPremium: number;
  readonly prevFeeLiquidationExpired: number;
  readonly prevLiquidationPremiumExpired: number;

  readonly creditManager: string;

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
      msg += `interest fee: ${
        this.prevFeeInterest / Number(PERCENTAGE_DECIMALS)
      }% => ${this.feeInterest / Number(PERCENTAGE_DECIMALS)}%, `;
    }

    if (this.feeLiquidation !== this.prevFeeLiquidation) {
      msg += `liquidation fee: ${
        this.prevFeeLiquidation / Number(PERCENTAGE_DECIMALS)
      }% => ${this.feeLiquidation / Number(PERCENTAGE_DECIMALS)}%, `;
    }

    if (this.liquidationPremium !== this.prevLiquidationPremium) {
      msg += `liquidation premium: ${
        this.prevLiquidationPremium / Number(PERCENTAGE_DECIMALS)
      }% => ${this.liquidationPremium / Number(PERCENTAGE_DECIMALS)}%, `;
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
  readonly newCreditFacade: string;
  readonly prevCreditFacade: string;
  readonly creditManager: string;

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
  readonly newConfigurator: string;
  readonly prevConfigurator: string;

  readonly creditManager: string;

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
  readonly creditManager: string;
  readonly lt: number;
  readonly prevLt: number;

  constructor(opts: LTUpdatedEventProps) {
    super(opts);
    this.creditManager = opts.creditManager;
    this.lt = opts.lt;
    this.prevLt = opts.prevLt;
  }

  toString(): string {
    return `Credit manager ${getContractName(
      this.creditManager,
    )} updated: liquidation fee: ${
      this.prevLt / Number(PERCENTAGE_DECIMALS)
    }% => ${this.lt / Number(PERCENTAGE_DECIMALS)}%`;
  }
}

export interface IncreaseDebtForbiddenModeChangedEventProps
  extends EVMEventProps {
  forbidden: boolean;

  creditManager: string;
}

export class EventIncreaseDebtForbiddenModeChanged extends EVMEvent {
  readonly forbidden: boolean;
  readonly creditManager: string;

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
  readonly date: number;
  readonly prevDate: number;

  readonly creditManager: string;

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
  readonly tokensEnabled: number;
  readonly prevTokensEnabled: number;

  readonly creditManager: string;

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
  readonly limit: bigint;
  readonly prevLimit: bigint;

  readonly token: string;
  readonly creditManager: string;

  constructor(opts: LimitPerBlockUpdatedEventProps) {
    super(opts);
    this.limit = toBigInt(opts.limit || 0);
    this.prevLimit = toBigInt(opts.prevLimit || 0);

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
  readonly added: string;
  readonly creditManager: string;

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
  readonly removed: string;
  readonly creditManager: string;

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
  readonly added: string;
  readonly creditManager: string;

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
  readonly removed: string;
  readonly creditManager: string;

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
