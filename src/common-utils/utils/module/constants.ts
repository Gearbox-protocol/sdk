import type { Address } from "viem";

import {
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
} from "../../../sdk/constants/math.js";
export const EMPTY_OBJECT = {};

export const EMPTY_ARRAY = [];

export const EMPTY_ADDRESS = "" as Address;

export const PERCENTAGE_FACTOR_1KK = PERCENTAGE_FACTOR * PERCENTAGE_DECIMALS;
