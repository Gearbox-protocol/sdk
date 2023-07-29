import { NetworkType } from "../core/chains";
import { TypedObjectUtils } from "../utils/mappers";
import { contractParams, contractsByAddress } from "./contracts";

export const stEthPoolWrapper: Record<NetworkType, string> = {
  Mainnet: "0x5a97e3E43dCBFe620ccF7865739075f92E93F5E4",
  Arbitrum: "0x3fe62a62C022A069952069b32C9d56718D30B7ec",
};

type MainnetCreditManagersV1 = "DAI_V1" | "USDC_V1" | "WETH_V1" | "WBTC_V1";
type MainnetCreditManagersV2 =
  | "DAI_V2"
  | "USDC_V2"
  | "WETH_V2"
  | "WSTETH_V2"
  | "WBTC_V2"
  | "FRAX_V2";
type MainnetCreditManagersV2_1 = "WETH_V2_1";

export type MainnetCreditManagers =
  | MainnetCreditManagersV1
  | MainnetCreditManagersV2
  | MainnetCreditManagersV2_1;

export type ArbitrumCreditManagers = never;

type CreditManagersListType = {
  [key in NetworkType]: key extends "Mainnet"
    ? Record<MainnetCreditManagers, string>
    : key extends "Arbitrum"
    ? Record<ArbitrumCreditManagers, string>
    : never;
};

export const creditManagerByNetwork: CreditManagersListType = {
  Mainnet: {
    DAI_V1: "0x777E23A2AcB2fCbB35f6ccF98272d03C722Ba6EB".toLowerCase(),
    USDC_V1: "0x2664cc24CBAd28749B3Dd6fC97A6B402484De527".toLowerCase(),
    WETH_V1: "0x968f9a68a98819E2e6Bb910466e191A7b6cf02F0".toLowerCase(),
    WBTC_V1: "0xC38478B0A4bAFE964C3526EEFF534d70E1E09017".toLowerCase(),

    DAI_V2: "0x672461Bfc20DD783444a830Ad4c38b345aB6E2f7".toLowerCase(),
    USDC_V2: "0x95357303f995e184A7998dA6C6eA35cC728A1900".toLowerCase(),
    WETH_V2: "0x5887ad4Cb2352E7F01527035fAa3AE0Ef2cE2b9B".toLowerCase(),
    WSTETH_V2: "0xe0bCE4460795281d39c91da9B0275BcA968293de".toLowerCase(),
    WBTC_V2: "0xc62BF8a7889AdF1c5Dc4665486c7683ae6E74e0F".toLowerCase(),
    FRAX_V2: "0xA3E1e0d58FE8dD8C9dd48204699a1178f1B274D8".toLowerCase(),

    WETH_V2_1: "0x4C6309fe2085EfE7A0Cfb426C16Ef3b41198cCE3".toLowerCase(),
  },
  Arbitrum: {},
};

export type MainnetPools =
  | "DAI_V1"
  | "USDC_V1"
  | "WETH_V1"
  | "WBTC_V1"
  | "WSTETH_V1"
  | "FRAX_V1";

export type ArbitrumPools = never;

type PoolsListType = {
  [key in NetworkType]: key extends "Mainnet"
    ? Record<MainnetPools, string>
    : key extends "Arbitrum"
    ? Record<ArbitrumPools, string>
    : never;
};

export const poolByNetwork: PoolsListType = {
  Mainnet: {
    DAI_V1: "0x24946bCbBd028D5ABb62ad9B635EB1b1a67AF668".toLowerCase(),
    USDC_V1: "0x86130bDD69143D8a4E5fc50bf4323D48049E98E4".toLowerCase(),
    WETH_V1: "0xB03670c20F87f2169A7c4eBE35746007e9575901".toLowerCase(),
    WBTC_V1: "0xB2A015c71c17bCAC6af36645DEad8c572bA08A08".toLowerCase(),
    WSTETH_V1: "0xB8cf3Ed326bB0E51454361Fb37E9E8df6DC5C286".toLowerCase(),
    FRAX_V1: "0x79012c8d491dcf3a30db20d1f449b14caf01da6c".toLowerCase(),
  },
  Arbitrum: {},
};

const deployedContractNames: Record<string, string> = {
  // MAINNET V1 CM
  [creditManagerByNetwork.Mainnet.DAI_V1]: "DAI",
  [creditManagerByNetwork.Mainnet.USDC_V1]: "USDC",
  [creditManagerByNetwork.Mainnet.WETH_V1]: "WETH",
  [creditManagerByNetwork.Mainnet.WBTC_V1]: "WBTC",

  // MAINNET V2 CM
  [creditManagerByNetwork.Mainnet.DAI_V2]: "DAI",
  [creditManagerByNetwork.Mainnet.USDC_V2]: "USDC",
  [creditManagerByNetwork.Mainnet.WETH_V2]: "WETH",
  [creditManagerByNetwork.Mainnet.WSTETH_V2]: "wstETH",
  [creditManagerByNetwork.Mainnet.WBTC_V2]: "WBTC",
  [creditManagerByNetwork.Mainnet.FRAX_V2]: "FRAX",

  // MAINNET V2_1 CM
  [creditManagerByNetwork.Mainnet.WETH_V2_1]: "WETH-Alpha",

  // MAINNET POOLS
  [poolByNetwork.Mainnet.DAI_V1]: "DAI",
  [poolByNetwork.Mainnet.USDC_V1]: "USDC",
  [poolByNetwork.Mainnet.WETH_V1]: "WETH",
  [poolByNetwork.Mainnet.WBTC_V1]: "WBTC",
  [poolByNetwork.Mainnet.WSTETH_V1]: "wstETH",
  [poolByNetwork.Mainnet.FRAX_V1]: "FRAX",
};

const contractNames = Object.entries(contractsByAddress).reduce<
  Record<string, string>
>((acc, [addr, cSymbol]) => {
  const params = contractParams[cSymbol];
  if (!params) return acc;

  return { ...acc, [addr]: params.name };
}, {});

const contractsFullList = {
  ...TypedObjectUtils.keyToLowercase(deployedContractNames),
  ...contractNames,
};

export function getContractName(address: string): string {
  return contractsFullList[address.toLowerCase()] || address;
}
