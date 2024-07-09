import { BigIntMath } from "../utils/math";
import { GaugeData } from "./gauge";

export type BaseVoteType = "raise" | "lower";
export type VoteType = BaseVoteType | "remove";

export interface BaseVote {
  amount: bigint;
  type: BaseVoteType;
}

export interface Vote {
  amount: bigint;
  type: VoteType;
}

export interface SingleVoteState {
  available: bigint;

  vote?: BaseVote;
  voteCalls: Array<Vote>;
}

export interface VoteProps {
  state: Omit<SingleVoteState, "voteCalls">;
  change?: Vote;
}

interface UnvoteProps {
  initialVote?: BaseVote;

  balanceAfter: bigint;
  nextVoteType: BaseVoteType;
  voteAfter?: Omit<SingleVoteState, "available">;
}

interface AddProps {
  state: Omit<SingleVoteState, "voteCalls">;
  change: BaseVote;
}

interface RemoveProps {
  state: Omit<SingleVoteState, "voteCalls">;
  change: Vote;
}

export interface GetGaugeApyProps {
  quota:
    | Pick<
        GaugeData["quotaParams"][string],
        | "totalVotesCaSide"
        | "totalVotesLpSide"
        | "stakerVotesCaSide"
        | "stakerVotesLpSide"
        | "minRate"
        | "maxRate"
      >
    | undefined;
  vote?: BaseVote;
  voteAfter?: Omit<SingleVoteState, "available">;
}

export class GaugeMath {
  static vote({ change, ...rest }: VoteProps): SingleVoteState | undefined {
    if (change?.type === "remove") {
      return this.removeVotes({ ...rest, change });
    }

    if (change) {
      return this.addVotes({
        ...rest,
        change: { ...change, type: change.type },
      });
    }

    return { ...rest.state, voteCalls: [] };
  }
  private static addVotes({ state, change }: AddProps): SingleVoteState {
    const { available, vote } = state;

    if (!vote) {
      return {
        available: available - change.amount,
        vote: change,
        voteCalls: [change],
      };
    }

    if (vote.type === change.type) {
      return {
        available: available - change.amount,
        vote: { ...change, amount: vote.amount + change.amount },
        voteCalls: [change],
      };
    }

    const remove: Vote = { type: "remove", amount: vote.amount };
    return {
      available: available + vote.amount - change.amount,
      vote: { ...change, amount: change.amount },
      voteCalls: [remove, change],
    };
  }
  private static removeVotes({ state, change }: RemoveProps): SingleVoteState {
    const { available, vote } = state;

    if (!vote) return { ...state, voteCalls: [] };
    const safeChange = BigIntMath.min(vote.amount, change.amount);
    const afterVote = vote.amount - safeChange;

    return {
      available: available + safeChange,
      vote: { ...vote, amount: afterVote },
      voteCalls: [{ ...change, amount: safeChange }],
    };
  }

  static revertVote({
    balanceAfter,
    initialVote,

    nextVoteType,
    voteAfter,
  }: UnvoteProps): bigint | undefined {
    // on vote type change unvote previous vote
    const prevUnvoted =
      !initialVote || initialVote.type === nextVoteType
        ? balanceAfter
        : balanceAfter + initialVote.amount;

    if (!voteAfter) return prevUnvoted;

    // change call is always last, remove is always first
    const [first, last = first] = voteAfter.voteCalls;
    const removePart = first?.type === "remove" ? first?.amount || 0n : 0n;
    const addPart = last?.type !== "remove" ? last?.amount || 0n : 0n;

    // revert current changes
    return prevUnvoted + addPart - removePart;
  }

  static getBaseVote = (
    v: GaugeData["quotaParams"][string],
  ): BaseVote | undefined => {
    const voteDown = v.stakerVotesCaSide;
    const voteUp = v.stakerVotesLpSide;

    if (!voteDown && !voteUp) return undefined;

    if (voteDown > 0) {
      return { type: "lower", amount: voteDown };
    }
    if (voteUp > 0) {
      return { type: "raise", amount: voteUp };
    }
    return undefined;
  };

  // rate = (minRate *(votesFormin + yourvotesformin) +maxRate*(votesFormax +yourvotesformax)/( votesForMin + votesForMax+yourvotes)

  static getGaugeApy({ quota, voteAfter, vote }: GetGaugeApyProps) {
    if (!quota) return null;

    const first = voteAfter?.voteCalls?.[0];
    const last = voteAfter?.voteCalls?.[1] || first;

    const isRemove = first?.type === "remove";
    const removeCaPart =
      isRemove && vote?.type === "lower" ? first?.amount || 0n : 0n;
    const removeLpPart =
      isRemove && vote?.type === "raise" ? first?.amount || 0n : 0n;

    const caPart = last?.type === "lower" ? last?.amount || 0n : 0n;
    const lpPart = last?.type === "raise" ? last?.amount || 0n : 0n;

    const caImpact =
      quota.minRate * (quota.totalVotesCaSide + caPart - removeCaPart);
    const lpImpact =
      quota.maxRate * (quota.totalVotesLpSide + lpPart - removeLpPart);
    const total =
      quota.totalVotesCaSide +
      quota.totalVotesLpSide +
      caPart +
      lpPart -
      removeCaPart -
      removeLpPart;

    if (total === 0n) return quota.minRate;

    const r = (caImpact + lpImpact) / total;
    return r;
  }
}
