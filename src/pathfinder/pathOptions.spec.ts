import type { CurveLPToken } from "@gearbox-protocol/sdk-gov";
import { tokenDataByNetwork } from "@gearbox-protocol/sdk-gov";
import { expect } from "chai";
import type { Address } from "viem";

import type { BalanceInterface, PathOptionSerie } from "./pathOptions";
import { PathOptionFactory } from "./pathOptions";

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
    const balances: Record<Address, BalanceInterface> = {
      [tokenDataByNetwork.Mainnet["1INCH"]]: { balance: 100n },
      [tokenDataByNetwork.Mainnet["3Crv"]]: { balance: 200n },
      [tokenDataByNetwork.Mainnet.USDC]: { balance: 200n },
      [tokenDataByNetwork.Mainnet.FRAX3CRV]: { balance: 200n },
    };

    const result = PathOptionFactory.generatePathOptions(
      balances,
      4,
      "Mainnet",
    );

    const expected: Array<PathOptionSerie> = [
      [
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
      ],
      [
        {
          target: tokenDataByNetwork.Mainnet["3Crv"],
          option: 2,
          totalOptions: 3,
        },
        {
          target: tokenDataByNetwork.Mainnet.FRAX3CRV,
          option: 0,
          totalOptions: 2,
        },
      ],
    ];

    expect(expected).to.be.eql(result);
  });

  it(" getCurvePools works correctly", () => {
    let balances: Record<Address, BalanceInterface> = {
      [tokenDataByNetwork.Mainnet["1INCH"]]: { balance: 100n },
      [tokenDataByNetwork.Mainnet["3Crv"]]: { balance: 200n },
      [tokenDataByNetwork.Mainnet.USDC]: { balance: 200n },
      [tokenDataByNetwork.Mainnet.FRAX3CRV]: { balance: 200n },
      [tokenDataByNetwork.Mainnet.LUSD3CRV]: { balance: 200n },
    };

    let expectedCurvePools: Array<CurveLPToken> = [
      "3Crv",
      "FRAX3CRV",
      "LUSD3CRV",
    ];

    expect(PathOptionFactory.getCurvePools(balances)).to.be.eql(
      expectedCurvePools,
    );

    balances = {
      [tokenDataByNetwork.Mainnet["1INCH"]]: { balance: 100n },
      [tokenDataByNetwork.Mainnet["3Crv"]]: { balance: 200n },
      [tokenDataByNetwork.Mainnet.USDC]: { balance: 200n },
      [tokenDataByNetwork.Mainnet.yvCurve_FRAX]: { balance: 200n },
      [tokenDataByNetwork.Mainnet.yvCurve_stETH]: { balance: 200n },
    };

    expectedCurvePools = ["3Crv", "FRAX3CRV", "steCRV"];

    expect(PathOptionFactory.getCurvePools(balances)).to.be.eql(
      expectedCurvePools,
    );

    balances = {
      [tokenDataByNetwork.Mainnet["1INCH"]]: { balance: 100n },
      [tokenDataByNetwork.Mainnet.USDC]: { balance: 200n },
      [tokenDataByNetwork.Mainnet.cvx3Crv]: { balance: 200n },
      [tokenDataByNetwork.Mainnet.cvxFRAX3CRV]: { balance: 200n },
    };

    expectedCurvePools = ["3Crv", "FRAX3CRV"];

    expect(PathOptionFactory.getCurvePools(balances)).to.be.eql(
      expectedCurvePools,
    );

    balances = {
      [tokenDataByNetwork.Mainnet.wstETH]: { balance: 100n },
      [tokenDataByNetwork.Mainnet.USDC]: { balance: 200n },
      [tokenDataByNetwork.Mainnet.stkcvx3Crv]: { balance: 200n },
      [tokenDataByNetwork.Mainnet.stkcvxFRAX3CRV]: { balance: 200n },
    };

    expectedCurvePools = ["3Crv", "FRAX3CRV"];

    expect(PathOptionFactory.getCurvePools(balances)).to.be.eql(
      expectedCurvePools,
    );

    balances = {
      [tokenDataByNetwork.Mainnet["3Crv"]]: { balance: 100n },
      [tokenDataByNetwork.Mainnet.USDC]: { balance: 200n },
      [tokenDataByNetwork.Mainnet.stkcvx3Crv]: { balance: 200n },
      [tokenDataByNetwork.Mainnet.cvx3Crv]: { balance: 200n },
      [tokenDataByNetwork.Mainnet.yvCurve_stETH]: { balance: 200n },
    };

    expectedCurvePools = ["3Crv", "steCRV"];

    expect(PathOptionFactory.getCurvePools(balances)).to.be.eql(
      expectedCurvePools,
    );
  });
});
