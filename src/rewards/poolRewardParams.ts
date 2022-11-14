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

export const GEAR_PER_BLOCK: Record<DieselTokenTypes, number> = {
  dDAI: 2283,
  dUSDC: 2283,
  dWETH: 3196,
  dWBTC: 913,
  dwstETH: 1636,
};

export const GEAR_PER_BLOCK_GIP30: Record<DieselTokenTypes, number> = {
  dDAI: 2283,
  dUSDC: 3101,
  dWETH: 4014,
  dWBTC: 457,
  dwstETH: 0,
};

export const GOERLI_BLOCK = 7694030;

poolRewardsPerBlock.Goerli.dDAI.addValue(
  GOERLI_BLOCK,
  BigNumber.from(10).pow(18).mul(GEAR_PER_BLOCK.dDAI).div(100),
);
poolRewardsPerBlock.Goerli.dUSDC.addValue(
  GOERLI_BLOCK,
  BigNumber.from(10).pow(18).mul(GEAR_PER_BLOCK.dUSDC).div(100),
);
poolRewardsPerBlock.Goerli.dWETH.addValue(
  GOERLI_BLOCK,
  BigNumber.from(10).pow(18).mul(GEAR_PER_BLOCK.dWETH).div(100),
);
poolRewardsPerBlock.Goerli.dWBTC.addValue(
  GOERLI_BLOCK,
  BigNumber.from(10).pow(18).mul(GEAR_PER_BLOCK.dWBTC).div(100),
);
poolRewardsPerBlock.Goerli.dwstETH.addValue(
  GOERLI_BLOCK,
  BigNumber.from(10).pow(18).mul(GEAR_PER_BLOCK.dwstETH).div(100),
);

export const MAINNET_BLOCK = 15820000;

poolRewardsPerBlock.Mainnet.dDAI.addValue(
  MAINNET_BLOCK,
  BigNumber.from(10).pow(18).mul(GEAR_PER_BLOCK.dDAI).div(100),
);
poolRewardsPerBlock.Mainnet.dUSDC.addValue(
  MAINNET_BLOCK,
  BigNumber.from(10).pow(18).mul(GEAR_PER_BLOCK.dUSDC).div(100),
);
poolRewardsPerBlock.Mainnet.dWETH.addValue(
  MAINNET_BLOCK,
  BigNumber.from(10).pow(18).mul(GEAR_PER_BLOCK.dWETH).div(100),
);
poolRewardsPerBlock.Mainnet.dWBTC.addValue(
  MAINNET_BLOCK,
  BigNumber.from(10).pow(18).mul(GEAR_PER_BLOCK.dWBTC).div(100),
);
poolRewardsPerBlock.Mainnet.dwstETH.addValue(
  MAINNET_BLOCK,
  BigNumber.from(10).pow(18).mul(GEAR_PER_BLOCK.dwstETH).div(100),
);

// poolRewardsPerBlock.Goerli.dDAI.addValue(90000, BigNumber.from(0));

export const MAINNET_BLOCK_GIP30 = 15977000;

poolRewardsPerBlock.Mainnet.dDAI.addValue(
  MAINNET_BLOCK_GIP30,
  BigNumber.from(10).pow(18).mul(GEAR_PER_BLOCK_GIP30.dDAI).div(100),
);
poolRewardsPerBlock.Mainnet.dUSDC.addValue(
  MAINNET_BLOCK_GIP30,
  BigNumber.from(10).pow(18).mul(GEAR_PER_BLOCK_GIP30.dUSDC).div(100),
);
poolRewardsPerBlock.Mainnet.dWETH.addValue(
  MAINNET_BLOCK_GIP30,
  BigNumber.from(10).pow(18).mul(GEAR_PER_BLOCK_GIP30.dWETH).div(100),
);
poolRewardsPerBlock.Mainnet.dWBTC.addValue(
  MAINNET_BLOCK_GIP30,
  BigNumber.from(10).pow(18).mul(GEAR_PER_BLOCK_GIP30.dWBTC).div(100),
);
poolRewardsPerBlock.Mainnet.dwstETH.addValue(
  MAINNET_BLOCK_GIP30,
  BigNumber.from(10).pow(18).mul(GEAR_PER_BLOCK_GIP30.dwstETH).div(100),
);
