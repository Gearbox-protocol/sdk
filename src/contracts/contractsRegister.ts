import {
  contractParams,
  contractsByAddress,
  NetworkType,
  TypedObjectUtils,
} from "@gearbox-protocol/sdk-gov";

export const stEthPoolWrapper: Record<NetworkType, string> = {
  Mainnet: "0x5a97e3E43dCBFe620ccF7865739075f92E93F5E4",
  Arbitrum: "0x3fe62a62C022A069952069b32C9d56718D30B7ec",
  Optimism: "",
  Base: "",
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
type MainnetCreditManagersV3 =
  | "USDC_V3_TRADE_TIER_1"
  | "USDC_V3_TRADE_TIER_2"
  | "USDC_V3_TRADE_TIER_3"
  | "WBTC_V3_TRADE_TIER_1"
  | "WBTC_V3_TRADE_TIER_2"
  | "WBTC_V3_TRADE_TIER_3"
  | "WETH_V3_TRADE_TIER_1"
  | "WETH_V3_TRADE_TIER_2"
  | "WETH_V3_TRADE_TIER_3"
  | "USDC_V3_FARM"
  | "WETH_V3_FARM"
  | "WETH_V3_RESTAKING"
  | "USDT_V3_TIER_1_BROKEN"
  | "GHO_V3_TIER_1"
  | "DAI_V3_TIER_1"
  | "USDT_V3_TIER_1";

export type MainnetCreditManagers =
  | MainnetCreditManagersV1
  | MainnetCreditManagersV2
  | MainnetCreditManagersV2_1
  | MainnetCreditManagersV3;

export type ArbitrumCreditManagers =
  | "USDC_E_V3_TRADE_TIER_1"
  | "USDC_E_V3_TRADE_TIER_2"
  | "WETH_V3_TRADE_TIER_1"
  | "WETH_V3_TRADE_TIER_2";
export type OptimismCreditManagers = never;
export type BaseCreditManagers = never;

type CreditManagersListType = {
  [key in NetworkType]: key extends "Mainnet"
    ? Record<MainnetCreditManagers, string>
    : key extends "Arbitrum"
    ? Record<ArbitrumCreditManagers, string>
    : key extends "Optimism"
    ? Record<OptimismCreditManagers, string>
    : key extends "Base"
    ? Record<BaseCreditManagers, string>
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

    USDC_V3_TRADE_TIER_1:
      "0x3eb95430fdb99439a86d3c6d7d01c3c561393556".toLowerCase(),
    USDC_V3_TRADE_TIER_2:
      "0xea7c28428d3916dbe2f113b8a6e6dd0f3819c050".toLowerCase(),
    USDC_V3_TRADE_TIER_3:
      "0x4e94cd228ef386ebc32900ec745d1865934688a3".toLowerCase(),

    WBTC_V3_TRADE_TIER_1:
      "0xefc134755aaf89fe84476946251680bece41246e".toLowerCase(),
    WBTC_V3_TRADE_TIER_2:
      "0xcac3e41b9bad20e2aa35e150de96eefb2d043735".toLowerCase(),
    WBTC_V3_TRADE_TIER_3:
      "0x46709ca16b1ffea5d6c6bb6b7e77dd9e3b4908ed".toLowerCase(),

    WETH_V3_TRADE_TIER_1:
      "0xa30099925b14b00b76ae2efe2639cd01598fe68a".toLowerCase(),
    WETH_V3_TRADE_TIER_2:
      "0x3f11758aca3f2eb7a27828c9cbcd0b347944ac14".toLowerCase(),
    WETH_V3_TRADE_TIER_3:
      "0x0b2486355e987586c32fc0feefe2943e396c484e".toLowerCase(),

    USDC_V3_FARM: "0x1d489ccd2b96908c0a80acbbdb2f1963ffed3384".toLowerCase(),
    WETH_V3_FARM: "0x6dc0eb1980fa6b3fa89f5b29937b9baab5865b3e".toLowerCase(),

    WETH_V3_RESTAKING:
      "0x50ba483272484fc5eebe8676dc87d814a11faef6".toLowerCase(),

    USDT_V3_TIER_1_BROKEN:
      "0x6950f4190aa1e1339519d5d4d89796ae4165cd5c".toLowerCase(),
    USDT_V3_TIER_1: "0xe35eb22a349baba4f1a28a9cdba641d3b72c6203".toLowerCase(),
    GHO_V3_TIER_1: "0x58c8e983d9479b69b64970f79e8965ea347189c9".toLowerCase(),
    DAI_V3_TIER_1: "0x4582411643f9bbe6c736ed2114eda856b1c9ed40".toLowerCase(),
  },
  Arbitrum: {
    USDC_E_V3_TRADE_TIER_1:
      "0x75bc0fef1c93723be3d73b2000b5ba139a0c680c".toLowerCase(),
    USDC_E_V3_TRADE_TIER_2:
      "0xb4bc02c0859b372c61abccfa5df91b1ccaa4dd1f".toLowerCase(),

    WETH_V3_TRADE_TIER_1:
      "0xcedaa4b4a42c0a771f6c24a3745c3ca3ed73f17a".toLowerCase(),
    WETH_V3_TRADE_TIER_2:
      "0x3ab1d35500d2da4216f5863229a7b81e2f6ff976".toLowerCase(),
  },
  Optimism: {},
  Base: {},
};

