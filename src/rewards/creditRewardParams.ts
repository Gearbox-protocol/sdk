import { BigNumber } from "ethers";

import {
  CREDIT_MANAGER_DAI_V2_GOERLI,
  CREDIT_MANAGER_DAI_V2_MAINNET,
  CREDIT_MANAGER_USDC_V2_GOERLI,
  CREDIT_MANAGER_USDC_V2_MAINNET,
  CREDIT_MANAGER_WBTC_V2_GOERLI,
  CREDIT_MANAGER_WBTC_V2_MAINNET,
  CREDIT_MANAGER_WETH_V2_GOERLI,
  CREDIT_MANAGER_WETH_V2_MAINNET,
  CREDIT_MANAGER_WSTETH_V2_GOERLI,
  CREDIT_MANAGER_WSTETH_V2_MAINNET,
  CreditManagersV2,
} from "../contracts/contractsRegister";
import { DieselTokenTypes } from "../tokens/gear";
import { RangedValue } from "./range";

export const creditRewardsPerBlock: Record<CreditManagersV2, RangedValue> = {
  [CREDIT_MANAGER_DAI_V2_MAINNET]: new RangedValue(),
  [CREDIT_MANAGER_USDC_V2_MAINNET]: new RangedValue(),
  [CREDIT_MANAGER_WETH_V2_MAINNET]: new RangedValue(),
  [CREDIT_MANAGER_WSTETH_V2_MAINNET]: new RangedValue(),
  [CREDIT_MANAGER_WBTC_V2_MAINNET]: new RangedValue(),

  // GOERLI CM
  [CREDIT_MANAGER_DAI_V2_GOERLI]: new RangedValue(),
  [CREDIT_MANAGER_USDC_V2_GOERLI]: new RangedValue(),
  [CREDIT_MANAGER_WETH_V2_GOERLI]: new RangedValue(),
  [CREDIT_MANAGER_WSTETH_V2_GOERLI]: new RangedValue(),
  [CREDIT_MANAGER_WBTC_V2_GOERLI]: new RangedValue(),
};

export const GEAR_PER_BLOCK: Record<DieselTokenTypes, number> = {
  dDAI: 166,
  dUSDC: 166,
  dWETH: 230,
  dWBTC: 66,
  dwstETH: 118,
};

export const GOERLI_BLOCK = 7694030;

creditRewardsPerBlock[CREDIT_MANAGER_DAI_V2_GOERLI].addValue(
  GOERLI_BLOCK,
  BigNumber.from(10).pow(18).mul(GEAR_PER_BLOCK.dDAI).div(100),
);
creditRewardsPerBlock[CREDIT_MANAGER_USDC_V2_GOERLI].addValue(
  GOERLI_BLOCK,
  BigNumber.from(10).pow(18).mul(GEAR_PER_BLOCK.dUSDC).div(100),
);
creditRewardsPerBlock[CREDIT_MANAGER_WETH_V2_GOERLI].addValue(
  GOERLI_BLOCK,
  BigNumber.from(10).pow(18).mul(GEAR_PER_BLOCK.dWETH).div(100),
);
creditRewardsPerBlock[CREDIT_MANAGER_WSTETH_V2_GOERLI].addValue(
  GOERLI_BLOCK,
  BigNumber.from(10).pow(18).mul(GEAR_PER_BLOCK.dwstETH).div(100),
);
creditRewardsPerBlock[CREDIT_MANAGER_WBTC_V2_GOERLI].addValue(
  GOERLI_BLOCK,
  BigNumber.from(10).pow(18).mul(GEAR_PER_BLOCK.dWBTC).div(100),
);
