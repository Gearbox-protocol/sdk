import { ethers } from "ethers";

import { ADDRESS_0X0, NetworkType } from "../core/constants";
import { tokenDataByNetwork } from "../tokens/token";
import { IERC20__factory } from "../types";

export async function detectNetwork(
  provider: ethers.providers.Provider,
): Promise<NetworkType> {
  try {
    const usdcMainnet = IERC20__factory.connect(
      tokenDataByNetwork.Mainnet.USDC,
      provider,
    );
    await usdcMainnet.balanceOf(ADDRESS_0X0);
    return "Mainnet";
  } catch {
    try {
      const usdcMainnet = IERC20__factory.connect(
        tokenDataByNetwork.Goerli.USDC,
        provider,
      );
      await usdcMainnet.balanceOf(ADDRESS_0X0);
      return "Goerli";
    } catch {
      throw new Error("Unknown network");
    }
  }
}
