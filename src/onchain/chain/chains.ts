import type { Address, Chain } from "viem";
import { defineChain } from "viem";
import {
  arbitrum,
  avalanche,
  base,
  berachain,
  bsc,
  etherlink,
  hemi,
  lisk,
  mainnet,
  megaeth,
  monad,
  optimism,
  plasma,
  somnia,
  sonic,
  worldchain,
} from "viem/chains";
import { z } from "zod/v4";
import type { AssetType, ChainId, CuratorName } from "../../model/index.js";
import { AddressMap } from "../utils/AddressMap.js";
import { AddressSet } from "../utils/AddressSet.js";

/**
 * Extended viem {@link Chain} with Gearbox-specific metadata.
 *
 * Every supported network is represented by a `GearboxChain` instance in
 * the {@link chains} record.
 **/
export interface GearboxChain extends Chain {
  /**
   * Gearbox network type label (e.g. `"Mainnet"`, `"Arbitrum"`).
   **/
  network: NetworkType;
  /**
   * Market configurator addresses operated by known curators on this chain.
   **/
  defaultMarketConfigurators: AddressMap<CuratorName>;
  /**
   * Known RWA factory addresses on this chain
   */
  rwaFactories: Address[];
  /**
   * Market configurators used in test/staging environments.
   **/
  testMarketConfigurators?: AddressMap<CuratorName>;
  /**
   * Denomination class of the market underlyings on this chain.
   *
   * Nothing on-chain says what a token is denominated in, so this is a manually
   * curated table. It only covers underlyings — there are few of them — and a
   * token missing from it is simply unclassified. An RWA market's compliance
   * wrapper does not belong here: it is unwrapped before the lookup, so the
   * token it holds is what needs an entry.
   **/
  underlyingAssetTypes?: AddressMap<AssetType>;
  /**
   * Tokens on this chain that represent a real-world asset. A market that
   * accepts one of them as collateral is reported as an RWA opportunity.
   **/
  rwaTokens?: AddressSet;
  /**
   * Pools being wound down. Curated, and unrelated to any on-chain flag.
   **/
  sunsetPools?: AddressSet;
  /**
   * Credit managers whose strategies are being wound down. Curated, and
   * unrelated to the credit facade's expiration date.
   **/
  sunsetStrategies?: AddressSet;
  /**
   * Legacy credit managers whose target collateral cannot be inferred from
   * the collateral list. Maps credit manager → target collateral.
   **/
  legacyStrategyTargets?: AddressMap<Address>;
  /**
   * Existing credit accounts whose target collateral must stay pinned, even
   * when the credit manager's current target would say otherwise. Maps credit
   * account → target collateral.
   **/
  accountTargetCollaterals?: AddressMap<Address>;
  /**
   * Display names that replace the on-chain ticker in {@link TokensMeta},
   * e.g. a Beefy vault rewritten as `"Beefy WBTC/cbBTC/hemiBTC"`.
   **/
  tokenPrettyNames?: AddressMap<string>;
  /**
   * Whether this chain is production-ready
   **/
  isPublic: boolean;
  /**
   * A well-known ERC-20 token that uniquely identifies this chain.
   *
   * Used by {@link detectNetwork} to determine which chain an arbitrary
   * RPC endpoint is connected to.
   **/
  wellKnownToken: {
    address: Address;
    symbol: string;
  };
  /**
   * Block number when the Gearbox address provider was deployed.
   **/
  firstBlock?: bigint;
  /**
   * Default read-only calls gas limit for this chain.
   */
  gasLimit: bigint;
}

/**
 * Tuple of all network labels the SDK can work with.
 **/
export const SUPPORTED_NETWORKS = [
  "Mainnet",
  "Arbitrum",
  "Optimism",
  "Base",
  "Sonic",
  "MegaETH",
  "Monad",
  "Berachain",
  "Avalanche",
  "BNB",
  "WorldChain",
  "Etherlink",
  "Hemi",
  "Lisk",
  "Plasma",
  "Somnia",
] as const;

