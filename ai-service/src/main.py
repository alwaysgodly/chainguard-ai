"""
ChainGuard AI Service — FastAPI entry point
Chatbot (GPT-4o RAG) + NFT Risk (XGBoost ML)
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize ML models and RAG pipeline on startup."""
    logger.info("🚀 ChainGuard AI Service starting...")

    # Pre-load NFT model (trains XGBoost on startup)
    from .nft_risk.model import get_nft_model
    model = get_nft_model()
    logger.info(f"🛡️  NFT Risk Model: {'XGBoost ✅' if model.is_trained else 'Rule-based fallback'}")

    # Pre-initialize RAG engine
    from .core.rag_engine import get_rag_engine
    rag = get_rag_engine()
    logger.info(f"🤖 RAG Engine: {'GPT-4o + FAISS ✅' if rag.is_initialized else 'Fallback mode (set OPENAI_API_KEY)'}")

    logger.info("✅ AI Service ready")
    yield
    logger.info("👋 AI Service shutting down")


from .nft_risk.router  import router as nft_router
from .chatbot.router   import router as chat_router

app = FastAPI(
    title       = "ChainGuard AI Service",
    description = "NFT Risk ML + GPT-4o RAG Chatbot",
    version     = "2.0.0",
    lifespan    = lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins  = ["http://localhost:5000", "http://localhost:3000"],
    allow_methods  = ["*"],
    allow_headers  = ["*"],
)

app.include_router(nft_router,  prefix="/nft",  tags=["NFT Risk"])
app.include_router(chat_router, prefix="/chat", tags=["Chatbot"])


@app.get("/health")
def health():
    from .nft_risk.model import get_nft_model
    from .core.rag_engine import get_rag_engine
    model = get_nft_model()
    rag   = get_rag_engine()
    return {
        "status":        "ok",
        "service":       "chainguard-ai",
        "version":       "2.0.0",
        "nft_model":     "xgboost" if model.is_trained else "rule_based",
        "rag_pipeline":  "gpt-4o+faiss" if rag.is_initialized else "fallback",
    }