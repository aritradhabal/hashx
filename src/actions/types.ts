export type VoteCardData = {
  marketId: string;
  title: string;
  description: string;
  rewards: string;
  optionATitle: string;
  optionBTitle: string;
  startTimestamp: string;
  endTimestamp: string;
  contractAddress: string | null;
  verified: boolean;
  server: boolean;
  pp: {
    N: string;
    t: string;
    a: number;
    skLocked: string;
    hashedSK: string;
    publicKey: string;
  };
  tallies: {
    optionA: string;
    optionB: string;
  };
  data: {
    solver: string | null;
    unlockedSecret: string | null;
    resolvedOption: bigint | null;
  };
};

export interface secretParamsT {
  marketId: bigint;
  N: `0x${string}`;
  t: bigint;
  a: number;
  skLocked: `0x${string}`;
  hashedSK: `0x${string}`;
  publicKey: `0x${string}`;
  secretKey: `0x${string}`;
  verified: boolean;
  server: boolean;
}
