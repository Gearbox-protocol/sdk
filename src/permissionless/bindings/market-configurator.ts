// External libraries

// Viem imports
import {
  type Address,
  type DecodeFunctionDataReturnType,
  decodeAbiParameters,
  encodeAbiParameters,
  encodeFunctionData,
  erc20Abi,
  erc4626Abi,
  type Hex,
  hexToString,
  keccak256,
  type PublicClient,
  parseAbi,
  stringToHex,
  toBytes,
} from "viem";
import {
  creditFacadeParamsAbi,
  creditManagerParamsAbi,
} from "../../abi/310/configure/creditSuiteParams.js";
// Permissionless SDK imports
import { iMarketConfiguratorV310Abi } from "../../abi/310/generated.js";
import type { RawTx } from "../../sdk/types/index.js";
import { json_stringify } from "../../sdk/utils/index.js";
// Local imports
import type { ParsedCall } from "../core/proposal";
import {
  parseIrmDeployParams,
  parseLossPolicyDeployParams,
  parseRateKeeperDeployParams,
} from "../plugins";
import { convertPercent } from "../utils";
import { handleSalt } from "../utils/create2";
import { AddressProviderContract, BaseContract } from ".";
import { CreditFactory } from "./factory/credit-factory";
import { PoolFactory } from "./factory/pool-factory";
import { PriceOracleFactory } from "./factory/price-oracle-factory";
import type {
  AddAssetParams,
  AllowTokenParams,
  DeployParams,
  ForbidAdapterParams,
  ForbidTokenParams,
  Market,
  PauseCreditManagerParams,
  SetExpirationDateParams,
  SetFeesParams,
  SetPriceFeedParams,
  SetReservePriceFeedParams,
  SetTokenQuotaIncreaseFeeParams,
  UnpauseCreditManagerParams,
} from "./types";

const abi = iMarketConfiguratorV310Abi;

export class MarketConfiguratorContract extends BaseContract<typeof abi> {
  public readonly creditFactory: CreditFactory;
  public readonly poolFactory: PoolFactory;
  public readonly priceOracleFactory: PriceOracleFactory;

  constructor(address: Address, client: PublicClient) {
    super(abi, address, client, "MarketConfigurator");
    this.creditFactory = new CreditFactory();
    this.poolFactory = new PoolFactory();
    this.priceOracleFactory = new PriceOracleFactory();
  }

  async getAddressProvider(): Promise<AddressProviderContract> {
    const addressProvider = await this.contract.read.addressProvider();
    return new AddressProviderContract(addressProvider, this.client);
  }

  //
  // MARKET CONFIG
  //

  async previewCreateMarket(params: {
    minorVersion: number;
    underlying: Address;
    name: string;
    symbol: string;
  }): Promise<Address> {
    return this.contract.read.previewCreateMarket([
      BigInt(params.minorVersion),
      params.underlying,
      params.name,
      params.symbol,
    ]);
  }

  async createMarket(params: {
    minorVersion: number;
    underlying: Address;
    name: string;
    symbol: string;
    interestRateModelParams: DeployParams;
    rateKeeperParams: DeployParams;
    lossPolicyParams: DeployParams;
    underlyingPriceFeed: Address;
  }): Promise<{ tx: RawTx; pool: Address }> {
    const pool = await this.contract.read.previewCreateMarket([
      BigInt(params.minorVersion),
      params.underlying,
      params.name,
      params.symbol,
    ]);

    const tx = this.createRawTx({
      functionName: "createMarket",
      args: [
        BigInt(params.minorVersion),
        params.underlying,
        params.name,
        params.symbol,
        params.interestRateModelParams,
        params.rateKeeperParams,
        params.lossPolicyParams,
        params.underlyingPriceFeed,
      ],
    });

    return {
      tx,
      pool,
    };
  }

  addAsset(pool: Address, args: AddAssetParams): RawTx {
    return this.createRawTx({
      functionName: "addToken",
      args: [pool, args.token, args.priceFeed],
    });
  }

  //
  // PRICE ORACLE CONFIG
  //

  configurePriceOracle(pool: Address, config: Hex): RawTx {
    return this.createRawTx({
      functionName: "configurePriceOracle",
      args: [pool, config],
    });
  }

