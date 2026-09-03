import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import {
  type IconComposite,
  TokenData,
  type TokenDataPayload,
} from "./token-data.js";

const payload: TokenDataPayload = {
  addr: "0xab7d50fc2486a1ac06516e2ece9dadc95ba8cd20",
  symbol: "wdwstETH",
  name: "Withdrawal phantom",
  decimals: 18,
  isPhantom: true,
};

describe("TokenData icons", () => {
  it.each([
    ["0xab7d50fc2486a1ac06516e2ece9dadc95ba8cd20", "cp0xLRT", "wstETH"],
    ["0x6252467c2fefb61cb55180282943139baeea36c5", "rstETH", "wstETH"],
    ["0xd412ca00d177eba2843348f9c50dd17bfce32c40", "pzETH", "wstETH"],
    ["0x26c98674e623647f11909791593fa3b6e9406c67", "steak7LRT", "wstETH"],
    ["0x9fb930eacadad079683a4758424a53b9b3692775", "Re7LRT", "wstETH"],
    ["0xd7f1a4e3aba92a9d20987c752bd4a6cc759d7738", "hgETH", "rsETH"],
    ["0xd2a72aa2d3f2815673f4bb887559c333d7f1f34f", "mEDGE", "USDC"],
    ["0xdc8e2bc5a360988f0eb6b70d42d7bfb0f72c1976", "rsETH", "WETH", "kpwWETH"],
    [
      "0xc71219dca5a671aa6268ab8fb35e570bd72f372b",
      "liUSD-1w",
      "iUSD",
      "wdiUSD",
    ],
  ])("selects the %s pair by address despite shared symbols", (addr, source, target, symbol = payload.symbol) => {
    const token = new TokenData({
      ...payload,
      addr: `0x${addr.slice(2).toUpperCase()}` as Address,
      symbol,
      title: "Custom title",
    });

    expect(token.address).toBe(addr);
    expect(token.symbol).toBe(symbol);
    expect(token.title).toBe(`${source}\u00A0→\u00A0${target}`);
    expect(token.icon).toBe(
      `https://static.gearbox.finance/tokens/${source.toLowerCase()}_> ${target.toLowerCase()}.svg`,
    );
  });

  it.each([
    "wdwstETH",
    "USDC_e",
    "PT-sUSDf-29JAN2026",
  ])("retains symbol-based icons for unmapped addresses (%s)", symbol => {
    const token = new TokenData({
      ...payload,
      addr: "0x0000000000000000000000000000000000000001",
      symbol,
      title: "Custom title",
    });
    expect(token.symbol).toBe(symbol);
    expect(token.icon).toBe(
      `https://static.gearbox.finance/tokens/${symbol.toLowerCase()}.svg`,
    );
  });

  it.each<string | IconComposite>([
    "https://example.com/custom.svg",
    "",
    {
      kind: "composite",
      preset: "centered_foreground",
      layers: [
        { type: "symbol", symbol: "cp0xLRT" },
        { type: "symbol", symbol: "wstETH" },
      ],
    },
  ])("preserves an explicit icon override (%j)", icon => {
    expect(new TokenData({ ...payload, icon }).icon).toBe(icon);
  });
});
