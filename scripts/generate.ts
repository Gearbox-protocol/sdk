import * as fs from "fs";

import {
  AdapterInterface,
  CHAINS,
  contractParams,
  contractsByNetwork,
  CurveLPTokenData,
  LPTokens,
  lpTokens,
  NOT_DEPLOYED,
  OracleType,
  priceFeedsByNetwork,
  supportedChains,
  SupportedContract,
  SupportedToken,
  supportedTokens,
  tokenDataByNetwork,
  TokenType,
} from "../src";

function safeEnum(t: string): string {
  if (!isNaN(parseInt(t.charAt(0), 10))) {
    return `_${t}`;
  }
  return t;
}

const tokens: Array<SupportedToken> = Object.keys(supportedTokens).filter(
  t => tokenDataByNetwork.Mainnet[t as SupportedToken] !== "",
) as Array<SupportedToken>;

/// ---------------- Tokens.sol -----------------------------

const tokensEnum = tokens.map(t => safeEnum(t)).join(",\n");
let file = fs.readFileSync("./bindings/Tokens.sol").toString();
file = file.replace(
  "// $TOKENS$",
  `enum Tokens {
  NO_TOKEN,
  cDAI,
  cUSDC,
  cUSDT,
  cLINK,
  LUNA,\n${tokensEnum}}\n`,
);
fs.writeFileSync("./contracts/Tokens.sol", file);

/// ---------------- TokensDataLive.sol ---------------------

let tokenAddresses = "";

for (const chain of supportedChains) {
  const chainId = CHAINS[chain];
  tokenAddresses += tokens
    .map(t => {
      const addr = tokenDataByNetwork[chain][t];

      if (addr !== NOT_DEPLOYED) {
        return `tokenDataByNetwork[${chainId}].push(TokenData({ id: Tokens.${safeEnum(
          t,
        )}, addr: ${addr}, symbol: "${t}", tokenType: TokenType.${
          TokenType[supportedTokens[t].type]
        } }));`;
      } else return "";
    })

    .join("\n");
}

file = fs.readFileSync("./bindings/TokensDataLive.sol").toString();
file = file.replace("// $TOKEN_ADDRESSES$", tokenAddresses);
fs.writeFileSync("./contracts/TokensData.sol", file);

/// ---------------- PriceFeedType.sol -----------------------------

const PriceFeedTypeEnum = Object.values(OracleType)
  .filter(v => isNaN(Number(v)))
  .map(t => safeEnum(t as string))
  .join(",\n");

file = fs.readFileSync("./bindings/PriceFeedType.sol").toString();
file = file.replace(
  "// $ENUM_PRICEFEEDTYPE$",
  `enum PriceFeedType{\n${PriceFeedTypeEnum}\n}`,
);
fs.writeFileSync("./contracts/PriceFeedType.sol", file);

/// ---------------- PriceFeedDataLive.sol -----------------------------
let chainlinkPriceFeeds = "";

for (const chain of supportedChains) {
  const chainId = CHAINS[chain];

  chainlinkPriceFeeds += Object.entries(priceFeedsByNetwork)
    .filter(([, oracleData]) => oracleData.type === OracleType.CHAINLINK_ORACLE)
    .map(([token, oracleData]) => {
      if (oracleData.type === OracleType.CHAINLINK_ORACLE) {
        const address: string | undefined = oracleData.address[chain];

        return address && address !== NOT_DEPLOYED
          ? `chainlinkPriceFeedsByNetwork[${chainId}].push(ChainlinkPriceFeedData({
    token: Tokens.${safeEnum(token as SupportedToken)},
    priceFeed: ${address}
  }));`
          : "";
      }

      return "";
    })
    .filter(t => t !== "")
    .join("\n");
}

const zeroPriceFeeds = Object.entries(priceFeedsByNetwork)
  .filter(([, oracleData]) => oracleData.type === OracleType.ZERO_ORACLE)
  .map(
    ([token]) =>
      `zeroPriceFeeds.push(SingeTokenPriceFeedData({ token: Tokens.${safeEnum(
        token as SupportedToken,
      )} }));`,
  )
  .join("\n");