  setPriceFeed(pool: Address, params: SetPriceFeedParams): RawTx {
    return this.configurePriceOracle(
      pool,
      this.priceOracleFactory.setPriceFeed(params),
    );
  }

  setReservePriceFeed(pool: Address, params: SetReservePriceFeedParams): RawTx {
    return this.configurePriceOracle(
      pool,
      this.priceOracleFactory.setReservePriceFeed(params),
    );
  }

  //
  // POOL CONFIG
  //

  configurePool(pool: Address, calldata: Hex): RawTx {
    return this.createRawTx({
      functionName: "configurePool",
      args: [pool, calldata],
    });
  }

  setTokenLimit(
    pool: Address,
    params: {
      token: Address;
      limit: bigint;
    },
  ): RawTx {
    return this.configurePool(pool, this.poolFactory.setTokenLimit(params));
  }

  setTokenQuotaIncreaseFee(
    pool: Address,
    params: SetTokenQuotaIncreaseFeeParams,
  ): RawTx {
    return this.configurePool(
      pool,
      this.poolFactory.setTokenQuotaIncreaseFee(params),
    );
  }

  setTotalDebtLimit(
    pool: Address,
    params: {
      limit: bigint;
    },
  ): RawTx {
    return this.configurePool(pool, this.poolFactory.setTotalDebtLimit(params));
  }

  setCreditManagerDebtLimit(
    pool: Address,
    args: {
      creditManager: Address;
      limit: bigint;
    },
  ): RawTx {
    return this.configurePool(
      pool,
      this.poolFactory.setCreditManagerDebtLimit(args),
    );
  }

  /// INTEREST RATE MODEL CONFIG

  updateInterestRateModel(
    pool: Address,
    args: {
      deployParams: DeployParams;
    },
  ): RawTx {
    return this.createRawTx({
      functionName: "updateInterestRateModel",
      args: [pool, args.deployParams],
    });
  }

  //
  // CREDIT MANAGER CONFIG
  //

  async createCreditSuite(
    marketInfo: {
      pool: Address;
      name: string;
      symbol: string;
      underlyingAsset: Address;
      minorVersion: number;
    },
    args: {
      params: {
        minorVersion: number;
        maxEnabledTokens: number;
        feeInterest: number;
        feeLiquidation: number;
        feeLiquidationPremium: number;
        feeLiquidationExpired: number;
        feeLiquidationPremiumExpired: number;
        minDebt: bigint;
        maxDebt: bigint;
        name: string;
        accountFactoryType: string;
        accountFactorySalt?: string;
        whitelistPolicy: Address;
        isExpired: boolean;
      };
    },
  ): Promise<{ tx: RawTx; creditManager: Address }> {
    const addressProvider = await this.contract.read.addressProvider();
    const creditSuiteParams = encodeAbiParameters(
      [
        {
          type: "tuple",
          components: [
            { type: "uint8", name: "maxEnabledTokens" },
            { type: "uint16", name: "feeInterest" },
            { type: "uint16", name: "feeLiquidation" },
            { type: "uint16", name: "liquidationPremium" },
            { type: "uint16", name: "feeLiquidationExpired" },
            { type: "uint16", name: "liquidationPremiumExpired" },
            { type: "uint128", name: "minDebt" },
            { type: "uint128", name: "maxDebt" },
            { type: "string", name: "name" },

            {
              type: "tuple",
              name: "accountFactoryParams",
              components: [
                {
                  type: "bytes32",
                  name: "postfix",
                },
                {
                  type: "bytes32",
                  name: "salt",
                },
                {
                  type: "bytes",
                  name: "constructorParams",
                },
              ],
            },
          ],
        },
        {
          type: "tuple",
          name: "creditFacadeParams",
          components: [
            { type: "address", name: "degenNFT" },
            { type: "bool", name: "isExpirable" },
            { type: "bool", name: "migrateBotList" },
          ],
        },
      ],
      [
        {
          maxEnabledTokens: args.params.maxEnabledTokens,
          feeInterest: convertPercent(args.params.feeInterest),
          feeLiquidation: convertPercent(args.params.feeLiquidation),
          liquidationPremium: convertPercent(args.params.feeLiquidationPremium),
          feeLiquidationExpired: convertPercent(
            args.params.feeLiquidationExpired,
          ),
          liquidationPremiumExpired: convertPercent(
            args.params.feeLiquidationPremiumExpired,
          ),
          minDebt: args.params.minDebt,
          maxDebt: args.params.maxDebt,
          name: args.params.name,
          accountFactoryParams: {
            postfix: stringToHex(args.params.accountFactoryType, { size: 32 }),
            salt: args.params.accountFactorySalt
              ? handleSalt(args.params.accountFactorySalt)
              : handleSalt(
                  keccak256(toBytes(marketInfo.name + args.params.name)),
                ),
            constructorParams: encodeAbiParameters(
              [{ type: "address" }],
              [addressProvider],
            ),
          },
        },
        {
          degenNFT: args.params.whitelistPolicy,
          isExpirable: args.params.isExpired,
          migrateBotList: false,
        },
      ],
    );

    const creditManagerAddress: Address =
      await this.contract.read.previewCreateCreditSuite([
        BigInt(marketInfo.minorVersion),
        BigInt(args.params.minorVersion),
        marketInfo.underlyingAsset,
        marketInfo.name,
        marketInfo.symbol,
        creditSuiteParams,
      ]);

    const tx = this.createRawTx({
      functionName: "createCreditSuite",
      args: [
        BigInt(args.params.minorVersion),
        marketInfo.pool,
        creditSuiteParams,
      ],
    });
    return {
      tx,
      creditManager: creditManagerAddress,
    };
  }

