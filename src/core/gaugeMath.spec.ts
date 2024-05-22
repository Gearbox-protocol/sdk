import { expect } from "chai";

import {
  BaseVote,
  GaugeMath,
  GetGaugeApyProps,
  SingleVoteState,
  VoteProps,
} from "./gaugeMath";

describe("GaugeMath vote() test", () => {
  it("with empty state and with no changes", () => {
    const s: SingleVoteState = { available: 0n, voteCalls: [] };
    const v: VoteProps = { state: s };
    const r = GaugeMath.vote(v);

    const res: SingleVoteState = { ...s, voteCalls: [] };
    expect(r).to.be.eql(res);
  });

  it("remove with no prev vote", () => {
    const s: SingleVoteState = { available: 0n, voteCalls: [] };
    const v: VoteProps = { state: s, change: { type: "remove", amount: 10n } };
    const r = GaugeMath.vote(v);

    const res: SingleVoteState = { ...s, voteCalls: [] };
    expect(r).to.be.eql(res);
  });
  it("remove with prev vote - more than available", () => {
    const s: SingleVoteState = {
      available: 0n,
      vote: { type: "lower", amount: 5n },
      voteCalls: [],
    };
    const v: VoteProps = { state: s, change: { type: "remove", amount: 10n } };
    const r = GaugeMath.vote(v);

    const res: SingleVoteState = {
      available: 5n,
      vote: { type: "lower", amount: 0n },
      voteCalls: [{ type: "remove", amount: 5n }],
    };
    expect(r).to.be.eql(res);
  });
  it("remove with prev vote - eq than available", () => {
    const s: SingleVoteState = {
      available: 0n,
      vote: { type: "lower", amount: 5n },
      voteCalls: [],
    };
    const v: VoteProps = { state: s, change: { type: "remove", amount: 5n } };
    const r = GaugeMath.vote(v);

    const res: SingleVoteState = {
      available: 5n,
      vote: { type: "lower", amount: 0n },
      voteCalls: [{ type: "remove", amount: 5n }],
    };
    expect(r).to.be.eql(res);
  });
  it("remove with prev vote - more than available", () => {
    const s: SingleVoteState = {
      available: 0n,
      vote: { type: "lower", amount: 10n },
      voteCalls: [],
    };
    const v: VoteProps = { state: s, change: { type: "remove", amount: 5n } };
    const r = GaugeMath.vote(v);

    const res: SingleVoteState = {
      available: 5n,
      vote: { type: "lower", amount: 5n },
      voteCalls: [{ type: "remove", amount: 5n }],
    };
    expect(r).to.be.eql(res);
  });

  it("add to zero", () => {
    const s: SingleVoteState = { available: 10n, voteCalls: [] };
    const v: VoteProps = { state: s, change: { type: "lower", amount: 10n } };
    const r = GaugeMath.vote(v);

    const res: SingleVoteState = {
      available: 0n,
      vote: { type: "lower", amount: 10n },
      voteCalls: [{ type: "lower", amount: 10n }],
    };
    expect(r).to.be.eql(res);
  });
  it("add to same type", () => {
    const s: SingleVoteState = {
      available: 10n,
      vote: { type: "lower", amount: 5n },
      voteCalls: [],
    };
    const v: VoteProps = { state: s, change: { type: "lower", amount: 10n } };
    const r = GaugeMath.vote(v);

    const res: SingleVoteState = {
      available: 0n,
      vote: { type: "lower", amount: 15n },
      voteCalls: [{ type: "lower", amount: 10n }],
    };
    expect(r).to.be.eql(res);
  });
  it("add different type", () => {
    const s: SingleVoteState = {
      available: 10n,
      vote: { type: "lower", amount: 10n },
      voteCalls: [],
    };
    const v: VoteProps = { state: s, change: { type: "raise", amount: 5n } };
    const r = GaugeMath.vote(v);

    const res: SingleVoteState = {
      available: 15n,
      vote: { type: "raise", amount: 5n },
      voteCalls: [
        { type: "remove", amount: 10n },
        { type: "raise", amount: 5n },
      ],
    };
    expect(r).to.be.eql(res);
  });

  it("available can be negative after add", () => {
    const s: SingleVoteState = {
      available: 5n,
      vote: { type: "lower", amount: 5n },
      voteCalls: [],
    };
    const v: VoteProps = { state: s, change: { type: "raise", amount: 15n } };
    const r = GaugeMath.vote(v);

    const res: SingleVoteState = {
      available: -5n,
      vote: { type: "raise", amount: 15n },
      voteCalls: [
        { type: "remove", amount: 5n },
        { type: "raise", amount: 15n },
      ],
    };
    expect(r).to.be.eql(res);
  });
});

