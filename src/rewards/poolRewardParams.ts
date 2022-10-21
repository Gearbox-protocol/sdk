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

// poolRewardsPerBlock.Goerli.dDAI.addValue(90000, BigNumber.from(0));
