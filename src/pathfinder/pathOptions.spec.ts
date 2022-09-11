import { expect } from "chai";
import { BigNumberish } from "ethers";

import { tokenDataByNetwork } from "../tokens/token";
import { PathOptionFactory, PathOptionSerie } from "./pathOptions";

describe("PathOptionFactory test", () => {
  it("next works correctly", () => {
    const serie: PathOptionSerie = [
      {
        target: tokenDataByNetwork.Mainnet["3Crv"],
        option: 0,
        totalOptions: 3,
      },
      {
        target: tokenDataByNetwork.Mainnet.FRAX3CRV,
        option: 0,
        totalOptions: 2,
      },
      {
        target: tokenDataByNetwork.Mainnet.LUSD3CRV,
        option: 0,
        totalOptions: 2,
      },
    ];

    const expectedNext = JSON.parse(JSON.stringify(serie));

    expectedNext[2].option = 1;
    let next = PathOptionFactory.next(serie);
    expect(next).to.be.eql(expectedNext);

    expectedNext[1].option = 1;
    expectedNext[2].option = 0;
    next = PathOptionFactory.next(next);
    expect(next).to.be.eql(expectedNext);

    expectedNext[1].option = 1;
    expectedNext[2].option = 1;
    next = PathOptionFactory.next(next);
    expect(next).to.be.eql(expectedNext);

    expectedNext[0].option = 1;
    expectedNext[1].option = 0;
    expectedNext[2].option = 0;
    next = PathOptionFactory.next(next);
    expect(next).to.be.eql(expectedNext);

    expectedNext[0].option = 1;
    expectedNext[1].option = 0;
    expectedNext[2].option = 1;
    next = PathOptionFactory.next(next);
    expect(next).to.be.eql(expectedNext);

    expectedNext[0].option = 1;
    expectedNext[1].option = 1;
    expectedNext[2].option = 0;
    next = PathOptionFactory.next(next);
    expect(next).to.be.eql(expectedNext);

    expectedNext[0].option = 1;
    expectedNext[1].option = 1;
    expectedNext[2].option = 1;
    next = PathOptionFactory.next(next);
    expect(next).to.be.eql(expectedNext);
  });

  it("generatePathOptions works correctly", () => {
    const balances: Record<string, BigNumberish> = {
      [tokenDataByNetwork.Mainnet["1INCH"]]: 100,
      [tokenDataByNetwork.Mainnet["3Crv"]]: 200,
      [tokenDataByNetwork.Mainnet.USDC]: 200,
      [tokenDataByNetwork.Mainnet.FRAX3CRV]: 200,
      [tokenDataByNetwork.Mainnet.LUSD3CRV]: 200,
    };

    const result = PathOptionFactory.generatePathOptions(balances, 4);

    const expected: PathOptionSerie = [
      {
        target: tokenDataByNetwork.Mainnet["3Crv"],
        option: 0,
        totalOptions: 3,
      },
      {
        target: tokenDataByNetwork.Mainnet.FRAX3CRV,
        option: 0,
        totalOptions: 2,
      },
      {
        target: tokenDataByNetwork.Mainnet.LUSD3CRV,
        option: 0,
        totalOptions: 2,
      },
    ];

    for (let i = 0; i < 3; i++) {
      expected[0].option = i;
      expect(expected).to.be.eql(result[i]);
    }
  });
});
