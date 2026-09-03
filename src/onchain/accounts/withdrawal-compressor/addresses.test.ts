import { describe, expect, it } from "vitest";
import {
  getLegacyWithdrawalCompressorAddresses,
  getWithdrawalCompressorAddress,
} from "./addresses.js";

describe("withdrawal compressor locations", () => {
  it("keeps the historical Mainnet cache separate from the active compressor", () => {
    expect(getWithdrawalCompressorAddress("Mainnet")).toMatchObject({
      address: "0x6FA0c5404C31D0161bb39Cc1311aac998A38ecD5",
      version: 313,
    });
    expect(getLegacyWithdrawalCompressorAddresses("Mainnet")).toEqual([
      {
        address: "0x36F3d0Bb73CBC2E94fE24dF0f26a689409cF9023",
        version: 310,
      },
    ]);
  });

  it("does not create a legacy cache where none is configured", () => {
    expect(getLegacyWithdrawalCompressorAddresses("Monad")).toEqual([]);
  });
});
