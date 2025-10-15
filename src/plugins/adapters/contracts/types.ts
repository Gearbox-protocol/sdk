export enum BalancerV2PoolStatus {
  NOT_ALLOWED = 0,
  ALLOWED = 1,
  SWAP_ONLY = 2,
  WITHDRAWAL_ONLY = 3,
}

export enum KodiakIslandStatus {
  NOT_ALLOWED = 0,
  ALLOWED = 1,
  SWAP_AND_EXIT_ONLY = 2,
  EXIT_ONLY = 3,
}

export enum PendlePairStatus {
  NOT_ALLOWED = 0,
  ALLOWED = 1,
  EXIT_ONLY = 2,
}

export enum TraderJoePoolVersion {
  V1 = 0,
  V2 = 1,
  V2_1 = 2,
  V2_2 = 3,
}
