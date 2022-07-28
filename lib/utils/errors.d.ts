interface IMetamaskError {
    code: number;
    message: string;
}
export declare const isMetamaskError: (e: any) => e is IMetamaskError;
export {};