describe("GaugeMath revertVote() test", () => {
  it("if no votes before & after, should return initial amount", () => {
    const initialBalance = 21n;

    const r = GaugeMath.revertVote({
      balanceAfter: initialBalance,
      nextVoteType: "lower",
    });

    expect(r).to.be.eql(initialBalance);
  });

  it("if no vote after and next expected type is not changed, should return initial amount", () => {
    const initialBalance = 27n;

    const initialVote: BaseVote = {
      type: "lower",
      amount: 99n,
    };

    const r = GaugeMath.revertVote({
      balanceAfter: initialBalance,
      initialVote,
      nextVoteType: "lower",
    });

    expect(r).to.be.eql(initialBalance);
  });
  it("if no vote after and next expected type is changed, should revert initial vote", () => {
    const initialBalance = 27n;

    const initialVote: BaseVote = {
      type: "lower",
      amount: 99n,
    };

    const r = GaugeMath.revertVote({
      balanceAfter: initialBalance,
      initialVote,
      nextVoteType: "raise",
    });

    expect(r).to.be.eql(initialBalance + initialVote.amount);
  });

  it("if no vote before, should revert vote after", () => {
    const initialBalance = 26n;
    const voteBy = 5n;

    const voteAfter: SingleVoteState = {
      available: initialBalance - voteBy,
      vote: { type: "lower", amount: voteBy },
      voteCalls: [{ type: "lower", amount: voteBy }],
    };
    const balanceAfter = voteAfter.available;

    const r = GaugeMath.revertVote({
      balanceAfter,
      nextVoteType: "lower",
      voteAfter: voteAfter,
    });

    expect(r).to.be.eql(initialBalance);
  });

  it("if vote before type matches expected type, should revert vote after", () => {
    const initialBalance = 10n;
    const voteBy = 6n;

    const initialVote: BaseVote = {
      type: "lower",
      amount: 20n,
    };
    const voteAfter: SingleVoteState = {
      available: initialBalance - voteBy,
      vote: { type: "lower", amount: initialVote.amount + voteBy },
      voteCalls: [{ type: "lower", amount: voteBy }],
    };
    const balanceAfter = voteAfter.available;

    const r = GaugeMath.revertVote({
      initialVote,
      balanceAfter,
      nextVoteType: "lower",
      voteAfter: voteAfter,
    });

    expect(r).to.be.eql(initialBalance);
  });
  it("if vote before type doesn't match expected type, should revert vote before", () => {
    const initialBalance = 10n;
    const voteBy = 20n;

    const initialVote: BaseVote = {
      type: "raise",
      amount: 61n,
    };
    const voteAfter: SingleVoteState = {
      available: initialBalance + initialVote.amount - voteBy,
      vote: { type: "lower", amount: voteBy },
      voteCalls: [
        { type: "remove", amount: initialVote.amount },
        { type: "lower", amount: voteBy },
      ],
    };

    const r = GaugeMath.revertVote({
      initialVote,
      balanceAfter: voteAfter.available,
      nextVoteType: "lower",
      voteAfter: voteAfter,
    });

    expect(r).to.be.eql(initialBalance + initialVote.amount);
  });

  it("on remove, if vote before type matches expected type, should revert removal", () => {
    const initialBalance = 100n;
    const voteBy = 13n;

    const initialVote: BaseVote = {
      type: "lower",
      amount: 30n,
    };
    const voteAfter: SingleVoteState = {
      available: initialBalance + voteBy,
      vote: { type: "lower", amount: initialVote.amount - voteBy },
      voteCalls: [{ type: "remove", amount: voteBy }],
    };

    const r = GaugeMath.revertVote({
      initialVote,
      balanceAfter: voteAfter.available,
      nextVoteType: "lower",
      voteAfter: voteAfter,
    });

    expect(r).to.be.eql(initialBalance);
  });
  it("on remove, if vote before type doesn't match expected type, should revert vote before", () => {
    const initialBalance = 100n;
    const voteBy = 13n;

    const initialVote: BaseVote = {
      type: "raise",
      amount: 30n,
    };
    const voteAfter: SingleVoteState = {
      available: initialBalance + voteBy,
      vote: { type: "raise", amount: initialVote.amount - voteBy },
      voteCalls: [{ type: "remove", amount: voteBy }],
    };

    const r = GaugeMath.revertVote({
      initialVote,
      balanceAfter: voteAfter.available,
      nextVoteType: "lower",
      voteAfter: voteAfter,
    });

    expect(r).to.be.eql(initialBalance + initialVote.amount);
  });
});