/**
 * Zod schema for validating/parsing network type strings.
 **/
export const NetworkType = z.enum(SUPPORTED_NETWORKS);

/**
 * All supported Gearbox network labels
 **/
export type NetworkType = z.infer<typeof NetworkType>;

function withPublicNode(chain: GearboxChain, subdomain: string): GearboxChain {
  return defineChain({
    ...chain,
    rpcUrls: {
      ...chain.rpcUrls,
      publicnode: {
        http: [`https://${subdomain}.publicnode.com`],
        webSocket: [`wss://${subdomain}.publicnode.com`],
      },
    },
  });
}

/**
 * Pre-configured {@link GearboxChain} instances for every supported network.
 **/
export const chains: Record<NetworkType, GearboxChain> = {
  Mainnet: withPublicNode(
    {
      ...mainnet,
      network: "Mainnet",
      defaultMarketConfigurators: AddressMap.fromRecord<CuratorName>({
        "0xc168343c791d56dd1da4b4b8b0cc1c1ec1a16e6b": "cp0x",
        "0x3b56538833fc02f4f0e75609390f26ded0c32e42": "Re7",
        "0x7a133fbd01736fd076158307c9476cc3877f1af5": "Invariant Group",
        "0x09d8305F49374AEA6A78aF6C996df2913e8f3b19": "Tulipa",
        "0x1b265b97eb169fb6668e3258007c3b0242c7bdbe": "KPK",
        "0x9dddd1b9ce0ac8aa0c80e4ec141600b9bf0101c3": "UltraYield",
        "0x601067eba24bb5b558a184fc082525637e96a42d": "Gami Labs",
      }),
      testMarketConfigurators: AddressMap.fromRecord<CuratorName>({
        "0x99df7330bf42d596af2e9d9836d4fc2077c574aa": "M11 Credit",
        "0x610627d8d01a413bdd9b0a0b60070da7dd1e54ad": "Securitize",
        "0xa770ce584adb6491a2138da6eaec33243bdcd248": "Testnet Curator", // without governor, for midas
      }),
      rwaFactories: [] as Address[],
      underlyingAssetTypes: AddressMap.fromRecord<AssetType>({
        "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0": "ETH", // [wstETH]
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": "ETH", //[WETH]
        "0x18084fbA666a33d37592fA2633fD49a74DD93a88": "BTC", // [tBTC]
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": "Stable", // [USDC]
        "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599": "BTC", // [WBTC]
      }),
      rwaTokens: new AddressSet([
        "0x17418038ecF73BA4026c4f428547BF099706F27B", // ACRED, Securitize
        "0x51C2d74017390CbBd30550179A16A1c28F7210fc", // STAC, Securitize
        "0x238a700eD6165261Cf8b2e544ba797BC11e466Ba", // mF-ONE, Midas
        "0x7433806912Eae67919e66aea853d46Fa0aef98A8", // mGLOBAL, Midas
      ]),
      legacyStrategyTargets: AddressMap.fromRecord<Address>({
        "0x1293a69e4ad4a93293a06b6303104be35bdd83af":
          "0x1a711a5bc48b5c1352c1882fa65dc14b5b9e829d",
        "0x29350a3c2627fb78c7e915cd59af754edf8998c5":
          "0xe1d9b789da5b5375eacf66f036022b019a2af307",
        "0x79c6c1ce5b12abcc3e407ce8c160ee1160250921":
          "0x02a4cceed3c400b5ba9fd22ad6ec18d8f7a3d48e",
        "0x9a0fdf7cdab4604fc27ebeab4b3d57bd825e8ebe":
          "0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee",
        "0x9fb5493deb601a0329ad8bff43cd182a61321ca7":
          "0x02a4cceed3c400b5ba9fd22ad6ec18d8f7a3d48e",
        "0x68df4deeff1d9007063395cc190a486dceb05920":
          "0x31454faa1daa04cacf59a6bd37681da9160d092a",
        "0x0f4e4432977bbf3962322996f1c9aefdbc62256d":
          "0xda06ee2dacf9245aa80072a4407debdea0d7e341",
        "0xfc896a605da98f3df6da47beb29cb59ae382351d":
          "0x924d24c238db7ecae2aa3a19430239ed684bde4a",
        "0x52b27889f67887fc9b98a59304037570e7d7e556":
          "0x4956b52ae2ff65d74ca2d61207523288e4528f96",
        "0xa64d5e7567c5e8f494549dbff60c77846e059706":
          "0x4956b52ae2ff65d74ca2d61207523288e4528f96",
        "0x0af1324369e3fd78325fab0cb62eea19f3e4ebf0":
          "0xb908c9fe885369643adb5fba4407d52bd726c72d",
        "0x0fafa30cd35bc6a48ff2b40694d4a73d4f4bcc92":
          "0xb908c9fe885369643adb5fba4407d52bd726c72d",
      }),
      accountTargetCollaterals: AddressMap.fromRecord<Address>({
        "0x56631dcb1ea548d2629e82e01375090ed1f81b7e":
          "0x1a711a5bc48b5c1352c1882fa65dc14b5b9e829d",
        "0x89014edc549ffa5c5b6e859b1496731bd035c247":
          "0x31454faa1daa04cacf59a6bd37681da9160d092a",
        "0x3b7ab1f4fee570933b24b202de90ffda82f6cae0":
          "0x31454faa1daa04cacf59a6bd37681da9160d092a",
        "0x721798d8ccf31ae75c12db82fa72b3806759cbc9":
          "0x31454faa1daa04cacf59a6bd37681da9160d092a",
        "0xd7273d9594ac88f993eda9773041e621633acea0":
          "0x1a711a5bc48b5c1352c1882fa65dc14b5b9e829d",
        "0x34442ca47435e90b80d835aab9737166e76d9962":
          "0x403cc0d2694ec2639101f32b146b90d766461ce9",
      }),
      sunsetPools: new AddressSet([
        "0xF791Ecc5F2472637eac9DFe3f7894C0B32C32bDf",
        "0xC155444481854c60e7a29f4150373f479988F32D",
        "0xF0795C47fA58d00f5F77F4D5c01F31eE891E21B4",
        "0x119f75D5AC5739Ae49ffC46117a20654793A9b18",
        "0xb46edf298989F0F106EDD80E4ae8f59a13531dB4",
        "0xd98e31C67c7C21f233C37c9AC9Ae656dcb0d5d25",
      ]),
      sunsetStrategies: new AddressSet([
        "0x1840056a2bdbe949e017a3716e3fdd4a0d327bf0",
        "0x187C5022002d45107dB72B0b59E72111f69Bd513",
        "0x9fF97B167Dd442bd5f277098bf1154C5807D3566",
        "0xa4c644f3180d10cd3b2121d455a2a88e1bda2928",
        "0xb79d6544839d169869476589d2e54014a074317b",
        "0xc307a074bd5aec2d6ad1d9b74465c24a59b490fd",
        "0xf5edc34204e67e592bdcb84114571c9e4bd0bdf7",
      ]),
      isPublic: true,
      wellKnownToken: {
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        symbol: "USDC",
      },
      tokenPrettyNames: AddressMap.fromRecord<string>({
        "0x924d24c238db7ecae2aa3a19430239ed684bde4a":
          "Beefy WBTC/cbBTC/hemiBTC",
        "0x403cc0d2694ec2639101f32b146b90d766461ce9": "Beefy wstETH/tETH",
        "0x02a4cceed3c400b5ba9fd22ad6ec18d8f7a3d48e": "Beefy ETH+/WETH",
        "0x31454faa1daa04cacf59a6bd37681da9160d092a": "Beefy rETH/WETH",
        "0x1a711a5bc48b5c1352c1882fa65dc14b5b9e829d": "Beefy osETH/WETH",
      }),
      firstBlock: 22358644n,
      gasLimit: 550_000_000n,
    },
    "ethereum-rpc",
  ),
  Arbitrum: withPublicNode(
    {
      ...arbitrum,
      network: "Arbitrum",
      defaultMarketConfigurators: AddressMap.fromRecord<CuratorName>({
        "0x01023850b360b88de0d0f84015bbba1eba57fe7e": "Chaos Labs",
      }),
      rwaFactories: [] as Address[],
      isPublic: true,
      wellKnownToken: {
        address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        symbol: "USDC",
      },
      firstBlock: 184650310n,
      gasLimit: 550_000_000n,
    },
    "arbitrum-one-rpc",
  ),
  Optimism: withPublicNode(
    {
      ...optimism,
      network: "Optimism",
      defaultMarketConfigurators: AddressMap.fromRecord<CuratorName>({
        "0x2a15969CE5320868eb609680751cF8896DD92De5": "Chaos Labs",
        "0x9dddd1b9ce0ac8aa0c80e4ec141600b9bf0101c3": "UltraYield",
      }),
      rwaFactories: [] as Address[],
      isPublic: true,
      wellKnownToken: {
        address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
        symbol: "USDC",
      },
      firstBlock: 118410666n,
      gasLimit: 550_000_000n,
    },
    "optimism-rpc",
  ),
  Base: withPublicNode(
    {
      ...base,
      network: "Base",
      defaultMarketConfigurators: new AddressMap<CuratorName>(),
      rwaFactories: [] as Address[],
      isPublic: false,
      wellKnownToken: {
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        symbol: "USDC",
      },
      gasLimit: 550_000_000n,
    },
    "base-rpc",
  ),
  Sonic: withPublicNode(
    defineChain({
      ...sonic,
      network: "Sonic",
      defaultMarketConfigurators: AddressMap.fromRecord<CuratorName>({
        "0x8FFDd1F1433674516f83645a768E8900A2A5D076": "Chaos Labs",
      }),
      rwaFactories: [] as Address[],
      isPublic: true,
      blockExplorers: {
        default: {
          name: "Sonic Explorer",
          url: "https://sonicscan.org",
          apiUrl: "https://api.sonicscan.org/api",
        },
      },
      wellKnownToken: {
        address: "0x29219dd400f2Bf60E5a23d13Be72B486D4038894",
        symbol: "USDC",
      },
      gasLimit: 550_000_000n,
      firstBlock: 9779380n,
    }),
    "sonic-rpc",
  ),
  MegaETH: defineChain({
    ...megaeth,
    network: "MegaETH",
    defaultMarketConfigurators: new AddressMap<CuratorName>(),
    rwaFactories: [] as Address[],
    isPublic: false,
    wellKnownToken: {
      address: "0xFAfDdbb3FC7688494971a79cc65DCa3EF82079E7",
      symbol: "USDm",
    },
    gasLimit: 550_000_000n,
  }),
  // NOTE: Monad chain configs should be updated once the public mainnet is available
  Monad: defineChain({
    ...monad,
    blockExplorers: {
      default: {
        name: "Monadscan",
        url: "https://monadscan.com/",
      },
    },
    network: "Monad",
    defaultMarketConfigurators: AddressMap.fromRecord<CuratorName>({
      "0x16956912813ab9a38d95730b52a8cf53e860a7c5": "Tulipa",
      "0x7c6ee1bf9c1eb3ee55bdbdc1e8d0317aab718e0a": "UltraYield",
    }),
    underlyingAssetTypes: AddressMap.fromRecord<AssetType>({
      "0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A": "ETH", // [WMON]
      "0x754704Bc059F8C67012fEd69BC8A327a5aafb603": "Stable", // [USDC]
      "0xe7cd86e13AC4309349F30B3435a9d337750fC82D": "Stable", // [USDT0]
      "0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a": "Stable", // [AUSD]
    }),
    legacyStrategyTargets: AddressMap.fromRecord<Address>({
      "0xd9b000e3f14ea2dd27be07859ab3ab9e0ef62dfa":
        "0x1c8ee940b654bfced403f2a44c1603d5be0f50fa",
      "0x01b3b3c03269e2fdf654676f2e57a9e325a55e51":
        "0x1c8ee940b654bfced403f2a44c1603d5be0f50fa",
    }),
    sunsetPools: new AddressSet([
      "0x09cA6b76276eC0682adb896418b99CB7E44a58A0",
      "0x34752948B0dc28969485Df2066fFE86D5dc36689",
      "0x164A35F31e4E0F6c45D500962a6978D2cbD5a16b",
    ]),
    sunsetStrategies: new AddressSet([
      "0xA1F05494Dab74Eb9C352C3A042836579fE168aa7",
      "0xb8C7D72CDD00F44390aDF6f0756AB11fd19723B5",
      "0xE01FEeBC233ee715592D056B0a53A4F316a62d1A",
      "0x5b5b351d70A67d18300cD89Db04089Aa37b271d2",
      "0xb21f766c193541305C18cE146DCD3Fdf642b40eF",
      "0x04620081bb818B8CD3996943D0A4a37Dbf296cF4",
      "0x5452971Fc17d025a1AFFDd5F7a44CCDD1BF0524C",
      "0x7ea06087C63568f1071c6BEA3AeB51e070ec68B9",
    ]),
    rwaFactories: [] as Address[],
    isPublic: true,
    wellKnownToken: {
      address: "0xe7cd86e13AC4309349F30B3435a9d337750fC82D",
      symbol: "USDT0",
    },
    tokenPrettyNames: AddressMap.fromRecord<string>({
      "0x942644106b073e30d72c2c5d7529d5c296ea91ab": "Curve AUSD/USDC/USDT0",
    }),
    firstBlock: 34650262n,
    gasLimit: 150_000_000n,
  }),
  Berachain: withPublicNode(
    {
      ...berachain,
      network: "Berachain",
      defaultMarketConfigurators: new AddressMap<CuratorName>(),
      rwaFactories: [] as Address[],
      isPublic: false,
      blockExplorers: {
        default: {
          name: "Berascan",
          url: "https://berascan.com",
          apiUrl: "https://api.berascan.com/api",
        },
      },
      wellKnownToken: {
        address: "0x549943e04f40284185054145c6e4e9568c1d3241",
        symbol: "USDC.e",
      },
      gasLimit: 550_000_000n,
    },
    "berachain-rpc",
  ),
  Avalanche: withPublicNode(
    {
      ...avalanche,
      network: "Avalanche",
      defaultMarketConfigurators: new AddressMap<CuratorName>(),
      rwaFactories: [] as Address[],
      isPublic: false,
      wellKnownToken: {
        address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
        symbol: "USDC",
      },
      gasLimit: 550_000_000n,
    },
    "avalanche-c-chain-rpc",
  ),
  BNB: withPublicNode(
    {
      ...bsc,
      network: "BNB",
      defaultMarketConfigurators: AddressMap.fromRecord<CuratorName>({
        "0x19037a281025b83fa37e3264b77af523ff87a3a4": "Chaos Labs",
        "0x92dc4ee43e9b207e16fbf3fd1a6933563c0a0d35": "Re7",
      }),
      testMarketConfigurators: new AddressMap<CuratorName>(),
      rwaFactories: [] as Address[],
      isPublic: true,
      wellKnownToken: {
        address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
        symbol: "USDC",
      },
      firstBlock: 48761804n,
      gasLimit: 550_000_000n,
    },
    "bsc-rpc",
  ),
  WorldChain: defineChain({
    ...worldchain,
    network: "WorldChain",
    defaultMarketConfigurators: new AddressMap<CuratorName>(),
    rwaFactories: [] as Address[],
    isPublic: false,
    wellKnownToken: {
      address: "0x79a02482a880bce3f13e09da970dc34db4cd24d1",
      symbol: "USDC",
    },
    // TODO: has no block explorer API
    gasLimit: 550_000_000n,
  }),
  Etherlink: defineChain({
    ...etherlink,
    network: "Etherlink",
    defaultMarketConfigurators: AddressMap.fromRecord<CuratorName>({
      "0x577424f0e6f50db668cc1bc76babb87e36732291": "Re7",
    }),
    underlyingAssetTypes: AddressMap.fromRecord<AssetType>({
      "0x796Ea11Fa2dD751eD01b53C372fFDB4AAa8f00F9": "Stable", // [USDC]
    }),
    legacyStrategyTargets: AddressMap.fromRecord<Address>({
      "0xf6f9bb0be5128bf6d02de00bba9c34b132c2c8ee":
        "0x2247b5a46bb79421a314ab0f0b67ffd11dd37ee4",
    }),
    rwaFactories: [] as Address[],
    isPublic: true,
    wellKnownToken: {
      address: "0x796Ea11Fa2dD751eD01b53C372fFDB4AAa8f00F9",
      symbol: "USDC",
    },
    tokenPrettyNames: AddressMap.fromRecord<string>({
      "0x5d37f9b272ca7cda2a05245b9a503746eefac88f": "Curve mRe7Yield/USDC",
    }),
    firstBlock: 16672963n,
    gasLimit: 550_000_000n,
  }),
  Hemi: defineChain({
    ...hemi,
    network: "Hemi",
    defaultMarketConfigurators: AddressMap.fromRecord<CuratorName>({
      "0xc9961b8a0c763779690577f2c76962c086af2fe3": "Invariant Group",
    }),
    rwaFactories: [] as Address[],
    isPublic: true,
    wellKnownToken: {
      address: "0xad11a8BEb98bbf61dbb1aa0F6d6F2ECD87b35afA",
      symbol: "USDC.e",
    },
    contracts: {
      multicall3: {
        address: "0xcA11bde05977b3631167028862bE2a173976CA11",
        blockCreated: 484490,
      },
    },
    gasLimit: 550_000_000n,
  }),
  Lisk: defineChain({
    ...lisk,
    network: "Lisk",
    defaultMarketConfigurators: AddressMap.fromRecord<CuratorName>({
      "0x25778dbf0e56b7feb8358c4aa2f6f9e19a1c145a": "Re7",
    }),
    rwaFactories: [] as Address[],
    isPublic: true,
    wellKnownToken: {
      address: "0xF242275d3a6527d877f2c927a82D9b057609cc71",
      symbol: "USDC.e",
    },
    gasLimit: 550_000_000n,
  }),
  Plasma: defineChain({
    ...plasma,
    network: "Plasma",
    defaultMarketConfigurators: AddressMap.fromRecord<CuratorName>({
      "0x7a133fbd01736fd076158307c9476cc3877f1af5": "Invariant Group",
      "0x4bce62622be621ce036691de98afcab0e41a77a3": "UltraYield",
      "0xce1cf71a28837daaa7b92d00ca4ef2fd649c2a67": "Hyperithm",
      "0x9655f82b585b11cee8a05576ed8efcf755cec04b": "TelosC",
    }),
    underlyingAssetTypes: AddressMap.fromRecord<AssetType>({
      "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb": "Stable", // [USDT0]
      "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34": "Stable", // [USDe]
    }),
    sunsetPools: new AddressSet([
      "0x76309A9a56309104518847BbA321c261B7B4a43f",
      "0x4273EEa5ffF61d8ee0C397cCcFCc8cF4B518221f",
      "0x53E4e9b8766969c43895839CC9c673bb6bC8Ac97",
      "0xB74760FD26400030620027DD29D19d74D514700e",
      "0xBa21b2807fcF136F1d61F40341d6Fb8F2535615F",
    ]),
    rwaFactories: [] as Address[],
    isPublic: true,
    wellKnownToken: {
      address: "0x5d72a9d9a9510cd8cbdba12ac62593a58930a948",
      symbol: "aPlaUSDT0",
    },
    contracts: {
      multicall3: {
        address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      },
    },
    firstBlock: 670913n,
    gasLimit: 550_000_000n,
  }),
  Somnia: defineChain({
    ...somnia,
    contracts: {
      multicall3: {
        address: "0x5e44F178E8cF9B2F5409B6f18ce936aB817C5a11",
        blockCreated: 38516341,
      },
    },
    blockTime: 200,
    network: "Somnia",
    defaultMarketConfigurators: AddressMap.fromRecord<CuratorName>({
      "0x1ca8b92aa7233a9f8f7ba031ac45c878141adff0": "Invariant Group",
    }),
    underlyingAssetTypes: AddressMap.fromRecord<AssetType>({
      "0x28BEc7E30E6faee657a03e19Bf1128AaD7632A00": "Stable", // [USDC.e]
      "0x046EDe9564A72571df6F5e44d0405360c0f4dCab": "ETH", // [WSOMI]
    }),
    rwaFactories: [] as Address[],
    sunsetPools: new AddressSet([
      "0xa561d6D554fB3637F590c4D73527fe19525d596b",
      "0x6f652fbCfC2107ef9C99456311B5650cd52D6419",
    ]),
    isPublic: true,
    wellKnownToken: {
      address: "0x67B302E35Aef5EEE8c32D934F5856869EF428330",
      symbol: "USDT",
    },
    firstBlock: 147687380n,
    gasLimit: 550_000_000n,
  }),
};

