import { type Address, erc20Abi } from "viem";
import { BytecodeRepositoryContract } from "../../bindings/bytecode-repository.js";
import { BYTECODE_REPOSITORY } from "../../utils/literals.js";
import type { GipMarketAction } from "../actions/types.js";
import type { PeripheryRegistryEntry } from "../actions/utils/isPeripheryContractAdded.js";
import {
  type GipDiagnostic,
  getGipDiagnostics,
} from "../diagnostics/getGipDiagnostics.js";
import {
  contractReaderFromClient,
  findIncompleteRwaPeripherySetups,
} from "../rwaPeripherySetup.js";
import { errorMessage } from "../utils/errorMessage.js";
import type { GipSdkRuntime } from "./GipSdkRuntime.js";
import type { IncompleteCheck } from "./types.js";

/** A market as the diagnostic checks see it. **/
export interface DiagnosticMarketInput {
  address: Address;
  underlyingAsset: Address;
  transactions: GipMarketAction[];
}

/**
 * Runs the full `getGipDiagnostics` check set against the source block.
 *
 * Every read it needs is wired here instead of being skipped. When one of them
 * fails, the failing check is named in {@link IncompleteCheck}s rather than
 * silently dropped, so a caller can tell "no diagnostics" from "not checked".
 **/
export async function collectGipDiagnostics(args: {
  runtime: GipSdkRuntime;
  markets: DiagnosticMarketInput[];
}): Promise<{
  diagnostics: GipDiagnostic<DiagnosticMarketInput>[];
  incompleteChecks: IncompleteCheck[];
}> {
  const { runtime, markets } = args;
  const incompleteChecks: IncompleteCheck[] = [];
  if (markets.length === 0) return { diagnostics: [], incompleteChecks };

  const client = runtime.readClient;
  const mc = runtime.marketConfigurator;

  const fail = (check: string, error: unknown): never => {
    incompleteChecks.push({ check, reason: errorMessage(error) });
    throw error;
  };

  const getRegistered = async (): Promise<PeripheryRegistryEntry[]> => {
    try {
      const byDomain = await mc.getPeripheryContracts();
      return Object.entries(byDomain).flatMap(([domain, addresses]) =>
        (addresses as Address[]).map(address => ({ address, domain })),
      );
    } catch (error) {
      return fail("registeredPeripheryContracts", error);
    }
  };

  const bytecodeRepository = async (): Promise<BytecodeRepositoryContract> => {
    const addressProvider = await mc.getAddressProvider();
    return new BytecodeRepositoryContract(
      await addressProvider.getAddressOrRevert(BYTECODE_REPOSITORY),
      client,
    );
  };

  try {
    const diagnostics = await getGipDiagnostics<DiagnosticMarketInput>({
      markets,
      balanceOf: async asset => {
        try {
          return await client.readContract({
            address: asset,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [runtime.source.marketConfigurator],
          });
        } catch (error) {
          return fail("poolCreationDeposit", error);
        }
      },
      registeredPeripheryContracts: getRegistered,
      registry: runtime.registry,
      incompleteRwaSetups: async () => {
        try {
          return await findIncompleteRwaPeripherySetups<DiagnosticMarketInput>({
            markets,
            read: contractReaderFromClient(client),
            // @dev governance executes every payload call through
            // `MarketConfigurator.admin()` (the TimeLock), so the TimeLock is
            // the Bytecode Repository's `msg.sender`.
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
            getRegistered,
          });
        } catch (error) {
          return fail("incompleteRwaPeripherySetup", error);
        }
      },
    });
    return { diagnostics, incompleteChecks };
  } catch (error) {
    if (incompleteChecks.length === 0) {
      incompleteChecks.push({
        check: "getGipDiagnostics",
        reason: errorMessage(error),
      });
    }
    return { diagnostics: [], incompleteChecks };
  }
}
