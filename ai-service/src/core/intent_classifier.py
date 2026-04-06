"""
ChainGuard AI — Intent Classifier
Classifies user messages into intents for routing and context.
"""

import re
from .knowledge_base import INTENT_EXAMPLES


def classify_intent(message: str) -> str:
    """
    Classify the intent of a user message.
    Returns one of: price_query | nft_risk | defi_question |
                    education | market_analysis | general
    """
    msg = message.lower().strip()

    # ── Keyword matching ──────────────────────────────────────────────────────
    for intent, examples in INTENT_EXAMPLES.items():
        for keyword in examples:
            if keyword in msg:
                return intent

    # ── Pattern matching ──────────────────────────────────────────────────────
    if re.search(r'\$[A-Z]{2,5}|\bprice\b|\bworth\b|\btrading at\b', msg, re.I):
        return "price_query"

    if re.search(r'0x[a-fA-F0-9]{40}|nft|token\s+id|contract', msg, re.I):
        return "nft_risk"

    if re.search(r'apy|tvl|pool|swap|stake|farm|protocol', msg, re.I):
        return "defi_question"

    if re.search(r'how does|explain|what is|what are|define|meaning', msg, re.I):
        return "education"

    if re.search(r'market|dominance|cap|volume|bull|bear|sentiment', msg, re.I):
        return "market_analysis"

    return "general"


def get_system_context(intent: str) -> str:
    """Returns additional context hint based on intent."""
    contexts = {
        "price_query":     "User is asking about cryptocurrency prices or market data.",
        "nft_risk":        "User wants to evaluate NFT risk or understand NFT safety.",
        "defi_question":   "User is asking about DeFi protocols, yield, or liquidity.",
        "education":       "User wants to learn about blockchain concepts.",
        "market_analysis": "User wants market sentiment or analysis.",
        "general":         "General blockchain assistant query.",
    }
    return contexts.get(intent, contexts["general"])