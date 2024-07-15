import {
  contractParams,
  contractsByAddress,
  NetworkType,
  TypedObjectUtils,
} from "@gearbox-protocol/sdk-gov";
import { Address } from "viem";

export const stEthPoolWrapper: Record<NetworkType, Address> = {
  Mainnet: "0x5a97e3E43dCBFe620ccF7865739075f92E93F5E4",
  Arbitrum: "0x3fe62a62C022A069952069b32C9d56718D30B7ec",
  Optimism: "" as Address,
  Base: "" as Address,
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
  | "USDT_V3_TIER_1"
  | "CRVUSD_V3_TIER_1";

export type MainnetCreditManagers =
  | MainnetCreditManagersV1
  | MainnetCreditManagersV2
  | MainnetCreditManagersV2_1
  | MainnetCreditManagersV3;

export type ArbitrumCreditManagers =
  | "USDC_E_V3_TRADE_TIER_1"
  | "USDC_E_V3_TRADE_TIER_2"
  | "USDC_V3_TRADE_TIER_1"
  | "USDC_V3_TRADE_TIER_2"
  | "WETH_V3_TRADE_TIER_1"
  | "WETH_V3_TRADE_TIER_2";
export type OptimismCreditManagers =
  | "USDC_E_V3_TIER_1"
  | "USDC_E_V3_TIER_2"
  | "WETH_V3_TIER_1"
  | "WETH_V3_TRADE_TIER_2";
export type BaseCreditManagers = never;

type CreditManagersListType = {
  [key in NetworkType]: key extends "Mainnet"
    ? Record<MainnetCreditManagers, Address>
    : key extends "Arbitrum"
    ? Record<ArbitrumCreditManagers, Address>
    : key extends "Optimism"
    ? Record<OptimismCreditManagers, Address>
    : key extends "Base"
    ? Record<BaseCreditManagers, Address>
    : never;
};

export const creditManagerByNetwork: CreditManagersListType = {
  Mainnet: {
    DAI_V1:
      "0x777E23A2AcB2fCbB35f6ccF98272d03C722Ba6EB".toLowerCase() as Address,
    USDC_V1:
      "0x2664cc24CBAd28749B3Dd6fC97A6B402484De527".toLowerCase() as Address,
    WETH_V1:
      "0x968f9a68a98819E2e6Bb910466e191A7b6cf02F0".toLowerCase() as Address,
    WBTC_V1:
      "0xC38478B0A4bAFE964C3526EEFF534d70E1E09017".toLowerCase() as Address,

    DAI_V2:
      "0x672461Bfc20DD783444a830Ad4c38b345aB6E2f7".toLowerCase() as Address,
    USDC_V2:
      "0x95357303f995e184A7998dA6C6eA35cC728A1900".toLowerCase() as Address,
    WETH_V2:
      "0x5887ad4Cb2352E7F01527035fAa3AE0Ef2cE2b9B".toLowerCase() as Address,
    WSTETH_V2:
      "0xe0bCE4460795281d39c91da9B0275BcA968293de".toLowerCase() as Address,
    WBTC_V2:
      "0xc62BF8a7889AdF1c5Dc4665486c7683ae6E74e0F".toLowerCase() as Address,
    FRAX_V2:
      "0xA3E1e0d58FE8dD8C9dd48204699a1178f1B274D8".toLowerCase() as Address,

    WETH_V2_1:
      "0x4C6309fe2085EfE7A0Cfb426C16Ef3b41198cCE3".toLowerCase() as Address,

    USDC_V3_TRADE_TIER_1:
      "0x3eb95430fdb99439a86d3c6d7d01c3c561393556".toLowerCase() as Address,
    USDC_V3_TRADE_TIER_2:
      "0xea7c28428d3916dbe2f113b8a6e6dd0f3819c050".toLowerCase() as Address,
    USDC_V3_TRADE_TIER_3:
      "0x4e94cd228ef386ebc32900ec745d1865934688a3".toLowerCase() as Address,

    WBTC_V3_TRADE_TIER_1:
      "0xefc134755aaf89fe84476946251680bece41246e".toLowerCase() as Address,
    WBTC_V3_TRADE_TIER_2:
      "0xcac3e41b9bad20e2aa35e150de96eefb2d043735".toLowerCase() as Address,
    WBTC_V3_TRADE_TIER_3:
      "0x46709ca16b1ffea5d6c6bb6b7e77dd9e3b4908ed".toLowerCase() as Address,

    WETH_V3_TRADE_TIER_1:
      "0xa30099925b14b00b76ae2efe2639cd01598fe68a".toLowerCase() as Address,
    WETH_V3_TRADE_TIER_2:
      "0x3f11758aca3f2eb7a27828c9cbcd0b347944ac14".toLowerCase() as Address,
    WETH_V3_TRADE_TIER_3:
      "0x0b2486355e987586c32fc0feefe2943e396c484e".toLowerCase() as Address,

    USDC_V3_FARM:
      "0x1d489ccd2b96908c0a80acbbdb2f1963ffed3384".toLowerCase() as Address,
    WETH_V3_FARM:
      "0x6dc0eb1980fa6b3fa89f5b29937b9baab5865b3e".toLowerCase() as Address,

    WETH_V3_RESTAKING:
      "0x50ba483272484fc5eebe8676dc87d814a11faef6".toLowerCase() as Address,

    USDT_V3_TIER_1_BROKEN:
      "0x6950f4190aa1e1339519d5d4d89796ae4165cd5c".toLowerCase() as Address,
    USDT_V3_TIER_1:
      "0xe35eb22a349baba4f1a28a9cdba641d3b72c6203".toLowerCase() as Address,
    GHO_V3_TIER_1:
      "0x58c8e983d9479b69b64970f79e8965ea347189c9".toLowerCase() as Address,
    DAI_V3_TIER_1:
      "0x4582411643f9bbe6c736ed2114eda856b1c9ed40".toLowerCase() as Address,
    CRVUSD_V3_TIER_1:
      "0x629f097996a5fb606470974bda1c3b6abc4d6857".toLowerCase() as Address,
  },
  Arbitrum: {
    USDC_E_V3_TRADE_TIER_1:
      "0x75bc0fef1c93723be3d73b2000b5ba139a0c680c".toLowerCase() as Address,
    USDC_E_V3_TRADE_TIER_2:
      "0xb4bc02c0859b372c61abccfa5df91b1ccaa4dd1f".toLowerCase() as Address,

    USDC_V3_TRADE_TIER_1:
      "0xe5e2d4bb15d26a6036805fce666c5488367623e2".toLowerCase() as Address,
    USDC_V3_TRADE_TIER_2:
      "0xb780dd9cec259a0bbf7b32587802f33730353e86".toLowerCase() as Address,

    WETH_V3_TRADE_TIER_1:
      "0xcedaa4b4a42c0a771f6c24a3745c3ca3ed73f17a".toLowerCase() as Address,
    WETH_V3_TRADE_TIER_2:
      "0x3ab1d35500d2da4216f5863229a7b81e2f6ff976".toLowerCase() as Address,
  },
  Optimism: {
    USDC_E_V3_TIER_1:
      "0xab260a0acbee82db69e61221a57aff302a2a83d9".toLowerCase() as Address,
    USDC_E_V3_TIER_2:
      "0xbd71b3e744a0f9a6f8405479118ff2f42118463a".toLowerCase() as Address,

    WETH_V3_TIER_1:
      "0x1c1261bbccd09cb618d3fd8cd74bf7562c022ac4".toLowerCase() as Address,
    WETH_V3_TRADE_TIER_2:
      "0x6ed2150a2d4136b42adf2043d25f5834baa0f1a9".toLowerCase() as Address,
  },
  Base: {},
};

export type SupportedCreditManagers =
  | MainnetCreditManagers
  | ArbitrumCreditManagers;

export const creditManagerByAddress = TypedObjectUtils.entries(
  creditManagerByNetwork,
).reduce<Record<Address, SupportedCreditManagers>>(
  (acc, [, cms]) => ({
    ...acc,
    ...TypedObjectUtils.fromEntries(
      TypedObjectUtils.entries(cms)
        .map(([k, v]) => [v.toLowerCase() as Address, k])
        .filter(k => !!k) as Array<[Address, SupportedCreditManagers]>,
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
  | "USDT_V3"
  | "CRVUSD_V3";

export type MainnetPools = MainnetPoolsV1 | MainnetPoolsV3;

export type ArbitrumPools = "USDC_V3" | "USDC_e_V3" | "WETH_V3";
export type OptimismPools = "USDC_V3" | "WETH_V3";
export type BasePools = never;

type PoolsListType = {
  [key in NetworkType]: key extends "Mainnet"
    ? Record<MainnetPools, Address>
    : key extends "Arbitrum"
    ? Record<ArbitrumPools, Address>
    : key extends "Optimism"
    ? Record<OptimismPools, Address>
    : key extends "Base"
    ? Record<BasePools, Address>
    : never;
};

export const poolByNetwork: PoolsListType = {
  Mainnet: {
    DAI_V1:
      "0x24946bCbBd028D5ABb62ad9B635EB1b1a67AF668".toLowerCase() as Address,
    USDC_V1:
      "0x86130bDD69143D8a4E5fc50bf4323D48049E98E4".toLowerCase() as Address,
    WETH_V1:
      "0xB03670c20F87f2169A7c4eBE35746007e9575901".toLowerCase() as Address,
    WBTC_V1:
      "0xB2A015c71c17bCAC6af36645DEad8c572bA08A08".toLowerCase() as Address,
    WSTETH_V1:
      "0xB8cf3Ed326bB0E51454361Fb37E9E8df6DC5C286".toLowerCase() as Address,
    FRAX_V1:
      "0x79012c8d491dcf3a30db20d1f449b14caf01da6c".toLowerCase() as Address,

    USDC_V3_TRADE:
      "0xda00000035fef4082f78def6a8903bee419fbf8e".toLowerCase() as Address,
    WBTC_V3_TRADE:
      "0xda00010eda646913f273e10e7a5d1f659242757d".toLowerCase() as Address,
    WETH_V3_TRADE:
      "0xda0002859b2d05f66a753d8241fcde8623f26f4f".toLowerCase() as Address,

    USDT_V3_BROKEN:
      "0x1dc0f3359a254f876b37906cfc1000a35ce2d717".toLowerCase() as Address,
    GHO_V3:
      "0x4d56c9cba373ad39df69eb18f076b7348000ae09".toLowerCase() as Address,
    DAI_V3:
      "0xe7146f53dbcae9d6fa3555fe502648deb0b2f823".toLowerCase() as Address,
    USDT_V3:
      "0x05a811275fe9b4de503b3311f51edf6a856d936e".toLowerCase() as Address,
    CRVUSD_V3:
      "0x8ef73f036feec873d0b2fd20892215df5b8bdd72".toLowerCase() as Address,
  },
  Arbitrum: {
    USDC_e_V3:
      "0xa76c604145d7394dec36c49af494c144ff327861".toLowerCase() as Address,
    USDC_V3:
      "0x890a69ef363c9c7bdd5e36eb95ceb569f63acbf6".toLowerCase() as Address,
    WETH_V3:
      "0x04419d3509f13054f60d253e0c79491d9e683399".toLowerCase() as Address,
  },
  Optimism: {
    USDC_V3:
      "0x5520daa93a187f4ec67344e6d2c4fc9b080b6a35".toLowerCase() as Address,
    WETH_V3:
      "0x42db77b3103c71059f4b997d6441cfb299fd0d94".toLowerCase() as Address,
  },
  Base: {},
};

export type SupportedPools = MainnetPools | ArbitrumPools;

const deployedContractNames: Record<Address, string> = {
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
  Record<Address, string>
>((acc, [addr, cSymbol]) => {
  const params = contractParams[cSymbol];
  if (!params) return acc;

  return { ...acc, [addr]: params.name };
}, {});

const contractsFullList = {
  ...TypedObjectUtils.keyToLowercase(deployedContractNames),
  ...contractNames,
};

export function getContractName(address: Address): string {
  return (
    contractsFullList[address.toLowerCase() as Address as Address] || address
  );
}
