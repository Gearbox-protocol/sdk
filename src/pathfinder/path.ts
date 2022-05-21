import {BigNumber, ethers} from "ethers";
import {CreditManagerData} from "../core/creditManager";
import {MultiCall} from "../core/multicall";
import {
    Curve3CrvUnderlyingTokenIndex, NormalToken,
    priority,
    SupportedToken,
    supportedTokens,
    TokenType
} from "../core/token";
import {NetworkType} from "../core/constants";
import {CreditAccountData} from "../core/creditAccount";
import {ConnectorPathAsset} from "./connectorPathAsset";
import {YearnVaultPathAsset} from "./yearnVaultPathAsset";
import {ConvexLPTokenPathAsset} from "./convexLPTokenPathAsset";
import {CurveLPPathAsset} from "./curveLPPathAsset";
import {MetaCurveLPPathAsset} from "./metaCurveLPPathAsset";
import {NormalTokenPathAsset} from "./normalTokenPathAsset";
import {YearnVaultOfCurveLPPathAsset} from "./yearnVaultOfCurveLPPathAsset";
import {YearnVaultOfMetaCurveLPPathAsset} from "./yearnVaultOfMetaCurveLPPathAsset";
import {
    CurveV1Adapter__factory,
    IQuoter__factory,
    UniswapV2Adapter__factory,
    UniswapV3Adapter__factory
} from "../types";
import {contractsByNetwork, SupportedContract, UNISWAP_V3_QUOTER} from "../core/contracts";
import {TradeAction, TradeType} from "../core/tradeTypes";


export class Path {
    public readonly calls: Array<MultiCall> = [];
    public readonly balances: Record<SupportedToken, BigNumber>;
    public readonly pool: SupportedToken;
    public readonly creditManager: CreditManagerData;
    public readonly creditAccount: CreditAccountData;
    public readonly networkType: NetworkType;
    public readonly provider: ethers.providers.Provider;
    public readonly totalGasLimit: BigNumber;


    // Path is for selling all assets in the credit account, it will return the calls data to sell all the assets, the amount of pool token will got after selling and the total gas limit for all the calls.
    // This is an example to describe how to use Path:
    // const path = new Path({gasUsed:0, balances: creditAccount.balances, })
    // const closurePath = await path.getBestPath();
    // closurePath.calls -> multicalls (!)
    // closurePath.balances[path.pool] = (X)
    // closurePath.balances[!path.pool] = 0 / 1;
    //
    // balances: the balance of each asset in the credit account
    // pool: the pool token
    // creditManager: credit manager data
    // creditAccount: credit account data
    // networkType: network type (Mainnet, Kovan)
    // provider: ehters rpc provider
    // totalGasLimit: the base gas limit, you can pass zero for not adding any base gas limit

    constructor(opts: {
        balances: Record<SupportedToken, BigNumber>;
        pool: SupportedToken;
        creditManager: CreditManagerData;
        creditAccount: CreditAccountData;
        networkType: NetworkType;
        provider: ethers.providers.Provider;
        totalGasLimit: BigNumber;
    }) {
        this.balances = opts.balances;
        this.pool = opts.pool;
        this.creditManager = opts.creditManager;
        this.creditAccount = opts.creditAccount;
        this.networkType = opts.networkType;
        this.provider = opts.provider;
        this.totalGasLimit = opts.totalGasLimit;
    }

    private comparedByPriority([tokenA, _balanceA]: [string, BigNumber], [tokenB, _balanceB]: [string, BigNumber]): number {
        const priorityTokenA = priority[supportedTokens[tokenA as SupportedToken].type];
        const priorityTokenB = priority[supportedTokens[tokenB as SupportedToken].type];

        if (priorityTokenA > priorityTokenB) {
            return -1;
        } else if (priorityTokenA < priorityTokenB) {
            return 1;
        }
        return 0;
    }

    async getBestPath(): Promise<Path> {
        const existingTokens = Object.entries(this.balances).filter(([_token, balance]) => balance.gt(1)).sort(this.comparedByPriority);

        if (existingTokens.length == 1) {
            return this;
        }

        const nextToken = existingTokens.at(0)![0] as SupportedToken;
        let pathAsset: PathAsset;
        // Get balances and keep non-zero only
        // Find token with highest priority
        // Get token type of this token
        switch (supportedTokens[nextToken].type) {
            case TokenType.CONNECTOR:
                pathAsset = new ConnectorPathAsset();
                break;

            case TokenType.YEARN_VAULT:
                pathAsset = new YearnVaultPathAsset();
                break;

            case TokenType.CONVEX_LP_TOKEN:
                pathAsset = new ConvexLPTokenPathAsset();
                break;

            case TokenType.CURVE_LP:
                pathAsset = new CurveLPPathAsset();
                break;

            case TokenType.META_CURVE_LP:
                pathAsset = new MetaCurveLPPathAsset();
                break;

            case TokenType.NORMAL_TOKEN:
                pathAsset = new NormalTokenPathAsset();
                break;

            case TokenType.YEARN_VAULT_OF_CURVE_LP:
                pathAsset = new YearnVaultOfCurveLPPathAsset();
                break;

            case TokenType.YEARN_VAULT_OF_META_CURVE_LP:
                pathAsset = new YearnVaultOfMetaCurveLPPathAsset();
                break;

            default:
                throw new Error("Token type not supported yet");
        }

        return await pathAsset.getBestPath(nextToken, this);
    }
}