const curvePriceFeeds = Object.entries(priceFeedsByNetwork)
  .filter(
    ([, oracleData]) =>
      oracleData.type === OracleType.CURVE_2LP_ORACLE ||
      oracleData.type === OracleType.CURVE_3LP_ORACLE ||
      oracleData.type === OracleType.CURVE_4LP_ORACLE,
  )
  .map(([token, oracleData]) => {
    if (
      oracleData.type === OracleType.CURVE_2LP_ORACLE ||
      oracleData.type === OracleType.CURVE_3LP_ORACLE ||
      oracleData.type === OracleType.CURVE_4LP_ORACLE
    ) {
      const assets = oracleData.assets
        .map(a => `Tokens.${safeEnum(a)}`)
        .join(", ");

      return `curvePriceFeeds.push(CurvePriceFeedData({
          lpToken: Tokens.${safeEnum(token as SupportedToken)},
          assets: TokensLib.arrayOf(${assets}),
          pool: Contracts.${
            (lpTokens[token as LPTokens] as CurveLPTokenData).pool
          }
        }));`;
    }
    return "";
  })
  .filter(t => t !== "")
  .join("\n");

const curveLikePriceFeeds = Object.entries(priceFeedsByNetwork)
  .filter(
    ([token, oracleData]) =>
      oracleData.type === OracleType.LIKE_CURVE_LP_TOKEN_ORACLE &&
      tokenDataByNetwork.Mainnet[token as SupportedToken] !== "",
  )
  .map(([token, oracleData]) => {
    if (oracleData.type === OracleType.LIKE_CURVE_LP_TOKEN_ORACLE) {
      const symbol = oracleData.curveSymbol;
      if (tokenDataByNetwork.Mainnet[token as SupportedToken] !== "") {
        return `likeCurvePriceFeeds.push(CurveLikePriceFeedData({
        lpToken: Tokens.${safeEnum(token as SupportedToken)},
        curveToken: Tokens.${safeEnum(symbol as SupportedToken)}
      }));`;
      }
    }
    return "";
  })
  .filter(t => t !== "")
  .join("\n");

let boundedPriceFeeds = "";

for (const chain of supportedChains) {
  const chainId = CHAINS[chain];

  boundedPriceFeeds += Object.entries(priceFeedsByNetwork)
    .filter(
      ([token, oracleData]) =>
        oracleData.type === OracleType.BOUNDED_ORACLE &&
        tokenDataByNetwork[chain][token as SupportedToken] !== "",
    )
    .map(([token, oracleData]) => {
      if (oracleData.type === OracleType.BOUNDED_ORACLE) {
        const targetPriceFeed: string | undefined =
          oracleData.targetPriceFeed[chain];

        return targetPriceFeed
          ? `boundedPriceFeedsByNetwork[${chainId}].push(BoundedPriceFeedData({
  token: Tokens.${safeEnum(token as SupportedToken)},
  priceFeed: ${targetPriceFeed},
  upperBound: ${oracleData.upperBound}
}));`
          : "";
      }
      return "";
    })
    .filter(t => t !== "")
    .join("\n");
}

let compositePriceFeeds = "";

for (const chain of supportedChains) {
  const chainId = CHAINS[chain];

  compositePriceFeeds += Object.entries(priceFeedsByNetwork)
    .filter(
      ([token, oracleData]) =>
        oracleData.type === OracleType.COMPOSITE_ORACLE &&
        tokenDataByNetwork[chain][token as SupportedToken] !== "",
    )
    .map(([token, oracleData]) => {
      if (
        oracleData.type === OracleType.COMPOSITE_ORACLE &&
        oracleData.targetToBasePriceFeed[chain] !== NOT_DEPLOYED &&
        oracleData.baseToUsdPriceFeed[chain] !== NOT_DEPLOYED
      ) {
        const targetToBaseFeed: string | undefined =
          oracleData.targetToBasePriceFeed[chain];
        const baseToUSDFeed: string | undefined =
          oracleData.baseToUsdPriceFeed[chain];

        return targetToBaseFeed && baseToUSDFeed
          ? `compositePriceFeedsByNetwork[${chainId}].push(CompositePriceFeedData({
        token: Tokens.${safeEnum(token as SupportedToken)},
        targetToBaseFeed: ${targetToBaseFeed},
        baseToUSDFeed: ${baseToUSDFeed}
      }));`
          : "";
      }
      return "";
    })
    .filter(t => t !== "")
    .join("\n");
}

