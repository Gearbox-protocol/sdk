import type { Address } from "viem";
import { BytecodeRepositoryContract } from "../../bindings/bytecode-repository.js";
import { BYTECODE_REPOSITORY } from "../../utils/literals.js";
import {
  contractReaderFromClient,
  type RwaPeripheryLookups,
} from "../rwaPeripherySetup.js";
import type { GipSdkRuntime } from "./GipSdkRuntime.js";
import { SharedPromise } from "./SharedPromise.js";

/**
 * The chain reads RWA periphery planning needs, at the session's source block:
 * the configurator's registered periphery, the zapper's CREATE2 address in the
 * Bytecode Repository and whether it already holds code.
 **/
export function rwaPeripheryLookups(
  runtime: GipSdkRuntime,
): RwaPeripheryLookups {
  const client = runtime.readClient;
  const mc = runtime.marketConfigurator;
  const repository = new SharedPromise<BytecodeRepositoryContract>();
  const bytecodeRepository = () =>
    repository.run(async () => {
      const addressProvider = await mc.getAddressProvider();
      return new BytecodeRepositoryContract(
        await addressProvider.getAddressOrRevert(BYTECODE_REPOSITORY),
        client,
      );
    });

  return {
    read: contractReaderFromClient(client),
    // @dev governance executes every payload call through
    // `MarketConfigurator.admin()` (the TimeLock), so the TimeLock is the
    // Bytecode Repository's `msg.sender`.
    getDeployer: () => runtime.timelockAdmin(),
    computeZapperAddress: async params =>
      (await bytecodeRepository()).computeAddress({
        contractType: params.contractType,
        version: params.version,
        encodedParams: params.encodedParams,
        salt: params.salt,
        owner: params.owner,
      }),
    isDeployed: async address => {
      const code = await client.getCode({ address });
      return !!code && code !== "0x";
    },
    getRegistered: async () => {
      const byDomain = await mc.getPeripheryContracts();
      return Object.entries(byDomain).flatMap(([domain, addresses]) =>
        (addresses as Address[]).map(address => ({ address, domain })),
      );
    },
  };
}
