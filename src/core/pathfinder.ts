import {BigNumber, ethers} from "ethers";
import {CreditManagerData} from "./creditManager";
import {MultiCall} from "./multicall";
import {
    curve3CrvUnderlyingTokenIndex,
    NormalToken,
    priority,
    SupportedToken,
    supportedTokens,
    tokenDataByNetwork,
    TokenDataI,
    TokenType
} from "./token";
import {ADDRESS_0x0, NetworkType} from "./constants";
import {
    CurveV1Adapter__factory,
    IQuoter__factory,
    UniswapV2Adapter__factory,
    UniswapV3Adapter__factory,
    YearnAdapter__factory
} from "../types";
import {CreditAccountData} from "./creditAccount";
import {contractsByNetwork, UNISWAP_V3_QUOTER} from "./contracts";
import {TradeType} from "./tradeTypes";

// const path = new Path({gasUsed:0, balances: creditAccount.balances, })
// const closurePath = await path.getBestPath();
// closurePath.calls -> multicalls (!)
// closurePath.balances[path.pool] = (X)
// closurePath.balances[!path.pool] = 0 / 1;

export class Path {
    public readonly calls: Array<MultiCall> = [];
    public readonly balances: Record<SupportedToken, BigNumber>;
    public readonly pool: SupportedToken;
    public readonly creditManager: CreditManagerData;
    public readonly creditAccount: CreditAccountData;
    public readonly networkType: NetworkType;
    public readonly provider: ethers.providers.Provider;
    public readonly totalGasLimit: BigNumber;

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

    async getBestPath(): Promise<Path> {
        const existingTokens = Object.entries(this.balances).filter(([, balance]) => balance.gt(1)).sort(([tokenA,], [tokenB,]) => {
            if (priority[supportedTokens[tokenA as SupportedToken].type] > priority[supportedTokens[tokenB as SupportedToken].type]) {
                return -1;
            } else if (priority[supportedTokens[tokenA as SupportedToken].type] < priority[supportedTokens[tokenB as SupportedToken].type]) {
                return 1;
            }
            return 0;
        });

        if (existingTokens.length == 1) {
            return Promise.resolve(this);
        }

        const [nextToken,] = existingTokens.at(0)!;
        // Get balances and keep non-zero only
        // Find token with highest priority
        // Get token type of this token
        switch (supportedTokens[nextToken as SupportedToken].type) {
            case TokenType.CONNECTOR:
                const connectorPathAsset = new ConnectorPathAsset();
                return await connectorPathAsset.getBestPath(nextToken as SupportedToken, this);
            case TokenType.YEARN_VAULT:
                const yearnVaultPathAsset = new YearnVaultPathAsset();
                return await yearnVaultPathAsset.getBestPath(nextToken as SupportedToken, this);
            case TokenType.CONVEX_LP_TOKEN:
            case TokenType.CURVE_LP:
            case TokenType.META_CURVE_LP:
            case TokenType.NORMAL_TOKEN:
            case TokenType.YEARN_VAULT_OF_CURVE_LP:
            case TokenType.YEARN_VAULT_OF_META_CURVE_LP:
            default:
                throw new Error("Token not supported yet");
        }
    }
}

export interface PathAsset {
    getBestPath(currentToken: SupportedToken, p: Path): Promise<Path>;
}

