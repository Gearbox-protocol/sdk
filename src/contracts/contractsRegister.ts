import { NetworkType } from "../core/constants";
import { shortAddress } from "../utils/formatter";
import { keyToLowercase } from "../utils/mappers";
import { contractParams, contractsByAddress } from "./contracts";

export const stEthPoolWrapper: Record<NetworkType, string> = {
  Mainnet: "Deploy me",
  Goerli: "0x3fe62a62C022A069952069b32C9d56718D30B7ec",
};

export const deployedContracts: Record<string, string> = {
  // MAINNET
  "0x24946bCbBd028D5ABb62ad9B635EB1b1a67AF668": "DAI",
  "0x777E23A2AcB2fCbB35f6ccF98272d03C722Ba6EB": "DAI",
  "0x86130bDD69143D8a4E5fc50bf4323D48049E98E4": "USDC",
  "0x2664cc24CBAd28749B3Dd6fC97A6B402484De527": "USDC",
  "0xB03670c20F87f2169A7c4eBE35746007e9575901": "WETH",
  "0x968f9a68a98819E2e6Bb910466e191A7b6cf02F0": "WETH",
  "0xB2A015c71c17bCAC6af36645DEad8c572bA08A08": "WBTC",
  "0xC38478B0A4bAFE964C3526EEFF534d70E1E09017": "WBTC",

  // GOERLI
  "0xf7ba434952acaa2e12035a2c3643ca327914a470": "DAI",
  "0x2144a7785baecbab32295188285717cad6c1a11c": "USDC",
  "0x2ad4a2f1bdd815e285a22cdcc072fbb43818b09b": "WETH",
  "0x40d542a5c15b2c0c65af047984c285c2c30847af": "wstETH",
  "0x6546dd4e8d507e3e45bb924818c0bad2a3aa2c5f": "WBTC",

  // GOERLI pools
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
  ...keyToLowercase(deployedContracts),
  ...contractNames,
};

export function getContractName(address: string): string {
  return contractsFullList[address.toLowerCase()] || shortAddress(address);
}