const networkByChainId = Object.values(chains).reduce<
  Record<number, NetworkType>
>((acc, chain) => {
  acc[chain.id] = chain.network;
  return acc;
}, {});

/**
 * Returns the {@link GearboxChain} for a given chain ID or network type label.
 *
 * @param chainIdOrNetworkType - Numeric chain ID, bigint chain ID, or a {@link NetworkType} string.
 * @throws If the chain ID / network type is not supported.
 **/
export function getChain(
  chainIdOrNetworkType: number | bigint | NetworkType,
): GearboxChain {
  const network =
    typeof chainIdOrNetworkType === "string"
      ? chainIdOrNetworkType
      : getNetworkType(Number(chainIdOrNetworkType));
  const chain = chains[network];
  if (!chain) {
    throw new Error(`Unsupported network: ${network}`);
  }
  return chain;
}

/**
 * Resolves a numeric chain ID to its {@link NetworkType} label.
 *
 * @param chainId - Numeric or bigint chain ID.
 * @throws If the chain ID does not correspond to a supported network.
 **/
export function getNetworkType(chainId: number | bigint): NetworkType {
  const network = networkByChainId[Number(chainId)];
  if (!network) throw new Error(`Unsupported network with chainId ${chainId}`);
  return network;
}

/**
 * Chain IDs of chains named as {@link NetworkType} labels or as IDs already,
 * e.g. `sdk.opportunities.list({ chainIds: toChainIds(["Mainnet"]) })`.
 *
 * @param scope - Chains as labels, or already as IDs.
 * @throws If any entry is not a supported network.
 **/
