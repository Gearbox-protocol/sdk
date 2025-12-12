import { type Address, parseEther } from "viem";
import { ierc20Abi } from "../../abi/iERC20.js";
import { type GearboxSDK, SDKConstruct } from "../../sdk/index.js";
import { iOwnableAbi } from "../abi.js";
import type { AnvilClient } from "../createAnvilClient.js";
import type { IMinter } from "./types.js";

export default abstract class AbstractMinter
  extends SDKConstruct
  implements IMinter
{
  protected readonly anvil: AnvilClient;
  public name: string;

  constructor(sdk: GearboxSDK, anvil: AnvilClient) {
    super(sdk);
    this.anvil = anvil;
    this.name = this.constructor.name;
  }

  public async tryMint(
    token: Address,
    dest: Address,
    amount: bigint,
  ): Promise<bigint> {
    const amnt = this.fmt(token, amount);
    const before = await this.balanceOf(token, dest);
    try {
      await this.mint(token, dest, amount);
    } catch (e) {
      this.logger?.warn(`failed to mint ${amnt} to ${dest}: ${e}`);
    }
    const after = await this.balanceOf(token, dest);
    const minted = after - before;
    this.logger?.debug(`minted ${this.fmt(token, minted)} to ${dest}`);
    return after;
  }

  public abstract mint(
    token: Address,
    dest: Address,
    amount: bigint,
  ): Promise<void>;

  protected async getOwner(address: Address): Promise<Address> {
    const owner = await this.anvil.readContract({
      address,
      abi: iOwnableAbi,
      functionName: "owner",
    });
    this.logger?.debug(`owner of ${this.sdk.labelAddress(address)}: ${owner}`);
    return owner;
  }

  protected async impersonateWithBalance(
    address: Address,
    balance = "1000",
  ): Promise<() => Promise<void>> {
    await this.anvil.impersonateAccount({ address });
    await this.anvil.setBalance({
      address,
      value: parseEther(balance),
    });
    return async () => {
      await this.anvil.stopImpersonatingAccount({ address });
    };
  }

  protected fmt(token: Address, amount: bigint): string {
    return this.sdk.tokensMeta.formatBN(token, amount, { symbol: true });
  }

  protected balanceOf(token: Address, dest: Address): Promise<bigint> {
    return this.anvil.readContract({
      address: token,
      abi: ierc20Abi,
      functionName: "balanceOf",
      args: [dest],
    });
  }
}
