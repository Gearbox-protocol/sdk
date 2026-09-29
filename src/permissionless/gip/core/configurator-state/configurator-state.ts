// External libraries
import {
  type Address,
  type Chain,
  decodeFunctionData,
  type PublicClient,
  type Transport,
} from "viem";
// Gearbox SDK
import {
  GovernorContract,
  MarketConfiguratorContract,
  TimeLockContract,
  TreasurySplitterContract,
} from "../../../index.js";
// Local imports
import type {
  ConfiguratorState,
  GovernorState,
  Split,
  TreasurySplitterState,
  TwoAdminProposal,
} from "./types.js";

const PERCENTAGE_SCALE = 100;

async function getGovernorState(
  timelockAddress: Address,
  client: PublicClient<Transport, Chain>,
): Promise<GovernorState> {
  const timelock = new TimeLockContract(timelockAddress, client);
  const admin = await timelock.admin();
  const governor = new GovernorContract(admin, client);

  const results = await client.multicall({
    contracts: [
      {
        address: governor.address,
        abi: governor.abi,
        functionName: "queueAdmins",
        args: [],
      },
      {
        address: governor.address,
        abi: governor.abi,
        functionName: "executionAdmins",
        args: [],
      },
      {
        address: governor.address,
        abi: governor.abi,
        functionName: "vetoAdmin",
        args: [],
      },
    ],
    allowFailure: false,
  });

  return {
    address: governor.address.toLowerCase() as Address,
    queueAdmins: results[0].map(r => r.toLowerCase() as Address),
    executionAdmins: results[1].map(r => r.toLowerCase() as Address),
    vetoAdmin: results[2].toLowerCase() as Address,
  };
}

async function getTreasurySplitterState(
  treasurySplitterAddress: Address,
  client: PublicClient<Transport, Chain>,
): Promise<TreasurySplitterState> {
  const treasurySplitter = new TreasurySplitterContract(
    treasurySplitterAddress,
    client,
  );
  const data = await client.multicall({
    contracts: [
      {
        address: treasurySplitter.address,
        abi: treasurySplitter.abi,
        functionName: "defaultSplit",
        args: [],
      },
      {
        address: treasurySplitter.address,
        abi: treasurySplitter.abi,
        functionName: "activeProposals",
        args: [],
      },
    ],
    allowFailure: false,
  });

  const defaultSplit: Split = {
    recievers: data[0].receivers.map(r => r.toLowerCase() as Address),
    proportions: data[0].proportions.map(r => Number(r) / PERCENTAGE_SCALE),
  };

  const activeProposals: TwoAdminProposal[] = data[1]
    .map(p => {
      const data = decodeFunctionData({
        abi: treasurySplitter.abi,
        data: p.callData,
      });

      if (data.functionName !== "setDefaultSplit") {
        return null;
      }

      return {
        data: {
          functionName: data.functionName,
          recievers: data.args[0] as Address[],
          proportions: data.args[1].map(p => Number(p) / PERCENTAGE_SCALE),
        },
        callData: p.callData,
        conirmedByTreasuryProxy: p.confirmedByTreasuryProxy,
        confirmedByAdmin: p.confirmedByAdmin,
      };
    })
    .filter(p => p !== null);

  return {
    address: treasurySplitterAddress.toLowerCase() as Address,
    defaultSplit,
    activeProposals,
  };
}

/**
 * Fetches the complete configurator state for a given market configurator
 *
 * Note: This primarily pulls from on-chain data. The database stores the same
 * information synced from events, which should match this state.
 */
export async function getConfiguratorState(
  client: PublicClient<Transport, Chain>,
  marketConfiguratorAddress: Address,
): Promise<ConfiguratorState> {
  const mc = new MarketConfiguratorContract(marketConfiguratorAddress, client);

  const version = 310; // TODO: get version from contract
  const {
    admin,
    emergencyAdmin,
    treasury,
    pausableAdmins,
    unpausableAdmins,
    lossLiquidators,
    emergencyLiquidators,
  } = await mc.admins();

  return {
    address: marketConfiguratorAddress.toLowerCase() as Address,
    version,
    admin: admin.toLowerCase() as Address,
    emergencyAdmin: emergencyAdmin.toLowerCase() as Address,
    pausableAdmins,
    unpausableAdmins,
    lossLiquidators,
    emergencyLiquidators,
    governor: await getGovernorState(admin, client),
    treasury: await getTreasurySplitterState(treasury, client),
    shutdown: false, // To be determined from contract state or database
  };
}

/**
 * Normalizes all addresses in a ConfiguratorState object for consistent comparison
 */
export function normalizeConfiguratorState(
  state: ConfiguratorState,
): ConfiguratorState {
  return {
    ...state,
    address: state.address.toLowerCase() as Address,
    admin: state.admin.toLowerCase() as Address,
    emergencyAdmin: state.emergencyAdmin.toLowerCase() as Address,
    pausableAdmins: state.pausableAdmins.map(a => a.toLowerCase() as Address),
    unpausableAdmins: state.unpausableAdmins.map(
      a => a.toLowerCase() as Address,
    ),
    treasury: normalizeTreasurySplitterState(state.treasury),
  };
}

export function normalizeTreasurySplitterState(
  state: TreasurySplitterState,
): TreasurySplitterState {
  return {
    ...state,
    address: state.address.toLowerCase() as Address,
  };
}
