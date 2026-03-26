-- ╔═══════════════════════════════════════════════════════════════╗
-- ║          ChainGuard AI — Education Seed Data                ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- ══════════════════════════════════════════════════════════════════
-- MODULE 1: Blockchain Basics
-- ══════════════════════════════════════════════════════════════════
INSERT INTO modules (id, title, description, category, difficulty, lesson_count, estimated_minutes, "order")
VALUES (
  'a1000000-0000-0000-0000-000000000001',
  'Blockchain Basics',
  'Learn the fundamental concepts behind blockchain technology, from distributed ledgers to consensus mechanisms.',
  'basics', 'beginner', 5, 30, 1
) ON CONFLICT DO NOTHING;

INSERT INTO lessons (id, module_id, title, content, "order") VALUES
('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
 'What is a Blockchain?',
 'A blockchain is a distributed, decentralized, public ledger that records transactions across many computers. The key innovation is that the record of transactions cannot be altered retroactively without the alteration of all subsequent blocks. This makes blockchains inherently resistant to data modification.\n\n**Key Properties:**\n- **Decentralized**: No single entity controls the network\n- **Immutable**: Once data is recorded, it cannot be changed\n- **Transparent**: All transactions are publicly verifiable\n- **Trustless**: No need to trust a central authority',
 1),
('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001',
 'How Blocks Work',
 'Each block in a blockchain contains:\n\n1. **Block Header**: Contains metadata like timestamp, previous block hash, nonce\n2. **Transaction Data**: The actual records stored in the block\n3. **Hash**: A unique cryptographic fingerprint of the block\n\nBlocks are chained together — each block references the hash of the previous block. If someone tries to tamper with a block, its hash changes, breaking the chain and alerting the network.',
 2),
('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001',
 'Consensus Mechanisms',
 'Consensus mechanisms are protocols that ensure all nodes in the network agree on the current state of the blockchain.\n\n**Proof of Work (PoW):**\nMiners solve complex mathematical puzzles to validate transactions (used by Bitcoin).\n\n**Proof of Stake (PoS):**\nValidators lock up (stake) their coins as collateral to validate transactions (used by Ethereum 2.0).\n\n**Other mechanisms:** Delegated PoS, Proof of Authority, Proof of History.',
 3),
('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001',
 'Cryptographic Hashing',
 'Hashing is at the heart of blockchain security. A hash function takes any input and produces a fixed-size output.\n\n**Properties of SHA-256:**\n- **Deterministic**: Same input always gives same output\n- **Fast**: Quick to compute\n- **Avalanche Effect**: Tiny input change = completely different output\n- **One-Way**: Cannot reverse-engineer the input from the hash\n- **Collision Resistant**: Virtually impossible to find two different inputs with the same hash',
 4),
('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001',
 'Public & Private Keys',
 'Blockchain uses asymmetric cryptography for security.\n\n- **Private Key**: A secret number only you know (like a password)\n- **Public Key**: Derived from your private key (like your email address)\n- **Digital Signatures**: Created with your private key to prove ownership\n\nWhen you send crypto, you sign the transaction with your private key. The network verifies it using your public key. Anyone can verify, but only you can sign.',
 5)
ON CONFLICT DO NOTHING;

-- Quiz for Module 1
INSERT INTO quiz_questions (id, module_id, question, options, answer, explanation, "order") VALUES
('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001',
 'What makes blockchain data immutable?', '["A central authority monitors changes", "Each block references the hash of the previous block", "Data is stored in RAM only", "Passwords protect the data"]',
 'B', 'Each block contains a hash of the previous block, so changing any block would break the chain.', 1),
('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001',
 'Which consensus mechanism does Bitcoin use?', '["Proof of Stake", "Proof of Authority", "Proof of Work", "Delegated Proof of Stake"]',
 'C', 'Bitcoin uses Proof of Work (PoW) where miners solve complex mathematical puzzles to validate transactions.', 2),
('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001',
 'What is a hash function?', '["A function that encrypts data reversibly", "A function that produces a fixed-size output from any input", "A function that stores passwords", "A function that connects blocks wirelessly"]',
 'B', 'Hash functions are one-way functions that take any input and produce a fixed-size output (digest).', 3),
('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001',
 'What is a private key used for?', '["Viewing the blockchain", "Mining new blocks", "Signing transactions to prove ownership", "Connecting to the internet"]',
 'C', 'Private keys are used to create digital signatures that prove you own the funds being spent.', 4),
