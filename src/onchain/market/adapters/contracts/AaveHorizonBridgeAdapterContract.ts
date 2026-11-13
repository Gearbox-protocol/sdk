import {
  type Address,
  decodeAbiParameters,
  decodeFunctionData,
  encodeFunctionData,
  type Hex,
  stringToHex,
} from "viem";
import { MissingSerializedParamsError } from "../../../base/index.js";
import type { OnchainSDK } from "../../../OnchainSDK.js";
import type { MultiCall } from "../../../types/index.js";
import { type AssetsMap, hexEq } from "../../../utils/index.js";
import { iAaveHorizonBridgeAbi } from "../abi/aave/index.js";
import { iAaveHorizonBridgeAdapterAbi } from "../abi/adapters/index.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iAaveHorizonBridgeAdapterAbi;
type abi = typeof abi;

const protocolAbi = iAaveHorizonBridgeAbi;
type protocolAbi = typeof protocolAbi;

const FINALIZER_BOT_TYPE = stringToHex("BOT::AAVE_HORIZON_FINALIZER", {
  size: 32,
});
const SECURITIZE_FINALIZER_BOT_TYPE = stringToHex(
  "BOT::AAVE_HORIZON_SECURITIZE",
  { size: 32 },
);

/**
 * The bridge a finalizer bot serves, from its `serialize()`:
 * `abi.encode(pool, bridge)`. `undefined` where the bot did not serialize.
 */
function finalizerBridge(serializedParams: Hex): Address | undefined {
  if (serializedParams === "0x") {
    return undefined;
  }
  const [, bridge] = decodeAbiParameters(
    [
      { type: "address", name: "pool" },
      { type: "address", name: "bridge" },
    ],
    serializedParams,
  );
  return bridge;
}

