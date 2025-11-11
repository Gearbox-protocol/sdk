import {
  type Address,
  type DecodeFunctionDataReturnType,
  type Hex,
  hexToString,
  type PublicClient,
  stringToHex,
} from "viem";
import { instanceManagerAbi } from "../../abi/310/instanceManager.js";
import { camelotV3WorkerAbi } from "../../abi/router/camelotV3Worker.js";
import { erc4626WorkerAbi } from "../../abi/router/erc4626Worker.js";
import { gearboxRouterAbi } from "../../abi/router/gearboxRouter.js";
import { mellow4626WorkerAbi } from "../../abi/router/mellow4626Worker.js";
import { pendleRouterWorkerAbi } from "../../abi/router/pendleRouterWorker.js";
import { uniswapV3WorkerAbi } from "../../abi/router/uniswapV3Worker.js";
import type { RawTx } from "../../sdk/types/index.js";
import { json_stringify } from "../../sdk/utils/index.js";
import type { ParsedCall } from "../core/proposal.js";
import { Addresses } from "../deployment/addresses.js";
import { BaseContract } from "./base-contract.js";
import { WithdrawalCompressorContract } from "./compressors/index.js";
import { PriceFeedStoreContract } from "./price-feed-store.js";
import { RoutingManagerContract } from "./router/index.js";
import { TreasurySplitterContract } from "./treasury-splitter.js";

const abi = instanceManagerAbi;

export class InstanceManagerContract extends BaseContract<typeof abi> {
  constructor(address: Address, client: PublicClient) {
    super(abi, address, client, "InstanceManager");
  }

  // TODO:
  decodeFunctionData(target: Address, calldata: Hex): ParsedCall | undefined {
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
            gearboxRouterAbi,
            target,
            this.client,
            "GearboxRouter",
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
            camelotV3WorkerAbi,
            target,
            this.client,
            "CamelotV3Worker",
          );
          parsedData = camelotV3Worker.parseFunctionData(calldata);

          if (!parsedData.functionName.startsWith("Unknown function")) {
            return parsedData;
          }

          const erc4626Worker = new BaseContract(
            erc4626WorkerAbi,
            target,
            this.client,
            "ERC4626Worker",
          );
          parsedData = erc4626Worker.parseFunctionData(calldata);

          if (!parsedData.functionName.startsWith("Unknown function")) {
            return parsedData;
          }

          const mellow4626Worker = new BaseContract(
            mellow4626WorkerAbi,
            target,
            this.client,
            "Mellow4626Worker",
          );
          parsedData = mellow4626Worker.parseFunctionData(calldata);

          if (!parsedData.functionName.startsWith("Unknown function")) {
            return parsedData;
          }

          const pendleRouterWorker = new BaseContract(
            pendleRouterWorkerAbi,
            target,
            this.client,
            "PendleRouterWorker",
          );
          parsedData = pendleRouterWorker.parseFunctionData(calldata);

          if (!parsedData.functionName.startsWith("Unknown function")) {
            return parsedData;
          }

          const uniswapV3Worker = new BaseContract(
            uniswapV3WorkerAbi,
            target,
            this.client,
            "UniswapV3Worker",
          );
          parsedData = uniswapV3Worker.parseFunctionData(calldata);

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

  // TODO:
  parseFunctionParams(
    params: DecodeFunctionDataReturnType<typeof abi>,
  ): ParsedCall | undefined {
    switch (params.functionName) {
      case "configureGlobal": {
        const [target, data] = params.args;
        const nestedCall = BaseContract.parse(target, data);
        return {
          ...nestedCall,
          label: `${nestedCall.label} via instanceManager`,
          target: this.address,
        };
      }
      case "configureLocal": {
        const [target, data] = params.args;

        const decoded = this.decodeFunctionData(target, data);

        return {
          chainId: 0,
          target: this.address,
          label: this.name,
          functionName: params.functionName,
          args: decoded
            ? {
                target,
                functionName: decoded.functionName,
                data: json_stringify(decoded.args),
              }
            : {
                target,
                data,
              },
        };
      }
      case "configureTreasury": {
        const [target, data] = params.args;

        let decoded: ParsedCall | undefined;
        try {
          const treasurySplitter = new TreasurySplitterContract(
            target,
            this.client,
          );
          decoded = treasurySplitter.parseFunctionData(data);
        } catch {
          // If decoding fails, use default decoding
          decoded = undefined;
        }

        return {
          chainId: 0,
          target: this.address,
          label: this.name,
          functionName: params.functionName,
          args: decoded
            ? {
                target,
                functionName: decoded.functionName,
                data: json_stringify(decoded.args),
              }
            : {
                target,
                data,
              },
        };
      }
      case "activate": {
        const [instanceOwner, treasury, weth, gear] = params.args;
        return this.wrapParseCall(params, {
          instanceOwner,
          treasury,
          weth,
          gear,
        });
      }
      case "deploySystemContract": {
        const [contractType, version, saveVersion] = params.args;
        return this.wrapParseCall(params, {
          contractType: hexToString(contractType, { size: 32 }),
          version: version.toString(),
          saveVersion: saveVersion ? "true" : "false",
        });
      }
      case "setGlobalAddress": {
        const [key, address, saveVersion] = params.args;
        return this.wrapParseCall(params, {
          key,
          address,
          saveVersion: saveVersion ? "true" : "false",
        });
      }

      default:
        return undefined;
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