('c1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001',
 'What does ''decentralized'' mean in blockchain?', '["One company owns the network", "No single entity controls the network", "The data is stored in one location", "Only governments can access it"]',
 'B', 'Decentralized means the network is distributed across many nodes with no single point of control.', 5)
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════════
-- MODULE 2: DeFi Fundamentals
-- ══════════════════════════════════════════════════════════════════
INSERT INTO modules (id, title, description, category, difficulty, lesson_count, estimated_minutes, "order")
VALUES (
  'a1000000-0000-0000-0000-000000000002',
  'DeFi Fundamentals',
  'Explore decentralized finance — from lending protocols and DEXs to yield farming and liquidity pools.',
  'defi', 'intermediate', 5, 40, 2
) ON CONFLICT DO NOTHING;

INSERT INTO lessons (id, module_id, title, content, "order") VALUES
('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002',
 'What is DeFi?',
 'DeFi (Decentralized Finance) recreates traditional financial services using blockchain and smart contracts — without banks, brokers, or intermediaries.\n\n**Core Principles:**\n- Open access (anyone with internet can participate)\n- Transparent (all code and transactions are public)\n- Composable (protocols can be combined like building blocks)\n- Non-custodial (you keep control of your assets)',
 1),
('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000002',
 'Decentralized Exchanges (DEXs)',
 'DEXs allow peer-to-peer trading without a central order book.\n\n**AMM (Automated Market Maker)** model:\n- Liquidity pools hold pairs of tokens\n- Prices are set by a mathematical formula (e.g., x × y = k)\n- Users trade against the pool, not against other users\n\n**Popular DEXs:** Uniswap, SushiSwap, Curve, PancakeSwap',
 2),
('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000002',
 'Lending & Borrowing',
 'DeFi lending protocols let you earn interest by supplying assets or borrow against your crypto collateral.\n\n**How it works:**\n1. Lenders deposit tokens into a pool and earn interest\n2. Borrowers put up collateral (usually 150%+ of loan value)\n3. Interest rates adjust algorithmically based on supply/demand\n\n**Popular protocols:** Aave, Compound, MakerDAO',
 3),
('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000002',
 'Yield Farming & Liquidity Mining',
 'Yield farming is the practice of moving assets between protocols to maximize returns.\n\n**Liquidity Mining:**\n- Provide liquidity to a DEX pool\n- Earn trading fees + bonus governance tokens\n- APY can be very high but comes with risks\n\n**Risks:** Impermanent loss, smart contract exploits, token price volatility, rug pulls.',
 4),
('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000002',
 'DeFi Risks & Security',
 'DeFi offers powerful tools but comes with significant risks.\n\n**Key Risks:**\n- **Smart Contract Bugs**: Code vulnerabilities can lead to hacks\n- **Impermanent Loss**: Providing liquidity can lose value vs. simply holding\n- **Oracle Manipulation**: Price feeds can be exploited\n- **Rug Pulls**: Developers abandon projects after taking funds\n- **Regulatory Risk**: Uncertain legal landscape\n\n**Best Practices:** Start small, use audited protocols, diversify, never invest more than you can afford to lose.',
 5)
ON CONFLICT DO NOTHING;

INSERT INTO quiz_questions (id, module_id, question, options, answer, explanation, "order") VALUES
('c1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002',
 'What does DeFi stand for?', '["Defined Finance", "Decentralized Finance", "Default Finance", "Digital Finance"]',
 'B', 'DeFi stands for Decentralized Finance, which recreates traditional financial services on blockchain.', 1),
('c1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000002',
 'What is an AMM?', '["Automated Market Maker", "Advanced Money Manager", "Asset Management Module", "Automated Mining Machine"]',
 'A', 'An AMM (Automated Market Maker) uses mathematical formulas to set prices in liquidity pools.', 2),
('c1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000002',
 'What is impermanent loss?', '["Losing your private key", "Value loss from providing liquidity vs holding", "A temporary network outage", "A type of scam"]',
 'B', 'Impermanent loss occurs when the price ratio of tokens in a liquidity pool changes, potentially leaving you worse off than just holding.', 3),
