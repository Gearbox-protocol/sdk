export enum Protocols {
  Uniswap,
  Sushiswap,
  Curve,
  Yearn,
  Convex,
  Lido,
  Gearbox,
}

export interface ProtocolData {
  name: string;
  icon: string;
}

export const protocolData: Record<Protocols, ProtocolData> = {
  [Protocols.Uniswap]: {
    name: "Uniswap",
    icon: "/protocols/uniswap.png",
  },
  [Protocols.Sushiswap]: {
    name: "Sushiswap",
    icon: "/protocols/sushi.svg",
  },
  [Protocols.Curve]: {
    name: "Curve",
    icon: "/protocols/curve.svg",
  },
  [Protocols.Yearn]: {
    name: "Yearn",
    icon: "/protocols/yearn.svg",
  },
  [Protocols.Convex]: {
    name: "Convex",
    icon: "/protocols/convex.svg",
  },
  [Protocols.Lido]: {
    name: "Lido",
    icon: "/protocols/lido.svg",
  },
};