export class ConnectorPathAsset implements PathAsset {
    async getBestPath(currentToken: SupportedToken, p: Path): Promise<Path> {
        // How to unwrap
        // set balance of current token to 0
        // add balnace what we get
        // add call
        // create new Paths

        // 3CRV:
        // coinst balance3crv = p.balance["3rcv"];
        // const p.balance["3rcv"] = 0;
        // DAI
        // const daiPath = {...p};
        // const daiPath["Dai"] = await curve.getAmount(t balance3crv);

        // const pathDai = new Path(daiPath)
        // ...
        // const bestPath = pathDai.balance[0] > pathUSDC.balance(0) ? pathDai : pathUsdc;

        //   --- DAI
        // --|
        //   --- USDC
        //
        // NORMAL TOKEN
        // ============
        //
        // - NORMAL -> POOL (1 pair) => #1
        // for(let conn of connectors) {
        //   const result = getAmount([NORMAL, conn, pool])
        // }
        // => best Path to get max Pool tokens
        // const resultInConnector = getAmount([NORMAL, conn]);
        // calls.push("Uniswap.swap(NORMAL, conn)");

        // CRV => CRV -> USDC -> DAI
        // LINK => LINK -> USDC -> DAI
        //
        // [UniV2.swap("CRV", "USDC"),
        //  UniV3.swap("LINK", "USDC"),
        //  Curve.exchange("USDC", "DAI")]
        //
        // Below is not optimal:
        // [ UniV2.swap("CRV -> USDC -> DAI"),
        // UniV2.swap("LINK -> USDC -> DAI")]
        //
        //
        // [ UniV2.swap("CRV -> USDC")
        // UniV2.swap("USDC -> DAI"),
        // UniV2.swap("LINK -> USDC"),
        // UniV2.swap("USDC -> DAI") ]
        type ConnectorDataI = Extract<TokenDataI, { type: TokenType.CONNECTOR }>;

        const currentBalance: BigNumber = p.balances[currentToken].sub(1);
        const currentTokenAddress: string = tokenDataByNetwork[p.networkType][currentToken];
        const currentTokenData: TokenDataI = supportedTokens[currentToken] as ConnectorDataI;
        // connector token will only swap to pool
        const nextToken: SupportedToken = p.pool;
        const nextTokenAddress: string = tokenDataByNetwork[p.networkType][nextToken];
        const deadline = Math.floor(Date.now() / 1000) + 1200;

        let callData: MultiCall = {
            targetContract: ADDRESS_0x0,
            callData: ""
        };
        let gasLimit: BigNumber = BigNumber.from(0);
        let maxAmountOut: BigNumber = BigNumber.from(0);

        for (let swapAction of currentTokenData.swapActions) {
            const actionType = swapAction.type;
            const actionContract = swapAction.contract;
            const actionContractAddress = contractsByNetwork[p.networkType][actionContract];

            let call: MultiCall = {
                targetContract: ADDRESS_0x0,
                callData: ""
            };
            let amountOut: BigNumber = BigNumber.from(0);
            let gasLimitTmp: BigNumber = BigNumber.from(0);

            switch (actionType) {
                case TradeType.UniswapV2Swap:
                    const uniswapV2Rounter = UniswapV2Adapter__factory.connect(actionContractAddress, p.provider);
                    const path: Array<string> = [currentTokenAddress, nextTokenAddress];
                    const amountsOut = await uniswapV2Rounter.getAmountsOut(currentBalance, path);
                    amountOut = amountsOut[amountsOut.length - 1];
                    call = {
                        targetContract: actionContractAddress,
                        callData: UniswapV2Adapter__factory.createInterface().encodeFunctionData("swapExactTokensForTokens", [currentBalance, amountOut, path, p.creditAccount.addr, deadline])
                    }
                    gasLimitTmp = await uniswapV2Rounter.estimateGas.swapExactTokensForTokens(currentBalance, amountOut, path, p.creditAccount.addr, deadline);
                    break;

                case TradeType.UniswapV3Swap:
                    const uniswapV3Rounter = UniswapV3Adapter__factory.connect(actionContractAddress, p.provider);
                    const iQuoter = IQuoter__factory.connect(UNISWAP_V3_QUOTER, p.provider);
                    amountOut = await iQuoter.callStatic.quoteExactInputSingle(currentTokenAddress, nextTokenAddress, 3000, currentBalance, 0);
                    const exactInputSingleOrder = {
                        "tokenIn": currentTokenAddress,
                        "tokenOut": nextTokenAddress,
                        "fee": 3000,
                        "recipient": p.creditAccount.addr,
                        "amountIn": currentBalance,
                        "amountOutMinimum": amountOut,
                        "deadline": Math.floor(Date.now() / 1000) + 1200,
                        "sqrtPriceLimitX96": 0
                    };
                    call = {
                        targetContract: actionContractAddress,
                        callData: UniswapV3Adapter__factory.createInterface().encodeFunctionData("exactInputSingle", [exactInputSingleOrder])
                    }
                    gasLimitTmp = await uniswapV3Rounter.estimateGas.exactInputSingle(exactInputSingleOrder);
                    break;

                case TradeType.CurveExchange:
                    if (swapAction.tokenOut!.includes(currentToken as NormalToken) && swapAction.tokenOut!.includes(p.pool as NormalToken)) {
                        const curve3CrvPool = CurveV1Adapter__factory.connect(actionContractAddress, p.provider);
                        const currentIndex: BigNumber = curve3CrvUnderlyingTokenIndex[currentToken]!;
                        const outputIndex: BigNumber = curve3CrvUnderlyingTokenIndex[p.pool]!;
                        amountOut = await curve3CrvPool.get_dy_underlying(currentIndex, outputIndex, currentBalance);
                        call = {
                            targetContract: actionContractAddress,
                            callData: CurveV1Adapter__factory.createInterface().encodeFunctionData("exchange_underlying", [currentIndex, outputIndex, currentBalance, amountOut])
                        };
                        gasLimitTmp = await curve3CrvPool.estimateGas.exchange_underlying(currentIndex, outputIndex, currentBalance, amountOut);
                    }
                    break;

                default:
                    throw Error(`TradeType not supported. ${actionType}`);
            }
            if (amountOut > maxAmountOut) {
                callData = call;
                maxAmountOut = amountOut;
                gasLimit = gasLimitTmp;
            }
        }

        if (callData.targetContract != ADDRESS_0x0) {
            p.balances[nextToken].add(maxAmountOut);
            p.balances[currentToken] = BigNumber.from(1);
            p.totalGasLimit.add(gasLimit);
            p.calls.push(callData);
        }

        return await p.getBestPath();
    }
}

export class YearnVaultPathAsset implements PathAsset {
    async getBestPath(currentToken: SupportedToken, p: Path): Promise<Path> {
        const currentBalance: BigNumber = p.balances[currentToken].sub(1);
        type YearnVaultDataI = Extract<TokenDataI, { type: TokenType.YEARN_VAULT }>;
        const currentTokenData = supportedTokens[currentToken] as YearnVaultDataI;

        // Yearn Vault only has one lp action
        const allowedContract: string = contractsByNetwork[p.networkType][currentTokenData.lpActions[0].contract];
        const outputToken: SupportedToken = currentTokenData.lpActions[0].tokenOut as SupportedToken;
        // For Yearn Vault the token address is the contract to withdraw
        const adapterAddress = p.creditManager.adapters[allowedContract];
        const call: MultiCall = {
            targetContract: adapterAddress,
            callData: YearnAdapter__factory.createInterface().encodeFunctionData('withdraw', [currentBalance, p.creditAccount.addr])
        };

        const IYVault = YearnAdapter__factory.connect(allowedContract, p.provider);
        const price: BigNumber = await IYVault.pricePerShare(); // get price
        const gasLimit: BigNumber = await IYVault.estimateGas["withdraw(uint256,address)"](currentBalance, p.creditAccount.addr);

        p.balances[outputToken].add(price.mul(currentBalance));
        p.balances[currentToken] = BigNumber.from(1);
        p.totalGasLimit.add(gasLimit)
        p.calls.push(call);

        return await p.getBestPath();
    }
}