  configureCreditManager(creditManager: Address, calldata: Hex): RawTx {
    return this.createRawTx({
      functionName: "configureCreditSuite",
      args: [creditManager, calldata],
    });
  }

  configureAdapterFor(
    creditManager: Address,
    targetContract: Address,
    data: `0x${string}`,
  ): RawTx {
    return this.configureCreditManager(
      creditManager,
      this.creditFactory.configureAdapterFor(targetContract, data),
    );
  }

  addCollateralToken(
    creditManager: Address,
    args: {
      token: Address;
      liquidationThreshold: number;
    },
  ): RawTx {
    return this.configureCreditManager(
      creditManager,
      this.creditFactory.addCollateralToken(args),
    );
  }

  setFees(params: SetFeesParams): RawTx {
    return this.configureCreditManager(
      params.creditManager,
      this.creditFactory.setFees(params),
    );
  }

  rampLiquidationThreshold(
    creditManager: Address,
    args: {
      token: Address;
      liquidationThresholdFinal: number;
      rampStart: number;
      rampDuration: number;
    },
  ): RawTx {
    return this.configureCreditManager(
      creditManager,
      this.creditFactory.rampLiquidationThreshold(args),
    );
  }

  forbidToken(params: ForbidTokenParams): RawTx {
    return this.configureCreditManager(
      params.creditManager,
      this.creditFactory.forbidToken(params.token),
    );
  }

  allowToken(params: AllowTokenParams): RawTx {
    return this.configureCreditManager(
      params.creditManager,
      this.creditFactory.allowToken(params.token),
    );
  }

  setExpirationDate(params: SetExpirationDateParams): RawTx {
    return this.configureCreditManager(
      params.creditManager,
      this.creditFactory.setExpirationDate(params),
    );
  }

  pauseCreditManager(params: PauseCreditManagerParams): RawTx {
    return this.configureCreditManager(
      params.creditManager,
      this.creditFactory.pause(),
    );
  }

  unpauseCreditManager(params: UnpauseCreditManagerParams): RawTx {
    return this.configureCreditManager(
      params.creditManager,
      this.creditFactory.unpause(),
    );
  }

  forbidAdapter(params: ForbidAdapterParams): RawTx {
    return this.configureCreditManager(
      params.creditManager,
      this.creditFactory.forbidAdapter(params.target),
    );
  }

  //
  // RATE KEEPER CONFIG
  //

  async updateRateKeeper(
    pool: Address,
    args: {
      deployParams: DeployParams;
    },
  ): Promise<RawTx> {
    return this.createRawTx({
      functionName: "updateRateKeeper",
      args: [pool, args.deployParams],
    });
  }

