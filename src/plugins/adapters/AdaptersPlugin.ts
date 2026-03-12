import type {
  BaseState,
  IBaseContract,
  IGearboxSDKPlugin,
} from "../../sdk/index.js";
import { BasePlugin } from "../../sdk/index.js";
import { AbstractAdapterContract } from "./contracts/AbstractAdapter.js";
import { createAdapter } from "./createAdapter.js";

export class AdaptersPlugin
  extends BasePlugin<{}>
  implements IGearboxSDKPlugin<{}>
{
  public readonly name = "Adapters";
  public readonly version = 1;
  public readonly loaded = true;

  public createContract(data: BaseState): IBaseContract | undefined {
    const adapter = createAdapter(this.sdk, data, false);
    if (this.sdk.strictContractTypes) {
      if (isAbstract(adapter)) {
        throw new Error(
          `Adapter type ${adapter.contractType} not supported for adapter at ${data.baseParams.addr}`,
        );
      }
      return adapter;
    } else {
      return isAbstract(adapter) ? undefined : adapter;
    }
  }

  public async load(_force?: boolean): Promise<{}> {
    return {};
  }

  public stateHuman(_?: boolean): {} {
    return {};
  }

  public get state(): {} {
    return {};
  }
}

/**
 * Check if the adapter is an abstract adapter contract, but not a subclass of AbstractAdapterContract
 * @param adapter
 * @returns
 */
function isAbstract(adapter: IBaseContract): boolean {
  return Object.getPrototypeOf(adapter) === AbstractAdapterContract.prototype;
}
