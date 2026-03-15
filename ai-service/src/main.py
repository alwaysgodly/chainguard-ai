from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .nft_risk.router  import router as nft_router
from .chatbot.router   import router as chat_router

load_dotenv()

app = FastAPI(title="ChainGuard AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(nft_router,  prefix="/nft",  tags=["NFT Risk"])
app.include_router(chat_router, prefix="/chat", tags=["Chatbot"])

@app.get("/health")
def health():
    return {"status": "ok", "service": "chainguard-ai"}
