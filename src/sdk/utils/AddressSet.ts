import { type Address, getAddress } from "viem";

/**
 * Case-insensitive set of EVM addresses.
 *
 * All addresses are checksummed via viem's {@link getAddress} on insertion and
 * lookup, so `0xabc...` and `0xABC...` are treated as the same entry.
 */
export class AddressSet extends Set<Address> {
  /**
   * @param entries - Optional initial addresses. Each is checksummed automatically.
   */
  constructor(entries?: Iterable<Address>) {
    super(Array.from(entries ?? []).map(a => getAddress(a)));
  }

  override add(value: Address): this {
    return super.add(getAddress(value));
  }

  override delete(value: Address): boolean {
    return super.delete(getAddress(value));
  }

  override has(value: Address): boolean {
    return super.has(getAddress(value));
  }

  /**
   * Returns all addresses as an array.
   **/
  public asArray(): Address[] {
    return Array.from(this);
  }

  /**
   * Maps each address through `fn` and returns the resulting array.
   **/
  public map<T>(fn: (address: Address) => T): T[] {
    return this.asArray().map(fn);
  }
}
