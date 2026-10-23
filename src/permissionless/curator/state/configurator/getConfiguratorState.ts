import {
  type Address,
  type Chain,
  decodeFunctionData,
  erc20Abi,
  formatUnits,
  type PublicClient,
  type Transport,
} from "viem";
import { ITreasurySplitterAbi } from "../../../../abi/310/iTreasurySplitter.js";
import { GovernorContract } from "../../../bindings/governance/governor.js";
import { TimeLockContract } from "../../../bindings/governance/timelock.js";
import { MarketConfiguratorContract } from "../../../bindings/market-configurator.js";
import { TreasurySplitterContract } from "../../../bindings/treasury-splitter.js";
import { lowerAddress, uniqueAddresses } from "../../utils/addressUtils.js";
import type {
  ConfiguratorState,
  GovernorState,
  Split,
  TreasurySplitterState,
  TreasuryTokenBalance,
  TwoAdminProposal,
} from "./types.js";

/** Treasury splitter proportions are percentages on chain scaled by this. **/
export const PERCENTAGE_SCALE = 100;

const toPercentages = (proportions: readonly (number | bigint)[]): number[] =>
  proportions.map(proportion => Number(proportion) / PERCENTAGE_SCALE);

async function getGovernorState(
  timelockAddress: Address,
  client: PublicClient<Transport, Chain>,
): Promise<GovernorState> {
  const timelock = new TimeLockContract(timelockAddress, client);
  const governor = new GovernorContract(await timelock.admin(), client);
  const call = {
    address: governor.address,
    abi: governor.abi,
    args: [],
  } as const;

  const [queueAdmins, executionAdmins, vetoAdmin] = await client.multicall({
    contracts: [
      { ...call, functionName: "queueAdmins" },
      { ...call, functionName: "executionAdmins" },
      { ...call, functionName: "vetoAdmin" },
    ],
    allowFailure: false,
  });

  return {
    address: lowerAddress(governor.address),
    queueAdmins: queueAdmins.map(lowerAddress),
    executionAdmins: executionAdmins.map(lowerAddress),
    vetoAdmin: lowerAddress(vetoAdmin),
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
  const call = {
    address: treasurySplitter.address,
    abi: treasurySplitter.abi,
    args: [],
  } as const;
  const [split, proposals] = await client.multicall({
    contracts: [
      { ...call, functionName: "defaultSplit" },
      { ...call, functionName: "activeProposals" },
    ],
    allowFailure: false,
  });

  const defaultSplit: Split = {
    recievers: split.receivers.map(lowerAddress),
    proportions: toPercentages(split.proportions),
  };

  // Only `setDefaultSplit` proposals are modelled; anything else is ignored.
  const activeProposals = proposals.flatMap((proposal): TwoAdminProposal[] => {
    const data = decodeFunctionData({
      abi: treasurySplitter.abi,
      data: proposal.callData,
    });
    if (data.functionName !== "setDefaultSplit") return [];

    return [
      {
        data: {
          functionName: data.functionName,
          recievers: data.args[0] as Address[],
          proportions: toPercentages(data.args[1]),
        },
        callData: proposal.callData,
        conirmedByTreasuryProxy: proposal.confirmedByTreasuryProxy,
        confirmedByAdmin: proposal.confirmedByAdmin,
      },
    ];
  });

  return {
    address: lowerAddress(treasurySplitterAddress),
    defaultSplit,
    activeProposals,
  };
}

/** `ContractsRegister.getPools()`: the configurator's markets. **/
const contractsRegisterAbi = [
  {
    type: "function",
    name: "getPools",
    inputs: [],
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
  },
] as const;

/** `PoolV3.asset()`: a pool's underlying. **/
const poolAssetAbi = [
  {
    type: "function",
    name: "asset",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
] as const;

/**
 * What the treasury splitter holds of the tokens the configurator's markets
 * pay fees in: every pool token (fees are minted as pool shares) and every
 * underlying.
 **/
export async function getTreasuryBalances(args: {
  client: PublicClient<Transport, Chain>;
  marketConfigurator: MarketConfiguratorContract;
  treasurySplitter: Address;
}): Promise<Record<Address, TreasuryTokenBalance>> {
  const { client, marketConfigurator, treasurySplitter } = args;
  const contractsRegister = await client.readContract({
    address: marketConfigurator.address,
    abi: marketConfigurator.abi,
    functionName: "contractsRegister",
  });
  const pools = await client.readContract({
    address: contractsRegister,
    abi: contractsRegisterAbi,
    functionName: "getPools",
  });
  if (pools.length === 0) return {};

  const underlyings = await client.multicall({
    allowFailure: false,
    contracts: pools.map(pool => ({
      address: pool,
      abi: poolAssetAbi,
      functionName: "asset" as const,
    })),
  });
  const tokens = uniqueAddresses([...pools, ...underlyings]);
  const reads = (await client.multicall({
    allowFailure: false,
    contracts: tokens.flatMap(token => [
      {
        address: token,
        abi: erc20Abi,
        functionName: "balanceOf" as const,
        args: [treasurySplitter] as const,
      },
      { address: token, abi: erc20Abi, functionName: "decimals" as const },
      {
        address: treasurySplitter,
        abi: ITreasurySplitterAbi,
        functionName: "tokenInsuranceAmount" as const,
        args: [token] as const,
      },
    ]),
  })) as unknown as (bigint | number)[];

  return Object.fromEntries(
    tokens.map((token, i) => {
      const balance = BigInt(reads[i * 3]);
      const decimals = Number(reads[i * 3 + 1]);
      const insurance = BigInt(reads[i * 3 + 2]);
      // @dev `distribute` sends what exceeds the insurance amount, if anything
      const available = balance > insurance ? balance - insurance : 0n;
      return [
        token,
        {
          available: Number(formatUnits(available, decimals)),
          insuranceAmount: Number(formatUnits(insurance, decimals)),
        },
      ];
    }),
  ) as Record<Address, TreasuryTokenBalance>;
}

/**
 * Fetches the complete configurator state for a given market configurator
 *
 * Note: This primarily pulls from on-chain data. The database stores the same
 * information synced from events, which should match this state.
 **/
export async function getConfiguratorState(
  client: PublicClient<Transport, Chain>,
  marketConfiguratorAddress: Address,
): Promise<ConfiguratorState> {
  const mc = new MarketConfiguratorContract(marketConfiguratorAddress, client);

  const version = Number(
    await client.readContract({
      address: mc.address,
      abi: mc.abi,
      functionName: "version",
    }),
  );
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
    address: lowerAddress(marketConfiguratorAddress),
    version,
    admin: lowerAddress(admin),
    emergencyAdmin: lowerAddress(emergencyAdmin),
    pausableAdmins,
    unpausableAdmins,
    lossLiquidators,
    emergencyLiquidators,
    governor: await getGovernorState(admin, client),
    treasury: {
      ...(await getTreasurySplitterState(treasury, client)),
      balances: await getTreasuryBalances({
        client,
        marketConfigurator: mc,
        treasurySplitter: treasury,
      }),
    },
    shutdown: false, // To be determined from contract state or database
  };
}

/**
 * Normalizes all addresses in a ConfiguratorState object for consistent comparison
 **/
export function normalizeConfiguratorState(
  state: ConfiguratorState,
): ConfiguratorState {
  return {
    ...state,
    address: lowerAddress(state.address),
    admin: lowerAddress(state.admin),
    emergencyAdmin: lowerAddress(state.emergencyAdmin),
    pausableAdmins: state.pausableAdmins.map(lowerAddress),
    unpausableAdmins: state.unpausableAdmins.map(lowerAddress),
    treasury: normalizeTreasurySplitterState(state.treasury),
  };
}

export function normalizeTreasurySplitterState(
  state: TreasurySplitterState,
): TreasurySplitterState {
  return {
    ...state,
    address: lowerAddress(state.address),
    ...(state.balances
      ? {
          balances: Object.fromEntries(
            Object.entries(state.balances).map(([token, balance]) => [
              lowerAddress(token),
              balance,
            ]),
          ) as Record<Address, TreasuryTokenBalance>,
        }
      : {}),
  };
}
