import { useState, useEffect, useRef } from 'react'
import api from '@/services/api'
import {
  BookOpen, ChevronLeft, ChevronRight, CheckCircle,
  RotateCcw, Trophy, Brain, Zap, Lock, Globe,
  Layers, Shield, Star, ArrowRight, Sparkles,
  GraduationCap, Target, Clock, Users
} from 'lucide-react'

// ─── INLINE STYLES INJECTION ─────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  .edu-page * { box-sizing: border-box; }

  .edu-hero-bg {
    background: radial-gradient(ellipse 80% 50% at 50% -10%, #1a2744 0%, transparent 60%),
                radial-gradient(ellipse 60% 40% at 80% 80%, #0f1f3d 0%, transparent 50%),
                #060912;
  }

  .edu-grid-texture {
    background-image:
      linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .edu-floating-node {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    animation: edu-float linear infinite;
  }

  @keyframes edu-float {
    0%   { transform: translateY(0px) translateX(0px) scale(1); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 0.6; }
    100% { transform: translateY(-120px) translateX(30px) scale(0.4); opacity: 0; }
  }

  @keyframes edu-pulse-ring {
    0%   { transform: scale(0.8); opacity: 0.8; }
    100% { transform: scale(2.2); opacity: 0; }
  }

  @keyframes edu-shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }

  @keyframes edu-slide-up {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes edu-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes edu-glow-pulse {
    0%, 100% { box-shadow: 0 0 20px var(--glow-color, #3b82f633); }
    50%       { box-shadow: 0 0 40px var(--glow-color, #3b82f655), 0 0 80px var(--glow-color, #3b82f622); }
  }

  @keyframes edu-progress-fill {
    from { width: 0%; }
  }

  .edu-animate-up {
    animation: edu-slide-up 0.5s ease both;
  }

  .edu-animate-fade {
    animation: edu-fade-in 0.4s ease both;
  }

  .edu-shimmer-text {
    background: linear-gradient(
      90deg,
      #3b82f6 0%,
      #8b5cf6 25%,
      #06b6d4 50%,
      #8b5cf6 75%,
      #3b82f6 100%
    );
    background-size: 400px 100%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: edu-shimmer 4s linear infinite;
  }

  .edu-card-hover {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), 
                box-shadow 0.3s ease,
                border-color 0.3s ease;
  }
  .edu-card-hover:hover {
    transform: translateY(-4px) scale(1.01);
  }

  .edu-module-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(135deg, var(--card-hex-a, transparent) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }
  .edu-module-card:hover::before { opacity: 0.08; }

  .edu-quiz-option {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }
  .edu-quiz-option::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent);
    transform: translateX(-100%);
    transition: transform 0.4s ease;
  }
  .edu-quiz-option:hover::after { transform: translateX(100%); }

  .edu-progress-bar {
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4);
    background-size: 200% 100%;
    animation: edu-shimmer 3s linear infinite;
    animation: edu-progress-fill 0.7s cubic-bezier(0.34, 1.2, 0.64, 1) both;
  }

  .edu-section-nav-item {
    transition: all 0.2s ease;
    border-left: 2px solid transparent;
  }
  .edu-section-nav-item.active {
    border-left-color: var(--nav-hex);
  }

  .edu-content-area {
    font-family: 'DM Sans', sans-serif;
    line-height: 1.9;
  }

  .edu-content-area code,
  .edu-content-area pre {
    font-family: 'JetBrains Mono', monospace;
  }

  .edu-score-ring {
    stroke-dasharray: 283;
    stroke-dashoffset: 283;
    transition: stroke-dashoffset 1s cubic-bezier(0.34, 1.2, 0.64, 1);
    transform-origin: center;
    transform: rotate(-90deg);
  }

  .edu-tag {
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.08em;
    font-size: 10px;
    font-weight: 600;
  }
`

// ─── DATA ─────────────────────────────────────────────────────────────────────

const MODULES = [
  {
    id: 'basics', emoji: '⛓️', title: 'Blockchain Basics',
    subtitle: 'History, structure & how it all works',
    icon: Globe, tag: 'FOUNDATION',
    hex: '#10b981', hex2: '#34d399',
    difficulty: 1,
    readTime: '35 min',
    sections: [
      { heading: 'What is Blockchain?', content: `A blockchain is a distributed, immutable ledger — a chain of "blocks" where each block contains a set of transactions. Once recorded, data cannot be altered without changing all subsequent blocks and gaining consensus from the network.

Think of it as a Google Doc that thousands of people hold simultaneously. No single person owns or controls it, and every change is visible to everyone. The key innovation: you can trust the data without trusting any individual party.

The three core properties that make blockchain powerful:

  ◆ Decentralization
    No single entity controls the network. Data is replicated across thousands of nodes worldwide. No CEO can shut it down.

  ◆ Immutability
    Past records cannot be changed. Every block contains the hash of the previous block — altering any block breaks the entire chain.

  ◆ Transparency
    All transactions are publicly verifiable. Anyone can audit the complete history of every transaction ever made.

This combination is unprecedented. For the first time in history, two parties who don't trust each other can transact directly — with a shared, tamper-proof record keeping score.` },
      { heading: 'The History of Blockchain', content: `📅 1991 — Stuart Haber and W. Scott Stornetta describe a cryptographically secured chain of blocks to timestamp documents, preventing backdating. This is the conceptual origin.

📅 1998 — Nick Szabo proposes "Bit Gold," a decentralized digital currency that required proof-of-work to generate. Never launched, but directly inspired Bitcoin.

📅 2008 — Satoshi Nakamoto (anonymous) publishes "Bitcoin: A Peer-to-Peer Electronic Cash System." The genesis block is mined January 3, 2009 with an embedded message: "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks."

📅 2010 — First real-world Bitcoin transaction: 10,000 BTC for two pizzas (worth ~$400M at peak). Laszlo Hanyecz made history.

📅 2011–2013 — Altcoins emerge (Litecoin, Namecoin). Bitcoin's first price bubble reaches $1,000. Mt. Gox dominates exchange volume.

📅 2014 — Ethereum whitepaper by 19-year-old Vitalik Buterin proposes "programmable blockchain." $18M raised in crowdsale.

📅 2015 — Ethereum mainnet launches with smart contracts. The blockchain industry expands beyond currency.

📅 2016 — The DAO raises $150M then gets hacked for $60M. Ethereum hard forks, creating ETH and ETC.

📅 2017 — ICO boom. CryptoKitties congests Ethereum. Bitcoin reaches $20,000 before crashing.

📅 2020–2021 — DeFi "Summer." NFT explosion. Bitcoin hits $69,000. Ethereum rises to $4,800.

📅 2022 — Ethereum's "Merge" — PoW → PoS, cutting energy 99.95%. Crypto bear market begins.

📅 2023–Present — Layer 2 scaling matures. Institutional adoption accelerates. Spot Bitcoin ETF approved by SEC in Jan 2024.` },
      { heading: 'The Anatomy of a Block', content: `Every block in a blockchain is a data container with a very specific structure:

  ┌─────────────────────────────────────────┐
  │              BLOCK HEADER               │
  │                                         │
  │  Block Number    : 845,231              │
  │  Prev Hash       : 0x3f7a9c...          │  ← links to chain
  │  Merkle Root     : 0x8b2e1f...          │  ← summarizes txns
  │  Timestamp       : 2024-01-15 14:32:07  │
  │  Nonce           : 3,892,741,043        │  ← PoW solution
  │  Difficulty      : 000000000000...      │  ← mining target
  ├─────────────────────────────────────────┤
  │            TRANSACTION DATA             │
  │                                         │
  │  Tx 1: Alice → Bob   0.5 BTC           │
  │  Tx 2: Carol → Dave  1.2 BTC           │
  │  Tx 3: Eve   → Frank 0.03 BTC          │
  │  ... (up to ~2,500 transactions)        │
  ├─────────────────────────────────────────┤
  │              BLOCK HASH                 │
  │  0x00000000000000000abc123...           │  ← THIS block's ID
  └─────────────────────────────────────────┘

The block hash is computed from ALL the above data. Change one character in any transaction, and the entire hash changes — breaking the link to the next block.

This is why tampering is practically impossible: you'd need to recompute the hash for the altered block AND every subsequent block, faster than the honest network adds new blocks.` },
      { heading: 'Types of Blockchains', content: `🌐 Public Blockchains (Permissionless)
  Anyone can read, write, and participate. Fully decentralized.
  Examples: Bitcoin, Ethereum, Solana, Avalanche
  Pros: Transparent, censorship-resistant, trustless, globally accessible
  Cons: Slower, less private, higher energy (PoW), anyone can join (including bad actors)

🔒 Private Blockchains (Permissioned)
  A single organization controls access. Participants must be invited.
  Examples: Hyperledger Fabric, Corda, Quorum
  Pros: Fast (1000s TPS), efficient, privacy, regulatory compliance
  Cons: Centralized trust, defeats the purpose of decentralization

🤝 Consortium / Federated
  Controlled by a group of organizations. Semi-decentralized.
  Examples: R3 (banking), Marco Polo (trade finance), MedChain (healthcare)
  Sweet spot for enterprise: efficiency + some decentralization

🔗 Hybrid Blockchains
  Combines public + private. Public root of trust, private execution.
  Examples: Dragonchain, XinFin XDC
  Use case: Public verifiability with private transaction data` },
      { heading: 'The Distributed Network', content: `Unlike a central server (like a bank's database), a blockchain runs on a P2P network of thousands of nodes worldwide.

  Types of Nodes:

  ◆ Full Nodes
    Download & verify every block since genesis. Store the entire blockchain.
    Bitcoin's full blockchain: ~600GB. Ethereum: ~1.2TB (archive node).
    These are the backbone — they enforce the rules.

  ◆ Light Nodes (SPV)
    Download only block headers (~80 bytes each). Trust full nodes for data.
    Used in: Mobile wallets (Trust Wallet, MetaMask mobile).
    Verify specific transactions via Merkle proofs without full chain.

  ◆ Mining / Validator Nodes
    Create new blocks. Earn block rewards + transaction fees.
    Bitcoin miners: ~400 EH/s total hashrate (400 quintillion hashes/second).

  Transaction Lifecycle:
  1. User signs tx with private key → broadcasts to network
  2. P2P gossip propagates tx to all nodes in ~1 second
  3. Nodes validate: correct signature? sufficient balance? valid nonce?
  4. Miner/validator includes tx in next block
  5. Block propagates → nodes verify and append
  6. After 6 confirmations (Bitcoin) = considered irreversible

  Network Stats (Bitcoin):
  • ~17,000 full nodes globally
  • ~$20B+ security budget per year (miner revenue)
  • 99.98% uptime since 2009` },
    ],
    quiz: [
      { q: 'Who published the Bitcoin whitepaper in 2008?', options: ['Vitalik Buterin', 'Nick Szabo', 'Satoshi Nakamoto', 'Stuart Haber'], answer: 2, explanation: 'Satoshi Nakamoto (pseudonym) published "Bitcoin: A Peer-to-Peer Electronic Cash System" in October 2008. Their true identity remains unknown.' },
      { q: 'What field in a block header links it to the previous block?', options: ['Nonce', 'Merkle Root', 'Timestamp', 'Previous Block Hash'], answer: 3, explanation: 'The Previous Block Hash cryptographically links each block to its predecessor. This chain of hashes is what makes tampering detectable — change any block and all subsequent hashes break.' },
      { q: 'Which type of blockchain requires permission to participate?', options: ['Public blockchain', 'Bitcoin network', 'Private blockchain', 'Ethereum mainnet'], answer: 2, explanation: 'Private (permissioned) blockchains require invitation to join, controlled by one or more organizations. They sacrifice decentralization for speed and privacy.' },
      { q: 'What is a Merkle Root?', options: ['The genesis block hash', 'A hash representing all transactions in a block', "The block's creation timestamp", 'A random number used in mining'], answer: 1, explanation: 'The Merkle Root is a single hash that efficiently summarizes all transactions in a block. If any transaction changes, the Merkle Root changes, making tampering detectable.' },
      { q: 'Which year did Ethereum launch?', options: ['2013', '2014', '2015', '2016'], answer: 2, explanation: 'Ethereum mainnet launched in July 2015, introducing programmable smart contracts and expanding blockchain far beyond simple currency transfers.' },
    ],
  },
  {
    id: 'consensus', emoji: '⚡', title: 'Consensus Mechanisms',
    subtitle: 'How distributed networks agree on truth',
    icon: Zap, tag: 'CORE',
    hex: '#8b5cf6', hex2: '#a78bfa',
    difficulty: 2,
    readTime: '40 min',
    sections: [
      { heading: 'The Byzantine Generals Problem', content: `This 1982 computer science problem is the theoretical foundation of blockchain consensus.

  Imagine Byzantine generals surrounding a city, communicating only by messenger. They must agree unanimously: attack or retreat. But some generals are traitors who send different messages to different recipients. How do the loyal generals reach agreement?

  Formally: In a distributed system, how can nodes reach consensus when some participants may be malicious or faulty?

  Before blockchain, this problem was considered nearly unsolvable for large, open networks. Satoshi Nakamoto's genius was using Proof of Work to solve it — making honest participation economically rational.

  Byzantine Fault Tolerance (BFT):
  A system is BFT if it can reach consensus despite up to ⌊(n-1)/3⌋ faulty nodes (for PBFT), or 49% of hashpower (for PoW), or 33% of stake (for PoS).

  Why it matters:
  Without BFT, a blockchain network with even one malicious node could be corrupted. The solution determines the entire security model.` },
      { heading: 'Proof of Work (PoW)', content: `Used by: Bitcoin, Litecoin, Monero, Bitcoin Cash

  The Algorithm:
  Find a nonce N such that:
    SHA256(SHA256(block_header + N)) < target

  The target is a 256-bit number. More zeros required = more hashes needed.
  Bitcoin's current difficulty requires hashing ~$10^{23}$ times to find one valid block.

  Why it's secure:
  ◆ Energy expenditure = real-world cost = attack cost
  ◆ 51% attack requires $20B+ in hardware + ongoing electricity
  ◆ Longest chain wins — attackers must outpace the entire honest network

  The Numbers (Bitcoin, 2024):
  • Hashrate: ~600 EH/s (600 × 10¹⁸ hashes/second)
  • Block reward: 3.125 BTC (~$200,000 per block)
  • Block time: ~10 minutes (auto-adjusted every 2016 blocks)
  • Energy use: ~150 TWh/year ≈ Poland's electricity consumption
  • Throughput: ~7 transactions per second

  The Halving:
  Every 210,000 blocks (~4 years), block reward halves. 2009: 50 BTC → 2012: 25 → 2016: 12.5 → 2020: 6.25 → 2024: 3.125. Maximum supply: 21 million BTC. Last bitcoin mined: ~2140.` },
      { heading: 'Proof of Stake (PoS)', content: `Used by: Ethereum, Cardano, Solana, Avalanche, Polkadot

  Instead of computational work, validators put up economic collateral.

  How Ethereum PoS Works:
  1. Validators stake 32 ETH (~$100,000) as collateral
  2. Every 12 seconds (one "slot"), a validator is pseudo-randomly chosen to propose a block (weighted by stake)
  3. A committee of 128 validators attests (votes) on the block
  4. If block is valid, proposer + attestors earn rewards
  5. If validator double-signs or goes offline for too long → slashing

  Slashing:
  Dishonest validators lose a portion (or all) of their staked ETH.
  Minor offense: lose ~1 ETH
  Coordinated attack: lose entire 32 ETH

  Security Analysis:
  • Attacking Ethereum PoS requires ~$30B+ in staked ETH
  • Attack would instantly destroy 33% of your own investment via slashing
  • Economic game theory makes attack irrational

  The Merge (Sept 15, 2022):
  Ethereum's transition from PoW to PoS reduced energy use by 99.95% — equivalent to taking 4 million cars off the road. 900,000+ validators now secure the network.` },
      { heading: 'Other Consensus Mechanisms', content: `🔗 Proof of History (PoH) — Solana
  Creates a cryptographic clock: SHA-256 output is fed back as input, creating a verifiable time sequence. Validators don't need to communicate timestamps — they're encoded in the chain.
  → Enables 65,000+ theoretical TPS, ~0.4s finality

  🔑 Proof of Authority (PoA)
  Approved validators are known, real-world entities (companies, governments). Blocks are signed by approved accounts.
  Trade-off: Efficient (1000s TPS) but centralized.
  Used by: Polygon PoS (26 validators), VeChain, BSC (21 validators)

  🏦 Proof of Capacity / Space-Time — Chia, Filecoin
  Use available hard drive space rather than computation. 100x more energy efficient than PoW. Drawback: Required massive HDD purchases, causing market shortages in 2021.

  🔄 PBFT (Practical Byzantine Fault Tolerance)
  Classical BFT algorithm used in Hyperledger. Requires known validator set (n nodes, tolerates ⌊(n-1)/3⌋ faults). Very fast (microsecond finality) but requires <100 validators.

  ⚡ DAG (Directed Acyclic Graph)
  No traditional "chain." Each transaction validates 2 previous ones. No miners needed. Examples: IOTA (IoT micropayments), Nano (feeless transfers), Avalanche (uses DAG + PoS hybrid).` },
      { heading: 'PoW vs PoS Comparison', content: `  Feature                │ Proof of Work      │ Proof of Stake
  ───────────────────────┼────────────────────┼──────────────────────
  Energy Consumption     │ Very High          │ ~99.95% less
  Throughput             │ ~7 TPS (BTC)       │ 100K+ TPS (theoretical)
  Finality               │ Probabilistic      │ Near-instant (PoS)
  Validator Requirement  │ ASIC hardware      │ 32 ETH stake
  Attack Cost            │ 51% hashpower      │ 33% of staked tokens
  Decentralization       │ Mining pool risk   │ Validator concentration
  Track Record           │ 15 years           │ Newer (ETH: 2022)
  Environmental Impact   │ Significant        │ Minimal
  Core Examples          │ Bitcoin, Litecoin  │ Ethereum, Cardano, Solana

  The Philosophical Debate:
  Bitcoin maximalists argue PoW's energy cost is a feature, not a bug. Real-world energy expenditure creates "unforgeable costliness" — you can't fake the work. Ethereum's camp argues PoS security is equivalent at a fraction of the cost.

  Both camps agree: the security guarantees are different, not one "better" than the other. Bitcoin PoW has 15 years of battle-testing. Ethereum PoS is 2 years old but securing $400B+.` },
    ],
    quiz: [
      { q: 'What problem does blockchain consensus solve?', options: ['Hash collision problem', 'The Byzantine Generals Problem', 'Traveling Salesman Problem', 'P vs NP Problem'], answer: 1, explanation: 'The Byzantine Generals Problem (1982) describes achieving reliable consensus among distributed parties when some may be malicious. Satoshi Nakamoto solved it for open networks using Proof of Work.' },
      { q: 'In Proof of Work, what are miners trying to find?', options: ['The next transaction', 'A valid digital signature', 'A nonce producing a hash below the target', 'The largest prime number'], answer: 2, explanation: 'Miners search for a nonce value such that SHA256(SHA256(block_header + nonce)) falls below the current difficulty target. This requires ~10²³ hashes for Bitcoin currently.' },
      { q: 'What is "slashing" in Proof of Stake?', options: ['Reducing transaction fees', 'Destroying a dishonest validator\'s staked tokens', 'Splitting a block reward', 'Cutting validator count'], answer: 1, explanation: 'Slashing is PoS\'s security mechanism. Validators who behave dishonestly (e.g., double-signing) lose part or all of their staked collateral — making attacks economically irrational.' },
      { q: "Ethereum's 'Merge' reduced energy consumption by approximately:", options: ['10%', '50%', '80%', '99.95%'], answer: 3, explanation: 'The Merge (Sept 2022) transitioned Ethereum from PoW to PoS, reducing energy consumption by 99.95% — equivalent to taking 4 million cars off the road.' },
      { q: 'Which consensus mechanism uses hard drive space as its resource?', options: ['Proof of Work', 'Proof of Stake', 'Proof of Capacity', 'Proof of Authority'], answer: 2, explanation: 'Proof of Capacity (used by Chia) leverages unused hard drive space. It\'s called "farming" rather than mining, and is significantly more energy-efficient than PoW.' },
    ],
  },
  {
    id: 'smartcontracts', emoji: '📜', title: 'Smart Contracts',
    subtitle: 'Self-executing code on the blockchain',
    icon: Layers, tag: 'CORE',
    hex: '#f97316', hex2: '#fb923c',
    difficulty: 2,
    readTime: '38 min',
    sections: [
      { heading: 'What are Smart Contracts?', content: `Smart contracts are self-executing programs stored permanently on a blockchain. The terms of an agreement are encoded directly in code — when conditions are met, they execute automatically, with no intermediary needed.

  Nick Szabo conceived the idea in 1994 — before the internet was mainstream. His canonical analogy:

  ◆ A Vending Machine
    Insert correct payment + press button → machine dispenses item.
    The machine enforces the contract automatically. No cashier. No trust required.
    The rules are in the hardware.

  Smart contracts are vending machines — but for any agreement imaginable.

  What makes them powerful:
  ✅ Trustless — executes based on code, not trust in any party
  ✅ Transparent — anyone can read the contract code
  ✅ Immutable — once deployed, code cannot be changed*
  ✅ Deterministic — same input = same output, always
  ✅ Permissionless — anyone can interact without approval
  ✅ Composable — contracts can call other contracts ("money legos")

  *Upgradeable contracts exist via proxy patterns, but the base execution is still trustless.

  Real impact: ~$50 billion in value is locked in smart contracts. Every DeFi protocol, NFT, DAO, and Layer 2 is built on them.` },
      { heading: 'How Smart Contracts Work', content: `The Ethereum Virtual Machine (EVM):
  A global, decentralized computer. Every Ethereum node runs an identical EVM. Smart contracts execute in this sandboxed environment — deterministically, in isolation.

  The Development Lifecycle:
  1. Write in Solidity (.sol) or Vyper (.vy)
  2. Compile to EVM bytecode
  3. Deploy via transaction → contract gets a permanent address
  4. Users call functions via transactions
  5. All nodes execute identically → same state

  A Real Solidity Contract:
  ┌─────────────────────────────────────────────┐
  │  pragma solidity ^0.8.0;                    │
  │                                             │
  │  contract SimpleEscrow {                    │
  │    address public buyer;                    │
  │    address public seller;                   │
  │    uint256 public amount;                   │
  │    bool    public released;                 │
  │                                             │
  │    constructor(address _seller) payable {   │
  │      buyer  = msg.sender;                   │
  │      seller = _seller;                      │
  │      amount = msg.value;                    │
  │    }                                        │
  │                                             │
  │    function release() external {            │
  │      require(msg.sender == buyer);          │
  │      require(!released);                    │
  │      released = true;                       │
  │      payable(seller).transfer(amount);      │
  │    }                                        │
  │  }                                          │
  └─────────────────────────────────────────────┘

  Gas:
  Every EVM opcode costs gas. ADD = 3 gas. SSTORE = 20,000 gas.
  Gas price (gwei) × gas used = ETH fee.
  Prevents infinite loops. Spam protection. Incentivizes efficiency.` },
      { heading: 'Oracles: Bridging Real World & Blockchain', content: `The Oracle Problem:
  Blockchains are sandboxed — they cannot access anything outside themselves. No HTTP calls. No external APIs. No weather data. No stock prices.

  This is intentional (determinism requires all nodes to get the same data), but limiting.

  Oracles solve this by securely delivering off-chain data on-chain.

  Chainlink's Decentralized Oracle Network:
  ◆ Data Request: Smart contract emits an event requesting data
  ◆ Node Selection: Multiple independent Chainlink nodes receive the request
  ◆ Data Fetching: Each node independently queries APIs
  ◆ Aggregation: Responses are aggregated (median/mean) on-chain
  ◆ Delivery: Single verified answer delivered to your contract

  Security: Node operators stake LINK tokens. Bad data → slashing.
  Scale: Chainlink secures $50B+ across 800+ protocols.

  Major Use Cases:
  • Price Feeds: ETH/USD, BTC/USD — used by Aave, Compound, dYdX
  • VRF (Verifiable Random Function): Provably fair randomness for NFTs, games
  • Automation: "Execute this trade when ETH > $3,000"
  • Cross-chain: CCIP moves data/tokens across blockchains
  • Weather/Sports: Parametric insurance, prediction markets` },
      { heading: 'DApps: The New Application Layer', content: `A DApp (Decentralized Application) runs on a blockchain instead of centralized servers.

  Architecture Comparison:
  ┌──────────────────────────────────────────┐
  │  Traditional App                         │
  │  User → Frontend → API → Database        │
  │  (All controlled by one company)         │
  ├──────────────────────────────────────────┤
  │  DApp                                    │
  │  User → Browser + MetaMask → Smart       │
  │  Contract → Blockchain (+ IPFS for UI)   │
  │  (No central point of control)           │
  └──────────────────────────────────────────┘

  The DApp Stack:
  • Frontend: React/Next.js using ethers.js or wagmi for wallet connection
  • Smart Contracts: Solidity on Ethereum, Rust on Solana
  • Storage: IPFS for files, Arweave for permanent storage
  • Indexing: The Graph Protocol (decentralized GraphQL for blockchain data)

  Notable DApps & Their Scale:
  🦄 Uniswap — $1-5B daily DEX volume, $5B TVL
  🏦 Aave — $10B+ TVL, cross-chain lending
  🖼️ OpenSea — $30B+ all-time NFT volume
  🎮 Axie Infinity — $4B+ in NFT sales at peak
  🏛️ MakerDAO — Governs $8B+ in DAI stablecoin` },
      { heading: 'Smart Contract Security', content: `Smart contracts are immutable and handle real money. Bugs are permanent and costly.

  Hall of Shame (Top Hacks by Loss):
  ┌────────────────────────────────────────┐
  │  Ronin Bridge (2022)    $625M stolen  │
  │  Poly Network (2021)    $611M stolen  │
  │  BNB Bridge (2022)      $586M stolen  │
  │  Wormhole (2022)        $325M stolen  │
  │  Nomad Bridge (2022)    $190M stolen  │
  │  The DAO (2016)          $60M stolen  │
  └────────────────────────────────────────┘
  Total crypto hacked 2022 alone: $3.8 billion

  Critical Vulnerability Classes:

  🔴 Reentrancy (The DAO hack)
    Attacker's contract calls back into the victim before state updates.
    Fix: Update state BEFORE external calls. Use ReentrancyGuard.

  🔴 Flash Loan Attacks
    Borrow $500M, manipulate price oracle, drain protocol, repay loan — all in one transaction.
    Fix: Use time-weighted average prices (TWAP), not spot prices.

  🔴 Access Control
    Missing onlyOwner or onlyRole modifier lets anyone call admin functions.
    The $150M Nomad bridge hack was basically "anyone could forge messages."

  🔴 Integer Overflow (pre-Solidity 0.8)
    uint256 max + 1 = 0. Now auto-checked in Solidity 0.8+.

  Security Best Practices:
  ✅ Formal verification (Certora, Echidna fuzzing)
  ✅ Multiple audits (Certik, OpenZeppelin, Trail of Bits)
  ✅ Bug bounty programs ($1M-$10M for critical bugs)
  ✅ Use OpenZeppelin battle-tested contract library
  ✅ Time-locks on admin functions (48h delay)
  ✅ Multi-sig for admin wallets (3-of-5)` },
    ],
    quiz: [
      { q: 'Who first conceptualized smart contracts?', options: ['Vitalik Buterin', 'Satoshi Nakamoto', 'Nick Szabo', 'Gavin Wood'], answer: 2, explanation: 'Nick Szabo coined "smart contracts" in 1994 — his vending machine analogy perfectly captures the concept of trustless, automated contract execution.' },
      { q: "What is 'gas' in Ethereum?", options: ['The cryptocurrency used to pay validators', 'A unit measuring computational effort for operations', 'A type of token standard', 'The encryption algorithm'], answer: 1, explanation: 'Gas is a unit measuring the computational work needed for EVM operations. Each opcode costs a fixed amount of gas. Gas price × gas used = ETH fee paid to validators.' },
      { q: 'What problem do oracles solve?', options: ['Network congestion', 'Bringing real-world data onto the blockchain', 'Reducing gas fees', 'Preventing 51% attacks'], answer: 1, explanation: 'Blockchains can\'t access external data (the Oracle Problem). Oracles like Chainlink securely deliver off-chain data on-chain through decentralized networks of node operators.' },
      { q: 'The DAO hack in 2016 used which attack vector?', options: ['Phishing', 'Integer overflow', 'Reentrancy attack', '51% attack'], answer: 2, explanation: 'The DAO was exploited via reentrancy: the attacker\'s contract called withdraw() recursively before the balance updated, draining $60M. This led to Ethereum\'s controversial hard fork.' },
      { q: 'Which language is most commonly used for Ethereum smart contracts?', options: ['JavaScript', 'Python', 'Solidity', 'Rust'], answer: 2, explanation: 'Solidity is the dominant language for Ethereum smart contracts. Vyper is a Pythonic alternative prioritizing safety. Rust is used for Solana/NEAR, and Move for Aptos/Sui.' },
    ],
  },
  {
    id: 'defi', emoji: '🌊', title: 'DeFi, NFTs & Web3',
    subtitle: 'The new economy of ownership',
    icon: Star, tag: 'ADVANCED',
    hex: '#eab308', hex2: '#f59e0b',
    difficulty: 3,
    readTime: '45 min',
    sections: [
      { heading: 'Decentralized Finance (DeFi)', content: `DeFi is the recreation of the entire financial system — on public blockchains, with no banks, brokers, or clearinghouses.

  Total Value Locked (TVL) in DeFi peaked at $180B in Nov 2021. As of 2024: ~$80B.

  ◆ Automated Market Makers (AMMs)
  Traditional exchange: Order book matching buyers/sellers. Requires liquidity, market makers.
  AMM: Replace order books with liquidity pools.

  Uniswap V2 Formula: x · y = k
  → x = token A reserve, y = token B reserve, k = constant
  → Price emerges from the ratio. Buy token A → ratio shifts → price rises.
  → Liquidity providers (LPs) earn 0.3% of every swap

  Uniswap processes $1-5B daily. No accounts. No KYC. Works 24/7/365.

  ◆ Lending & Borrowing (Aave, Compound)
  Deposit USDC → earn 5% APY (supplied by borrowers)
  Borrow ETH against your BTC collateral (150% collateral ratio)
  If collateral drops below threshold → liquidation bots repay loan, take collateral
  All automated by smart contracts. No credit checks. No paperwork.

  ◆ Flash Loans
  The most mind-bending DeFi primitive: borrow $100M with ZERO collateral — as long as you repay in the same transaction block. If you don't repay → entire transaction reverts as if it never happened.
  Used legitimately for: arbitrage, collateral swaps, self-liquidation.
  Used maliciously for: price oracle manipulation attacks.

  ◆ Yield Aggregators (Yearn Finance)
  Automatically move your deposits between protocols to maximize yield.
  Yearn's "vaults" earned users billions in optimized returns.` },
      { heading: 'NFTs: Non-Fungible Tokens', content: `Understanding Fungibility:
  Fungible: Every unit is identical and interchangeable.
    → 1 ETH = any other 1 ETH = $3,000 USD bill
  Non-Fungible: Each unit is unique and non-interchangeable.
    → The Mona Lisa ≠ a copy of the Mona Lisa
    → Your house ≠ my house (even if same model)

  An NFT is a unique, verifiable token on a blockchain proving ownership of a digital (or physical) asset.

  Token Standards:
  • ERC-721: "One token, one unique asset." Used for art, collectibles, land.
  • ERC-1155: "One contract, many token types." Used for games (weapons, potions, land — all in one contract). 5x more gas efficient.
  • ERC-6551: "Token-bound accounts." NFTs that own other assets (an NFT that has its own wallet).

  The NFT Ecosystem:

  🎨 Digital Art
    Beeple's "Everydays: The First 5000 Days" → $69.3M at Christie's (March 2021)
    Most expensive tweet: Jack Dorsey's first tweet → $2.9M
    XCOPY, Pak, Art Blocks generative art → built entire art market

  🎮 Gaming & Virtual Worlds
    Axie Infinity: $4B in sales. Players earned real income in Philippines.
    The Sandbox: Virtual land plots sold for $4M+ each.
    Gods Unchained: Trading cards you actually own.

  🪪 Real Utility NFTs
    ENS domains: "alice.eth" → links to your wallet (27M+ registered)
    Soulbound Tokens: Non-transferable. Diplomas, medical records, reputation.
    Nike .SWOOSH: Digital sneakers, exclusive community access.` },
      { heading: 'Web3: The Ownership Economy', content: `Web1 (1991-2004): Read
  Static HTML pages. You consumed content. AOL, Yahoo, early web.
  No logins. No personalization. No user data collection.

  Web2 (2004-present): Read + Write
  You create content — but platforms own it.
  Facebook, Google, Twitter: you're the product. Your data is the revenue model.
  3 billion people on social media. ~$500B/year in ad revenue extracted from attention.
  Platform risk: get deplatformed, lose everything overnight.

  Web3 (emerging): Read + Write + Own
  You control your data, identity, and digital assets via cryptographic keys.
  No account deletions. No data harvesting. No single point of control.

  Core Web3 Building Blocks:

  🔑 Identity (Self-Sovereign)
  Your wallet IS your identity. No username/password. Sign in with Ethereum (EIP-4361).
  ENS: "alice.eth" maps wallet → human-readable name (like DNS for crypto).
  Verifiable Credentials: Tamper-proof digital diplomas, licenses, proofs of personhood.

  🗄️ Storage
  IPFS: Content-addressed storage. Files identified by their hash, not location.
    → Move a file, the hash stays the same. Censorship-resistant.
  Arweave: Permanent storage, paid upfront. Files stored forever.
  Filecoin: Incentivized IPFS — pay FIL tokens to store on the network.

  🌐 Frontend Hosting
  Fleek (IPFS), Vercel (centralized but common), ENS + IPFS for fully decentralized dApps.` },
      { heading: 'DAOs: Decentralized Autonomous Organizations', content: `A DAO is an organization whose rules are encoded in smart contracts and executed by token holder votes. No CEO. No board of directors. No headquarters.

  The DAO Lifecycle:
  1. Token holders hold governance tokens (e.g., UNI, MKR, ARB)
  2. Anyone with enough tokens can submit a proposal
  3. Token holders vote over a set period
  4. If quorum + approval % met → smart contract auto-executes the change
  5. Treasury managed on-chain via Gnosis Safe multisig

  Notable DAOs by Treasury Size (2024):
  ◆ Uniswap DAO    $3B+ treasury, governs the #1 DEX
  ◆ Arbitrum DAO   $2B+ treasury, governs Layer 2 network
  ◆ Optimism DAO   $1B+ treasury, "RetroPGF" retroactive public funding
  ◆ MakerDAO       Governs $8B+ in DAI, earns $200M/year in protocol revenue
  ◆ Nouns DAO      1 Noun NFT auctioned daily (~$100K each) → treasury

  Governance Innovations:
  • Quadratic voting: Voting power = √(tokens held). Reduces whale dominance.
  • Conviction voting: Long-term staking of votes on proposals increases weight.
  • Rage quit: If a proposal passes you hate, exit with your proportional share of treasury (Moloch DAO pattern).

  Real Limitations:
  Voter apathy is endemic (3-5% average participation). Whales dominate. Decision-making is slow. Legal status unclear in most jurisdictions.` },
      { heading: 'Layer 2: Scaling Ethereum', content: `The Scalability Trilemma (Vitalik Buterin):
  You can maximize only 2 of: Security, Decentralization, Scalability.
  Ethereum optimizes for Security + Decentralization → ~15 TPS.
  Layer 2s inherit Ethereum's security while adding Scalability.

  ◆ Optimistic Rollups (Arbitrum One, Optimism, Base)
  How: Execute thousands of transactions off-chain. Post compressed data + state root to Ethereum L1. Assume all transactions are valid ("optimistic").
  Fraud proofs: Anyone can challenge invalid transactions within 7 days.
  Result: 10-40x cheaper than L1. 2,000+ TPS.
  Trade-off: 7-day withdrawal delay (challenge period).
  Adoption: $15B+ TVL. Uniswap, Aave, GMX all on Arbitrum.

  ◆ ZK-Rollups (zkSync Era, StarkNet, Polygon zkEVM, Scroll)
  How: Generate cryptographic validity proofs (zk-SNARKs or zk-STARKs) for every batch.
  The proof mathematically guarantees all transactions are valid.
  No challenge period. Instant cryptographic finality.
  Trade-off: Computationally expensive to generate proofs.
  Why it's the future: Trustless, fast, private, and composable.

  ◆ Validium (StarkEx, Immutable X)
  Like ZK-rollup but data stored off-chain. 9,000+ TPS.
  Used by: dYdX (v3), Immutable X for NFT games.

  Current L2 Landscape (2024):
  • Arbitrum One: $10B TVL, dominant DeFi hub
  • Base (Coinbase): $5B TVL, consumer apps
  • Optimism: $6B TVL, Superchain vision
  • zkSync Era: $700M TVL, growing ZK ecosystem` },
    ],
    quiz: [
      { q: 'What formula does Uniswap V2 use for pricing?', options: ['x + y = k', 'x × y = k', 'x² + y² = k', 'x / y = k'], answer: 1, explanation: 'Uniswap V2 uses the constant product formula x × y = k. As you buy token X (removing it from the pool), Y must increase to maintain k. This creates price impact proportional to trade size.' },
      { q: 'What makes a Flash Loan unique?', options: ['0% interest rate', 'Uncollateralized loan repaid within one transaction', 'Available only to institutions', 'Can only borrow ETH'], answer: 1, explanation: 'Flash loans require no collateral — but must be borrowed AND repaid in a single transaction block. If not repaid, the entire transaction reverts as if it never happened. This creates atomic arbitrage possibilities.' },
      { q: 'What ERC standard defines unique NFTs?', options: ['ERC-20', 'ERC-1155', 'ERC-721', 'ERC-4626'], answer: 2, explanation: 'ERC-721 is the standard for non-fungible tokens, where each token has a unique ID. ERC-1155 is a multi-token standard supporting both fungible and non-fungible tokens in one contract.' },
      { q: "What is the Scalability Trilemma?", options: ["Blockchain can't be secure", 'Can only optimize 2 of: security, decentralization, scalability', 'All three are impossible simultaneously', 'Scalability is most important'], answer: 1, explanation: "Vitalik Buterin's Scalability Trilemma: blockchain systems can typically optimize for only two of three properties. Ethereum chose security + decentralization, leaving scalability to Layer 2 solutions." },
      { q: 'Which L2 uses cryptographic proofs for instant finality?', options: ['Optimistic Rollups', 'State Channels', 'Sidechains', 'ZK-Rollups'], answer: 3, explanation: 'ZK-Rollups generate zero-knowledge validity proofs for every batch of transactions. These proofs mathematically guarantee correctness, enabling instant finality — unlike Optimistic Rollups\' 7-day challenge window.' },
    ],
  },
  {
    id: 'crypto', emoji: '🔐', title: 'Cryptography',
    subtitle: 'The mathematical backbone of trust',
    icon: Lock, tag: 'ADVANCED',
    hex: '#06b6d4', hex2: '#22d3ee',
    difficulty: 3,
    readTime: '42 min',
    sections: [
      { heading: 'Why Cryptography Matters', content: `Cryptography is why blockchain works. Without it, there is no security, no ownership, no trust. Every single blockchain feature traces back to three cryptographic primitives:

  1. Cryptographic Hash Functions
     → Fingerprinting data. Detecting tampering. Proof of Work. Merkle Trees.

  2. Public-Key Cryptography (Asymmetric Encryption)
     → Identity. Digital signatures. Proving ownership without revealing secrets.

  3. Zero-Knowledge Proofs
     → Proving knowledge without revealing it. Privacy + scalability.

  A mental model:
  ◆ Hash functions = fingerprints (unique, irreversible)
  ◆ Public/private keys = a special padlock (anyone can lock it, only you can open it)
  ◆ ZK proofs = proving you know a secret without telling anyone what it is

  These three tools, combined with game theory and peer-to-peer networking, create a system that replaced banks, notaries, and escrow agents with math.

  The result: two strangers on opposite sides of the world can transact $1 billion with zero trust required.` },
      { heading: 'Cryptographic Hash Functions', content: `A hash function maps arbitrary input → fixed-length output.
  SHA-256 always outputs 64 hex characters (256 bits), regardless of input size.

  The five properties that make them useful:

  1. Deterministic
     SHA-256("hello") = 2cf24dba5... — always, on every computer, forever.

  2. Avalanche Effect (most important!)
     SHA-256("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73...
     SHA-256("Hello") = 185f8db32921bd46d35cc2e586...
     → One bit change → ~50% of output bits flip. Unpredictable.

  3. Pre-image Resistance (one-way)
     Given output H, it's computationally infeasible to find input X where H(X) = H.
     This is why passwords are stored as hashes, not plaintext.

  4. Collision Resistance
     Computationally infeasible to find X ≠ Y where H(X) = H(Y).
     SHA-256 has never had a known collision in 20+ years.

  5. Fixed Output Size
     SHA-256("a") = 64 chars
     SHA-256(entire Harry Potter series) = 64 chars

  Blockchain Applications:
  • SHA-256: Bitcoin block hashes, PoW puzzle
  • Keccak-256: Ethereum block hashes, address derivation, function selectors
  • RIPEMD-160: Bitcoin address generation (SHA-256 then RIPEMD-160)` },
      { heading: 'Public-Key Cryptography', content: `The mathematical magic that lets you prove ownership without revealing your secret.

  Key Generation (secp256k1 elliptic curve):
  1. Private key: 256-bit random number (must be truly random)
     Example: 0x4b392b7f7a6e5b4d8c2a1f3e9d6b0c8a...
     This is your master secret. NEVER share it.

  2. Public key: privateKey × G (elliptic curve point multiplication)
     G = secp256k1 generator point (a specific point on the curve)
     This math is one-way: easy to compute public from private, impossible to reverse.

  3. Ethereum address: last 20 bytes of Keccak256(publicKey)
     0x742d35Cc6634C0532925a3b844Bc454e4438f44e

  How Digital Signatures Work (ECDSA):
  ┌──────────────────────────────────────────┐
  │  SIGNING (you do this)                  │
  │  1. hash = Keccak256(transaction_data)   │
  │  2. sig = ECDSA.sign(hash, privateKey)   │
  │  3. Signature: (r, s, v) — 65 bytes      │
  ├──────────────────────────────────────────┤
  │  VERIFICATION (anyone can do this)       │
  │  1. recoveredKey = ECDSA.recover(hash,sig│
  │  2. address = deriveAddress(recoveredKey)│
  │  3. Check: address == tx.from? ✓         │
  └──────────────────────────────────────────┘

  HD Wallets (BIP-32/BIP-39):
  12 or 24 random English words → single seed → billions of key pairs
  "abandon abandon abandon ... about" → deterministic key tree
  Lose your seed phrase = lose all your wallets forever.
  Never screenshot. Never type in websites. Never store in cloud.` },
      { heading: 'Merkle Trees', content: `Named after Ralph Merkle (1979 patent). A binary tree where every node is the hash of its children. The root is a single hash summarizing the entire dataset.

  Construction for a block with 8 transactions:
  Level 3 (leaves): H(T1) H(T2) H(T3) H(T4) H(T5) H(T6) H(T7) H(T8)
  Level 2:         H(12)      H(34)      H(56)      H(78)
  Level 1:              H(1234)                H(5678)
  Level 0 (root):             H(12345678) = Merkle Root

  Merkle Proofs — The Killer Feature:

  Question: Is transaction T1 in this block of 1 million transactions?
  Without Merkle: Download all 1M transactions and check. ~1GB of data.
  With Merkle: Provide just log₂(1,000,000) ≈ 20 hashes. ~640 bytes.

  The proof for T1 contains: H(T2), H(34), H(5678), and the Merkle Root.
  Anyone can recompute the path and verify the Merkle Root matches.

  This enables:
  • SPV (Simplified Payment Verification): Mobile wallets verify txns with 99.99% less data
  • Bitcoin's "Segregated Witness": Tx data and signatures in separate Merkle trees
  • Ethereum's Patricia Merkle Trie: Efficient state proofs for account balances
  • Certificate Transparency: Google's tamper-evident log of all TLS certificates

  Ethereum's State Trie:
  Modified Merkle Patricia Trie stores the entire world state: every account balance, every contract storage slot. The state root is included in every block header.` },
      { heading: 'Zero-Knowledge Proofs', content: `One of the most profound cryptographic innovations of the 20th century.

  Definition: Prove you know a secret without revealing the secret.

  The Cave Analogy (Quisquater & Guillou, 1990):
  A circular cave has a magic door requiring a secret code word.
  You want to prove you know the code without saying it.
  → Enter the cave, choose left or right path randomly
  → I shout "come out left" or "come out right"
  → If you know the code, you can always comply
  → Repeat 20 times: probability of cheating = (½)²⁰ = 1 in 1,048,576
  → After enough rounds, I'm statistically certain you know the code

  Three Required Properties:
  1. Completeness: If you know the secret, honest prover always convinces verifier
  2. Soundness: If you don't know the secret, you can only cheat with negligible probability
  3. Zero-Knowledge: Verifier learns NOTHING about the secret itself

  Types of ZK Proofs:
  ◆ zk-SNARKs (Succinct Non-interactive ARguments of Knowledge)
    Proof size: ~200 bytes. Verification: milliseconds. Requires trusted setup.
    Used by: Zcash, Groth16, Plonk, many ZK-rollups

  ◆ zk-STARKs (Scalable Transparent ARguments of Knowledge)
    No trusted setup. Quantum-resistant. Larger proofs (~50KB).
    Used by: StarkNet, Polygon Miden

  Blockchain Applications (This is the future):
  • ZK-Rollups: Prove 10,000 transactions are valid in one 200-byte proof
  • Privacy coins: Prove "I have enough balance" without revealing amount
  • Identity: "I am over 18" without revealing birthdate or name
  • Compliance: "This transaction is not OFAC-sanctioned" without revealing sender
  • Gaming: Prove your hidden move in chess is valid without revealing it` },
    ],
    quiz: [
      { q: 'Which hash property makes Proof of Work secure?', options: ['They are reversible', 'They produce identical outputs for similar inputs', 'Finding an input for a target output requires massive computation', 'They always produce short outputs'], answer: 2, explanation: 'Pre-image resistance means you cannot work backwards from a hash. Finding a nonce that produces a hash below the target requires brute force — billions of hashes per second for trillions of attempts.' },
      { q: 'Which key can you safely share with anyone?', options: ['Private key', 'Public key', 'Both', 'Neither'], answer: 1, explanation: 'Your public key (and derived address) are designed to be shared — they\'re how people send you funds. Your private key must never be shared; anyone with it has full control of your assets.' },
      { q: 'What is the key advantage of Merkle proofs?', options: ['They encrypt transactions', 'Verify a transaction in a block of millions using only ~20 hashes', 'They speed up mining', 'They prevent double-spending'], answer: 1, explanation: 'Merkle proofs enable logarithmic verification. To prove 1 tx is in a block of 1 million, you only need log₂(1,000,000) ≈ 20 hashes instead of downloading everything.' },
      { q: 'What does a Zero-Knowledge proof allow?', options: ['Reveal all transaction details', 'Prove knowledge of a secret without revealing it', 'Verify a hash is valid', 'Prove you own a private key by sharing it'], answer: 1, explanation: 'ZK proofs are cryptographic protocols allowing a prover to convince a verifier they know a secret — without revealing any information about the secret itself. This enables privacy + scalability.' },
      { q: "What is the 'avalanche effect' in hash functions?", options: ['Performance degrades with large inputs', 'A 1-bit change in input causes ~50% of output bits to change', 'Hash collisions occur under heavy network load', 'Output size grows with input size'], answer: 1, explanation: 'The avalanche effect is a critical security property: a tiny input change causes a dramatically different output. This makes blockchain hashes unpredictable, tamper-evident, and suitable for PoW.' },
    ],
  },
  {
    id: 'usecases', emoji: '🌍', title: 'Real-World Use Cases',
    subtitle: 'Blockchain solving real problems at scale',
    icon: Shield, tag: 'APPLIED',
    hex: '#f43f5e', hex2: '#fb7185',
    difficulty: 2,
    readTime: '35 min',
    sections: [
      { heading: 'Finance & Banking', content: `Blockchain is disrupting the $20T/year global financial system.

  ◆ Cross-Border Payments
  Status quo: SWIFT transfers take 3-5 business days, cost 5-10% in fees, involve 3-5 correspondent banks.
  Blockchain: Stellar — transactions settle in 3-5 seconds for $0.0001.
  Ripple's xCurrent: Used by Santander, SBI Holdings, 300+ banks for real-time settlement.
  2023: Ripple On-Demand Liquidity processed $15B+ in transactions.

  ◆ CBDCs (Central Bank Digital Currencies)
  130+ countries (98% of global GDP) are exploring or piloting CBDCs.
  • China's Digital Yuan (e-CNY): 261M+ wallets. Used at 2022 Winter Olympics. Programmable (expiry dates on stimulus money).
  • EU Digital Euro: Pilot launched 2023. Target: 2027 rollout.
  • US FedNow (2023): Real-time payments, not blockchain, but shows urgency.
  Key tension: Financial surveillance vs. cash-like privacy.

  ◆ Tokenized Real-World Assets (RWA)
  The $600T opportunity: Tokenize bonds, equities, real estate, private credit.
  • BlackRock BUIDL Fund: $500M+ tokenized US Treasury bills on Ethereum
  • Franklin Templeton: $380M US gov money market fund on Stellar
  • JPMorgan Onyx: Tokenized repo, $300B+ processed
  • Ondo Finance, Maple Finance: DeFi protocols for institutional RWA lending

  The Vision: 24/7 trading of any asset, fractional ownership of the Eiffel Tower, instant T+0 settlement.` },
      { heading: 'Supply Chain & Logistics', content: `Global supply chains are opaque, paper-based, and ripe for fraud. Blockchain creates immutable audit trails.

  ◆ Food Safety — IBM Food Trust (Walmart)
  The Problem: A 2018 romaine lettuce E. coli outbreak required 7 days to trace. 5 died.
  2018: Walmart mandated all leafy greens suppliers join IBM Food Trust.
  Result: Mango tracing time → 2.2 seconds. 25+ food categories now tracked.
  Real Impact: In an outbreak, you can isolate the exact contaminated farm in seconds — not pull ALL romaine lettuce from every shelf.

  ◆ Pharmaceutical — MediLedger / DSCSA Compliance
  Drug counterfeiting kills 250,000-500,000 people annually.
  US Drug Supply Chain Security Act requires track-and-trace by 2025.
  MediLedger Network: 40+ pharma companies (Pfizer, Genentech, AmerisourceBergen) track drugs from factory to pharmacy.
  Each pill's serialization data is on-chain. Instant verification. Counterfeit drugs detected immediately.

  ◆ Luxury Goods — LVMH Aura Consortium
  Members: Louis Vuitton, Dior, Prada, Cartier, OTB.
  Every product gets an NFT-linked digital certificate of authenticity.
  Tracks: Materials, manufacturing, ownership transfers, repairs.
  $400B global luxury market finally has a scalable anti-counterfeit solution.

  ◆ Shipping — TradeLens (Maersk + IBM)
  Containerized shipping documentation: 200+ interactions, 30+ organizations per shipment.
  TradeLens digitized and shared paperwork across all parties.
  Result: Rotterdam to Newark shipping documentation time: 10 days → 1 day.` },
      { heading: 'Healthcare & Identity', content: `◆ Patient-Controlled Medical Records
  The Problem: Your health data is in silos — 3 different EHRs across hospitals that don't talk.
  Emergency doctors lack your medication history. You need to request your own records.

  Blockchain Vision:
  • Patient holds private key → grants time-limited read access to any provider
  • Immutable audit trail: who accessed what and when
  • Estonia's e-Health system (X-Road): 1M+ citizens, 99% of health data digital, blockchain timestamps
  • Medicalchain: Patients share records with doctors, earn tokens for anonymized research

  ◆ COVID Vaccine Cold Chain
  Pfizer BNT162b2 required -70°C storage. A single temperature excursion = unusable dose.
  IoT sensors + Blockchain: Every temperature reading immutably recorded.
  Smart contract: auto-flag deviation, auto-deny reimbursement if cold chain broken.
  Implemented by IBM TrustChain at multiple distribution centers.

  ◆ Self-Sovereign Identity (SSI)
  Current Model: Google/Facebook/government know everything about you.
  SSI Model: You hold Verifiable Credentials in your crypto wallet.
  • Prove you're 18+ without revealing your DOB (ZK proof)
  • Prove you have a medical license without revealing which hospital
  • Prove you passed a background check without revealing the details

  Implementations:
  • Microsoft Entra Verified ID: 1M+ credentials issued
  • Proof of Humanity: 20,000+ verified unique humans on Ethereum
  • Worldcoin: Iris-scan based global proof-of-personhood (controversial)` },
      { heading: 'Gaming & Creator Economy', content: `◆ The Play-to-Earn Revolution (and its lessons)
  Traditional gaming: $180B industry. Platform owns everything. Server shuts down → you lose all progress.

  Axie Infinity (2021 peak):
  • 2.7M daily active players
  • Players in Philippines earning $500-$1,500/month playing a game
  • Scholarship model: guilds lend Axies to players, split earnings
  • $4B+ in all-time NFT sales
  • The collapse: "Infinity" required infinite new players. When growth stopped → token crashed 99%. Unsustainable tokenomics lesson.

  Better models emerging:
  • Gods Unchained: Fun-first, blockchain-second card game. True card ownership.
  • Illuvium: AAA-quality RPG with Ethereum asset ownership.
  • Star Atlas: $650M raised, building a Solana-based space MMO.
  Key lesson: Games need to be fun first. Blockchain is the backend, not the game.

  ◆ Creator Economy Transformation
  Current: Spotify takes 30-70% of revenue. YouTube keeps 45%. Artists must build on platforms they don't control.

  Blockchain alternative:
  • Audius: 8M users, artists keep 90%+ of revenue. 100M streams/month.
  • Mirror.xyz: Decentralized publishing. Articles are NFTs. Collectors earn appreciation.
  • Sound.xyz: Music NFTs. An artist sold 100 editions at $10 = $1,000. Resales earn royalties.
  • Royal.io: Fans buy royalty shares of songs. Earn % of Spotify revenue.

  Creator economy on-chain total: $5B+ paid to creators in 2021-2023.` },
      { heading: 'What\'s Next: Frontier Blockchain', content: `◆ AI × Blockchain
  The convergence everyone is building toward:
  • Bittensor: Decentralized ML marketplace. Train/run AI models, earn TAO tokens.
  • Akash Network: Decentralized GPU compute marketplace. Cheaper than AWS.
  • Gensyn: Pay-per-use ML training on idle consumer GPUs.
  • Worldcoin: Use AI iris scans to issue proof-of-human credentials.
  Vision: AI agents hold crypto wallets, own resources, hire other AI agents.

  ◆ Onchain Social
  • Farcaster: Decentralized Twitter alternative. 100K+ daily active users. Frames = mini-apps in posts.
  • Lens Protocol: Social graph as NFTs. Your followers = your asset.
  • Friend.tech: Buy "shares" of people's access. $50M+ in revenue at peak.

  ◆ Modular Blockchains
  The future is modular, not monolithic.
  • Execution layer: Rollups (Arbitrum, StarkNet, zkSync)
  • Data availability: Celestia, EigenDA, Avail
  • Settlement: Ethereum
  • Consensus: Ethereum + EigenLayer restaking

  EigenLayer: Restake your ETH to secure other protocols. $15B+ TVL in months. Creates economic security as a service.

  ◆ The Cypherpunk Vision
  The original Bitcoin white paper was a response to the 2008 financial crisis. Satoshi's vision: a world where individuals have monetary sovereignty. Whether blockchain achieves that vision — or becomes another layer of financial infrastructure captured by banks — is the defining question of the next decade.` },
    ],
    quiz: [
      { q: "Walmart's blockchain traceability reduced mango tracking time from 7 days to:", options: ['1 hour', '30 minutes', '2.2 seconds', '24 hours'], answer: 2, explanation: "IBM Food Trust reduced mango origin tracing from 7 days to 2.2 seconds. In a food safety outbreak, this difference can save lives by enabling immediate, targeted recalls." },
      { q: 'What is a CBDC?', options: ['A DeFi governance token', 'A Central Bank Digital Currency on a government blockchain', 'A cross-border payment protocol', 'A community-based decentralized coin'], answer: 1, explanation: 'CBDCs are digital fiat currencies issued by central banks, often on permissioned blockchains. 130+ countries representing 98% of global GDP are exploring or piloting them.' },
      { q: 'In Self-Sovereign Identity, what holds your credentials?', options: ['A government database', 'Facebook', 'Your crypto wallet via cryptographic keys', 'A biometric server'], answer: 2, explanation: 'SSI means your identity lives in your crypto wallet as Verifiable Credentials. You control what to share, with whom, and for how long — with no central database that can be hacked or censored.' },
      { q: 'What was Axie Infinity\'s key innovation AND its critical flaw?', options: ['Best graphics / bad gameplay', 'Play-to-earn NFT ownership / unsustainable tokenomics requiring infinite new players', 'Fully decentralized servers / high gas fees', 'First NFT game / bad art'], answer: 1, explanation: "Axie pioneered play-to-earn with true NFT ownership, enabling real income in developing countries. But its economy required constant new player inflow — when growth stopped, tokens crashed 99%. A critical tokenomics lesson." },
      { q: 'Why is blockchain valuable for pharmaceutical supply chains?', options: ['Reduces drug production costs', 'Enables faster shipping', 'Immutable records prevent counterfeit drugs from entering supply chain', 'Replaces FDA regulation'], answer: 2, explanation: 'Drug counterfeiting kills 250,000+ annually. Blockchain\'s immutable track-and-trace from manufacturer to pharmacy makes it cryptographically impossible to inject counterfeit drugs without detection.' },
    ],
  },
]

