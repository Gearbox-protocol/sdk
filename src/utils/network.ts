import { ethers } from "ethers";
import { tokenDataByNetwork } from "../tokens/token";
import { ERC20__factory } from "../types";
import { ADDRESS_0X0, NetworkType } from "../core/constants";

export async function detectNetwork(
  provider: ethers.providers.Provider,
): Promise<NetworkType> {
  try {
    const usdcMainnet = ERC20__factory.connect(
      tokenDataByNetwork.Mainnet.USDC,
      provider,
    );
    await usdcMainnet.balanceOf(ADDRESS_0X0);
    return "Mainnet";
  } catch {
    try {
      const usdcMainnet = ERC20__factory.connect(
        tokenDataByNetwork.Kovan.USDC,
        provider,
      );
      await usdcMainnet.balanceOf(ADDRESS_0X0);
      return "Kovan";
    } catch {
      throw new Error("Unknown network");
    }
  }
}
