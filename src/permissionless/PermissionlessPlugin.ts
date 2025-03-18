import {
  AP_BYTECODE_REPOSITORY,
  type IGearboxSDKPlugin,
  NO_VERSION,
  SDKConstruct,
} from "../sdk/index.js";
import { BytecodeRepositoryContract } from "./BytecodeRepositoryContract.js";
import type { PermissionlessStateHuman } from "./types.js";

export class PermissionlessPlugin
  extends SDKConstruct
  implements IGearboxSDKPlugin
{
  #bytecodeRepository?: BytecodeRepositoryContract;

  public async attach(): Promise<void> {
    await this.#load();
  }

  public async syncState(): Promise<void> {
    await this.#load();
  }

  async #load(): Promise<void> {
    const bcrAddr = this.sdk.addressProvider.getAddress(
      AP_BYTECODE_REPOSITORY,
      NO_VERSION,
    );
    this.sdk.logger?.debug(`bytecode repository address: ${bcrAddr}`);
    this.#bytecodeRepository = new BytecodeRepositoryContract(
      this.sdk,
      bcrAddr,
    );
  }

  public get bytecodeRepository(): BytecodeRepositoryContract {
    if (!this.#bytecodeRepository) {
      throw new Error("bytecode repository not attached");
    }
    return this.#bytecodeRepository;
  }

  public stateHuman(raw?: boolean): PermissionlessStateHuman {
    return {
      bytecodeRepository: this.bytecodeRepository.stateHuman(raw),
    };
  }
}