  configureRateKeeper(pool: Address, calldata: Hex): RawTx {
    return this.createRawTx({
      functionName: "configureRateKeeper",
      args: [pool, calldata],
    });
  }

  //
  // LOSS POLICY CONFIG
  //

  configureLossPolicy(pool: Address, calldata: Hex): RawTx {
    return this.createRawTx({
      functionName: "configureLossPolicy",
      args: [pool, calldata],
    });
  }

  updateLossPolicy(pool: Address, deployParams: DeployParams): RawTx {
    return this.createRawTx({
      functionName: "updateLossPolicy",
      args: [pool, deployParams],
    });
  }

  enableLossPolicy(pool: Address): RawTx {
    return this.createRawTx({
      functionName: "configureLossPolicy",
      args: [
        pool,
        encodeFunctionData({
          abi: parseAbi(["function enable() external"]),
          functionName: "enable",
        }),
      ],
    });
  }

  disableLossPolicy(pool: Address): RawTx {
    return this.createRawTx({
      functionName: "configureLossPolicy",
      args: [
        pool,
        encodeFunctionData({
          abi: parseAbi(["function disable() external"]),
          functionName: "disable",
        }),
      ],
    });
  }

  //
  // ROLES
  //

  async treasury(): Promise<Address> {
    return await this.contract.read.treasury();
  }

  async admins(): Promise<{
    admin: Address;
    emergencyAdmin: Address;
    treasury: Address;
    pausableAdmins: Address[];
    unpausableAdmins: Address[];
  }> {
    const [admin, emergencyAdmin, treasury, acl] = await Promise.all([
      this.contract.read.admin(),
      this.contract.read.emergencyAdmin(),
      this.contract.read.treasury(),
      this.contract.read.acl(),
    ]);

    const results = await this.client.multicall({
      allowFailure: false,
      contracts: [
        {
          address: acl,
          abi: parseAbi([
            "function getRoleHolders(bytes32) view returns (address[])",
          ]),
          functionName: "getRoleHolders",
          args: [stringToHex("PAUSABLE_ADMIN", { size: 32 })],
        },
        {
          address: acl,
          abi: parseAbi([
            "function getRoleHolders(bytes32) view returns (address[])",
          ]),
          functionName: "getRoleHolders",
          args: [stringToHex("UNPAUSABLE_ADMIN", { size: 32 })],
        },
      ],
    });

    return {
      admin,
      emergencyAdmin,
      treasury,
      pausableAdmins: [...results[0]],
      unpausableAdmins: [...results[1]],
    };
  }

  async multipause(): Promise<Address | undefined> {
    const acl = await this.contract.read.acl();
    const pausableAdmins = await this.client.readContract({
      address: acl,
      abi: parseAbi([
        "function getRoleHolders(bytes32) view returns (address[])",
      ]),
      functionName: "getRoleHolders",
      args: [stringToHex("PAUSABLE_ADMIN", { size: 32 })],
    });

    try {
      const result = await this.client.multicall({
        allowFailure: true,
        contracts: pausableAdmins.map(admin => ({
          address: admin,
          abi: parseAbi(["function contractType() view returns (bytes32)"]),
          functionName: "contractType",
        })),
      });

      const pause = result
        .map((r, i) => ({
          ...r,
          address: pausableAdmins[i],
        }))
        .find(({ status, result }) => {
          try {
            return (
              status === "success" &&
              hexToString(result as Hex, { size: 32 }) === "MULTI_PAUSE"
            );
          } catch {
            return false;
          }
        });

      return pause?.address;
    } catch {
      return undefined;
    }
  }

  grantRole(role: string, address: Address): RawTx {
    return this.createRawTx({
      functionName: "grantRole",
      args: [stringToHex(role, { size: 32 }), address],
    });
  }

  //
  // SYNC
  //

