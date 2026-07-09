import { iTumblerV310Abi } from "../../../abi/310/generated.js";
import { AbstractFactory } from "./abstract-factory.js";

// note: Gauge is no more supported
const abi = iTumblerV310Abi;

export class RateKeeperFactory extends AbstractFactory<typeof abi> {
  constructor() {
    super(abi);
  }
}