export function toChainIds(scope: NetworkType[] | ChainId[]): ChainId[] {
  return scope.map(entry => getChain(entry).id);
}

/**
 * Type guard that checks whether a chain ID belongs to a supported Gearbox network.
 *
 * @param chainId - Numeric chain ID, or `undefined`.
 **/
export function isSupportedNetwork(
  chainId: number | undefined,
): chainId is number {
  if (chainId === undefined) return false;
  return !!networkByChainId[chainId];
}

/**
 * Returns `true` if the given network or chain ID has a publicly deployed Gearbox instance.
 *
 * @param networkOrChainId - {@link NetworkType} string or numeric chain ID.
 **/
export function isPublicNetwork(
  networkOrChainId: NetworkType | number | bigint,
): boolean {
  return Object.values(chains).some(c => {
    if (typeof networkOrChainId === "string") {
      return c.network === networkOrChainId && c.isPublic;
    }
    return c.id === Number(networkOrChainId) && c.isPublic;
  });
}

/**
 * Looks up the {@link CuratorName} name for a market configurator address.
 *
 * Searches default and test market configurators across all chains, or
 * a single network if provided.
 *
 * @param marketConfigurator - On-chain market configurator address.
 * @param network - Optional network to restrict the search to.
 * @returns The curator name, or `undefined` if not found.
 **/
