import {
  type Address,
  BaseError,
  type Chain,
  ContractFunctionRevertedError,
  type DecodeFunctionDataReturnType,
  encodeAbiParameters,
  type Hex,
  isAddressEqual,
  keccak256,
  type PublicClient,
  type Transport,
  toHex,
  zeroAddress,
} from "viem";
import { iKillSwitchProxyAbi } from "../../abi/310/iKillSwitchProxy.js";
import type { ParsedCallArgs, RawTx } from "../../onchain/index.js";
import { BaseContract, json_stringify } from "../../onchain/index.js";
import { KILL_SWITCH_PROXY } from "../utils/literals.js";
import type { BytecodeRepositoryContract } from "./bytecode-repository.js";
import { MarketConfiguratorContract } from "./market-configurator.js";

const abi = iKillSwitchProxyAbi;

/**
 * Minor version of kill switch proxy, the latest allowed patch of it is deployed
 */
export const KILL_SWITCH_PROXY_MINOR_VERSION = 310;

/**
 * Salt of kill switch proxy deployed together with market configurator,
 * makes each curator's market configurator get its own proxy
 */
export function killSwitchProxySalt(curatorName: string): Hex {
  return keccak256(toHex(curatorName));
}

/**
 * Thrown when bytecode repository has no allowed kill switch proxy bytecode,
 * so its address can't be computed and it can't be deployed
 */
export class KillSwitchProxyNotAllowedError extends BaseError {
  override name = "KillSwitchProxyNotAllowedError";

  public readonly bytecodeRepository: Address;

  constructor(bytecodeRepository: Address) {
    super(
      `${KILL_SWITCH_PROXY} v${KILL_SWITCH_PROXY_MINOR_VERSION} is not allowed in bytecode repository ${bytecodeRepository}.`,
      {
        metaMessages: [
          "Its bytecode must be uploaded, audited and allowed before it can be deployed.",
        ],
      },
    );
    this.bytecodeRepository = bytecodeRepository;
  }
}

export interface PreparedKillSwitchProxyDeployment {
  address: Address;
  version: number;
  encodedParams: Hex;
  salt: Hex;
  isAlreadyDeployed: boolean;
  /**
   * Whether already deployed proxy is killed, always false for not yet deployed one
   */
  isKilled: boolean;
  /**
   * Bytecode repository `deploy` transaction, must be sent by the deployer
   */
  tx: RawTx;
}

/**
 * Kill switch proxy forwards calls of its `caller` via `proxyCall` until `owner` kills it.
 * It is used as market configurator's emergency admin, so that emergency powers
 * can be revoked instantly without going through the timelock.
 */
export class KillSwitchProxyContract extends BaseContract<typeof abi> {
  constructor(addr: Address, client: PublicClient<Transport, Chain>) {
    super({ client }, { abi, addr, name: "KillSwitchProxy" });
  }

  /**
   * Encodes `constructor(address _owner, address _caller)` params
   * @throws if any address is zero or owner equals caller (constructor reverts in that case)
   */
  static encodeConstructorParams(args: {
    owner: Address;
    caller: Address;
  }): Hex {
    const { owner, caller } = args;
    if (
      isAddressEqual(owner, zeroAddress) ||
      isAddressEqual(caller, zeroAddress)
    ) {
      throw new Error(`${KILL_SWITCH_PROXY} owner and caller must be non-zero`);
    }
    if (isAddressEqual(owner, caller)) {
      throw new Error(
        `${KILL_SWITCH_PROXY} owner must differ from caller ${caller}, provide another kill switch owner`,
      );
    }
    const [constructorAbi] = abi;
    return encodeAbiParameters(constructorAbi.inputs, [owner, caller]);
  }

  /**
   * Returns whether some patch of kill switch proxy v3.10 is allowed in bytecode repository
   */
  static async isAvailable(bcr: BytecodeRepositoryContract): Promise<boolean> {
    try {
      await KillSwitchProxyContract.#getVersion(bcr);
      return true;
    } catch (e) {
      if (e instanceof KillSwitchProxyNotAllowedError) {
        return false;
      }
      throw e;
    }
  }

