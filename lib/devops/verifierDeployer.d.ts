import { LoggedDeployer } from "./loggedDeployer";
export interface VerifyRequest {
    address: string;
    constructorArguments: Array<any>;
}
export declare class Verifier extends LoggedDeployer {
    protected verifier: Array<VerifyRequest>;
    protected apiKey: string;
    constructor();
    addContract(c: VerifyRequest): void;
    deploy(): Promise<void>;
    protected _saveVerifier(): void;
}