export function getCuratorName(
  marketConfigurator: Address,
  network?: NetworkType,
): CuratorName | undefined {
  const chainz = network ? [chains[network]] : Object.values(chains);
  for (const c of chainz) {
    const name =
      c.defaultMarketConfigurators.get(marketConfigurator) ??
      c.testMarketConfigurators?.get(marketConfigurator);
    if (name) {
      return name;
    }
  }
  return undefined;
}

/**
 * Finds the market configurator address for a given curator on a network.
 *
 * @param curator - Curator name to search for.
 * @param network - Network to search in.
 * @returns The market configurator address, or `undefined` if the curator
 *   has no configurator on this network.
 **/
export function findCuratorMarketConfigurator(
  curator: CuratorName,
  network: NetworkType,
): Address | undefined {
  const { defaultMarketConfigurators, testMarketConfigurators } =
    chains[network];
  for (const [address, name] of defaultMarketConfigurators.entries()) {
    if (name === curator) {
      return address;
    }
  }
  for (const [address, name] of testMarketConfigurators?.entries() ?? []) {
    if (name === curator) {
      return address;
    }
  }
  return undefined;
}

/**
 * Looks up the {@link AssetType} of a token in hardcoded classifier.
 * Not all tokens are classified, only underlyings, so the default answer is `undefined`.
 *
 * @param token - Token address
 * @param network - Network the token lives on.
 * @returns The asset type, or `undefined` when the token is not classified
 **/
