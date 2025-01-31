import type { Protocols } from "../../sdk-gov-legacy";

interface ProtocolData {
  name: string;
  icon: string;
}

export type ExtendedProtocols =
  | keyof typeof Protocols
  | "Stakewise"
  | "Etherfi"
  | "Rocketpool"
  | "Renzo"
  | "Coinbase"
  | "Kelp"
  | "Swell"
  | "Puffer"
  | "Mellow"
  | "Lombard"
  | "pumpBTC"
  | "Stakestone"
  | "Treehouse";

const PROTOCOL_DATA: Record<ExtendedProtocols, ProtocolData> = {
  Uniswap: {
    name: "Uniswap",
    icon: "/protocols/uniswap.png",
  },
  Sushiswap: {
    name: "Sushiswap",
    icon: "/protocols/sushi.svg",
  },
  Curve: {
    name: "Curve",
    icon: "/protocols/curve.svg",
  },
  Yearn: {
    name: "Yearn",
    icon: "/protocols/yearn.svg",
  },
  Convex: {
    name: "Convex",
    icon: "/protocols/convex.svg",
  },
  Lido: {
    name: "Lido",
    icon: "/protocols/lido.svg",
  },
  Gearbox: {
    name: "Gearbox",
    icon: "/protocols/gearbox.svg",
  },
  Balancer: {
    name: "Balancer",
    icon: "/protocols/balancer.svg",
  },
  AaveV2: {
    name: "Aave V2",
    icon: "/protocols/aavev2.svg",
  },
  CompoundV2: {
    name: "Compound V2",
    icon: "/protocols/compoundv2.svg",
  },
  Flux: {
    name: "Flux",
    icon: "/protocols/flux.svg",
  },
  Aura: {
    name: "Aura",
    icon: "/protocols/aura.svg",
  },
  MakerDSR: {
    name: "MakerDSR",
    icon: "/protocols/maker.svg",
  },
  Sommelier: {
    name: "Sommelier",
    icon: "/protocols/sommelier.svg",
  },
  Fraxswap: {
    name: "Fraxswap",
    icon: "/protocols/fraxswap.svg",
  },
  Stakewise: {
    name: "Stakewise",
    icon: "/protocols/stakewise.svg",
  },
  Rocketpool: {
    name: "Rocketpool",
    icon: "/protocols/rocketpool.svg",
  },
  Etherfi: {
    name: "Ether.fi",
    icon: "/protocols/etherfi.svg",
  },
  Renzo: {
    name: "Renzo",
    icon: "/protocols/renzo.svg",
  },
  Coinbase: {
    name: "Coinbase",
    icon: "/protocols/coinbase.svg",
  },
  Camelot: {
    name: "Camelot",
    icon: "/protocols/camelot.svg",
  },
  Ethena: {
    name: "Ethena",
    icon: "/protocols/ethena.svg",
  },
  Velodrome: {
    name: "Velodrome",
    icon: "/protocols/velodrome.svg",
  },
  AaveV3: {
    name: "Aave V3",
    icon: "/protocols/aavev3.svg",
  },
  Kelp: {
    name: "Kelp",
    icon: "/protocols/kelp.svg",
  },
  Pancakeswap: {
    name: "Pancakeswap",
    icon: "/protocols/pancakeswap.svg",
  },
  Swell: {
    name: "Swell",
    icon: "/protocols/swell.svg",
  },
  Puffer: {
    name: "Puffer",
    icon: "/protocols/puffer.svg",
  },
  Zircuit: {
    name: "Zircuit",
    icon: "/protocols/zircuit.svg",
  },
  Mellow: {
    name: "Mellow",
    icon: "/protocols/mellow.svg",
  },
  Pendle: {
    name: "Pendle",
    icon: "/protocols/pendle.svg",
  },
  Lombard: {
    name: "Lombard",
    icon: "/protocols/lombard.svg",
  },
  Sky: {
    name: "Sky",
    icon: "/protocols/sky.svg",
  },
  pumpBTC: {
    name: "Pump BTC",
    icon: "/protocols/pumpbtc.svg",
  },
  Equalizer: {
    name: "Equalizer",
    icon: "/protocols/equalizer.svg",
  },
  Stakestone: {
    name: "Stakestone",
    icon: "/protocols/stakestone.svg",
  },
  Treehouse: {
    name: "Treehouse",
    icon: "/protocols/treehouse.svg",
  },
};

export const isExtendedProtocol = (t: unknown): t is ExtendedProtocols =>
  typeof t === "string" && !!PROTOCOL_DATA[t as ExtendedProtocols];

export function getProtocolData(t: string): ProtocolData {
  return isExtendedProtocol(t)
    ? PROTOCOL_DATA[t]
    : { name: "unknown", icon: "" };
}
