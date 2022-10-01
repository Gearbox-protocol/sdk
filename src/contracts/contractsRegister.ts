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
  "0x2B16eA2D7a1b13d115d05B03Fd0E5984eFA0F18D": "DAI",
  "0x19e8293f46caE0770d608a3078EFb59f0B0166aa": "USDC",
  "0x9149A40293d0bc17f07DaFC7F6282b267D3C68C8": "WETH",
  "0x70ba4442e9c76269f9f2c31c8884fc7880f40d4a": "wstETH",

  // GOERLI pools
  "0xfb422E503f8b768184ABA5e73587543d1C871A23": "DAI",
  "0x7c14C88f672d5513C8fa640fA48815f40c781a60": "USDC",
  "0x13376d637dEd73a0df20D192F691a88c8aF7DD0A": "WETH",
  "0x3F926a46893AF659C2768f118D5F189190bAA15C": "WBTC",
  "0xBDF0395fa6f134B8DE35Ef30c61B2B9711CBD67A": "wstETH",
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