  async syncSetEmergencyAdmin(
    fromBlock: bigint,
    toBlock: bigint,
  ): Promise<
    Array<{
      emergencyAdmin: Address;
      atBlock: number;
    }>
  > {
    const events = await this.getEvents(
      "SetEmergencyAdmin",
      fromBlock,
      toBlock,
    );

    return (events || [])
      .map(event => ({
        emergencyAdmin: event.args.newEmergencyAdmin as Address,
        atBlock: Number(event.blockNumber),
      }))
      .filter(event => event.emergencyAdmin !== undefined);
  }

  async syncMarkets({
    fromBlock,
    toBlock,
  }: {
    fromBlock: bigint;
    toBlock: bigint;
  }): Promise<Market[]> {
    const events = await this.getEvents("CreateMarket", fromBlock, toBlock);

    const chainId = await this.client.getChainId();

    const markets: Market[] = [];
    for (const event of events) {
      const pool = event.args.pool!;

      const [underlyingAsset, name, symbol] = await Promise.all([
        this.client.readContract({
          address: pool,
          abi: erc4626Abi,
          functionName: "asset",
        }),
        this.client.readContract({
          address: pool,
          abi: erc20Abi,
          functionName: "name",
        }),
        this.client.readContract({
          address: pool,
          abi: erc20Abi,
          functionName: "symbol",
        }),
      ]);

      markets.push({
        address: pool,
        underlyingAsset,
        name,
        symbol,
        isDeployed: true,
      });
    }

    return markets;
  }

