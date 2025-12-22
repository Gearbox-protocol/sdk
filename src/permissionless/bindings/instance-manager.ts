import {
  type Address,
  type Chain,
  type DecodeFunctionDataReturnType,
  decodeFunctionData,
  type Hex,
  hexToString,
  type PublicClient,
  stringToHex,
  type Transport,
} from "viem";
import { instanceManagerAbi } from "../../abi/310/instanceManager.js";
import { camelotV3WorkerAbi } from "../../abi/router/camelotV3Worker.js";
import { erc4626WorkerAbi } from "../../abi/router/erc4626Worker.js";
import { gearboxRouterAbi } from "../../abi/router/gearboxRouter.js";
import { mellow4626WorkerAbi } from "../../abi/router/mellow4626Worker.js";
import { pendleRouterWorkerAbi } from "../../abi/router/pendleRouterWorker.js";
import { uniswapV3WorkerAbi } from "../../abi/router/uniswapV3Worker.js";
import { uniswapV4WorkerAbi } from "../../abi/router/uniswapV4Worker.js";
import type { RawTx } from "../../sdk/index.js";
import {
  BaseContract,
  json_stringify,
  type ParsedCall,
  type ParsedCallArgs,
} from "../../sdk/index.js";
import { Addresses } from "../deployment/addresses.js";
import { WithdrawalCompressorContract } from "./compressors/index.js";
import { PriceFeedStoreContract } from "./price-feed-store.js";
import { RoutingManagerContract } from "./router/index.js";
import { TreasurySplitterContract } from "./treasury-splitter.js";

const abi = instanceManagerAbi;

export class InstanceManagerContract extends BaseContract<typeof abi> {
  constructor(addr: Address, client: PublicClient<Transport, Chain>) {
    super({ client }, { abi, addr, name: "InstanceManager" });
  }

