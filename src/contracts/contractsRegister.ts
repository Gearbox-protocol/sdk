import { keyToLowercase } from "../utils/mappers";
import { contractsByAddress, contractParams } from "./contracts";

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

  // [UNISWAP_V2_ROUTER]: "Uniswap V2",
  // [UNISWAP_V3_ROUTER]: "Uniswap V3",
  // [CURVE_3CRV_POOL_ADDRESS]: "Curve 3Pool",
  // [SUSHISWAP_MAINNET]: "Sushiswap",
  // [YEARN_DAI_VAULT_ADDRESS]: "Yearn DAI",
  // [YEARN_USDC_VAULT_ADDRESS]: "Yearn USDC",

  // KOVAN
  "0xc40B71BCcb749D91923654571f715Bf1FC464E66": "DAI",
  "0x1b0c9312FB74d08e57F49Ee5e4601a1846dc2207": "USDC",
  "0x4b20dD834B8898caC2c1B2C94163f14FA866AadC": "WETH",
  "0x2c52bc97485bcb3BeA763Fb5793eF15BA388D140": "WBTC",
  "0xe04b4db67127d1930D36f16B51653120C4285708": "WBTC",
  "0x600073357c29d169aAF3E543A4519749830553F1": "WETH",
  "0xdBAd1361d9A03B81Be8D3a54Ef0dc9e39a1bA5b3": "USDC",
  "0x50d1fA47b0D88BA0D108148B8481b4A762eFB99e": "DAI",
  // [YEARN_DAI_VAULT_KOVAN_MOCK]: "Yearn DAI",
  // [YEARN_USDC_VAULT_KOVAN_MOCK]: "Yearn USDC",
  // [SUSHISWAP_KOVAN]: "Sushiswap"

  "0x94cd5F09727ae04d7D6fd36A9c9DD96D0d54646B": "DAI",
  "0x53B4a7389EA369a9299DfF524f916EC3cB77ffF4": "USDC",
  "0xE6631f7b18744651A385a02ea2C89634d20D7819": "WETH",
  "0x4d2cBA0E43Ad3B3E1C3B1922fe6E8e910b8C3ae0": "WBTC",

  "0x6Ae9Ed829AF469Df9526FA7443E876bfaBC79eff": "DAI V2",
  "0x8E0a874E3475de1C16490E386b7E2904CdC03086": "USDC V2",
  "0x816a74B75D60839247C848518545fb17cedDC460": "WETH V2"
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
  ...contractNames
};

export function getContractName(address: string): string {
  return contractsFullList[address.toLowerCase()] || address;
}
