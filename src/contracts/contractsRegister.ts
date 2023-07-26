import { NetworkType } from "../core/chains";
import { TypedObjectUtils } from "../utils/mappers";
import { contractParams, contractsByAddress } from "./contracts";

export const stEthPoolWrapper: Record<NetworkType, string> = {
  Mainnet: "0x5a97e3E43dCBFe620ccF7865739075f92E93F5E4",
  Arbitrum: "0x3fe62a62C022A069952069b32C9d56718D30B7ec",
};

export const CREDIT_MANAGER_DAI_V2_MAINNET =
  "0x672461bfc20dd783444a830ad4c38b345ab6e2f7".toLowerCase();

export const CREDIT_MANAGER_USDC_V2_MAINNET =
  "0x95357303f995e184A7998dA6C6eA35cC728A1900".toLowerCase();

export const CREDIT_MANAGER_WETH_V2_MAINNET =
  "0x5887ad4cb2352e7f01527035faa3ae0ef2ce2b9b".toLowerCase();

export const CREDIT_MANAGER_WSTETH_V2_MAINNET =
  "0xe0bce4460795281d39c91da9b0275bca968293de".toLowerCase();

export const CREDIT_MANAGER_WBTC_V2_MAINNET =
  "0xc62bf8a7889adf1c5dc4665486c7683ae6e74e0f".toLowerCase();

export const CREDIT_MANAGER_FRAX_V2_MAINNET =
  "0xa3e1e0d58fe8dd8c9dd48204699a1178f1b274d8".toLowerCase();

// Arbitrum
export const CREDIT_MANAGER_DAI_V2_ARBITRUM =
  "0xf7ba434952acaa2e12035a2c3643ca327914a470".toLowerCase();

export const CREDIT_MANAGER_USDC_V2_ARBITRUM =
  "0x2144a7785baecbab32295188285717cad6c1a11c".toLowerCase();

export const CREDIT_MANAGER_WETH_V2_ARBITRUM =
  "0x2ad4a2f1bdd815e285a22cdcc072fbb43818b09b".toLowerCase();

export const CREDIT_MANAGER_WSTETH_V2_ARBITRUM =
  "0x40d542a5c15b2c0c65af047984c285c2c30847af".toLowerCase();

export const CREDIT_MANAGER_WBTC_V2_ARBITRUM =
  "0x6546dd4e8d507e3e45bb924818c0bad2a3aa2c5f".toLowerCase();

export type CreditManagersV2 =
  | typeof CREDIT_MANAGER_DAI_V2_MAINNET
  | typeof CREDIT_MANAGER_USDC_V2_MAINNET
  | typeof CREDIT_MANAGER_WETH_V2_MAINNET
  | typeof CREDIT_MANAGER_WSTETH_V2_MAINNET
  | typeof CREDIT_MANAGER_WBTC_V2_MAINNET
  | typeof CREDIT_MANAGER_DAI_V2_ARBITRUM
  | typeof CREDIT_MANAGER_USDC_V2_ARBITRUM
  | typeof CREDIT_MANAGER_WETH_V2_ARBITRUM
  | typeof CREDIT_MANAGER_WSTETH_V2_ARBITRUM
  | typeof CREDIT_MANAGER_WBTC_V2_ARBITRUM
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

  // Arbitrum CM
  [CREDIT_MANAGER_DAI_V2_ARBITRUM]: "DAI",
  [CREDIT_MANAGER_USDC_V2_ARBITRUM]: "USDC",
  [CREDIT_MANAGER_WETH_V2_ARBITRUM]: "WETH",
  [CREDIT_MANAGER_WSTETH_V2_ARBITRUM]: "wstETH",
  [CREDIT_MANAGER_WBTC_V2_ARBITRUM]: "WBTC",

  // Arbitrum pools
  "0xfb422e503f8b768184aba5e73587543d1c871a23": "DAI",
  "0x7c14c88f672d5513c8fa640fa48815f40c781a60": "USDC",
  "0x13376d637ded73a0df20d192f691a88c8af7dd0a": "ETH/WETH",
  "0x3f926a46893af659c2768f118d5f189190baa15c": "WBTC",
  "0xbdf0395fa6f134b8de35ef30c61b2b9711cbd67a": "wstETH",
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
