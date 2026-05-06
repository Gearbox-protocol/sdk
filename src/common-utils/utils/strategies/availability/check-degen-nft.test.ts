import { describe, expect, it } from "vitest";
import { ADDRESS_0X0 } from "../../../../sdk/index.js";
import { buildCreditManager } from "../__test-utils.js";
import { checkDegenNFT } from "./check-degen-nft.js";

describe("checkDegenNFT", () => {
  it("returns zero address and marks freeOfNFT when degen mode disabled", () => {
    const cm = buildCreditManager({
      isDegenMode: false,
      degenNFT: "0xDEeEeEeEeEeEeEeEeEeEeEeEeEeEeEeEeEeEeEE",
    });

    const result = checkDegenNFT(cm);

    expect(result).toEqual({
      nftAddress: ADDRESS_0X0,
      freeOfNFT: true,
    });
  });

  it("returns NFT address and marks not free when degen mode enabled", () => {
    const nft = "0x1111111111111111111111111111111111111111";
    const cm = buildCreditManager({
      isDegenMode: true,
      degenNFT: nft,
    });

    const result = checkDegenNFT(cm);

    expect(result).toEqual({
      nftAddress: nft,
      freeOfNFT: false,
    });
  });
});