const GLOSSARY = [
  ['Block', 'A container of validated transactions, linked to previous block via its hash'],
  ['Hash', 'Fixed-length cryptographic fingerprint of any data (SHA-256, Keccak-256)'],
  ['Nonce', 'Number miners iterate to find a valid block hash below the difficulty target'],
  ['Gas', 'Unit measuring EVM computation cost; gas × gwei price = ETH transaction fee'],
  ['Wallet', 'Software/hardware storing private keys and signing transactions'],
  ['Fork', 'Protocol change — soft fork (backward compatible) or hard fork (chain split)'],
  ['UTXO', "Unspent Transaction Output — Bitcoin's accounting model vs Ethereum's accounts"],
  ['EVM', 'Ethereum Virtual Machine — global sandboxed computer executing smart contracts'],
  ['MEV', 'Maximal Extractable Value — profit from reordering/inserting transactions in a block'],
  ['TVL', 'Total Value Locked — total assets deposited in a DeFi protocol'],
  ['Slippage', 'Difference between expected and actual price in an AMM trade'],
  ['Impermanent Loss', 'Loss AMM liquidity providers experience when token prices diverge'],
  ['Wrapped Token', 'Token representing another asset cross-chain (WBTC = Bitcoin on Ethereum)'],
  ['Multisig', 'Wallet requiring M-of-N signatures — critical for DAO treasuries'],
  ['Soulbound Token', "Non-transferable NFT representing reputation, credentials, or identity"],
  ['Slashing', 'Penalty destroying a PoS validator\'s stake for provably malicious behavior'],
]

