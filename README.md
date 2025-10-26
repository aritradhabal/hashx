### HashX — An Optimistic Oracle on Hedera using verifiable timelocked puzzles for delayed consensus.

HashX is an app for creating and resolving prediction markets with accuracy with the help of privacy-preserving voting on Hedera EVM.

> Votes are encrypted using BabyJubJub-based ECDH and AES-256-CTR, then revealed via a timelock puzzle or automatically by a server-held key. Rewards are distributed using Merkle proofs.

> If you are trying the live deploy link, please try two to three times to deploy the contracts, I observed frequent crashes.

### Features

- Verifier Secret Key is generated upon Oracle Creation, Public Parameters for solving the SK is published Onchain (RSA modulus $N$, base $a$, iterations $t$)
- Encrypted voting with EIP‑712 typed signatures → ephemeral keys → AES-encrypted ballot
- Votes are calculated per user basis, Rewards are calculated as per amount staked.
- Voters can not prove what they have voted until the vote is resolved.
- Hedera EVM integration (Testnet) with RainbowKit.
- HBAR staking via `HBARLockingContract` to obtain voting power. This converts HBAR to WHBAR utilizing WHBAR.sol contract.
- Solver gets certain percentage (default $5\%$) of the Oracle value.
- Oracle rewards among voters are distributed via Merkle proofs.
- Postgres DB for fetching markets metadata and serving proofs.

### Contracts (addresses on Hedera Testnet)

- HBAR_LOCKING_CONTRACT_ADDRESS: `0xde368C3DCac4E5096f2D2b8AF7Be70277c43b144`
- CREATEVOTE_FACTORY_ADDRESS: `0x90Fe5e610A12D2Aa0374e5CEA373bc4CdC103Cbc`
- PREDICT_MARKET_FACTORY_ADDRESS: `0x0118250132B55af4Ca1659dA51Bf7430245C1A03`
- ABIs: see `ABI/`
- Only Factory contracts are verified on Hashscan.

### Planned Features

- Optional ZK verification with Semaphore, Our app already supports all the necessary features needed for zk encryption.
- Chainlink Oracle integration for real-time price feeds, for markets which don't require Optimistic Oracle
- Scoped Voting, only accepting votes where users have hold to certain onchain NFT.

### Tech stack

- App: Next.js (app router), React 19, Tailwind, Zustand, TanStack Query
- Web3: wagmi v2, viem, RainbowKit, SIWE
- Crypto: @zk-kit/baby-jubjub, AES-256-CTR, bigint-mod-arith
- DB: Postgres (Neon)

### Prerequisites

- Node 20+ and pnpm 10+
- A Postgres database (Neon recommended)
- A wallet with Hedera Testnet HBAR

### Environment

Create `.env.local` at the repo root:

```bash
# Postgres connection string (required)
DATABASE_URL=postgres://user:pass@host/db?sslmode=require

# Server wallet to submit finalize and linkage txs (0x-prefixed; fund with test HBAR)
PRIVATE_KEY=0xYOUR_PRIVATE_KEY

# Optional: custom RPC; defaults to wagmi’s http()
HEDERA_TESTNET_RPC_URL=https://testnet.hashio.io/api
```

### Install, migrate, run

```bash
pnpm i

# Run DB migrations (uses drizzle.config.ts)
pnpm dlx drizzle-kit push

# Dev server (TurboPack)
pnpm dev
# Build
pnpm build
pnpm start
# Lint
pnpm lint
```

### How it works

- Create Oracle (Vote):
  - Creator sets rewards and time window; generates public parameters and timelock puzzle.
  - Optionally stores secret key server-side for auto-resolve; otherwise anyone can solve puzzle post‑end.
  - A `CreateVote` contract is deployed via factory; server verifies on-chain public params against DB.
- Create Prediction Market:
  - After oracle exists, deploy `PredictionMarket` via factory with initial liquidity and parameters.
  - Server links the oracle to the market (`setPredictionMarket`) and stores market metadata.
- Vote:
  - User signs typed data (EIP‑712), derives ephemeral BabyJubJub key, and encrypts the chosen option.
  - Submits `castVote(userPublicKey, encryptedOption, amount)`.
- Resolve and claim:
  - After end time, server (or anyone with SK) decrypts logs, tallies votes, builds Merkle trees.
  - Finalizes on-chain with winner root; winners claim via `claimRewards(proof)`.

### Using the app

1. Connect wallet. The UI will prompt to add/switch to Hedera Testnet if needed.
2. Stake HBAR (Stake tab) to gain voting power.
3. Create Oracle (Start Creating):
   - Set rewards, start/end time, and choose resolution mode (auto vs manual puzzle).
   - The app records `marketId` and oracle `contractAddress`.
4. Create Market: Provide initial liquidity and parameters, then submit.
5. Vote: Pick option, Generate Signature, then Submit Vote.
6. Resolve: After end, click Verify Result (runs decrypt + finalize) and then Claim Rewards.

### Scripts

- Solve timelock puzzle interactively:

```bash
pnpm dlx tsx src/scripts/solve_puzzle.ts
pnpm dlx tsx src/scripts/timelock_test.ts
```