('c1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000002',
 'Why do borrowers need over-collateralization?', '["To earn more interest", "Because crypto prices are volatile and loans need safety margins", "Its a scam tactic", "To speed up transactions"]',
 'B', 'Over-collateralization protects lenders from default risk due to the volatility of crypto assets.', 4),
('c1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000002',
 'What is a rug pull?', '["A mining technique", "A type of consensus", "When developers abandon a project after collecting funds", "A hardware wallet feature"]',
 'C', 'A rug pull is when project developers drain funds or abandon the project, leaving investors with worthless tokens.', 5)
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════════
-- MODULE 3: NFT Deep Dive
-- ══════════════════════════════════════════════════════════════════
INSERT INTO modules (id, title, description, category, difficulty, lesson_count, estimated_minutes, "order")
VALUES (
  'a1000000-0000-0000-0000-000000000003',
  'NFT Deep Dive',
  'Understand Non-Fungible Tokens — how they work, why they matter, and how to evaluate NFT projects.',
  'nft', 'beginner', 5, 35, 3
) ON CONFLICT DO NOTHING;

INSERT INTO lessons (id, module_id, title, content, "order") VALUES
('b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000003',
 'What Are NFTs?',
 'NFTs (Non-Fungible Tokens) are unique digital assets stored on a blockchain. Unlike cryptocurrencies where each unit is interchangeable, each NFT has a unique identifier.\n\n**Fungible vs Non-Fungible:**\n- Fungible: $1 = $1, 1 BTC = 1 BTC (interchangeable)\n- Non-Fungible: Each item is unique (digital art, collectibles, domain names)\n\n**Standards:** ERC-721 (unique tokens), ERC-1155 (semi-fungible)',
 1),
('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000003',
 'NFT Use Cases',
 'NFTs go far beyond profile pictures and digital art.\n\n**Art & Collectibles**: Digital art ownership, generative art, virtual collectibles\n**Gaming**: In-game items, characters, land that players truly own\n**Music & Media**: Artists sell directly to fans, royalties built in\n**Real Estate**: Tokenized property deeds and fractional ownership\n**Identity**: Decentralized credentials and certifications\n**Ticketing**: Event tickets that prevent scalping and counterfeiting',
 2),
('b1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000003',
 'How NFTs Are Created (Minting)',
 'Minting is the process of creating an NFT on the blockchain.\n\n**Steps:**\n1. Create your digital asset (image, video, music, etc.)\n2. Choose a blockchain (Ethereum, Polygon, Solana)\n3. Select a marketplace (OpenSea, Rarible, Magic Eden)\n4. Upload your asset and set metadata\n5. Pay gas fees (transaction costs)\n6. Your NFT is now on the blockchain!\n\n**Metadata** includes: name, description, traits, and a link to the actual file.',
 3),
('b1000000-0000-0000-0000-000000000014', 'a1000000-0000-0000-0000-000000000003',
 'NFT Marketplaces',
 'Marketplaces are platforms where NFTs are bought, sold, and discovered.\n\n**Major Marketplaces:**\n- **OpenSea**: Largest, supports multiple chains\n- **Blur**: Pro-trader focused, zero fees\n- **Magic Eden**: Originally Solana, now multi-chain\n- **Rarible**: Community-governed marketplace\n- **Foundation**: Curated art platform\n\n**Key Features to Compare**: fees, royalty enforcement, chain support, community.',
 4),
('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000003',
 'Evaluating NFT Projects',
 'Due diligence is critical before investing in NFTs.\n\n**Red Flags:**\n- Anonymous team with no track record\n- Unrealistic promises (guaranteed 100x)\n- Copied art or plagiarized content\n- No clear utility or roadmap\n- Low liquidity and wash trading\n\n**Green Flags:**\n- Doxxed, experienced team\n- Active community (Discord, Twitter)\n- Clear utility and roadmap milestones\n- Audited smart contracts\n- Organic trading volume',
 5)
ON CONFLICT DO NOTHING;

INSERT INTO quiz_questions (id, module_id, question, options, answer, explanation, "order") VALUES
('c1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000003',
 'What does "non-fungible" mean?', '["Can be divided into smaller parts", "Each item is unique and not interchangeable", "It is free to mint", "It can be copied easily"]',
 'B', 'Non-fungible means each token is unique and cannot be exchanged 1:1 with another token.', 1),