  /**
   * Computes address of kill switch proxy and prepares its deployment via bytecode repository
   * @param bcr - bytecode repository
   * @param args.deployer - address that will send deployment transaction, it is mixed into the salt
   * @param args.owner - address that can kill the proxy
   * @param args.caller - address that can call through the proxy
   * @param args.salt - deployment salt
   * @throws {KillSwitchProxyNotAllowedError} if kill switch proxy is not allowed in bytecode repository
   */
  static async prepareDeploy(
    bcr: BytecodeRepositoryContract,
    args: {
      deployer: Address;
      owner: Address;
      caller: Address;
      salt: Hex;
    },
  ): Promise<PreparedKillSwitchProxyDeployment> {
    const { deployer, owner, caller, salt } = args;
    const encodedParams = KillSwitchProxyContract.encodeConstructorParams({
      owner,
      caller,
    });
    // must be resolved before computing address: for not allowed bytecode,
    // bytecode repository silently computes address of empty init code
    const version = await KillSwitchProxyContract.#getVersion(bcr);

    const [isAlreadyDeployed, address] = await bcr.isAlreadyDeployedAddress({
      contractType: KILL_SWITCH_PROXY,
      version,
      encodedParams,
      salt,
      owner: deployer,
    });
    const isKilled = isAlreadyDeployed
      ? await new KillSwitchProxyContract(address, bcr.client).isKilled()
      : false;

    return {
      address,
      version,
      encodedParams,
      salt,
      isAlreadyDeployed,
      isKilled,
      tx: bcr.deployTx({
        contractType: KILL_SWITCH_PROXY,
        version: BigInt(version),
        encodedParams,
        salt,
      }),
    };
  }

  static async #getVersion(bcr: BytecodeRepositoryContract): Promise<number> {
    try {
      return await bcr.getLatestPatchVersion(
        KILL_SWITCH_PROXY,
        KILL_SWITCH_PROXY_MINOR_VERSION,
      );
    } catch (e) {
      const revert =
        e instanceof BaseError
          ? e.walk(err => err instanceof ContractFunctionRevertedError)
          : null;
      if (
        revert instanceof ContractFunctionRevertedError &&
        revert.data?.errorName === "VersionNotFoundException"
      ) {
        throw new KillSwitchProxyNotAllowedError(bcr.address);
      }
      throw e;
    }
  }

  async isKilled(): Promise<boolean> {
    return await this.contract.read.isKilled();
  }

  async state(): Promise<{
    caller: Address;
    owner: Address;
    isKilled: boolean;
  }> {
    const [caller, owner, isKilled] = await this.client.multicall({
      allowFailure: false,
      contracts: [
        { address: this.address, abi, functionName: "caller" },
        { address: this.address, abi, functionName: "owner" },
        { address: this.address, abi, functionName: "isKilled" },
      ],
      batchSize: 0,
    });
    return { caller, owner, isKilled };
  }

  /**
   * Wraps transaction into `proxyCall`, must be sent by proxy's caller
   */
  proxyCallTx(tx: RawTx): RawTx {
    return this.createRawTx({
      functionName: "proxyCall",
      args: [tx.to, tx.callData],
      description: tx.description
        ? `KillSwitchProxy.proxyCall(${tx.description})`
        : undefined,
    });
  }

  /**
   * Permanently disables `proxyCall`, must be sent by proxy's owner
   */
  killTx(): RawTx {
    return this.createRawTx({ functionName: "kill" });
  }

  protected override parseFunctionParams(
    params: DecodeFunctionDataReturnType<typeof abi>,
  ): ParsedCallArgs {
    const { functionName, args } = params;

    switch (functionName) {
      case "proxyCall": {
        const [target, data] = args;
        const decoded = new MarketConfiguratorContract(
          target,
          this.client,
        ).parseFunctionData(data);
        if (decoded.functionName.startsWith("Unknown function")) {
          return { target, data };
        }
        return {
          target,
          functionName: decoded.functionName,
          data: json_stringify(decoded.args),
        };
      }

      default:
        return super.parseFunctionParams(params);
    }
  }
}
