"""
ChainGuard AI — Blockchain Knowledge Base
Used to build the FAISS vector store for RAG pipeline.
"""

BLOCKCHAIN_KNOWLEDGE = [
    # ── Blockchain Fundamentals ────────────────────────────────────────────────
    """
    Blockchain is a distributed, immutable ledger where data is stored in blocks 
    chained together cryptographically. Each block contains a hash of the previous 
    block, making tampering practically impossible. Key properties: decentralization 
    (no single authority), immutability (records cannot be altered), and transparency 
    (all transactions are publicly verifiable).
    """,
    """
    Consensus mechanisms are protocols that allow distributed nodes to agree on the 
    valid state of the blockchain. Proof of Work (PoW) requires miners to solve 
    computational puzzles — used by Bitcoin. Proof of Stake (PoS) selects validators 
    based on staked tokens — used by Ethereum after The Merge (September 2022), 
    reducing energy consumption by 99.95%.
    """,
    """
    Bitcoin was created by Satoshi Nakamoto in 2008. Fixed supply of 21 million BTC. 
    Block reward halves every 210,000 blocks (~4 years) — called the halving. 
    April 2024 halving reduced reward from 6.25 to 3.125 BTC. Current hashrate 
    exceeds 600 EH/s. Lightning Network enables fast, cheap off-chain payments.
    """,
    """
    Ethereum is a programmable blockchain launched in 2015 by Vitalik Buterin. 
    The Ethereum Virtual Machine (EVM) executes smart contracts — self-executing 
    code deployed on-chain. Solidity is the primary smart contract language. 
    EIP-1559 introduced base fee burning, making ETH deflationary. The Merge 
    transitioned Ethereum to Proof of Stake.
    """,

    # ── DeFi ──────────────────────────────────────────────────────────────────
    """
    DeFi (Decentralized Finance) recreates financial services on public blockchains 
    without intermediaries. Key protocols: Uniswap (AMM-based DEX using x*y=k formula), 
    Aave and Compound (lending/borrowing with algorithmic interest rates), 
    MakerDAO (DAI stablecoin collateralized by crypto), Curve (stablecoin DEX). 
    Total Value Locked (TVL) across DeFi peaked at $180B in 2021.
    """,
    """
    Automated Market Makers (AMMs) use liquidity pools instead of order books. 
    The constant product formula x * y = k ensures liquidity always exists. 
    Liquidity providers earn trading fees but face impermanent loss when asset 
    prices diverge. Concentrated liquidity (Uniswap v3) allows LPs to specify 
    price ranges for capital efficiency.
    """,
    """
    Flash loans allow borrowing large amounts of crypto with zero collateral 
    within a single transaction block. The loan must be repaid within the same 
    transaction or it reverts. Used for arbitrage, collateral swaps, and 
    liquidations. First popularized by Aave protocol.
    """,
    """
    Yield farming involves providing liquidity to DeFi protocols to earn rewards. 
    Strategies include liquidity provision, lending, staking, and governance token 
    farming. Risks include smart contract bugs, impermanent loss, liquidation risk, 
    and rug pulls. APY can range from 2% to over 1000% for high-risk pools.
    """,

    # ── NFTs ──────────────────────────────────────────────────────────────────
    """
    NFTs (Non-Fungible Tokens) are unique blockchain tokens where each unit is 
    distinct and non-interchangeable. ERC-721 is the original standard (one token 
    per unique asset). ERC-1155 supports both fungible and non-fungible tokens 
    in one contract — more gas efficient. ERC-6551 enables token-bound accounts 
    where NFTs can own other assets.
    """,
    """
    NFT risk factors to evaluate: Contract Safety (reentrancy, honeypot patterns), 
    Metadata Integrity (IPFS pinning, broken links), Trading Activity (wash trading, 
    volume manipulation), Creator Reputation (verified status, track record), 
    Royalty Structure (unusual enforcement mechanisms), Liquidity Risk (floor price 
    stability, owner concentration). A healthy NFT collection has >40% unique owner ratio.
    """,
    """
    Common NFT scams: Rug pulls (developers abandon project after raising funds), 
    Wash trading (artificially inflating volume by trading with yourself), 
    Honeypot contracts (can buy but cannot sell), Metadata manipulation 
    (changing what an NFT represents after purchase), Copycat collections 
    (copying artwork from legitimate projects), Phishing sites mimicking 
    legitimate marketplaces like OpenSea.
    """,
    """
    NFT valuation factors: rarity (trait rarity within collection), utility 
    (access, gaming, governance rights), community strength, creator reputation, 
    historical sales data, floor price trends, and broader market sentiment. 
    Blue-chip collections like CryptoPunks and BAYC have maintained value due 
    to strong brand recognition and community.
    """,

    # ── Layer 2 & Scaling ─────────────────────────────────────────────────────
    """
    Layer 2 solutions scale Ethereum by processing transactions off the main chain. 
    Optimistic Rollups (Optimism, Arbitrum) assume transactions are valid and use 
    fraud proofs. ZK-Rollups (zkSync, Starknet, Polygon zkEVM) use zero-knowledge 
    proofs for instant finality. Rollups can achieve 1000-10000x throughput 
    improvement over Ethereum mainnet.
    """,
    """
    Zero-knowledge proofs allow one party to prove knowledge of information without 
    revealing the information itself. ZK-SNARKs (Succinct Non-interactive Arguments 
    of Knowledge) and ZK-STARKs are the main variants. Applications include: 
    private transactions, identity verification, rollup validity proofs, 
    and cross-chain bridges.
    """,

    # ── Crypto Market ─────────────────────────────────────────────────────────
    """
    The Fear and Greed Index measures crypto market sentiment on a scale of 0-100. 
    0-24: Extreme Fear (potential buying opportunity), 25-44: Fear, 45-55: Neutral, 
    56-74: Greed, 75-100: Extreme Greed (potential selling signal). Calculated from 
    volatility, market momentum, social media sentiment, dominance, and trends.
    """,
    """
    Bitcoin dominance measures BTC's market cap as a percentage of total crypto 
    market cap. High dominance (>60%) often means altcoins are underperforming. 
    Low dominance (<40%) can signal an altcoin season. BTC dominance typically 
    rises during bear markets as investors move to safer assets.
    """,
    """
    Market capitalization = current price × circulating supply. Total crypto market 
    cap peaked at ~$3 trillion in November 2021. Bitcoin typically represents 
    40-60% of total market cap. Volume indicates trading activity — high volume 
    on price moves suggests stronger conviction.
    """,

    # ── Security ──────────────────────────────────────────────────────────────
    """
    Common smart contract vulnerabilities: Reentrancy (attacker re-enters function 
    before state updates — caused the $60M DAO hack in 2016), Integer overflow/underflow, 
    Access control issues (missing onlyOwner modifiers), Front-running (MEV bots 
    observing mempool), Oracle manipulation (price feed attacks), Flash loan attacks 
    (borrowing large amounts to manipulate prices within one transaction).
    """,
    """
    Wallet security best practices: Use hardware wallets (Ledger, Trezor) for large 
    holdings. Never share seed phrases. Use separate wallets for DeFi interactions 
    and long-term storage. Verify contract addresses before signing transactions. 
    Revoke token approvals regularly using tools like Revoke.cash. Be suspicious 
    of unsolicited NFT airdrops — some contain malicious contracts.
    """,

    # ── Solana & Alternatives ─────────────────────────────────────────────────
    """
    Solana uses Proof of History (PoH) combined with Proof of Stake for high 
    throughput (~65,000 TPS theoretical). Low transaction fees (<$0.01). 
    Popular for DeFi (Jupiter, Raydium) and NFTs (Magic Eden). Has experienced 
    multiple network outages due to congestion. Uses Rust for smart contracts 
    (called programs). Validators stake SOL as collateral.
    """,
    """
    BNB Chain (formerly Binance Smart Chain) is EVM-compatible with faster blocks 
    and lower fees than Ethereum. More centralized (21 validators). Popular for 
    lower-cost DeFi. Polygon (MATIC) is an Ethereum sidechain and zkEVM rollup 
    offering low fees while maintaining EVM compatibility. Avalanche uses a novel 
    consensus protocol with subnets for custom blockchains.
    """,

    # ── ChainGuard Specific ───────────────────────────────────────────────────
    """
    ChainGuard AI is an intelligent blockchain platform combining education, 
    live market analytics, NFT risk scanning, and AI assistance. The NFT Risk 
    Scanner evaluates contracts across 6 dimensions scoring 0-100 (higher = safer). 
    Risk bands: 0-29 Low Risk, 30-59 Medium Risk, 60-79 High Risk, 80-100 Critical. 
    The Blockchain Academy covers 6 modules from basics to real-world use cases.
    """,
]

# Intent classification examples for routing
INTENT_EXAMPLES = {
    "price_query": [
        "what is the price of bitcoin",
        "how much is ethereum worth",
        "btc price today",
        "what is sol trading at",
        "crypto prices",
        "market cap",
    ],
    "nft_risk": [
        "is this nft safe to buy",
        "check nft risk",
        "is cryptopunks legit",
        "nft scam",
        "rug pull check",
        "nft contract analysis",
        "is bayc a good investment",
    ],
    "defi_question": [
        "how does uniswap work",
        "what is yield farming",
        "explain liquidity pools",
        "what is impermanent loss",
        "aave lending",
        "defi protocol",
    ],
    "education": [
        "explain blockchain",
        "how does ethereum work",
        "what is proof of stake",
        "explain smart contracts",
        "what is a wallet",
        "how does bitcoin mining work",
    ],
    "market_analysis": [
        "fear and greed index",
        "btc dominance",
        "market sentiment",
        "is it a good time to buy",
        "bull market bear market",
        "crypto market overview",
    ],
    "general": [
        "hello",
        "help",
        "what can you do",
        "tell me about chainguard",
    ],
}