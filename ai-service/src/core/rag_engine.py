"""
ChainGuard AI — RAG Engine
LangChain + FAISS vector store + GPT-4o
"""

import os
import logging
from typing import Optional
from functools import lru_cache

logger = logging.getLogger(__name__)

# ── Lazy imports (only load when needed) ──────────────────────────────────────
_rag_engine = None

def get_rag_engine():
    global _rag_engine
    if _rag_engine is None:
        _rag_engine = RAGEngine()
    return _rag_engine


class RAGEngine:
    def __init__(self):
        self.vectorstore    = None
        self.llm            = None
        self.chain          = None
        self.is_initialized = False
        self._initialize()

    def _initialize(self):
        """Initialize the RAG pipeline — gracefully degrade if keys missing."""
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
            from langchain_community.vectorstores import FAISS
            from langchain_text_splitters import RecursiveCharacterTextSplitter
            from langchain_core.documents import Document
            from langchain_core.prompts import ChatPromptTemplate
            from langchain_core.runnables import RunnablePassthrough
            from langchain_core.output_parsers import StrOutputParser
            from .knowledge_base import BLOCKCHAIN_KNOWLEDGE

            api_key = os.getenv("GEMINI_API_KEY", "")
            if not api_key or api_key == "your_gemini_api_key":
                logger.warning("Gemini API key not set — RAG will use fallback mode")
                return

            # ── Build vector store ────────────────────────────────────────────
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=500, chunk_overlap=50
            )
            docs = [
                Document(page_content=chunk.strip())
                for text in BLOCKCHAIN_KNOWLEDGE
                for chunk in splitter.split_text(text.strip())
                if chunk.strip()
            ]

            embeddings       = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001", google_api_key=api_key)
            self.vectorstore = FAISS.from_documents(docs, embeddings)

            # ── LLM ───────────────────────────────────────────────────────────
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-2.0-flash",
                temperature=0.3,
                google_api_key=api_key,
                max_output_tokens=800,
            )

            # ── Prompt ────────────────────────────────────────────────────────
            prompt = ChatPromptTemplate.from_messages([
                ("system", """You are ChainGuard AI, an expert blockchain assistant. 
You help users understand blockchain technology, DeFi, NFTs, crypto markets, and security.

Use the following context from the knowledge base to answer accurately:
{context}

Guidelines:
- Be concise but thorough
- Use bullet points for lists
- Include specific numbers/stats when available  
- If asked about current prices, note they change rapidly
- For NFT risk questions, mention the 6 risk factors
- Always prioritize security awareness
- If unsure, say so rather than hallucinating"""),
                ("human", "{question}"),
            ])

            # ── Chain ─────────────────────────────────────────────────────────
            retriever = self.vectorstore.as_retriever(
                search_type="similarity",
                search_kwargs={"k": 4}
            )

            self.chain = (
                {"context": retriever | self._format_docs, "question": RunnablePassthrough()}
                | prompt
                | self.llm
                | StrOutputParser()
            )

            self.is_initialized = True
            logger.info("✅ RAG engine initialized successfully")

        except ImportError as e:
            logger.warning(f"RAG dependencies not installed: {e}")
        except Exception as e:
            logger.error(f"RAG initialization failed: {e}")

    def _format_docs(self, docs) -> str:
        return "\n\n".join(doc.page_content for doc in docs)

    async def query(self, question: str, session_history: list = []) -> dict:
        """
        Query the RAG pipeline.
        Returns: { response, sources_used, used_rag }
        """
        if self.is_initialized and self.chain:
            try:
                response = await self.chain.ainvoke(question)
                return {
                    "response":    response,
                    "used_rag":    True,
                    "model":       "gemini-2.0-flash",
                }
            except Exception as e:
                logger.error(f"RAG query failed: {e}")

        # ── Fallback: smart rule-based responses ──────────────────────────────
        return {
            "response":  self._fallback_response(question),
            "used_rag":  False,
            "model":     "fallback",
        }

    def _fallback_response(self, question: str) -> str:
        """Smart fallback when OpenAI key is not set."""
        q = question.lower()

        if any(w in q for w in ["bitcoin", "btc", "price", "worth"]):
            return """**Bitcoin (BTC)** is the original cryptocurrency created by Satoshi Nakamoto in 2008.

**Key facts:**
- Fixed supply: 21 million BTC maximum
- Consensus: Proof of Work (SHA-256)
- Halving: every ~4 years (last: April 2024 → 3.125 BTC reward)
- Use case: Digital store of value, "digital gold"

For live price data, check the **Analytics** page — it pulls real-time data from CoinGecko."""

        if any(w in q for w in ["ethereum", "eth", "smart contract", "evm"]):
            return """**Ethereum** is a programmable blockchain enabling smart contracts and dApps.

**Key facts:**
- Consensus: Proof of Stake (since The Merge, Sept 2022)
- Smart contracts written in Solidity
- Powers DeFi, NFTs, DAOs
- EIP-1559: base fee burned → deflationary pressure
- Layer 2s (Arbitrum, Optimism) scale transaction throughput

The Ethereum Virtual Machine (EVM) is the engine that executes smart contract code."""

        if any(w in q for w in ["nft", "non-fungible", "opensea", "risk"]):
            return """**NFT Risk Assessment** — what to check before buying:

**6 risk dimensions:**
- 🔵 **Contract Safety** — no reentrancy, honeypot, or malicious patterns
- 🔵 **Metadata Integrity** — IPFS links resolve, images load correctly
- 🔵 **Trading Activity** — organic volume, no wash trading signals
- 🔵 **Creator Reputation** — verified history, no previous rugs
- 🔵 **Royalty Structure** — standard 2-10%, no unusual enforcement
- 🔵 **Liquidity Risk** — healthy floor price, >40% unique owner ratio

Use the **NFT Scanner** tab to get an instant AI risk score for any collection!"""

        if any(w in q for w in ["defi", "uniswap", "aave", "yield", "liquidity"]):
            return """**DeFi (Decentralized Finance)** recreates financial services on-chain.

**Core primitives:**
- 🔄 **AMMs** (Uniswap) — swap tokens via liquidity pools using x*y=k
- 🏦 **Lending** (Aave, Compound) — deposit to earn yield, borrow against collateral
- ⚡ **Flash Loans** — borrow millions with zero collateral in one transaction
- 🌾 **Yield Farming** — provide liquidity to earn protocol rewards

**Key risks:** smart contract bugs, impermanent loss, liquidation, rug pulls."""

        if any(w in q for w in ["fear", "greed", "sentiment", "market"]):
            return """**Fear & Greed Index** measures crypto market sentiment (0-100):

- **0-24** Extreme Fear 😱 — historically good buying opportunity
- **25-44** Fear 😰 — market pessimism
- **45-55** Neutral 😐 — balanced sentiment
- **56-74** Greed 😏 — market optimism
- **75-100** Extreme Greed 🤑 — potential top signal

Calculated from: volatility, momentum, social media, dominance, trends.

Check live readings on the **Analytics** page!"""

        if any(w in q for w in ["layer 2", "l2", "rollup", "arbitrum", "optimism", "zk"]):
            return """**Layer 2 Scaling Solutions** process transactions off Ethereum mainnet:

**Optimistic Rollups** (Arbitrum, Optimism):
- Assume transactions valid, use fraud proofs
- 7-day withdrawal period to mainnet

**ZK-Rollups** (zkSync, Starknet, Polygon zkEVM):
- Use zero-knowledge proofs for instant finality
- More complex but more secure

**Benefits:** 10-100x lower fees, faster transactions, inherits Ethereum security."""

        return """I'm ChainGuard AI, your blockchain intelligence assistant! 🤖

I can help you with:
- 📚 **Blockchain education** — explain any concept
- 📊 **Market analysis** — understand prices and trends
- 🛡️ **NFT risk assessment** — evaluate any collection
- 💱 **DeFi guidance** — protocols, strategies, risks
- 🔐 **Security advice** — wallet safety, scam detection

What would you like to know about blockchain today?

> *Note: Connect an OpenAI API key in the backend .env for full GPT-4o RAG responses.*"""