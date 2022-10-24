import { BigNumber } from "ethers";

import { NetworkType } from "../core/constants";
import { DieselTokenTypes } from "../tokens/gear";
import { RangedValue } from "./range";

export const poolRewardsPerBlock: Record<
  NetworkType,
  Record<DieselTokenTypes, RangedValue>
> = {
  Mainnet: {
    dDAI: new RangedValue(),
    dUSDC: new RangedValue(),
    dWETH: new RangedValue(),
    dWBTC: new RangedValue(),
    dwstETH: new RangedValue(),
  },
  Goerli: {
    dDAI: new RangedValue(),
    dUSDC: new RangedValue(),
    dWETH: new RangedValue(),
    dWBTC: new RangedValue(),
    dwstETH: new RangedValue(),
  },
};

poolRewardsPerBlock.Goerli.dDAI.addValue(
  7694030,
  BigNumber.from(10).pow(18).mul(2283).div(100),
);
poolRewardsPerBlock.Goerli.dUSDC.addValue(
  7694030,
  BigNumber.from(10).pow(6).mul(2283).div(100),
);
poolRewardsPerBlock.Goerli.dWETH.addValue(
  7694030,
  BigNumber.from(10).pow(18).mul(3196).div(100),
);
poolRewardsPerBlock.Goerli.dWBTC.addValue(
  7694030,
  BigNumber.from(10).pow(8).mul(913).div(100),
);
poolRewardsPerBlock.Goerli.dwstETH.addValue(
  7694030,
  BigNumber.from(10).pow(18).mul(1636).div(100),
);

poolRewardsPerBlock.Mainnet.dDAI.addValue(
  7694030,
  BigNumber.from(10).pow(18).mul(2283).div(100),
);
poolRewardsPerBlock.Mainnet.dUSDC.addValue(
  7694030,
  BigNumber.from(10).pow(6).mul(2283).div(100),
);
poolRewardsPerBlock.Mainnet.dWETH.addValue(
  7694030,
  BigNumber.from(10).pow(18).mul(3196).div(100),
);
poolRewardsPerBlock.Mainnet.dWBTC.addValue(
  7694030,
  BigNumber.from(10).pow(8).mul(913).div(100),
);
poolRewardsPerBlock.Mainnet.dwstETH.addValue(
  7694030,
  BigNumber.from(10).pow(18).mul(1636).div(100),
);

// poolRewardsPerBlock.Goerli.dDAI.addValue(90000, BigNumber.from(0));