const yearnPriceFeeds = Object.entries(priceFeedsByNetwork)
  .filter(([, oracleData]) => oracleData.type === OracleType.YEARN_ORACLE)
  .map(
    ([token]) =>
      `yearnPriceFeeds.push(SingeTokenPriceFeedData({ token: Tokens.${safeEnum(
        token as SupportedToken,
      )} }));`,
  )
  .join("\n");

const wstethPriceFeed = Object.entries(priceFeedsByNetwork)
  .filter(([, oracleData]) => oracleData.type === OracleType.WSTETH_ORACLE)
  .map(
    ([token]) =>
      `wstethPriceFeed = SingeTokenPriceFeedData({ token: Tokens.${safeEnum(
        token as SupportedToken,
      )} });`,
  )
  .join("\n");

file = fs.readFileSync("./bindings/PriceFeedDataLive.sol").toString();

file = file.replace("// $CHAINLINK_PRICE_FEEDS", chainlinkPriceFeeds);

file = file.replace("// $ZERO_PRICE_FEEDS", zeroPriceFeeds);
file = file.replace("// $CURVE_PRICE_FEEDS", curvePriceFeeds);
file = file.replace("// $CURVE_LIKE_PRICE_FEEDS", curveLikePriceFeeds);

file = file.replace("// $BOUNDED_PRICE_FEEDS", boundedPriceFeeds);
file = file.replace("// $COMPOSITE_PRICE_FEEDS", compositePriceFeeds);

file = file.replace("// $YEARN_PRICE_FEEDS", yearnPriceFeeds);
file = file.replace("// $WSTETH_PRICE_FEED", wstethPriceFeed);

fs.writeFileSync("./contracts/PriceFeedDataLive.sol", file);

/// ---------------- SupportedContracts.sol -----------------------------

const contracts: Array<SupportedContract> = Object.keys(
  contractsByNetwork.Mainnet,
) as Array<SupportedContract>;

const contractsEnum = `enum Contracts {NO_CONTRACT, ${contracts.join(",\n")} }`;

let contractAddresses = `cd = new  ContractData[](${contracts.length});`;
contractAddresses += contracts
  .map((t, num) => {
    if (contractsByNetwork.Mainnet[t] !== NOT_DEPLOYED) {
      return `cd[${num}] = ContractData({ id: Contracts.${t}, addr:  ${contractsByNetwork.Mainnet[t]}, name: "${t}" });`;
    } else return "";
  })
  .join("\n");

file = fs.readFileSync("./bindings/SupportedContracts.sol").toString();

file = file.replace("// $CONTRACTS_ENUM$", contractsEnum);
file = file.replace("// $CONTRACTS_ADDRESSES$", contractAddresses);

fs.writeFileSync("./contracts/SupportedContracts.sol", file);

/// ---------------- AdapterType.sol -----------------------------

const adapterTypeEnum = Object.values(AdapterInterface)
  .filter(v => isNaN(Number(v)))
  .map(t => safeEnum(t as string))
  .join(",\n");

file = fs.readFileSync("./bindings/AdapterType.sol").toString();
file = file.replace(
  "// $ENUM_ADAPTERTYPE$",
  `enum AdapterType{\n${adapterTypeEnum}\n}`,
);
fs.writeFileSync("./contracts/AdapterType.sol", file);

