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

class BindingsGenerator {
  tokens: Array<SupportedToken>;

  constructor() {
    this.tokens = Object.keys(supportedTokens) as Array<SupportedToken>;
  }

  generateTokens() {
    const tokensEnum = this.tokens.map(t => this.safeEnum(t)).join(",\n");
    let data = `enum Tokens {${tokensEnum}}`;

    const tokenTypeEnum = Object.values(TokenType)
      .filter(v => isNaN(Number(v)))
      .map(t => this.safeEnum(t as string))
      .join(",\n");

    data += `enum TokenType {${tokenTypeEnum}}`;

    this.makeBindings("Tokens.sol", data);
  }

  /// ---------------- TokensDataLive.sol ---------------------

  generateTokenData() {
    let data = "";

    for (const chain of supportedChains) {
      const chainId = CHAINS[chain];
      data += this.tokens
        .map(t => {
          const addr = tokenDataByNetwork[chain][t];

          if (addr !== NOT_DEPLOYED) {
            return `tokenDataByNetwork[${chainId}].push(TokenData({ id: ${this.tokensEnum(
              t,
            )}, addr: ${addr}, symbol: "${t}", tokenType: TokenType.${
              TokenType[supportedTokens[t].type]
            } }));`;
          } else return "";
        })

        .join("\n");
    }

    this.makeBindings("TokensData.sol", data);
  }

  /// ---------------- PriceFeedType.sol -----------------------------
  generatePriceFeedType() {
    const priceFeedTypeEnum = Object.values(OracleType)
      .filter(v => isNaN(Number(v)))
      .map(t => this.safeEnum(t as string))
      .join(",\n");

    const data = `enum PriceFeedType {${priceFeedTypeEnum}}`;

    this.makeBindings("PriceFeedType.sol", data);
  }

