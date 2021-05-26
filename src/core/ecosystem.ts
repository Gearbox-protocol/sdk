import uniswapLogo from "../assets/partners/uniswap.svg";
import sushiSwapLogo from "../assets/partners/sushi.svg";
import curveLogo from "../assets/partners/curve.svg";

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
    link: "uniswap.gearbox.fi",
    icon: uniswapLogo,
  },
  sushiswap: {
    id: "sushiswap",
    name: "Sushi",
    description: "Trade on Sushiswap with margin",
    link: "sushi.gearbox.fi",
    icon: sushiSwapLogo,
  },
  curve: {
    id: "curve",
    name: "Curve",
    description: "Trade on curve with margin",
    link: "margin.gearbox.fi",
    icon: curveLogo,
  },
};

export const partnersByKind = {
  trade: ["uniswap", "sushiswap"],
  stable: ["curve"],
};
