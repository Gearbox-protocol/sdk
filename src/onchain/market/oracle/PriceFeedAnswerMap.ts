import type { Address } from "viem";

import type { PriceFeedAnswer } from "../../base/index.js";
import { AddressMap } from "../../utils/index.js";

export default class PriceFeedAnswerMap extends AddressMap<PriceFeedAnswer> {
  public price(token: Address): bigint {
    const answer = this.get(token);
    if (!answer) {
      throw new Error(`no answer found for token ${token}`);
    }
    const { success, price } = answer;
    if (!success) {
      throw new Error(`answer (${price}) is not successful for token ${token}`);
    }
    return price;
  }
}