('c1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000003',
 'What is minting?', '["Selling an NFT", "Creating and recording an NFT on the blockchain", "Deleting an NFT", "Copying an NFT"]',
 'B', 'Minting is the process of creating a new NFT and writing it to the blockchain.', 2),
('c1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000003',
 'Which token standard is used for unique NFTs on Ethereum?', '["ERC-20", "ERC-721", "ERC-1155", "BEP-20"]',
 'B', 'ERC-721 is the standard for non-fungible tokens where each token has a unique ID.', 3),
('c1000000-0000-0000-0000-000000000014', 'a1000000-0000-0000-0000-000000000003',
 'What is a red flag when evaluating NFT projects?', '["Active Discord community", "Audited smart contracts", "Anonymous team with unrealistic promises", "Clear roadmap"]',
 'C', 'Anonymous teams making unrealistic promises is a major red flag indicating potential fraud.', 4),
('c1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000003',
 'What are gas fees?', '["Monthly subscription costs", "Transaction costs paid to the blockchain network", "NFT royalty payments", "Marketplace listing fees"]',
 'B', 'Gas fees are costs paid to miners/validators for processing transactions on the blockchain.', 5)
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════════
-- MODULE 4: Blockchain Security
-- ══════════════════════════════════════════════════════════════════
INSERT INTO modules (id, title, description, category, difficulty, lesson_count, estimated_minutes, "order")
VALUES (
  'a1000000-0000-0000-0000-000000000004',
  'Blockchain Security',
  'Master security best practices — protect your crypto assets from hacks, scams, and social engineering.',
  'security', 'intermediate', 5, 45, 4
) ON CONFLICT DO NOTHING;

INSERT INTO lessons (id, module_id, title, content, "order") VALUES
('b1000000-0000-0000-0000-000000000016', 'a1000000-0000-0000-0000-000000000004',
 'Common Attack Vectors',
 'Understanding threats is the first step to security.\n\n**Phishing**: Fake websites and emails that steal your credentials\n**Social Engineering**: Manipulating people to reveal sensitive information\n**Smart Contract Exploits**: Bugs in code that hackers exploit\n**51% Attacks**: When a single entity controls majority of network hashrate\n**Front-Running**: Bots that detect and exploit pending transactions\n**SIM Swapping**: Attackers take over your phone number for 2FA bypass',
 1),
('b1000000-0000-0000-0000-000000000017', 'a1000000-0000-0000-0000-000000000004',
 'Wallet Security',
 'Your wallet is your bank — protect it accordingly.\n\n**Hardware Wallets (Cold Storage):**\n- Ledger, Trezor — keep private keys offline\n- Best for long-term holdings\n- Never enter seed phrase digitally\n\n**Software Wallets (Hot Wallets):**\n- MetaMask, Trust Wallet — convenient but less secure\n- Only keep small amounts for active use\n\n**NEVER share your seed phrase with anyone. Ever.**',
 2),
('b1000000-0000-0000-0000-000000000018', 'a1000000-0000-0000-0000-000000000004',
 'Smart Contract Auditing',
 'Smart contracts handle billions of dollars — bugs can be catastrophic.\n\n**What Auditors Check:**\n- Reentrancy vulnerabilities\n- Integer overflow/underflow\n- Access control issues\n- Logic errors\n- Gas optimization\n\n**Top Audit Firms:** CertiK, Trail of Bits, OpenZeppelin, Halborn\n\n**Best Practice:** Only interact with audited and battle-tested protocols.',
 3),
('b1000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000004',
 'Recognizing Scams',
 'The crypto space is full of scams. Learn to spot them.\n\n**Common Scams:**\n- "Send me 1 ETH, I''ll send back 2" (giveaway scams)\n- Fake airdrops that drain your wallet\n- Ponzi schemes disguised as "staking protocols"\n- Fake customer support on Discord/Telegram\n- Honeypot tokens (you can buy but never sell)\n\n**Rule of Thumb:** If it sounds too good to be true, it is.',
 4),
('b1000000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000004',
 'Security Best Practices',
 'A comprehensive security checklist:\n\n✅ Use a hardware wallet for significant holdings\n✅ Enable 2FA with an authenticator app (not SMS)\n✅ Use unique, strong passwords for every service\n✅ Bookmark legitimate sites — never click links from DMs\n✅ Verify contract addresses before interacting\n✅ Revoke unused token approvals regularly\n✅ Keep your seed phrase written on paper, in a safe\n✅ Use a separate browser/profile for DeFi\n✅ Test with small amounts first',
 5)