export function getAssetType(
  token: Address,
  network: NetworkType,
): AssetType | undefined {
  return chains[network].underlyingAssetTypes?.get(token);
}

/**
 * Checks whether a token represents a real-world asset, per the curated list of
 * a network.
 *
 * @param token - Token address.
 * @param network - Network the token lives on.
 **/
export function isRWAToken(token: Address, network: NetworkType): boolean {
  return !!chains[network].rwaTokens?.has(token);
}

/**
 * Checks whether a pool is on the sunset list of a network.
 *
 * @param pool - Pool address.
 * @param network - Network the pool lives on.
 **/
export function isSunsetPool(pool: Address, network: NetworkType): boolean {
  return !!chains[network].sunsetPools?.has(pool);
}

/**
 * Checks whether a credit manager is on the sunset list of a network.
 *
 * @param creditManager - Credit manager address.
 * @param network - Network the credit manager lives on.
 **/
export function isSunsetStrategy(
  creditManager: Address,
  network: NetworkType,
): boolean {
  return !!chains[network].sunsetStrategies?.has(creditManager);
}

/**
 * Hardcoded target collateral of a legacy credit manager, or `undefined` when
 * the manager is not in the table and the on-chain rule should apply.
 *
 * @param creditManager - Credit manager address.
 * @param network - Chain id or {@link NetworkType} label.
 **/
export function getLegacyStrategyTarget(
  creditManager: Address,
  network: number | bigint | NetworkType,
): Address | undefined {
  return getChain(network).legacyStrategyTargets?.get(creditManager);
}

/**
 * Hardcoded target collateral of an already-existing credit account, or
 * `undefined` when the account is not in the table and the credit manager's
 * target should apply.
 *
 * @param creditAccount - Credit account address.
 * @param network - Chain id or {@link NetworkType} label.
 **/
export function getAccountTargetCollateral(
  creditAccount: Address,
  network: number | bigint | NetworkType,
): Address | undefined {
  return getChain(network).accountTargetCollaterals?.get(creditAccount);
}
