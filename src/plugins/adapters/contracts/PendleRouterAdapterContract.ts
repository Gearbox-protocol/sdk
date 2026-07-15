import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
} from "viem";
import {
  type AssetsMap,
  MissingSerializedParamsError,
  type OnchainSDK,
} from "../../../sdk/index.js";
import { iPendleRouterAdapterAbi } from "../abi/adapters/index.js";
import { iPendleRouterAbi } from "../abi/targetContractAbi.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

export enum PendleTokenType {
  PT = 0,
  LP = 1,
}

export enum PendlePairStatus {
  NOT_ALLOWED = 0,
  ALLOWED = 1,
  EXIT_ONLY = 2,
}

const abi = iPendleRouterAdapterAbi;
type abi = typeof abi;

const protocolAbi = iPendleRouterAbi;
type protocolAbi = typeof protocolAbi;

export interface PendlePair {
  market: Address;
  inputToken: Address;
  pendleToken: Address;
  pendleTokenType?: PendleTokenType;
  status: PendlePairStatus;
}

export class PendleRouterAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #allowedPairs?: PendlePair[];

  constructor(sdk: OnchainSDK, args: ConcreteAdapterContractOptions) {
    super(sdk, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const version = Number(args.baseParams.version);
      if (version === 310) {
        const decoded = decodeAbiParameters(
          [
            { type: "address", name: "creditManager" },
            { type: "address", name: "targetContract" },
            {
              type: "tuple[]",
              name: "allowedPairs",
              components: [
                { type: "address", name: "market" },
                { type: "address", name: "inputToken" },
                { type: "address", name: "pendleToken" },
                { type: "uint8", name: "status" },
              ],
            },
          ],
          args.baseParams.serializedParams,
        );

        this.#allowedPairs = decoded[2].map(pair => ({
          market: pair.market,
          inputToken: pair.inputToken,
          pendleToken: pair.pendleToken,
          status: pair.status as PendlePairStatus,
        }));
      } else {
        const decoded = decodeAbiParameters(
          [
            { type: "address", name: "creditManager" },
            { type: "address", name: "targetContract" },
            {
              type: "tuple[]",
              name: "allowedPairs",
              components: [
                { type: "address", name: "market" },
                { type: "address", name: "inputToken" },
                { type: "address", name: "pendleToken" },
                { type: "uint8", name: "pendleTokenType" },
                { type: "uint8", name: "status" },
              ],
            },
          ],
          args.baseParams.serializedParams,
        );

        this.#allowedPairs = decoded[2].map(pair => ({
          market: pair.market,
          inputToken: pair.inputToken,
          pendleToken: pair.pendleToken,
          pendleTokenType: pair.pendleTokenType as PendleTokenType,
          status: pair.status as PendlePairStatus,
        }));
      }
    }
  }

  get allowedPairs(): PendlePair[] {
    if (!this.#allowedPairs)
      throw new MissingSerializedParamsError("allowedPairs");
    return this.#allowedPairs;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      allowedPairs: this.#allowedPairs?.map(p => ({
        market: this.labelAddress(p.market),
        inputToken: this.labelAddress(p.inputToken),
        pendleToken: this.labelAddress(p.pendleToken),
        pendleTokenType: p.pendleTokenType,
        status: p.status,
      })),
    };
  }

  protected override async applyBalanceChanges(
    balances: AssetsMap,
    decoded: DecodeFunctionDataReturnType<abi>,
  ): Promise<void> {
    switch (decoded.functionName) {
      case "swapDiffTokenForPt":
      case "addLiquiditySingleTokenDiff": {
        const [, , , diffInput] = decoded.args;
        this.setLeftover(
          balances,
          diffInput.tokenIn,
          diffInput.leftoverTokenIn,
        );
        break;
      }
      case "swapDiffPtForToken": {
        const [market, leftoverPt] = decoded.args;
        const pt = this.#mustFindPendleToken(market, PendleTokenType.PT);
        this.setLeftover(balances, pt, leftoverPt);
        break;
      }
      case "removeLiquiditySingleTokenDiff": {
        const [market, leftoverLp] = decoded.args;
        const lp = this.#mustFindPendleToken(market, PendleTokenType.LP);
        this.setLeftover(balances, lp, leftoverLp);
        break;
      }
      case "redeemDiffPyToToken": {
        // calldata only carries the YT address, and the YT→PT mapping is not
        // part of the serialized params; recover the PT as the unique PT-type
        // pair currently holding a balance
        const candidates = this.allowedPairs.filter(
          p =>
            (p.pendleTokenType === undefined ||
              p.pendleTokenType === PendleTokenType.PT) &&
            (balances.get(p.pendleToken) ?? 0n) > 1n,
        );
        const ptTokens = new Set(
          candidates.map(p => p.pendleToken.toLowerCase()),
        );
        if (ptTokens.size !== 1) {
          throw new Error(
            `cannot recover PT token for redeemDiffPyToToken on pendle adapter at ${this.address}: ${ptTokens.size} candidates`,
          );
        }
        const [, leftoverPt] = decoded.args;
        this.setLeftover(balances, candidates[0].pendleToken, leftoverPt);
        break;
      }
      default:
        await super.applyBalanceChanges(balances, decoded);
    }
  }

  #mustFindPendleToken(market: Address, type: PendleTokenType): Address {
    const marketLC = market.toLowerCase();
    const pair = this.allowedPairs.find(
      p =>
        p.market.toLowerCase() === marketLC &&
        (p.pendleTokenType === undefined || p.pendleTokenType === type),
    );
    if (!pair) {
      throw new Error(
        `pendle pair for market ${market} not found on adapter at ${this.address}`,
      );
    }
    return pair.pendleToken;
  }
}