ON CONFLICT DO NOTHING;

INSERT INTO quiz_questions (id, module_id, question, options, answer, explanation, "order") VALUES
('c1000000-0000-0000-0000-000000000016', 'a1000000-0000-0000-0000-000000000004',
 'What is phishing?', '["A type of mining", "Fake websites that steal your credentials", "A consensus mechanism", "A blockchain feature"]',
 'B', 'Phishing involves creating fake websites or emails to trick users into revealing sensitive information.', 1),
('c1000000-0000-0000-0000-000000000017', 'a1000000-0000-0000-0000-000000000004',
 'Where should you store your seed phrase?', '["In your email drafts", "On a cloud storage service", "Written on paper in a secure location", "In a text file on your computer"]',
 'C', 'Seed phrases should be written on paper and stored in a physically secure location, never digitally.', 2),
('c1000000-0000-0000-0000-000000000018', 'a1000000-0000-0000-0000-000000000004',
 'What is a 51% attack?', '["When 51% of users leave the network", "When one entity controls majority of network hashrate", "When 51% of tokens are minted", "When a smart contract has 51 bugs"]',
 'B', 'A 51% attack occurs when a single entity controls enough hash power to manipulate the blockchain.', 3),
('c1000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000004',
 'What type of 2FA is most secure?', '["SMS text codes", "Authenticator app (like Google Authenticator)", "Email verification", "No 2FA needed"]',
 'B', 'Authenticator apps generate codes locally and are not vulnerable to SIM swapping attacks.', 4),
('c1000000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000004',
 'What is a honeypot token?', '["A token with sweet returns", "A token you can buy but never sell", "A governance token", "A stablecoin"]',
 'B', 'Honeypot tokens are malicious contracts designed so that users can buy but cannot sell, trapping their funds.', 5)
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════════
-- MODULE 5: Smart Contracts
-- ══════════════════════════════════════════════════════════════════
INSERT INTO modules (id, title, description, category, difficulty, lesson_count, estimated_minutes, "order")
VALUES (
  'a1000000-0000-0000-0000-000000000005',
  'Smart Contracts',
  'Dive into programmable agreements on the blockchain — from Solidity basics to real-world deployments.',
  'advanced', 'advanced', 5, 50, 5
) ON CONFLICT DO NOTHING;

INSERT INTO lessons (id, module_id, title, content, "order") VALUES
('b1000000-0000-0000-0000-000000000021', 'a1000000-0000-0000-0000-000000000005',
 'What Are Smart Contracts?',
 'Smart contracts are self-executing programs stored on the blockchain that automatically enforce the terms of an agreement.\n\n**Key Characteristics:**\n- **Self-Executing**: Run automatically when conditions are met\n- **Immutable**: Once deployed, code cannot be changed\n- **Deterministic**: Same input always produces same output\n- **Trustless**: No need for intermediaries\n\nThink of them as vending machines: insert money + make selection → get product. No cashier needed.',
 1),
('b1000000-0000-0000-0000-000000000022', 'a1000000-0000-0000-0000-000000000005',
 'Solidity Basics',
 'Solidity is the most popular language for writing smart contracts on Ethereum.\n\n**Key Concepts:**\n- State variables (stored on blockchain)\n- Functions (read/write blockchain state)\n- Events (emit logs for off-chain listeners)\n- Modifiers (reusable access control)\n- Mappings (key-value stores)\n\n**Data Types:** uint, int, address, bool, string, bytes, arrays, structs',
 2),
('b1000000-0000-0000-0000-000000000023', 'a1000000-0000-0000-0000-000000000005',
 'Token Standards',
 'Token standards define interfaces for creating tokens on Ethereum.\n\n**ERC-20 (Fungible Tokens):**\n- Standard for currencies and utility tokens\n- Functions: transfer, approve, balanceOf, totalSupply\n\n**ERC-721 (Non-Fungible Tokens):**\n- Each token has a unique ID\n- Functions: ownerOf, transferFrom, approve\n\n**ERC-1155 (Multi-Token):**\n- Supports both fungible and non-fungible in one contract\n- More gas-efficient for batch operations',
 3),