  // TODO:
  #decodeFunctionData(target: Address, calldata: Hex): ParsedCall | undefined {
    switch (target.toLowerCase()) {
      case this.address.toLowerCase(): {
        return this.parseFunctionData(calldata);
      }
      case Addresses.PRICE_FEED_STORE.toLowerCase(): {
        const priceFeedStore = new PriceFeedStoreContract(target, this.client);
        return priceFeedStore.parseFunctionData(calldata);
      }
      default: {
        try {
          // ROUTER
          let parsedData: ParsedCall;
          const router = new BaseContract(
            { client: this.client },
            { abi: gearboxRouterAbi, addr: target, name: "GearboxRouter" },
          );
          parsedData = router.parseFunctionData(calldata);

          if (!parsedData.functionName.startsWith("Unknown function")) {
            return parsedData;
          }

          const routingManager = new RoutingManagerContract(
            target,
            this.client,
          );
          parsedData = routingManager.parseFunctionData(calldata);

          if (!parsedData.functionName.startsWith("Unknown function")) {
            return parsedData;
          }

          // WORKERS
          const camelotV3Worker = new BaseContract(
            { client: this.client },
            { abi: camelotV3WorkerAbi, addr: target, name: "CamelotV3Worker" },
          );
          parsedData = camelotV3Worker.parseFunctionData(calldata);

          if (!parsedData.functionName.startsWith("Unknown function")) {
            return parsedData;
          }

          const erc4626Worker = new BaseContract(
            { client: this.client },
            { abi: erc4626WorkerAbi, addr: target, name: "ERC4626Worker" },
          );
          parsedData = erc4626Worker.parseFunctionData(calldata);

          if (!parsedData.functionName.startsWith("Unknown function")) {
            return parsedData;
          }

          const mellow4626Worker = new BaseContract(
            { client: this.client },
            {
              abi: mellow4626WorkerAbi,
              addr: target,
              name: "Mellow4626Worker",
            },
          );
          parsedData = mellow4626Worker.parseFunctionData(calldata);

          if (!parsedData.functionName.startsWith("Unknown function")) {
            return parsedData;
          }

          const pendleRouterWorker = new BaseContract(
            { client: this.client },
            {
              abi: pendleRouterWorkerAbi,
              addr: target,
              name: "PendleRouterWorker",
            },
          );
          parsedData = pendleRouterWorker.parseFunctionData(calldata);

          if (!parsedData.functionName.startsWith("Unknown function")) {
            return parsedData;
          }

          const uniswapV3Worker = new BaseContract(
            { client: this.client },
            { abi: uniswapV3WorkerAbi, addr: target, name: "UniswapV3Worker" },
          );
          parsedData = uniswapV3Worker.parseFunctionData(calldata);

          if (!parsedData.functionName.startsWith("Unknown function")) {
            return parsedData;
          }

          const uniswapV4Worker = new BaseContract(
            { client: this.client },
            { abi: uniswapV4WorkerAbi, addr: target, name: "UniswapV4Worker" },
          );
          parsedData = uniswapV4Worker.parseFunctionData(calldata);

          if (!parsedData.functionName.startsWith("Unknown function")) {
            return parsedData;
          }

          // COMPRESSORS
          const withdrawalCompressor = new WithdrawalCompressorContract(
            target,
            this.client,
          );
          parsedData = withdrawalCompressor.parseFunctionData(calldata);

          if (!parsedData.functionName.startsWith("Unknown function")) {
            return parsedData;
          }
        } catch {
          return undefined;
        }
      }
    }
  }

  public override mustParseFunctionData(calldata: Hex): ParsedCall {
    const { functionName, args } = decodeFunctionData({
      abi: this.abi,
      data: calldata,
    });
    // Previously bindings contract returned entire ParsedCall in parseFunctionParams
    // So configureGlobal returned flat call with label e.g. "PriceFeedStore via instanceManager"
    // if we keep configureGlobal in parseFunctionParams, it'll return nedsted call
    // interface is unabled to display nested calls nicely, so we have to make exception in mustParseFunctionData
    if (functionName === "configureGlobal") {
      const [target, data] = args;
      const nestedCall = this.register.parseFunctionData(target, data);
      const result = this.wrapParseCall(
        nestedCall.functionName,
        nestedCall.args,
      );
      return {
        ...result,
        label: `${this.register.labelAddress(target, true)} via ${result.label}`,
      };
    }

    return super.mustParseFunctionData(calldata);
  }

  protected override parseFunctionParams(
    params: DecodeFunctionDataReturnType<typeof abi>,
  ): ParsedCallArgs {
    switch (params.functionName) {
      case "configureLocal": {
        const [target, data] = params.args;

        const decoded = this.#decodeFunctionData(target, data);

        return decoded
          ? {
              target,
              functionName: decoded.functionName,
              data: json_stringify(decoded.args),
            }
          : {
              target,
              data,
            };
      }
      case "configureTreasury": {
        const [target, data] = params.args;

        const treasurySplitter = new TreasurySplitterContract(
          target,
          this.client,
        );
        const decoded = treasurySplitter.mustParseFunctionData(data);

        return {
          target,
          functionName: decoded.functionName,
          data: json_stringify(decoded.args),
        };
      }
      case "deploySystemContract": {
        const [contractType, version, saveVersion] = params.args;
        return {
          contractType: hexToString(contractType, { size: 32 }),
          version: version.toString(),
          saveVersion: saveVersion ? "true" : "false",
        };
      }

      default:
        return super.parseFunctionParams(params);
    }
  }

  async isActivated(): Promise<boolean> {
    const result = await this.contract.read.isActivated();
    return result;
  }

  async getOwner(): Promise<Address> {
    const result = await this.contract.read.owner();
    return result;
  }

  wrapConfigureGlobal(rawTx: RawTx): RawTx {
    return this.createRawTx({
      functionName: "configureGlobal",
      args: [rawTx.to, rawTx.callData],
      description: rawTx.description
        ? `InstanceManager.configureGlobal(${rawTx.description})`
        : undefined,
    });
  }

  wrapConfigureLocal(rawTx: RawTx): RawTx {
    return this.createRawTx({
      functionName: "configureLocal",
      args: [rawTx.to, rawTx.callData],
      description: rawTx.description
        ? `InstanceManager.configureLocal(${rawTx.description})`
        : undefined,
    });
  }

  wrapConfigureTreasury(rawTx: RawTx): RawTx {
    return this.createRawTx({
      functionName: "configureTreasury",
      args: [rawTx.to, rawTx.callData],
      description: rawTx.description
        ? `InstanceManager.configureTreasury(${rawTx.description})`
        : undefined,
    });
  }

  setLocalAddress(args: {
    key: string;
    address: Address;
    saveVersion: boolean;
  }): RawTx {
    const { key, address, saveVersion } = args;
    return this.createRawTx({
      functionName: "setLocalAddress",
      args: [stringToHex(key, { size: 32 }), address, saveVersion],
      description: `InstanceManager.setLocalAddress(key: ${key}, addr: ${address}, saveVersion: ${saveVersion})`,
    });
  }

  setGlobalAddress(args: {
    key: string;
    address: Address;
    saveVersion: boolean;
  }): RawTx {
    const { key, address, saveVersion } = args;
    return this.createRawTx({
      functionName: "setGlobalAddress",
      args: [stringToHex(key, { size: 32 }), address, saveVersion],
      description: `InstanceManager.setGlobalAddress(key: ${key}, addr: ${address}, saveVersion: ${saveVersion})`,
    });
  }

  deploySystemContractTx(args: {
    name: string;
    version: bigint;
    saveVersion: boolean;
  }): RawTx {
    const { name, version, saveVersion } = args;
    return this.createRawTx({
      functionName: "deploySystemContract",
      args: [stringToHex(name, { size: 32 }), version, saveVersion],
      description: `InstanceManager.deploySystemContract(${name})`,
    });
  }

  activateTx(args: {
    instanceOwner: Address;
    treasury: Address;
    weth: Address;
    gear: Address;
  }): RawTx {
    const { instanceOwner, treasury, weth, gear } = args;
    return this.createRawTx({
      functionName: "activate",
      args: [instanceOwner, treasury, weth, gear],
      description: `InstanceManager.activate(instanceOwner: ${instanceOwner}, treasury: ${treasury}, weth: ${weth}, gear: ${gear})`,
    });
  }
}