  public parseFunctionParams(
    params: DecodeFunctionDataReturnType<typeof abi>,
  ): ParsedCall | undefined {
    const { functionName, args } = params;

    switch (functionName) {
      case "createMarket": {
        const [
          minorVersion,
          underlying,
          name,
          symbol,
          interestRateModelParams,
          rateKeeperParams,
          lossPolicyParams,
          underlyingPriceFeed,
        ] = args as [
          bigint,
          Address,
          string,
          string,
          DeployParams,
          DeployParams,
          DeployParams,
          Address,
        ];
        const irmParsedPostfix = hexToString(
          interestRateModelParams.postfix,
        ).replace(/\0/g, "");
        const irmParsedParams = parseIrmDeployParams(
          irmParsedPostfix,
          Number(minorVersion),
          interestRateModelParams.constructorParams,
        );
        const rateKeeperParsedPostfix = hexToString(
          rateKeeperParams.postfix,
        ).replace(/\0/g, "");
        const rateKeeperParsedParams = parseRateKeeperDeployParams(
          rateKeeperParsedPostfix,
          Number(minorVersion),
          rateKeeperParams.constructorParams,
        );
        const lossPolicyParsedPostfix = hexToString(
          lossPolicyParams.postfix,
        ).replace(/\0/g, "");
        const lossPolicyParsedParams = parseLossPolicyDeployParams(
          lossPolicyParsedPostfix,
          Number(minorVersion),
          lossPolicyParams.constructorParams,
        );
        return {
          chainId: 0,
          target: this.address,
          label: this.name,
          functionName,
          args: {
            minorVersion: minorVersion.toString(),
            underlying,
            name,
            symbol,
            interestRateModelParams: json_stringify({
              postfix: irmParsedPostfix,
              salt: interestRateModelParams.salt,
              constructorParams: irmParsedParams,
            }),
            rateKeeperParams: json_stringify({
              postfix: rateKeeperParsedPostfix,
              salt: rateKeeperParams.salt,
              constructorParams: rateKeeperParsedParams,
            }),
            lossPolicyParams: json_stringify({
              postfix: lossPolicyParsedPostfix,
              salt: lossPolicyParams.salt,
              constructorParams: lossPolicyParsedParams,
            }),
            underlyingPriceFeed,
          },
        };
      }

      case "createCreditSuite": {
        const [minorVersion, pool, creditSuiteParams] = args as [
          bigint,
          Address,
          Hex,
        ];
        const decoded = decodeAbiParameters(
          [creditManagerParamsAbi, creditFacadeParamsAbi],
          creditSuiteParams,
        );
        const accountFactoryParams = decoded[0].accountFactoryParams;
        return {
          chainId: 0,
          target: this.address,
          label: this.name,
          functionName,
          args: {
            minorVersion: minorVersion.toString(),
            pool,
            creditSuiteParams: json_stringify({
              ...decoded[0],
              minDebt: decoded[0].minDebt.toString(),
              maxDebt: decoded[0].maxDebt.toString(),
              accountFactoryParams: {
                postfix: hexToString(accountFactoryParams.postfix).replace(
                  /\0/g,
                  "",
                ),
                salt: accountFactoryParams.salt,
                // TODO: tmp solution, move AccountFactory decoding to plugins
                constructorParams: {
                  addressProvider: decodeAbiParameters(
                    [{ type: "address" }],
                    accountFactoryParams.constructorParams,
                  )[0],
                },
              },
            }),
          },
        };
      }

      case "configurePriceOracle": {
        const [pool, config] = args as [Address, Hex];
        const decoded = this.priceOracleFactory.decodeConfig(config);
        if (decoded) {
          return {
            chainId: 0,
            target: this.address,
            label: this.name,
            functionName,
            args: {
              pool,
              data: json_stringify(decoded),
            },
          };
        }
        return {
          chainId: 0,
          target: this.address,
          label: this.name,
          functionName,
          args: {
            pool,
            config,
          },
        };
      }

      case "configurePool": {
        const [pool, calldata] = args as [Address, Hex];
        const decoded = this.poolFactory.decodeConfig(calldata);
        if (decoded) {
          return {
            chainId: 0,
            target: this.address,
            label: this.name,
            functionName,
            args: {
              pool,
              data: json_stringify(decoded),
            },
          };
        }
        return {
          chainId: 0,
          target: this.address,
          label: this.name,
          functionName,
          args: {
            pool,
            calldata,
          },
        };
      }

      case "configureCreditSuite": {
        const [creditManager, calldata] = args as [Address, Hex];
        const decoded = this.creditFactory.decodeConfig(calldata);
        if (decoded) {
          return {
            chainId: 0,
            target: this.address,
            label: this.name,
            functionName,
            args: {
              creditManager,
              data: json_stringify(decoded),
            },
          };
        }
        return {
          chainId: 0,
          target: this.address,
          label: this.name,
          functionName,
          args: {
            creditManager,
            calldata,
          },
        };
      }

      case "updateInterestRateModel": {
        const [pool, deployParams] = args as [Address, DeployParams];
        return {
          chainId: 0,
          target: this.address,
          label: this.name,
          functionName,
          args: {
            pool,
            deployParams: json_stringify(deployParams),
          },
        };
      }

      case "updateRateKeeper": {
        const [pool, deployParams] = args as [Address, DeployParams];
        return {
          chainId: 0,
          target: this.address,
          label: this.name,
          functionName,
          args: {
            pool,
            deployParams: json_stringify(deployParams),
          },
        };
      }

      case "updateLossPolicy": {
        const [pool, deployParams] = args as [Address, DeployParams];
        return {
          chainId: 0,
          target: this.address,
          label: this.name,
          functionName,
          args: {
            pool,
            deployParams: json_stringify(deployParams),
          },
        };
      }

      case "grantRole": {
        const [role, address] = args as [Hex, Address];
        return {
          chainId: 0,
          target: this.address,
          label: this.name,
          functionName,
          args: {
            address,
            role: hexToString(role, { size: 32 }),
          },
        };
      }

      default:
        return undefined;
    }
  }

  //
  // EMERGENCY CONFIG
  //

  emergencyConfigurePool(pool: Address, calldata: Hex): RawTx {
    return this.createRawTx({
      functionName: "emergencyConfigurePool",
      args: [pool, calldata],
    });
  }

  emergencyConfigureCreditSuite(creditManager: Address, calldata: Hex): RawTx {
    return this.createRawTx({
      functionName: "emergencyConfigureCreditSuite",
      args: [creditManager, calldata],
    });
  }

  emergencyConfigurePriceOracle(pool: Address, calldata: Hex): RawTx {
    return this.createRawTx({
      functionName: "emergencyConfigurePriceOracle",
      args: [pool, calldata],
    });
  }

  emergencyConfigureLossPolicy(pool: Address, calldata: Hex): RawTx {
    return this.createRawTx({
      functionName: "emergencyConfigureLossPolicy",
      args: [pool, calldata],
    });
  }
}
