import { expect } from "chai";

import { SingleVoteState, VoteMath, VoteProps } from "./gaugeVotes";

describe("VoteMath test", () => {
  it("vote() with empty state and with no changes", () => {
    const s: SingleVoteState = { available: 0n, voteCalls: [] };
    const v: VoteProps = { state: s };
    const r = VoteMath.vote(v);

    const res: SingleVoteState = { ...s, voteCalls: [] };
    expect(r).to.be.eql(res);
  });

  it("remove with no prev vote", () => {
    const s: SingleVoteState = { available: 0n, voteCalls: [] };
    const v: VoteProps = { state: s, change: { type: "remove", amount: 10n } };
    const r = VoteMath.vote(v);

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
    const r = VoteMath.vote(v);

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
    const r = VoteMath.vote(v);

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
    const r = VoteMath.vote(v);

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
    const r = VoteMath.vote(v);

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
    const r = VoteMath.vote(v);

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

  it("available can be negative after add", () => {
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
});