export type SupportedCreditManagers =
  | MainnetCreditManagers
  | ArbitrumCreditManagers;

export const creditManagerByAddress = TypedObjectUtils.entries(
  creditManagerByNetwork,
).reduce<Record<string, SupportedCreditManagers>>(
  (acc, [, cms]) => ({
    ...acc,
    ...TypedObjectUtils.fromEntries(
      TypedObjectUtils.entries(cms)
        .map(([k, v]) => [v.toLowerCase(), k])
        .filter(k => !!k) as Array<[string, SupportedCreditManagers]>,
    ),
  }),
  {},
);

export type MainnetPoolsV1 =
  | "DAI_V1"
  | "USDC_V1"
  | "WETH_V1"
  | "WBTC_V1"
  | "WSTETH_V1"
  | "FRAX_V1";

export type MainnetPoolsV3 =
  | "USDC_V3_TRADE"
  | "WETH_V3_TRADE"
  | "WBTC_V3_TRADE"
  | "USDT_V3_BROKEN"
  | "GHO_V3"
  | "DAI_V3"
  | "USDT_V3";

export type MainnetPools = MainnetPoolsV1 | MainnetPoolsV3;

export type ArbitrumPools = "USDC_V3" | "WETH_V3";
export type OptimismPools = never;
export type BasePools = never;

type PoolsListType = {
  [key in NetworkType]: key extends "Mainnet"
    ? Record<MainnetPools, string>
    : key extends "Arbitrum"
    ? Record<ArbitrumPools, string>
    : key extends "Optimism"
    ? Record<OptimismPools, string>
    : key extends "Base"
    ? Record<BasePools, string>
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

    USDC_V3_TRADE: "0xda00000035fef4082f78def6a8903bee419fbf8e".toLowerCase(),
    WBTC_V3_TRADE: "0xda00010eda646913f273e10e7a5d1f659242757d".toLowerCase(),
    WETH_V3_TRADE: "0xda0002859b2d05f66a753d8241fcde8623f26f4f".toLowerCase(),

    USDT_V3_BROKEN: "0x1dc0f3359a254f876b37906cfc1000a35ce2d717".toLowerCase(),
    GHO_V3: "0x4d56c9cba373ad39df69eb18f076b7348000ae09".toLowerCase(),
    DAI_V3: "0xe7146f53dbcae9d6fa3555fe502648deb0b2f823".toLowerCase(),
    USDT_V3: "0x05a811275fe9b4de503b3311f51edf6a856d936e".toLowerCase(),
  },
  Arbitrum: {
    USDC_V3: "0xa76c604145d7394dec36c49af494c144ff327861".toLowerCase(),
    WETH_V3: "0x04419d3509f13054f60d253e0c79491d9e683399".toLowerCase(),
  },
  Optimism: {},
  Base: {},
};

export type SupportedPools = MainnetPools | ArbitrumPools;

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
