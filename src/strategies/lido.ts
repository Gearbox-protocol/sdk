import { BigNumberish } from "ethers"


import {
    LidoV1Adapter__factory
} from "../types";

import { MultiCallStruct } from "../types/contracts/interfaces/ICreditFacade.sol/ICreditFacade";


export class LidoCalls {
    public static submit(amount: BigNumberish) {
        return LidoV1Adapter__factory.createInterface().encodeFunctionData(
            "submit",
            [amount]
        )
    }

    public static submitAll() {
        return LidoV1Adapter__factory.createInterface().encodeFunctionData(
            "submitAll"
        )
    }
}

export class LidoMulticaller {
    private readonly _address: string;

    constructor(address: string) {
        this._address = address;
    }

    submit(amount: BigNumberish): MultiCallStruct {
        return {
            target: this._address,
            callData: LidoCalls.submit(amount)
        }
    }

    submitAll(): MultiCallStruct {
        return {
            target: this._address,
            callData: LidoCalls.submitAll()
        }
    }
}
