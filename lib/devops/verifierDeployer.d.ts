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
    baseUrl(chainId: any): String;
    isVerified(address: string | undefined): Promise<boolean>;
    deploy(): Promise<void>;
    protected _saveVerifier(): void;
}
