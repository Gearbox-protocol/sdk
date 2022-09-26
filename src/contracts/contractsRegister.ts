import { NetworkType } from "../core/constants";
import { shortAddress } from "../utils/formatter";
import { keyToLowercase } from "../utils/mappers";
import { contractParams, contractsByAddress } from "./contracts";

export const stEthPoolWrapper: Record<NetworkType, string> = {
  Mainnet: "Deploy me",
  Goerli: "0x7D625991f71d473E3EA1DC819Ce583cD36D00C88",
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

  // GOERLI pools
  "0xEA7D5CaE79Cdf2E07E0aa7edfB1AF7A429Cb7513": "DAI",
  "0xF0A7BE2EB39bBbd55fc5597F93E01f62A790e587": "USDC",
  "0x560F2aa70003af4A69Bc79bB3c40955d396305aE": "WETH",
  "0x9f07160C42d5d8325E3Aa50e0075Ef3A8E4DcA9B": "WBTC",
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