  /// ---------------- PriceFeedDataLive.sol -----------------------------
  generatePriceFeedData() {
    let data = "";

    for (const chain of supportedChains) {
      const chainId = CHAINS[chain];

      data += Object.entries(priceFeedsByNetwork)

        .map(([token, oracleData]) => {
          if (oracleData.type === OracleType.CHAINLINK_ORACLE) {
            const address: string = oracleData.address[chain];

            return address && address !== NOT_DEPLOYED
              ? `chainlinkPriceFeedsByNetwork[${chainId}].push(ChainlinkPriceFeedData({
    token: ${this.tokensEnum(token)},
    priceFeed: ${address}
  }));`
              : "";
          }

          return "";
        })
        .filter(t => t !== "")
        .join("\n");
    }

    data += this.generateSingeTokenPriceFeedData(
      "zeroPriceFeeds",
      OracleType.ZERO_ORACLE,
    );

    data += Object.entries(priceFeedsByNetwork)

      .map(([token, oracleData]) => {
        if (
          oracleData.type === OracleType.CURVE_2LP_ORACLE ||
          oracleData.type === OracleType.CURVE_3LP_ORACLE ||
          oracleData.type === OracleType.CURVE_4LP_ORACLE
        ) {
          const assets = oracleData.assets
            .map(t => this.tokensEnum(t))
            .join(", ");

          return `curvePriceFeeds.push(CurvePriceFeedData({
          lpToken: ${this.tokensEnum(token)},
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

    data += Object.entries(priceFeedsByNetwork)
      .map(([token, oracleData]) => {
        if (oracleData.type === OracleType.THE_SAME_AS) {
          const symbol = oracleData.token;
          return `theSamePriceFeeds.push(TheSamePriceFeedData({
        token: ${this.tokensEnum(token)},
        tokenHasSamePriceFeed: ${this.tokensEnum(symbol as SupportedToken)}
      }));`;
        }
        return "";
      })
      .filter(t => t !== "")
      .join("\n");

    for (const chain of supportedChains) {
      const chainId = CHAINS[chain];

      data += Object.entries(priceFeedsByNetwork)

        .map(([token, oracleData]) => {
          if (oracleData.type === OracleType.BOUNDED_ORACLE) {
            const targetPriceFeed: string | undefined =
              oracleData.targetPriceFeed[chain];

            return targetPriceFeed !== NOT_DEPLOYED
              ? `boundedPriceFeedsByNetwork[${chainId}].push(BoundedPriceFeedData({
  token: ${this.tokensEnum(token)},
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

    for (const chain of supportedChains) {
      const chainId = CHAINS[chain];

      data += Object.entries(priceFeedsByNetwork)

        .map(([token, oracleData]) => {
          if (
            oracleData.type === OracleType.COMPOSITE_ORACLE &&
            oracleData.targetToBasePriceFeed[chain] !== NOT_DEPLOYED &&
            oracleData.baseToUsdPriceFeed[chain] !== NOT_DEPLOYED
          ) {
            const targetToBaseFeed = oracleData.targetToBasePriceFeed[chain];
            const baseToUSDFeed = oracleData.baseToUsdPriceFeed[chain];

            return `compositePriceFeedsByNetwork[${chainId}].push(CompositePriceFeedData({
        token: ${this.tokensEnum(token)},
        targetToBaseFeed: ${targetToBaseFeed},
        baseToUSDFeed: ${baseToUSDFeed}
      }));`;
          }
          return "";
        })
        .filter(t => t !== "")
        .join("\n");
    }

    data += this.generateSingeTokenPriceFeedData(
      "yearnPriceFeeds",
      OracleType.YEARN_ORACLE,
    );

    data += this.generateSingeTokenPriceFeedData(
      "wstethPriceFeed",
      OracleType.WSTETH_ORACLE,
    );

    data += this.generateGenericLPPriceFeedData(
      "wrappedAaveV2PriceFeeds",
      OracleType.WRAPPED_AAVE_V2_ORACLE,
    );

    data += this.generateGenericLPPriceFeedData(
      "compoundV2PriceFeeds",
      OracleType.COMPOUND_V2_ORACLE,
    );

    data += this.generateGenericLPPriceFeedData(
      "erc4626PriceFeeds",
      OracleType.ERC4626_VAULT_ORACLE,
    );

    this.makeBindings("PriceFeedDataLive.sol", data);
  }

  protected generateSingeTokenPriceFeedData(
    varName: string,
    oracleType: OracleType,
  ): string {
    return Object.entries(priceFeedsByNetwork)
      .filter(([, oracleData]) => oracleData.type === oracleType)
      .map(([token]) => {
        const structure = `SingeTokenPriceFeedData({ token: ${this.tokensEnum(
          token,
        )} })`;

        return oracleType === OracleType.WSTETH_ORACLE
          ? `${varName} = ${structure};`
          : `${varName}.push(${structure});`;
      })
      .join("\n");
  }

  protected generateGenericLPPriceFeedData(
    varName: string,
    oracleType: OracleType,
  ): string {
    return Object.entries(priceFeedsByNetwork)
      .filter(([, oracleData]) => oracleData.type === oracleType)
      .map(([token, oracleData]) => {
        if (
          oracleData.type === OracleType.WRAPPED_AAVE_V2_ORACLE ||
          oracleData.type === OracleType.COMPOUND_V2_ORACLE ||
          // @ts-ignore
          oracleData.type === OracleType.ERC4626_VAULT_ORACLE
        ) {
          return `${varName}.push(GenericLPPriceFeedData({ lpToken: ${this.tokensEnum(
            token,
          )}, underlying: ${this.tokensEnum(
            oracleData.underlying as SupportedToken,
          )}}));`;
        } else return "";
      })
      .join("\n");
  }

  /// ---------------- SupportedContracts.sol -----------------------------

  generateSupportedContracts() {
    const contracts: Array<SupportedContract> = Object.keys(
      contractsByNetwork.Mainnet,
    ) as Array<SupportedContract>;

    let data = `enum Contracts {NO_CONTRACT, ${contracts.join(",\n")} }`;

    this.makeBindings("ContractType.sol", data);

    data = `cd = new ContractData[](${contracts.length});`;
    data += contracts
      .map((t, num) => {
        if (contractsByNetwork.Mainnet[t] !== NOT_DEPLOYED) {
          return `cd[${num}] = ContractData({ id: Contracts.${t}, addr:  ${contractsByNetwork.Mainnet[t]}, name: "${t}" });`;
        } else return "";
      })
      .join("\n");

    this.makeBindings(
      "SupportedContracts.sol",

      data,
    );
  }
  /// ---------------- AdapterType.sol -----------------------------

  generateAdapterType() {
    const adapterTypeEnum = Object.values(AdapterInterface)
      .filter(v => isNaN(Number(v)))
      .map(t => this.safeEnum(t as string))
      .join(",\n");

    const data = `enum AdapterType {${adapterTypeEnum}}`;
    this.makeBindings("AdapterType.sol", data);
  }

  /// ---------------- AdapterData.sol -----------------------------
  generateAdapterData() {
    let data = Object.entries(contractParams)
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

    data += Object.entries(contractParams)
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
  }, lpToken: ${this.tokensEnum(
            contractParam.lpToken,
          )}, basePool: Contracts.${basePool}}));`;
        }

        return "";
      })
      .join("\n");

    data += Object.entries(contractParams)
      .filter(
        ([, contractParam]) =>
          contractParam.type === AdapterInterface.CURVE_V1_STECRV_POOL,
      )
      .map(([contract, contractParam]) => {
        if (contractParam.type === AdapterInterface.CURVE_V1_STECRV_POOL) {
          return `curveStEthAdapter = CurveStETHAdapter({curveETHGateway:  Contracts.${contract},
        adapterType: AdapterType.${
          AdapterInterface[contractParam.type]
        }, lpToken: ${this.tokensEnum(contractParam.lpToken)}});`;
        }
        return "";
      })
      .join("\n");

    data += Object.entries(contractParams)
      .filter(
        ([, contractParam]) =>
          contractParam.type === AdapterInterface.CURVE_V1_WRAPPER,
      )
      .map(([contract, contractParam]) => {
        if (contractParam.type === AdapterInterface.CURVE_V1_WRAPPER) {
          return `curveWrappers.push(CurveWrapper({targetContract:  Contracts.${contract},
  adapterType: AdapterType.${
    AdapterInterface[contractParam.type]
  }, lpToken: ${this.tokensEnum(contractParam.lpToken)}, nCoins: ${
            contractParam.tokens.length
          }}));`;
        }
        return "";
      })
      .join("\n");

    data += Object.entries(contractParams)
      .filter(
        ([, contractParam]) =>
          contractParam.type === AdapterInterface.CONVEX_V1_BASE_REWARD_POOL &&
          this.tokens.includes(contractParam.stakedToken),
      )
      .map(([contract, contractParam]) => {
        if (
          contractParam.type === AdapterInterface.CONVEX_V1_BASE_REWARD_POOL
        ) {
          return `convexBasePoolAdapters.push(ConvexBasePoolAdapter({targetContract:  Contracts.${contract},
  adapterType: AdapterType.${
    AdapterInterface[contractParam.type]
  }, stakedToken: ${this.tokensEnum(contractParam.stakedToken)}}));`;
        }
        return "";
      })
      .join("\n");

    this.makeBindings("AdapterData.sol", data);
  }

  //
  // INTERNAL FUNCTIONS
  //

  private makeBindings(fileName: string, replacement: string) {
    let content = fs.readFileSync(`./bindings/${fileName}`, "utf8");
    content = content.replace("// $GENERATE_HERE$", replacement);
    fs.writeFileSync(`./contracts/${fileName}`, content);
  }

  private safeEnum(t: string): string {
    if (!isNaN(parseInt(t.charAt(0), 10))) {
      return `_${t}`;
    }
    return t;
  }

  private tokensEnum(t: string): string {
    return `Tokens.${this.safeEnum(t)}`;
  }
}

const generator = new BindingsGenerator();

generator.generateTokens();
generator.generateTokenData();
generator.generatePriceFeedType();
generator.generatePriceFeedData();
generator.generateSupportedContracts();
generator.generateAdapterType();
generator.generateAdapterData();
