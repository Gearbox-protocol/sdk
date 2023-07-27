import { NetworkType } from "../core/chains";
import { TypedObjectUtils } from "../utils/mappers";
import { contractParams, contractsByAddress } from "./contracts";

export const stEthPoolWrapper: Record<NetworkType, string> = {
  Mainnet: "0x5a97e3E43dCBFe620ccF7865739075f92E93F5E4",
  Arbitrum: "0x3fe62a62C022A069952069b32C9d56718D30B7ec",
};

export const CREDIT_MANAGER_DAI_V2_MAINNET =
  "0x672461Bfc20DD783444a830Ad4c38b345aB6E2f7".toLowerCase();

export const CREDIT_MANAGER_USDC_V2_MAINNET =
  "0x95357303f995e184A7998dA6C6eA35cC728A1900".toLowerCase();

export const CREDIT_MANAGER_WETH_V2_MAINNET =
  "0x5887ad4Cb2352E7F01527035fAa3AE0Ef2cE2b9B".toLowerCase();

export const CREDIT_MANAGER_WSTETH_V2_MAINNET =
  "0xe0bCE4460795281d39c91da9B0275BcA968293de".toLowerCase();

export const CREDIT_MANAGER_WBTC_V2_MAINNET =
  "0xc62BF8a7889AdF1c5Dc4665486c7683ae6E74e0F".toLowerCase();

export const CREDIT_MANAGER_FRAX_V2_MAINNET =
  "0xA3E1e0d58FE8dD8C9dd48204699a1178f1B274D8".toLowerCase();

export type CreditManagersV2 =
  | typeof CREDIT_MANAGER_DAI_V2_MAINNET
  | typeof CREDIT_MANAGER_USDC_V2_MAINNET
  | typeof CREDIT_MANAGER_WETH_V2_MAINNET
  | typeof CREDIT_MANAGER_WSTETH_V2_MAINNET
  | typeof CREDIT_MANAGER_WBTC_V2_MAINNET
  | typeof CREDIT_MANAGER_FRAX_V2_MAINNET;
export const deployedContracts: Record<string, string> = {
  // MAINNET
  "0x777E23A2AcB2fCbB35f6ccF98272d03C722Ba6EB": "DAI",
  "0x2664cc24CBAd28749B3Dd6fC97A6B402484De527": "USDC",
  "0x968f9a68a98819E2e6Bb910466e191A7b6cf02F0": "WETH",
  "0xC38478B0A4bAFE964C3526EEFF534d70E1E09017": "WBTC",
  "0x79012c8d491dcf3a30db20d1f449b14caf01da6c": "FRAX",

  // MAINNET POOLS
  "0x24946bCbBd028D5ABb62ad9B635EB1b1a67AF668": "DAI",
  "0x86130bDD69143D8a4E5fc50bf4323D48049E98E4": "USDC",
  "0xB03670c20F87f2169A7c4eBE35746007e9575901": "WETH",
  "0xB8cf3Ed326bB0E51454361Fb37E9E8df6DC5C286": "wstETH",
  "0xB2A015c71c17bCAC6af36645DEad8c572bA08A08": "WBTC",

  // MAINNET V2 CM
  [CREDIT_MANAGER_DAI_V2_MAINNET]: "DAI",
  [CREDIT_MANAGER_USDC_V2_MAINNET]: "USDC",
  [CREDIT_MANAGER_WETH_V2_MAINNET]: "WETH",
  [CREDIT_MANAGER_WSTETH_V2_MAINNET]: "wstETH",
  [CREDIT_MANAGER_WBTC_V2_MAINNET]: "WBTC",
  [CREDIT_MANAGER_FRAX_V2_MAINNET]: "FRAX",
};

const contractNames = Object.entries(contractsByAddress).reduce<
  Record<string, string>
>((acc, [addr, cSymbol]) => {
  const params = contractParams[cSymbol];
  if (!params) return acc;

  return { ...acc, [addr]: params.name };
}, {});

const contractsFullList = {
  ...TypedObjectUtils.keyToLowercase(deployedContracts),
  ...contractNames,
};

export function getContractName(address: string): string {
  return contractsFullList[address.toLowerCase()] || address;
}