('b1000000-0000-0000-0000-000000000024', 'a1000000-0000-0000-0000-000000000005',
 'Gas & Optimization',
 'Every operation on Ethereum costs gas (measured in gwei).\n\n**Gas-Expensive Operations:**\n- Writing to storage (SSTORE)\n- Creating contracts\n- Complex computations\n\n**Optimization Tips:**\n- Pack variables into single storage slots\n- Use events instead of storage when possible\n- Avoid loops over unbounded arrays\n- Use calldata instead of memory for read-only params\n- Cache storage reads in memory variables',
 4),
('b1000000-0000-0000-0000-000000000025', 'a1000000-0000-0000-0000-000000000005',
 'Deploying & Testing',
 'Best practices for deploying smart contracts:\n\n**Testing:**\n1. Write unit tests with Hardhat or Foundry\n2. Use test networks (Goerli, Sepolia) before mainnet\n3. Get an audit from a reputable firm\n4. Consider a bug bounty program\n\n**Deployment Tools:**\n- Hardhat (JavaScript/TypeScript)\n- Foundry (Rust-based, very fast)\n- Remix (browser-based IDE)\n- Truffle (legacy, still used)\n\n**After Deployment:** Verify source code on Etherscan, monitor with alerts.',
 5)
ON CONFLICT DO NOTHING;

INSERT INTO quiz_questions (id, module_id, question, options, answer, explanation, "order") VALUES
('c1000000-0000-0000-0000-000000000021', 'a1000000-0000-0000-0000-000000000005',
 'What is a smart contract?', '["A legal document signed digitally", "A self-executing program on the blockchain", "A type of cryptocurrency", "A wallet feature"]',
 'B', 'Smart contracts are self-executing programs stored on the blockchain that enforce agreements automatically.', 1),
('c1000000-0000-0000-0000-000000000022', 'a1000000-0000-0000-0000-000000000005',
 'What language is most commonly used for Ethereum smart contracts?', '["Python", "JavaScript", "Solidity", "Rust"]',
 'C', 'Solidity is the primary programming language for writing smart contracts on Ethereum.', 2),
('c1000000-0000-0000-0000-000000000023', 'a1000000-0000-0000-0000-000000000005',
 'What is ERC-20?', '["A standard for unique NFTs", "A standard for fungible tokens", "A consensus protocol", "A wallet standard"]',
 'B', 'ERC-20 is the standard interface for fungible tokens on Ethereum (like USDT, LINK, UNI).', 3),
('c1000000-0000-0000-0000-000000000024', 'a1000000-0000-0000-0000-000000000005',
 'What costs gas on Ethereum?', '["Reading public data", "Every computational operation on the network", "Only sending ETH", "Only deploying contracts"]',
 'B', 'Every operation that changes state on the Ethereum network requires gas fees.', 4),
('c1000000-0000-0000-0000-000000000025', 'a1000000-0000-0000-0000-000000000005',
 'Why should you deploy to a testnet before mainnet?', '["Its cheaper", "To catch bugs without risking real funds", "Its faster", "Testnets have better features"]',
 'B', 'Testnets allow you to test your contracts without risking real money — catching bugs first.', 5)
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════════
-- MODULE 6: Real-World Use Cases
-- ══════════════════════════════════════════════════════════════════
INSERT INTO modules (id, title, description, category, difficulty, lesson_count, estimated_minutes, "order")
VALUES (
  'a1000000-0000-0000-0000-000000000006',
  'Real-World Use Cases',
  'Discover how blockchain is being used in supply chains, healthcare, voting, identity, and more.',
  'real-world', 'beginner', 5, 30, 6
) ON CONFLICT DO NOTHING;

INSERT INTO lessons (id, module_id, title, content, "order") VALUES
('b1000000-0000-0000-0000-000000000026', 'a1000000-0000-0000-0000-000000000006',
 'Supply Chain Tracking',
 'Blockchain provides end-to-end transparency in supply chains.\n\n**How It Works:**\n- Each step (manufacturing, shipping, delivery) is recorded as a transaction\n- Immutable records prevent fraud and counterfeiting\n- QR codes link physical products to blockchain records\n\n**Real Examples:**\n- **Walmart** uses blockchain to track food from farm to store\n- **De Beers** tracks diamonds to prevent conflict diamonds\n- **Maersk + IBM** (TradeLens) for global shipping',
 1),
