export declare enum Protocols {
    Uniswap = 0,
    Sushiswap = 1,
    Curve = 2,
    Yearn = 3,
    Convex = 4,
    Lido = 5
}
export interface ProtocolData {
    name: string;
    icon: string;
}
export declare const protocolData: Record<Protocols, ProtocolData>;
