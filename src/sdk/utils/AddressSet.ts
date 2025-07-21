import { type Address, getAddress } from "viem";

export class AddressSet extends Set<Address> {
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

  public asArray(): Address[] {
    return Array.from(this);
  }

  public map<T>(fn: (address: Address) => T): T[] {
    return this.asArray().map(fn);
  }
}