/// ---------------- AdapterData.sol -----------------------------
let adapters = Object.entries(contractParams)
  .filter(
    ([, contractParam]) =>
      contractParam.type === AdapterInterface.UNISWAP_V2_ROUTER ||
      contractParam.type === AdapterInterface.UNISWAP_V3_ROUTER ||
      contractParam.type === AdapterInterface.YEARN_V2 ||
      contractParam.type === AdapterInterface.CONVEX_V1_BOOSTER ||
      contractParam.type === AdapterInterface.LIDO_V1 ||
      contractParam.type === AdapterInterface.UNIVERSAL ||
      contractParam.type === AdapterInterface.LIDO_WSTETH_V1,
  )
  .map(
    ([contract, contractParam]) =>
      `simpleAdapters.push(SimpleAdapter({targetContract:  Contracts.${contract},
        adapterType: AdapterType.${AdapterInterface[contractParam.type]}}));`,
  )
  .join("\n");

adapters += Object.entries(contractParams)
  .filter(
    ([, contractParam]) =>
      contractParam.type === AdapterInterface.CURVE_V1_2ASSETS ||
      contractParam.type === AdapterInterface.CURVE_V1_3ASSETS ||
      contractParam.type === AdapterInterface.CURVE_V1_4ASSETS,
  )
  .map(([contract, contractParam]) => {
    if (
      contractParam.type === AdapterInterface.CURVE_V1_2ASSETS ||
      contractParam.type === AdapterInterface.CURVE_V1_3ASSETS ||
      contractParam.type === AdapterInterface.CURVE_V1_4ASSETS
    ) {
      if (contractParam.lpToken === "GEAR") return "";
      const basePool: SupportedContract | "NO_CONTRACT" =
        contractParam.tokens.includes("3Crv")
          ? "CURVE_3CRV_POOL"
          : "NO_CONTRACT";
      return `curveAdapters.push(CurveAdapter({targetContract:  Contracts.${contract},
  adapterType: AdapterType.${
    AdapterInterface[contractParam.type]
  }, lpToken: Tokens.${safeEnum(
        contractParam.lpToken,
      )}, basePool: Contracts.${basePool}}));`;
    }

    return "";
  })
  .join("\n");

adapters += Object.entries(contractParams)
  .filter(
    ([, contractParam]) =>
      contractParam.type === AdapterInterface.CURVE_V1_STECRV_POOL,
  )
  .map(([contract, contractParam]) => {
    if (contractParam.type === AdapterInterface.CURVE_V1_STECRV_POOL) {
      return `curveStEthAdapter = CurveStETHAdapter({curveETHGateway:  Contracts.${contract},
        adapterType: AdapterType.${
          AdapterInterface[contractParam.type]
        }, lpToken: Tokens.${safeEnum(contractParam.lpToken)}});`;
    }
    return "";
  })
  .join("\n");

adapters += Object.entries(contractParams)
  .filter(
    ([, contractParam]) =>
      contractParam.type === AdapterInterface.CURVE_V1_WRAPPER,
  )
  .map(([contract, contractParam]) => {
    if (contractParam.type === AdapterInterface.CURVE_V1_WRAPPER) {
      return `curveWrappers.push(CurveWrapper({targetContract:  Contracts.${contract},
  adapterType: AdapterType.${
    AdapterInterface[contractParam.type]
  }, lpToken: Tokens.${safeEnum(contractParam.lpToken)}, nCoins: ${
        contractParam.tokens.length
      }}));`;
    }
    return "";
  })
  .join("\n");

adapters += Object.entries(contractParams)
  .filter(
    ([, contractParam]) =>
      contractParam.type === AdapterInterface.CONVEX_V1_BASE_REWARD_POOL &&
      tokens.includes(contractParam.stakedToken),
  )
  .map(([contract, contractParam]) => {
    if (contractParam.type === AdapterInterface.CONVEX_V1_BASE_REWARD_POOL) {
      return `convexBasePoolAdapters.push(ConvexBasePoolAdapter({targetContract:  Contracts.${contract},
  adapterType: AdapterType.${
    AdapterInterface[contractParam.type]
  }, stakedToken: Tokens.${safeEnum(contractParam.stakedToken)}}));`;
    }
    return "";
  })
  .join("\n");

file = fs.readFileSync("./bindings/AdapterData.sol").toString();

file = file.replace("// $ADAPTERS_LIST", adapters);

fs.writeFileSync("./contracts/AdapterData.sol", file);
