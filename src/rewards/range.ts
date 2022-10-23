import { BigNumber } from "ethers";

export class RangedValue {
  protected initialValue: BigNumber;
  protected data: Map<number, BigNumber> = new Map();
  protected _keys: Array<number> = [];

  constructor(initialValue?: BigNumber) {
    this.initialValue = initialValue || BigNumber.from(0);
  }
  addValue(from: number, value: BigNumber) {
    this.data.set(from, value);
    this._keys = [...this._keys, from].sort((a, b) => (a > b ? 1 : -1));
  }

  getValue(at: number): BigNumber {
    for (let index of [...this._keys].reverse()) {
      if (at >= index) {
        const value = this.data.get(index);
        if (!value)
          throw new Error(`Unexpectedly cant find a value with index ${index}`);
        return value;
      }
    }

    return this.initialValue;
  }

  getValues(sortedKeys: Array<number>): Array<BigNumber> {
    const lastElm = this._keys.length - 1;
    let ownKeyIndex = lastElm;
    const result: Array<BigNumber> = [];
    for (let sk of [...sortedKeys].reverse()) {
      if (sk < this._keys[0]) {
        result.push(this.initialValue);
      } else if (sk > this._keys[lastElm]) {
        result.push(this.getMapValue(this._keys[lastElm]));
      } else {
        if (sk < this._keys[ownKeyIndex]) {
          for (; ownKeyIndex >= 0; ownKeyIndex--) {
            if (sk >= this._keys[ownKeyIndex]) break;
          }
        }
        result.push(this.getMapValue(this._keys[ownKeyIndex]));
      }
    }
    return result.reverse();
  }

  protected getMapValue(index: number) {
    const value = this.data.get(index);
    if (!value) {
      if (this.data.size > 0) {
        throw new Error(`Can get value for ${index}`);
      } else {
        return this.initialValue;
      }
    }
    return value;
  }

  get keys(): Array<number> {
    return this._keys;
  }
}