export class AaveHorizonBridgeAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #bridge?: Address;
  #allowedATokens?: Address[];
  #allowedDebtTokens?: Address[];

  constructor(sdk: OnchainSDK, args: ConcreteAdapterContractOptions) {
    super(sdk, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "bridge" },
          { type: "address[]", name: "allowedATokens" },
          { type: "address[]", name: "allowedDebtTokens" },
        ],
        args.baseParams.serializedParams,
      );

      this.#bridge = decoded[2];
      this.#allowedATokens = [...decoded[3]];
      this.#allowedDebtTokens = [...decoded[4]];
    }
  }

  get bridge(): Address {
    if (!this.#bridge) throw new MissingSerializedParamsError("bridge");
    return this.#bridge;
  }

  get allowedATokens(): Address[] {
    if (!this.#allowedATokens)
      throw new MissingSerializedParamsError("allowedATokens");
    return this.#allowedATokens;
  }

  get allowedDebtTokens(): Address[] {
    if (!this.#allowedDebtTokens)
      throw new MissingSerializedParamsError("allowedDebtTokens");
    return this.#allowedDebtTokens;
  }

  public isATokenAllowed(token: Address): boolean {
    return includes(this.allowedATokens, token);
  }

  public isDebtTokenAllowed(token: Address): boolean {
    return includes(this.allowedDebtTokens, token);
  }

  /**
   * Facade call handing every `aToken` the account holds above
   * `leftoverAmount` to the account owner and borrowing `borrowAmount` of
   * `debtToken` on the owner's behalf into the account.
   */
  public openPositionDiffCall(
    aToken: Address,
    debtToken: Address,
    leftoverAmount: bigint,
    borrowAmount: bigint,
  ): MultiCall {
    return {
      target: this.address,
      callData: encodeFunctionData({
        abi,
        functionName: "openPositionDiff",
        args: [aToken, debtToken, leftoverAmount, borrowAmount],
      }),
    };
  }

  /**
   * Facade call repaying `repayAmount` of `debtToken` on the owner's Aave
   * position out of the account and bringing `aTokenAmount` of the owner's
   * `aToken` back into it. The bridge takes the whole `repayAmount` even where
   * Aave settles less, and keeps what it did not.
   */
  public closePositionCall(
    aToken: Address,
    debtToken: Address,
    repayAmount: bigint,
    aTokenAmount: bigint,
  ): MultiCall {
    return {
      target: this.address,
      callData: encodeFunctionData({
        abi,
        functionName: "closePosition",
        args: [aToken, debtToken, repayAmount, aTokenAmount],
      }),
    };
  }

  /**
   * What an opening call borrows on the owner's behalf: `debtToken` and
   * `borrowAmount`. `undefined` for a call that borrows nothing.
   */
  public parseBorrow(
    calldata: Hex,
  ): { debtToken: Address; amount: bigint } | undefined {
    const decoded = decodeFunctionData({ abi, data: calldata });
    switch (decoded.functionName) {
      case "openPosition":
      case "openPositionDiff":
        return { debtToken: decoded.args[1], amount: decoded.args[3] };
      default:
        return undefined;
    }
  }

  /**
   * Every account on this credit manager is finished by a Horizon finalizer
   * bot a block after its own transaction, so opening one grants the bot its
   * permissions. The bot is the one the market configurator lists among its
   * periphery contracts for this adapter's bridge, the latest version where
   * there are several; nothing where it lists none.
   *
   * An account opened through an RWA factory belongs to the factory's wallet,
   * which needs the Securitize finalizer and grants only the bots the factory
   * allows; nothing where it does not allow that bot.
   */
  public override async openingCalls(): Promise<MultiCall[]> {
    const { configurator } = this.sdk.marketRegister.findByCreditManager(
      this.creditManager,
    );
    const { creditFacade, rwaFactory } =
      this.sdk.marketRegister.findCreditManager(this.creditManager);
    const botType = rwaFactory
      ? SECURITIZE_FINALIZER_BOT_TYPE
      : FINALIZER_BOT_TYPE;
    const bots = await this.sdk.accounts.bots.getMarketBots(
      configurator.address,
    );
    const [bot] = bots
      .filter(
        ({ baseParams }) =>
          hexEq(baseParams.contractType, botType) &&
          hexEq(finalizerBridge(baseParams.serializedParams), this.bridge),
      )
      .sort((a, b) => Number(b.baseParams.version - a.baseParams.version));
    if (!bot) {
      return [];
    }
    if (rwaFactory && !(await rwaFactory.isAllowedBot(bot.baseParams.addr))) {
      return [];
    }
    return [
      creditFacade.prepareSetBotPermissions(
        bot.baseParams.addr,
        bot.requiredPermissions,
      ),
    ];
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      bridge: this.#bridge ? this.labelAddress(this.#bridge) : undefined,
      allowedATokens: this.#allowedATokens?.map(a => this.labelAddress(a)),
      allowedDebtTokens: this.#allowedDebtTokens?.map(a =>
        this.labelAddress(a),
      ),
    };
  }

  /**
   * Opening and closing a position are legal outside a bracket: the bridge
   * moves exactly the amounts the calldata names, or the balance above the
   * named leftover, so there is nothing for an on-chain comparison to enforce.
   *
   * Opening hands the aTokens to the account owner and brings `borrowAmount`
   * of the debt token in; closing sends `repayAmount` of the debt token out and
   * brings the aTokens back.
   */
  public override replayOutOfBracketCall(
    balances: AssetsMap,
    calldata: Hex,
  ): boolean {
    const decoded = decodeFunctionData({ abi, data: calldata });
    switch (decoded.functionName) {
      case "openPosition": {
        const [aToken, debtToken, aTokenAmount, borrowAmount] = decoded.args;
        balances.dec(aToken, aTokenAmount);
        balances.inc(debtToken, borrowAmount);
        return true;
      }
      case "openPositionDiff": {
        const [aToken, debtToken, leftoverAmount, borrowAmount] = decoded.args;
        const balance = balances.getOrZero(aToken);
        if (balance > leftoverAmount) {
          balances.dec(aToken, balance - leftoverAmount);
          balances.inc(debtToken, borrowAmount);
        }
        return true;
      }
      case "closePosition": {
        const [aToken, debtToken, repayAmount, aTokenAmount] = decoded.args;
        balances.dec(debtToken, repayAmount);
        balances.inc(aToken, aTokenAmount);
        return true;
      }
      default:
        return false;
    }
  }
}

const includes = (list: Address[], token: Address): boolean =>
  list.some(a => a.toLowerCase() === token.toLowerCase());