describe("GaugeMath getGaugeApy() test", () => {
  it("should return null if no quota", () => {
    const vote: GetGaugeApyProps["vote"] = { amount: 0n, type: "lower" };
    const voteAfter: GetGaugeApyProps["voteAfter"] = {
      vote: { amount: 5n, type: "lower" },
      voteCalls: [{ amount: 5n, type: "lower" }],
    };

    const r = GaugeMath.getGaugeApy({
      quota: undefined,
      vote,
      voteAfter,
    });

    expect(r).to.be.eql(null);
  });
  it("should return min rate if total is zero", () => {
    const quota: GetGaugeApyProps["quota"] = {
      totalVotesCaSide: 0n,
      totalVotesLpSide: 0n,
      stakerVotesCaSide: 0n,
      stakerVotesLpSide: 0n,
      minRate: 12n,
      maxRate: 12345n,
    };

    const r = GaugeMath.getGaugeApy({
      quota,
    });

    expect(r).to.be.eql(12n);
  });
  it("should calculate quota without votes", () => {
    const quota: GetGaugeApyProps["quota"] = {
      totalVotesCaSide: 100n,
      totalVotesLpSide: 100n,
      stakerVotesCaSide: 10n,
      stakerVotesLpSide: 0n,
      minRate: 0n,
      maxRate: 10000n,
    };

    const r = GaugeMath.getGaugeApy({
      quota,
    });

    expect(r).to.be.eql(5000n);
  });
  it("should calculate quota with prev vote", () => {
    const quota: GetGaugeApyProps["quota"] = {
      totalVotesCaSide: 100n,
      totalVotesLpSide: 100n,
      stakerVotesCaSide: 10n,
      stakerVotesLpSide: 0n,
      minRate: 0n,
      maxRate: 10000n,
    };
    const vote: GetGaugeApyProps["vote"] = { amount: 10n, type: "lower" };

    const r = GaugeMath.getGaugeApy({
      quota,
      vote,
    });

    expect(r).to.be.eql(5000n);
  });
  it("should calculate quota with same vote increase", () => {
    const quota: GetGaugeApyProps["quota"] = {
      totalVotesCaSide: 100n,
      totalVotesLpSide: 100n,
      stakerVotesCaSide: 10n,
      stakerVotesLpSide: 0n,
      minRate: 0n,
      maxRate: 10000n,
    };
    const vote: GetGaugeApyProps["vote"] = { amount: 10n, type: "lower" };
    const voteAfter: GetGaugeApyProps["voteAfter"] = {
      vote: { amount: 20n, type: "lower" },
      voteCalls: [{ amount: 10n, type: "lower" }],
    };

    const r = GaugeMath.getGaugeApy({
      quota,
      vote,
      voteAfter,
    });

    expect(r).to.be.eql(4761n);
  });
  it("should calculate quota with different vote increase", () => {
    const quota: GetGaugeApyProps["quota"] = {
      totalVotesCaSide: 100n,
      totalVotesLpSide: 100n,
      stakerVotesCaSide: 20n,
      stakerVotesLpSide: 0n,
      minRate: 0n,
      maxRate: 10000n,
    };
    const vote: GetGaugeApyProps["vote"] = { amount: 30n, type: "lower" };
    const voteAfter: GetGaugeApyProps["voteAfter"] = {
      vote: { amount: 20n, type: "raise" },
      voteCalls: [
        { amount: 30n, type: "remove" },
        { amount: 20n, type: "raise" },
      ],
    };

    const r = GaugeMath.getGaugeApy({
      quota,
      vote,
      voteAfter,
    });

    expect(r).to.be.eql(6315n);
  });
  it("should calculate quota with vote remove", () => {
    const quota: GetGaugeApyProps["quota"] = {
      totalVotesCaSide: 100n,
      totalVotesLpSide: 100n,
      stakerVotesCaSide: 20n,
      stakerVotesLpSide: 0n,
      minRate: 0n,
      maxRate: 10000n,
    };
    const vote: GetGaugeApyProps["vote"] = { amount: 20n, type: "lower" };
    const voteAfter: GetGaugeApyProps["voteAfter"] = {
      vote: { amount: 0n, type: "lower" },
      voteCalls: [{ amount: 20n, type: "remove" }],
    };

    const r = GaugeMath.getGaugeApy({
      quota,
      vote,
      voteAfter,
    });

    expect(r).to.be.eql(5555n);
  });
});