// ─── FLOATING NODES ANIMATION ────────────────────────────────────────────────
function FloatingNodes() {
  const nodes = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: 5 + (i * 8.5) % 90,
    size: 2 + (i % 3) * 1.5,
    delay: i * 0.8,
    duration: 6 + (i % 4) * 2,
    color: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'][i % 4],
  }))
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {nodes.map(n => (
        <div
          key={n.id}
          className="edu-floating-node"
          style={{
            left: `${n.x}%`,
            bottom: '10%',
            width: n.size,
            height: n.size,
            background: n.color,
            boxShadow: `0 0 ${n.size * 3}px ${n.color}`,
            animationDuration: `${n.duration}s`,
            animationDelay: `${n.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

// ─── SCORE RING ───────────────────────────────────────────────────────────────
function ScoreRing({ score, total, hex }: { score: number; total: number; hex: string }) {
  const pct = score / total
  const circumference = 283
  const offset = circumference * (1 - pct)
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: 120, height: 120 }}>
      <svg width="120" height="120" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#1e2130" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="45" fill="none"
          stroke={hex} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="edu-score-ring"
          style={{ stroke: hex, filter: `drop-shadow(0 0 6px ${hex}88)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{score}/{total}</span>
        <span className="text-xs text-gray-500">{Math.round(pct * 100)}%</span>
      </div>
    </div>
  )
}

// ─── DIFFICULTY DOTS ──────────────────────────────────────────────────────────
function DifficultyDots({ level }: { level: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: i <= level ? '#f59e0b' : '#1f2937' }}
        />
      ))}
    </div>
  )
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
function ProgressBar({ value, max, hex, animated = false }: { value: number; max: number; hex: string; animated?: boolean }) {
  const pct = (value / max) * 100
  return (
    <div className="h-1 rounded-full overflow-hidden" style={{ background: '#1a1f2e' }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${hex}, ${hex}99)`,
          transition: 'width 0.7s cubic-bezier(0.34,1.2,0.64,1)',
          boxShadow: `0 0 8px ${hex}55`,
        }}
      />
    </div>
  )
}

// ─── QUIZ ──────────────────────────────────────────────────────────────────────
function QuizView({ questions, mod, onComplete }: {
  questions: typeof MODULES[0]['quiz']
  mod: typeof MODULES[0]
  onComplete: (s: number) => void
}) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [visible, setVisible] = useState(true)
  const q = questions[current]

  const handleSelect = (i: number) => {
    if (answered) return
    setSelected(i)
    setAnswered(true)
    if (i === q.answer) setScore(s => s + 1)
  }

  const handleNext = () => {
    const ns = score + (selected === q.answer ? 1 : 0)
    if (current + 1 >= questions.length) {
      setDone(true)
      onComplete(ns)
      return
    }
    setVisible(false)
    setTimeout(() => { setCurrent(c => c + 1); setSelected(null); setAnswered(false); setVisible(true) }, 250)
  }

  if (done) {
    const finalScore = score
    const pct = Math.round((finalScore / questions.length) * 100)
    const msg = pct >= 80 ? ['🏆', 'Outstanding!', 'You\'ve mastered this topic.']
              : pct >= 60 ? ['✅', 'Well done!', 'Review a few sections to reach mastery.']
              : ['📚', 'Keep going!', 'Re-read the material and try again.']
    return (
      <div className="text-center py-10 edu-animate-fade">
        <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 20px rgba(255,200,0,0.4))' }}>{msg[0]}</div>
        <ScoreRing score={finalScore} total={questions.length} hex={mod.hex} />
        <div className="mt-6">
          <h3 className="text-white text-2xl font-black mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>{msg[1]}</h3>
          <p className="text-gray-400 text-sm">{msg[2]}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          {questions.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? 20 : 6,
                height: 6,
                background: i < current ? mod.hex : i === current ? mod.hex : '#1f2937',
                opacity: i === current ? 1 : i < current ? 0.7 : 0.4,
              }}
            />
          ))}
        </div>
        <span className="font-bold text-sm" style={{ color: mod.hex, fontFamily: 'JetBrains Mono, monospace' }}>
          {score}/{questions.length}
        </span>
      </div>

      {/* Question card */}
      <div
        className="rounded-2xl p-6 mb-5 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${mod.hex}0d 0%, #0d1017 100%)`,
          border: `1px solid ${mod.hex}20`,
        }}
      >
        <div
          className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-20 blur-2xl"
          style={{ background: mod.hex }}
        />
        <p className="text-white font-semibold text-base leading-relaxed relative">
          <span className="text-xs font-mono mr-2 opacity-40" style={{ color: mod.hex }}>Q{current + 1}.</span>
          {q.q}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-2.5 mb-5">
        {q.options.map((opt, i) => {
          const isCorrect = answered && i === q.answer
          const isWrong = answered && i === selected && i !== q.answer
          const isPending = !answered

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={answered}
              className="edu-quiz-option w-full text-left rounded-xl px-4 py-3.5 text-sm flex items-center gap-3"
              style={{
                background: isCorrect ? 'rgba(16,185,129,0.1)' : isWrong ? 'rgba(239,68,68,0.08)' : '#0d1017',
                border: `1.5px solid ${isCorrect ? '#10b981' : isWrong ? '#ef4444' : answered ? '#1a1f2e' : '#1a1f2e'}`,
                color: isCorrect ? '#6ee7b7' : isWrong ? '#fca5a5' : answered && i !== selected ? '#374151' : '#d1d5db',
                cursor: isPending ? 'pointer' : 'default',
                boxShadow: isCorrect ? '0 0 20px rgba(16,185,129,0.15)' : isWrong ? '0 0 20px rgba(239,68,68,0.1)' : 'none',
              }}
            >
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: isCorrect ? 'rgba(16,185,129,0.2)' : isWrong ? 'rgba(239,68,68,0.15)' : `${mod.hex}15`,
                  color: isCorrect ? '#10b981' : isWrong ? '#ef4444' : mod.hex,
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {isCorrect ? '✓' : isWrong ? '✗' : String.fromCharCode(65 + i)}
              </span>
              <span>{opt}</span>
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {answered && (
        <div
          className="rounded-xl p-4 mb-5 edu-animate-fade"
          style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-1 h-1 rounded-full bg-blue-400" />
            <span className="text-blue-400 text-xs font-bold tracking-widest" style={{ fontFamily: 'JetBrains Mono, monospace' }}>EXPLANATION</span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{q.explanation}</p>
        </div>
      )}

      {answered && (
        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm"
          style={{
            background: `linear-gradient(135deg, ${mod.hex}, ${mod.hex2})`,
            color: '#050810',
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            letterSpacing: '0.02em',
            boxShadow: `0 4px 20px ${mod.hex}40`,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px ${mod.hex}55` }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px ${mod.hex}40` }}
        >
          {current + 1 >= questions.length ? 'See Your Results' : 'Continue'}
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  )
}

// ─── MODULE DETAIL ─────────────────────────────────────────────────────────────
function ModuleDetail({ mod, onBack }: { mod: typeof MODULES[0]; onBack: () => void }) {
  const [view, setView] = useState<'learn' | 'quiz'>('learn')
  const [activeSection, setActiveSection] = useState(0)
  const [quizDone, setQuizDone] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [quizKey, setQuizKey] = useState(0)
  const [contentVisible, setContentVisible] = useState(true)

  const switchSection = (i: number) => {
    setContentVisible(false)
    setTimeout(() => { setActiveSection(i); setContentVisible(true) }, 150)
  }

  const sec = mod.sections[activeSection]

  return (
    <div className="edu-page">
      <style>{STYLES}</style>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors"
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          <ChevronLeft size={15} />
          <span>Academy</span>
        </button>
        <span className="text-gray-700">/</span>
        <span style={{ color: mod.hex, fontFamily: 'DM Sans, sans-serif' }}>{mod.title}</span>
      </div>

      {/* Module header */}
      <div
        className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${mod.hex}10 0%, #050810 60%)`,
          border: `1px solid ${mod.hex}25`,
        }}
      >
        <div className="absolute inset-0 edu-grid-texture opacity-40" />
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full blur-3xl opacity-15" style={{ background: mod.hex }} />

        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{
                background: `${mod.hex}15`,
                border: `1.5px solid ${mod.hex}35`,
                boxShadow: `0 0 20px ${mod.hex}20`,
              }}
            >
              {mod.emoji}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="edu-tag px-2 py-0.5 rounded" style={{ color: mod.hex, background: `${mod.hex}15`, border: `1px solid ${mod.hex}30` }}>{mod.tag}</span>
                <DifficultyDots level={mod.difficulty} />
              </div>
              <h2 className="text-xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{mod.title}</h2>
              <p className="text-gray-500 text-sm">{mod.subtitle}</p>
            </div>
          </div>
          <div className="flex gap-5 text-center">
            {[
              [mod.sections.length, 'Sections'],
              [mod.quiz.length, 'Questions'],
              [mod.readTime, 'Read Time'],
            ].map(([v, l]) => (
              <div key={l as string}>
                <div className="text-white font-black text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>{v}</div>
                <div className="text-gray-600 text-xs">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div
        className="flex gap-1 mb-6 p-1 rounded-xl"
        style={{ background: '#0a0d14', border: '1px solid #1a1f2e' }}
      >
        {(['learn', 'quiz'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setView(tab)}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
            style={
              view === tab
                ? { background: `linear-gradient(135deg, ${mod.hex}20, ${mod.hex2}12)`, color: mod.hex, border: `1px solid ${mod.hex}30` }
                : { color: '#4b5563', border: '1px solid transparent' }
            }
          >
            {tab === 'learn' ? <><BookOpen size={14} />Learn</> : <><Brain size={14} />Quiz</>}
          </button>
        ))}
      </div>

      {/* ── LEARN ── */}
      {view === 'learn' && (
        <div className="flex gap-5">
          {/* Nav */}
          <div className="w-52 flex-shrink-0 space-y-0.5">
            {mod.sections.map((s, i) => (
              <button
                key={i}
                onClick={() => switchSection(i)}
                className="edu-section-nav-item w-full text-left px-3 py-2.5 rounded-r-xl text-xs transition-all"
                style={{
                  '--nav-hex': mod.hex,
                  borderLeftColor: activeSection === i ? mod.hex : 'transparent',
                  background: activeSection === i ? `${mod.hex}0e` : 'transparent',
                  color: activeSection === i ? '#e5e7eb' : '#4b5563',
                  fontFamily: 'DM Sans, sans-serif',
                } as React.CSSProperties}
              >
                <span
                  className="inline-flex w-5 h-5 rounded items-center justify-center text-xs font-mono mr-1.5 flex-shrink-0"
                  style={{
                    background: activeSection === i ? `${mod.hex}25` : '#111520',
                    color: activeSection === i ? mod.hex : '#374151',
                  }}
                >
                  {i + 1}
                </span>
                {s.heading}
              </button>
            ))}
            <div className="pt-2">
              <button
                onClick={() => setView('quiz')}
                className="w-full text-left px-3 py-2.5 rounded-r-xl text-xs flex items-center gap-2 transition-all"
                style={{ color: '#374151', borderLeft: '2px solid #1a1f2e', fontFamily: 'DM Sans, sans-serif' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = mod.hex }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#374151' }}
              >
                <Brain size={11} />
                Take the Quiz →
              </button>
            </div>
          </div>

          {/* Content */}
          <div
            className="flex-1 rounded-2xl flex flex-col"
            style={{
              background: '#050810',
              border: '1px solid #0f1520',
              minHeight: 500,
            }}
          >
            {/* Content header */}
            <div
              className="flex items-center gap-3 px-6 py-4 border-b"
              style={{ borderColor: '#0f1520' }}
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold"
                style={{ background: `${mod.hex}20`, color: mod.hex }}
              >
                {activeSection + 1}
              </div>
              <h3 className="font-bold text-white text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>{sec.heading}</h3>
              <div className="ml-auto text-xs" style={{ color: mod.hex, fontFamily: 'JetBrains Mono, monospace' }}>
                {activeSection + 1} / {mod.sections.length}
              </div>
            </div>

            {/* Content body */}
            <div
              className="flex-1 px-6 py-5 overflow-y-auto edu-content-area"
              style={{
                opacity: contentVisible ? 1 : 0,
                transition: 'opacity 0.15s ease',
                fontSize: '0.875rem',
                color: '#94a3b8',
                lineHeight: 1.9,
                whiteSpace: 'pre-line',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {sec.content}
            </div>

            {/* Footer nav */}
            <div
              className="flex items-center justify-between px-6 py-4 border-t"
              style={{ borderColor: '#0f1520' }}
            >
              <button
                onClick={() => switchSection(Math.max(0, activeSection - 1))}
                disabled={activeSection === 0}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all"
                style={{
                  color: activeSection === 0 ? '#1f2937' : '#6b7280',
                  background: activeSection === 0 ? 'transparent' : '#0d1017',
                  border: `1px solid ${activeSection === 0 ? '#111' : '#1a1f2e'}`,
                  cursor: activeSection === 0 ? 'not-allowed' : 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                <ChevronLeft size={13} /> Prev
              </button>

              {/* Section dots */}
              <div className="flex gap-1.5">
                {mod.sections.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => switchSection(i)}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: i === activeSection ? 16 : 6,
                      height: 6,
                      background: i === activeSection ? mod.hex : i < activeSection ? `${mod.hex}60` : '#1a1f2e',
                    }}
                  />
                ))}
              </div>

              {activeSection < mod.sections.length - 1 ? (
                <button
                  onClick={() => switchSection(activeSection + 1)}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg"
                  style={{
                    background: `${mod.hex}15`,
                    border: `1px solid ${mod.hex}30`,
                    color: mod.hex,
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  Next <ChevronRight size={13} />
                </button>
              ) : (
                <button
                  onClick={() => setView('quiz')}
                  className="flex items-center gap-1.5 text-sm px-4 py-1.5 rounded-lg font-semibold"
                  style={{
                    background: `linear-gradient(135deg, ${mod.hex}, ${mod.hex2})`,
                    color: '#050810',
                    fontFamily: 'Syne, sans-serif',
                    boxShadow: `0 2px 12px ${mod.hex}40`,
                  }}
                >
                  <Brain size={13} /> Quiz Time
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── QUIZ ── */}
      {view === 'quiz' && (
        <div
          className="rounded-2xl p-6"
          style={{ background: '#050810', border: '1px solid #0f1520' }}
        >
          <QuizView key={quizKey} questions={mod.quiz} mod={mod} onComplete={(score: number) => {
            setQuizDone(true)
            setQuizScore(score)
            // Send quiz results to backend for progress tracking
            api.post('/education/progress', {
              module_id: mod.id,
              score,
              total: mod.quiz.length,
            }).catch(() => {}) // Silently fail if not authenticated
          }} />
          {quizDone && (
            <button
              onClick={() => { setQuizKey(k => k + 1); setQuizDone(false) }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm mt-4"
              style={{
                background: '#0d1017',
                border: '1px solid #1a1f2e',
                color: '#6b7280',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              <RotateCcw size={13} /> Retake Quiz
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────
export default function Education() {
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [completed, setCompleted] = useState<Record<string, boolean>>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  const mod = MODULES.find(m => m.id === activeModule)
  const totalDone = Object.keys(completed).length

  if (mod) {
    return (
      <div className="space-y-0">
        <ModuleDetail mod={mod} onBack={() => setActiveModule(null)} />
      </div>
    )
  }

  return (
    <div className="edu-page space-y-8">
      <style>{STYLES}</style>

      {/* ── HERO ── */}
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #060912 0%, #0a0f1e 50%, #060912 100%)',
          border: '1px solid #0f1520',
          minHeight: 220,
        }}
      >
        <div className="absolute inset-0 edu-grid-texture opacity-100" />
        <FloatingNodes />

        {/* Glow orbs */}
        <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-[0.07]" style={{ background: '#3b82f6' }} />
        <div className="absolute bottom-0 right-1/3 w-60 h-60 rounded-full blur-3xl opacity-[0.07]" style={{ background: '#8b5cf6' }} />

        <div className="relative px-8 py-10 flex items-center justify-between flex-wrap gap-6">
          <div
            className="edu-animate-up"
            style={{ animationDelay: '0ms' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#3b82f6' }} />
              <span
                className="text-xs tracking-widest text-blue-400"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                BLOCKCHAIN ACADEMY
              </span>
            </div>
            <h1
              className="text-4xl font-black leading-tight mb-3"
              style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.03em' }}
            >
              <span className="text-white">Master</span>{' '}
              <span className="edu-shimmer-text">Blockchain Technology</span>
            </h1>
            <p
              className="text-gray-500 text-sm max-w-lg leading-relaxed"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              From cryptographic fundamentals to real-world DeFi — 6 deep modules,
              30 quiz questions, and everything you need to go from curious to confident.
            </p>
          </div>

          {/* Stats */}
          <div
            className="flex gap-6 edu-animate-up"
            style={{ animationDelay: '100ms' }}
          >
            {([
              [GraduationCap, MODULES.length, 'Modules'],
              [Target, '30', 'Questions'],
              [Clock, '~4h', 'Content'],
              [Users, 'Free', 'Access'],
            ] as [React.FC<{size:number;className:string}>, string|number, string][]).map(([StatIcon, val, label]) => (
              <div key={label} className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <StatIcon size={14} className="text-gray-600" />
                </div>
                <div className="text-white font-black text-xl" style={{ fontFamily: 'Syne, sans-serif' }}>{val}</div>
                <div className="text-gray-600 text-xs">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress */}
        {totalDone > 0 && (
          <div className="relative px-8 pb-6 edu-animate-fade">
            <div className="flex justify-between text-xs mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              <span className="text-gray-600">Course progress</span>
              <span className="text-blue-400 font-semibold">{totalDone} of {MODULES.length} complete</span>
            </div>
            <ProgressBar value={totalDone} max={MODULES.length} hex="#3b82f6" animated />
          </div>
        )}
      </div>

      {/* ── MODULE GRID ── */}
      <div className="edu-animate-up" style={{ animationDelay: '150ms' }}>
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-white font-black text-xl"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Course Modules
          </h2>
          <span className="text-gray-600 text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {totalDone}/{MODULES.length} completed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {MODULES.map((m, idx) => {
            const done = completed[m.id]
            const Icon = m.icon

            return (
              <button
                key={m.id}
                onClick={() => setActiveModule(m.id)}
                className="edu-module-card edu-card-hover text-left rounded-2xl relative overflow-hidden"
                style={{
                  '--card-hex-a': m.hex,
                  background: '#060912',
                  border: `1px solid ${done ? m.hex + '35' : '#0f1520'}`,
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(12px)',
                  transition: `opacity 0.4s ease ${idx * 60}ms, transform 0.4s ease ${idx * 60}ms, box-shadow 0.3s ease, border-color 0.3s ease`,
                } as React.CSSProperties}
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = m.hex + '55'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = `0 8px 40px ${m.hex}18, 0 0 0 1px ${m.hex}15`
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = done ? m.hex + '35' : '#0f1520'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                }}
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${m.hex}80, transparent)` }}
                />

                {/* Glow blob */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 pointer-events-none"
                  style={{ background: m.hex, filter: 'blur(32px)', opacity: 0.04 }}
                />

                <div className="p-5">
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{
                        background: `${m.hex}12`,
                        border: `1px solid ${m.hex}25`,
                        boxShadow: done ? `0 0 12px ${m.hex}20` : 'none',
                      }}
                    >
                      {m.emoji}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className="edu-tag px-2 py-0.5 rounded-md"
                        style={{ color: m.hex, background: `${m.hex}12`, border: `1px solid ${m.hex}25` }}
                      >
                        {m.tag}
                      </span>
                      <DifficultyDots level={m.difficulty} />
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    className="text-white font-black text-base mb-1 leading-snug"
                    style={{ fontFamily: 'Syne, sans-serif' }}
                  >
                    {m.title}
                  </h3>
                  <p
                    className="text-gray-600 text-xs mb-4 leading-relaxed"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {m.subtitle}
                  </p>

                  {/* Stats row */}
                  <div className="flex items-center gap-3 mb-4 text-xs text-gray-700" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    <span className="flex items-center gap-1"><BookOpen size={10} /> {m.sections.length} sections</span>
                    <span className="text-gray-800">·</span>
                    <span className="flex items-center gap-1"><Brain size={10} /> {m.quiz.length} questions</span>
                    <span className="text-gray-800">·</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {m.readTime}</span>
                  </div>

                  {/* Progress segments */}
                  <div className="flex gap-1 mb-4">
                    {m.sections.map((_, i) => (
                      <div
                        key={i}
                        className="h-0.5 flex-1 rounded-full"
                        style={{
                          background: done ? `linear-gradient(90deg, ${m.hex}, ${m.hex2})` : '#111520',
                          boxShadow: done ? `0 0 4px ${m.hex}60` : 'none',
                        }}
                      />
                    ))}
                  </div>

                  {/* CTA row */}
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-semibold flex items-center gap-1"
                      style={{ color: m.hex, fontFamily: 'DM Sans, sans-serif' }}
                    >
                      {done ? (
                        <><CheckCircle size={11} /> Completed</>
                      ) : (
                        'Start Learning'
                      )}
                    </span>
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center"
                      style={{ background: `${m.hex}15` }}
                    >
                      <ArrowRight size={12} style={{ color: m.hex }} />
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── GLOSSARY ── */}
      <div className="edu-animate-up" style={{ animationDelay: '250ms' }}>
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}
          >
            <Sparkles size={14} className="text-blue-400" />
          </div>
          <h2 className="text-white font-black text-xl" style={{ fontFamily: 'Syne, sans-serif' }}>
            Quick Reference
          </h2>
          <span
            className="ml-auto text-gray-700 text-xs"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            {GLOSSARY.length} terms
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {GLOSSARY.map(([term, def]) => (
            <div
              key={term}
              className="rounded-xl p-4 transition-all duration-200"
              style={{ background: '#060912', border: '1px solid #0f1520' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1a1f2e' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#0f1520' }}
            >
              <div
                className="text-xs font-bold mb-1.5 flex items-center gap-1.5"
                style={{ color: '#3b82f6', fontFamily: 'JetBrains Mono, monospace' }}
              >
                <span className="w-1 h-1 rounded-full bg-blue-500 inline-block flex-shrink-0" />
                {term}
              </div>
              <div
                className="text-gray-600 text-xs leading-relaxed"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                {def}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}