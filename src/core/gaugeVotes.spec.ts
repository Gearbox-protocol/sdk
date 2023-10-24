import { expect } from "chai";

import { BaseVote, SingleVoteState, VoteMath, VoteProps } from "./gaugeVotes";

describe("VoteMath test", () => {
  it("vote: with empty state and with no changes", () => {
    const s: SingleVoteState = { available: 0n, voteCalls: [] };
    const v: VoteProps = { state: s };
    const r = VoteMath.vote(v);

    const res: SingleVoteState = { ...s, voteCalls: [] };
    expect(r).to.be.eql(res);
  });

  it("vote: remove with no prev vote", () => {
    const s: SingleVoteState = { available: 0n, voteCalls: [] };
    const v: VoteProps = { state: s, change: { type: "remove", amount: 10n } };
    const r = VoteMath.vote(v);

    const res: SingleVoteState = { ...s, voteCalls: [] };
    expect(r).to.be.eql(res);
  });
  it("vote: remove with prev vote - more than available", () => {
    const s: SingleVoteState = {
      available: 0n,
      vote: { type: "lower", amount: 5n },
      voteCalls: [],
    };
    const v: VoteProps = { state: s, change: { type: "remove", amount: 10n } };
    const r = VoteMath.vote(v);

    const res: SingleVoteState = {
      available: 5n,
      vote: { type: "lower", amount: 0n },
      voteCalls: [{ type: "remove", amount: 5n }],
    };
    expect(r).to.be.eql(res);
  });
  it("vote: remove with prev vote - eq than available", () => {
    const s: SingleVoteState = {
      available: 0n,
      vote: { type: "lower", amount: 5n },
      voteCalls: [],
    };
    const v: VoteProps = { state: s, change: { type: "remove", amount: 5n } };
    const r = VoteMath.vote(v);

    const res: SingleVoteState = {
      available: 5n,
      vote: { type: "lower", amount: 0n },
      voteCalls: [{ type: "remove", amount: 5n }],
    };
    expect(r).to.be.eql(res);
  });
  it("vote: remove with prev vote - more than available", () => {
    const s: SingleVoteState = {
      available: 0n,
      vote: { type: "lower", amount: 10n },
      voteCalls: [],
    };
    const v: VoteProps = { state: s, change: { type: "remove", amount: 5n } };
    const r = VoteMath.vote(v);

    const res: SingleVoteState = {
      available: 5n,
      vote: { type: "lower", amount: 5n },
      voteCalls: [{ type: "remove", amount: 5n }],
    };
    expect(r).to.be.eql(res);
  });

  it("vote: add to zero", () => {
    const s: SingleVoteState = { available: 10n, voteCalls: [] };
    const v: VoteProps = { state: s, change: { type: "lower", amount: 10n } };
    const r = VoteMath.vote(v);

    const res: SingleVoteState = {
      available: 0n,
      vote: { type: "lower", amount: 10n },
      voteCalls: [{ type: "lower", amount: 10n }],
    };
    expect(r).to.be.eql(res);
  });
  it("vote: add to same type", () => {
    const s: SingleVoteState = {
      available: 10n,
      vote: { type: "lower", amount: 5n },
      voteCalls: [],
    };
    const v: VoteProps = { state: s, change: { type: "lower", amount: 10n } };
    const r = VoteMath.vote(v);

    const res: SingleVoteState = {
      available: 0n,
      vote: { type: "lower", amount: 15n },
      voteCalls: [{ type: "lower", amount: 10n }],
    };
    expect(r).to.be.eql(res);
  });
  it("vote: add different type", () => {
    const s: SingleVoteState = {
      available: 10n,
      vote: { type: "lower", amount: 10n },
      voteCalls: [],
    };
    const v: VoteProps = { state: s, change: { type: "raise", amount: 5n } };
    const r = VoteMath.vote(v);

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

  it("vote: available can be negative after add", () => {
    const s: SingleVoteState = {
      available: 5n,
      vote: { type: "lower", amount: 5n },
      voteCalls: [],
    };
    const v: VoteProps = { state: s, change: { type: "raise", amount: 15n } };
    const r = VoteMath.vote(v);

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

  it("revertVote: if no votes before & after, should return initial amount", () => {
    const initialBalance = 21n;

    const r = VoteMath.revertVote({
      balanceAfter: initialBalance,
    });

    expect(r).to.be.eql(initialBalance);
  });
  it("revertVote: if no vote after, should return initial amount", () => {
    const initialBalance = 27n;

    const initialVote: BaseVote = {
      type: "lower",
      amount: 99n,
    };

    const r = VoteMath.revertVote({
      balanceAfter: initialBalance,
      initialVote,
    });

    expect(r).to.be.eql(initialBalance);
  });
  it("revertVote: if no vote before, should return amount with reverted vote after", () => {
    const initialBalance = 26n;
    const voteBy = 5n;

    const votesAfter: SingleVoteState = {
      available: initialBalance - voteBy,
      vote: { type: "lower", amount: voteBy },
      voteCalls: [{ type: "lower", amount: voteBy }],
    };
    const balanceAfter = votesAfter.available;

    const r = VoteMath.revertVote({
      balanceAfter,
      nextVoteType: "lower",
      votesAfter: votesAfter,
    });

    expect(r).to.be.eql(votesAfter.available + voteBy);
  });
  it("revertVote: if vote before type matches vote after type, should return amount with reverted vote after", () => {
    const initialBalance = 10n;
    const voteBy = 6n;

    const initialVote: BaseVote = {
      type: "lower",
      amount: 20n,
    };
    const votesAfter: SingleVoteState = {
      available: initialBalance - voteBy,
      vote: { type: "lower", amount: voteBy },
      voteCalls: [{ type: "lower", amount: voteBy }],
    };
    const balanceAfter = votesAfter.available;

    const r = VoteMath.revertVote({
      initialVote,
      balanceAfter,
      nextVoteType: "lower",
      votesAfter: votesAfter,
    });

    expect(r).to.be.eql(votesAfter.available + voteBy);
  });
  it("revertVote: if vote before type doesn't match vote after type, should revert vote before", () => {
    const initialBalance = 10n;
    const voteBy = 20n;

    const initialVote: BaseVote = {
      type: "raise",
      amount: 61n,
    };
    const votesAfter: SingleVoteState = {
      available: initialBalance + initialVote.amount - voteBy,
      vote: { type: "lower", amount: voteBy },
      voteCalls: [
        { type: "remove", amount: initialVote.amount },
        { type: "lower", amount: voteBy },
      ],
    };

    const r = VoteMath.revertVote({
      initialVote,
      balanceAfter: votesAfter.available,
      nextVoteType: "lower",
      votesAfter: votesAfter,
    });

    expect(r).to.be.eql(votesAfter.available + voteBy);
  });
});
