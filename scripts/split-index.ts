import fs from "fs";
import path from "path";

const SKIP_ABI: Record<string, true> = {
  AddressProvider: true,
  BalanceOps: true,
  CalldataExtractor: true,
  Claimable: true,
  ContractsRegisterTrait: true,
  Errors: true,
  FarmAccounting: true,
  IAdapter: true,
  IAddressProvider: true,
  IAddressProviderEvents: true,
  IAddressProviderV3Events: true,
  IAirdropDistributorEvents: true,
  IBalancerV2Vault: true,
  IBalancerV2VaultAdapterEvents: true,
  IBalancerV2VaultAdapterExceptions: true,
  IBalancerV2VaultGetters: true,
  IBotListV3: true,
  IBotListV3Events: true,
  ICompoundV2_Exceptions: true,
  IContractsRegister: true,
  IContractsRegisterEvents: true,
  IControllerTimelockV3: true,
  IControllerTimelockV3Events: true,
  IConvexV1BoosterAdapterEvents: true,
  ICreditAccountBase: true,
  ICreditAccountV3: true,
  ICreditConfiguratorV2: true,
  ICreditConfiguratorV2Events: true,
  ICreditConfiguratorV2Exceptions: true,
  ICreditConfiguratorV3Events: true,
  ICreditFacadeV2: true,
  ICreditFacadeV2Events: true,
  ICreditFacadeV2Exceptions: true,
  ICreditFacadeV2V2: true,
  ICreditFacadeV3Events: true,
  ICreditManagerV2Events: true,
  ICreditManagerV2Exceptions: true,
  ICreditManagerV3Events: true,
  ICurvePool2Assets: true,
  ICurvePool3Assets: true,
  ICurvePool4Assets: true,
  ICurveV1Adapter: true,
  IDaiLikePermit: true,
  IDegenDistributorEvents: true,
  IDegenNFTV2: true,
  IDegenNFTV2Events: true,
  IDegenNFTV2Exceptions: true,
  IERC20Metadata: true,
  IERC165: true,
  IERC721: true,
  IERC721Metadata: true,
  IERC4626: true,
  IGasPricer: true,
  IGaugeV3: true,
  IGaugeV3Events: true,
  IGearStakingV3Events: true,
  ILinearInterestRateModelV3: true,
  ILPPriceFeed: true,
  ILPPriceFeedEvents: true,
  ILPPriceFeedExceptions: true,
  IPermit2: true,
  IPoolQuotaKeeperV3: true,
  IPoolQuotaKeeperV3Events: true,
  IPoolService: true,
  IPoolServiceEvents: true,
  IPoolV3Events: true,
  IPriceOracleV2: true,
  IPriceOracleV2Events: true,
  IPriceOracleV2Exceptions: true,
  IPriceOracleV2Ext: true,
  IPriceOracleV3Events: true,
  IRedstonePriceFeedEvents: true,
  IRedstonePriceFeedExceptions: true,
  IRouter: true,
  IstETHGetters: true,
  ISwapRouter: true,
  IUniswapV2AdapterEvents: true,
  IUniswapV2AdapterExceptions: true,
  IUniswapV3AdapterEvents: true,
  IUniswapV3AdapterExceptions: true,
  IVersion: true,
  IVotingContractV3: true,
  IWETH: true,
  IWETHGateway: true,
  IwstETHGateWay: true,
  IwstETHGetters: true,
  IYVault: true,
  IZapperRegister: true,
  NumericArrayLib: true,
  Ownable: true,
  RedstoneConstants: true,
  RedstoneConsumerBase: true,
  RedstoneConsumerNumericBase: true,
  RedstoneDefaultsLib: true,
  SafeERC20: true,
  SignUpRepositoryEvents: true,
  ERC20: true,
  PartialLiquidationBotV3: true,
};

const indexPath = path.join("src", "types", "index.ts");
const typesDir = path.dirname(indexPath);

// Read the index.ts file
const indexContent = fs.readFileSync(indexPath, "utf8");

const SEPARATOR =
  "//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////";
const sections = indexContent.split(SEPARATOR) as Array<string>;

sections.forEach((s, index, arr) => {
  const trimmed = s.trim();
  const fileName = trimmed.startsWith("// ")
    ? trimmed.replace("// ", "")
    : null;

  if (fileName && !SKIP_ABI[fileName]) {
    const abi = SEPARATOR + s + SEPARATOR + arr[index + 1];

    fs.writeFile(path.join(typesDir, `${fileName}.ts`), abi, err => {
      if (err) {
        console.error("Error writing index.ts:", err);
        return;
      }
    });
  }
});