export interface ExchangeData {
    callData: MultiCall;
    amountOut: BigNumber;
    gasLimit: BigNumber;
};

export abstract class PathAsset {
    abstract getBestPath(currentToken: SupportedToken, p: Path): Promise<Path>;


    async getUniswapV2SwapData(adapterAddress: string, currentTokenAddress: string, currentBalance: BigNumber, nextTokenAddress: string, p: Path): Promise<ExchangeData> {

        const deadline = Math.floor(Date.now() / 1000) + 1200;
        const uniswapV2Adapter = UniswapV2Adapter__factory.connect(adapterAddress, p.provider);
        const path: Array<string> = [currentTokenAddress, nextTokenAddress];
        const amountsOut: Array<BigNumber> = await uniswapV2Adapter.getAmountsOut(currentBalance, path);

        const amountOut: BigNumber = amountsOut[amountsOut.length - 1];
        const gasLimit: BigNumber = await uniswapV2Adapter.estimateGas.swapExactTokensForTokens(currentBalance, amountOut, path, p.creditAccount.addr, deadline);
        const call: MultiCall = {
            targetContract: adapterAddress,
            callData: UniswapV2Adapter__factory.createInterface().encodeFunctionData("swapExactTokensForTokens", [currentBalance, amountOut, path, p.creditAccount.addr, deadline])
        }

        return { callData: call, amountOut: amountOut, gasLimit: gasLimit };
    }

    async getUniswapV3SwapData(adapterAddress: string, currentTokenAddress: string, currentBalance: BigNumber, nextTokenAddress: string, p: Path): Promise<ExchangeData> {
        const uniswapV3Adapter = UniswapV3Adapter__factory.connect(adapterAddress, p.provider);
        const iQuoter = IQuoter__factory.connect(UNISWAP_V3_QUOTER, p.provider);
        const amountOut: BigNumber = await iQuoter.callStatic.quoteExactInputSingle(currentTokenAddress, nextTokenAddress, 3000, currentBalance, 0);
        const deadline = Math.floor(Date.now() / 1000) + 1200;
        const exactInputSingleOrder = {
            "tokenIn": currentTokenAddress,
            "tokenOut": nextTokenAddress,
            "fee": 3000,
            "recipient": p.creditAccount.addr,
            "amountIn": currentBalance,
            "amountOutMinimum": amountOut,
            "deadline": deadline,
            "sqrtPriceLimitX96": 0
        };
        const call: MultiCall = {
            targetContract: adapterAddress,
            callData: UniswapV3Adapter__factory.createInterface().encodeFunctionData("exactInputSingle", [exactInputSingleOrder])
        }
        const gasLimit: BigNumber = await uniswapV3Adapter.estimateGas.exactInputSingle(exactInputSingleOrder);

        return { callData: call, amountOut: amountOut, gasLimit: gasLimit };
    }

    async getCurveExchangeData(adapterAddress: string, currentToken: SupportedToken, currentBalance: BigNumber, nextToken: SupportedToken, p: Path): Promise<ExchangeData> {
        const curve3CrvPool = CurveV1Adapter__factory.connect(adapterAddress, p.provider);
        const currentIndex: BigNumber = Curve3CrvUnderlyingTokenIndex[currentToken]!;
        const outputIndex: BigNumber = Curve3CrvUnderlyingTokenIndex[nextToken]!;

        const amountOut: BigNumber = await curve3CrvPool.get_dy_underlying(currentIndex, outputIndex, currentBalance);
        const gasLimit: BigNumber = await curve3CrvPool.estimateGas.exchange_underlying(currentIndex, outputIndex, currentBalance, amountOut);
        const call: MultiCall = {
            targetContract: adapterAddress,
            callData: CurveV1Adapter__factory.createInterface().encodeFunctionData("exchange_underlying", [currentIndex, outputIndex, currentBalance, amountOut])
        };

        return { callData: call, amountOut: amountOut, gasLimit: gasLimit };
    }

    async getExchangeData(swapAction: TradeAction, currentTokenAddress: string, currentToken: SupportedToken, currentBalance: BigNumber, nextTokenAddress: string, nextToken: SupportedToken, p: Path): Promise<ExchangeData> {
        const actionType: TradeType = swapAction.type;
        const actionContract: SupportedContract = swapAction.contract;
        const actionContractAddress: string = contractsByNetwork[p.networkType][actionContract];
        const adapterAddress: string = p.creditManager.adapters[actionContractAddress];

        switch (actionType) {
            case TradeType.UniswapV2Swap:
                return await this.getUniswapV2SwapData(adapterAddress, currentTokenAddress, currentBalance, nextTokenAddress, p);

            case TradeType.UniswapV3Swap:
                return await this.getUniswapV3SwapData(adapterAddress, currentTokenAddress, currentBalance, nextTokenAddress, p);

            case TradeType.CurveExchange:
                if (swapAction.tokenOut!.includes(p.pool as NormalToken)) {
                    return await this.getCurveExchangeData(adapterAddress, currentToken, currentBalance, nextToken, p);
                } else {
                    return {
                        callData: {
                            targetContract: "",
                            callData: ""
                        },
                        amountOut: BigNumber.from(0),
                        gasLimit: BigNumber.from(0)
                    };
                }

            default:
                throw Error(`TradeType not supported. ${actionType}`);
        }
    }
}