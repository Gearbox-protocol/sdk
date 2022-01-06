import {BigNumber} from "ethers";
import {TokenData} from "./token";
import {formatBN} from "../utils/formatter";
import {EventOrTx} from "./events";

export class EventAddLiquidity extends EventOrTx {
    public readonly amount: BigNumber;
    public readonly underlyingToken: string;

    constructor(

        txHash: string,
        amount: BigNumber,
        underlyingToken: string
    ) {
        super(block, txHash);
        this.amount = amount;
        this.underlyingToken = underlyingToken;
    }

    toString(tokenData: Record<string, TokenData>): string {
        const token = tokenData[this.underlyingToken];
        return `Deposit ${formatBN(this.amount, token?.decimals || 18)} ${
            token?.symbol || ""
        } to ${token?.symbol} pool`;
    }
}