('b1000000-0000-0000-0000-000000000027', 'a1000000-0000-0000-0000-000000000006',
 'Healthcare & Medical Records',
 'Blockchain can solve key challenges in healthcare data management.\n\n**Applications:**\n- Patient-controlled medical records\n- Secure sharing between providers\n- Drug supply chain verification\n- Clinical trial data integrity\n\n**Benefits:**\n- Patients own their data\n- Interoperability between hospitals\n- Tamper-proof research data\n- Reduced insurance fraud',
 2),
('b1000000-0000-0000-0000-000000000028', 'a1000000-0000-0000-0000-000000000006',
 'Digital Identity',
 'Self-sovereign identity lets individuals control their digital identity.\n\n**Current Problem:** Your identity is scattered across many centralized databases\n\n**Blockchain Solution:**\n- You hold your credentials in a decentralized wallet\n- Share only what''s needed (zero-knowledge proofs)\n- Verifiable without contacting the issuer\n\n**Use Cases:** KYC, age verification, academic credentials, professional licenses',
 3),
('b1000000-0000-0000-0000-000000000029', 'a1000000-0000-0000-0000-000000000006',
 'Voting Systems',
 'Blockchain voting can increase transparency and reduce fraud.\n\n**Potential Benefits:**\n- Immutable vote records\n- Real-time auditing\n- Remote voting from anywhere\n- Reduced counting errors\n\n**Challenges:**\n- Voter privacy vs. transparency\n- Accessibility for non-technical voters\n- Regulatory acceptance\n- Preventing vote buying\n\n**Projects:** Voatz, Follow My Vote, Agora',
 4),
('b1000000-0000-0000-0000-000000000030', 'a1000000-0000-0000-0000-000000000006',
 'The Future of Blockchain',
 'Blockchain technology is still evolving rapidly.\n\n**Emerging Trends:**\n- **Layer 2 Scaling**: Rollups and sidechains for faster/cheaper transactions\n- **Cross-Chain**: Bridges and protocols connecting different blockchains\n- **RWA (Real-World Assets)**: Tokenizing stocks, real estate, commodities\n- **AI + Blockchain**: Decentralized AI training and data marketplaces\n- **CBDCs**: Central Bank Digital Currencies\n\n**The big picture:** Blockchain is becoming infrastructure — invisible but essential.',
 5)
ON CONFLICT DO NOTHING;

INSERT INTO quiz_questions (id, module_id, question, options, answer, explanation, "order") VALUES
('c1000000-0000-0000-0000-000000000026', 'a1000000-0000-0000-0000-000000000006',
 'How does blockchain help supply chains?', '["By speeding up delivery", "By providing immutable, transparent tracking records", "By reducing product weight", "By automating manufacturing"]',
 'B', 'Blockchain creates tamper-proof records of each step in the supply chain, enabling full transparency.', 1),
('c1000000-0000-0000-0000-000000000027', 'a1000000-0000-0000-0000-000000000006',
 'What is self-sovereign identity?', '["Government-issued digital ID", "Identity controlled by the individual on a decentralized system", "Social media profiles on blockchain", "A type of passport"]',
 'B', 'Self-sovereign identity means individuals own and control their digital identity without relying on centralized authorities.', 2),
('c1000000-0000-0000-0000-000000000028', 'a1000000-0000-0000-0000-000000000006',
 'What are Layer 2 solutions?', '["A second blockchain built from scratch", "Protocols built on top of existing blockchains for scaling", "Physical security layers", "Network hardware upgrades"]',
 'B', 'Layer 2 solutions are built on top of existing blockchains to improve speed and reduce costs.', 3),
('c1000000-0000-0000-0000-000000000029', 'a1000000-0000-0000-0000-000000000006',
 'What does RWA stand for in blockchain context?', '["Real Web Applications", "Real-World Assets", "Random Wallet Addresses", "Rapid Web Access"]',
 'B', 'RWA stands for Real-World Assets — the tokenization of physical assets like real estate and commodities.', 4),
('c1000000-0000-0000-0000-000000000030', 'a1000000-0000-0000-0000-000000000006',
 'Which company uses blockchain to track food from farm to store?', '["Amazon", "Walmart", "Google", "Apple"]',
 'B', 'Walmart partnered with IBM to use blockchain for tracking food through its supply chain.', 5)
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════════
-- Seed data ready ✅  (6 modules · 30 lessons · 30 quiz questions)
-- ══════════════════════════════════════════════════════════════════
