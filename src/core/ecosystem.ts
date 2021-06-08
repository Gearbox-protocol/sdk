import uniswapLogo from "../assets/protocols/uniswap.svg";
import sushiSwapLogo from "../assets/protocols/sushi.svg";
import curveLogo from "../assets/protocols/curve.svg";

export interface Partner {
  id: string;
  name: string;
  description: string;
  link: string;
  icon: string;
}

export const ecosystemPartners: Record<string, Partner> = {
  uniswap: {
    id: "uniswap",
    name: "Uniswap",
    description: "Trade on Uniswap with margin",
    link: "https://uniswap.gearbox.fi",
    icon: uniswapLogo,
  },
  sushiswap: {
    id: "sushiswap",
    name: "Sushi",
    description: "Trade on Sushiswap with margin",
    link: "https://sushi.gearbox.fi",
    icon: sushiSwapLogo,
  },
  curve: {
    id: "curve",
    name: "Curve",
    description: "Trade on curve with margin",
    link: "https://margin.gearbox.fi",
    icon: curveLogo,
  },
};

export const partnersByKind = {
  trade: ["uniswap", "sushiswap"],
  stable: ["curve"],
};
