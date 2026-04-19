"""
ChainGuard AI — Chatbot Router
GPT-4o + LangChain + FAISS RAG pipeline
"""

import uuid
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..core.rag_engine import get_rag_engine
from ..core.intent_classifier import classify_intent

logger = logging.getLogger(__name__)
router = APIRouter()

# ── In-memory conversation history (replace with Redis in Phase 4) ─────────────
_conversation_store: dict[str, list] = {}


# ── Schemas ───────────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message:    str
    session_id: Optional[str] = None

class ChatMessage(BaseModel):
    role:    str   # user | assistant
    content: str

class ChatResponse(BaseModel):
    session_id:   str
    response:     str
    intent:       str
    used_rag:     bool
    model:        str
    history_len:  int


# ── POST /chat/message ────────────────────────────────────────────────────────
@router.post("/message", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """
    Process a chat message through the RAG pipeline.
    - Classifies intent
    - Retrieves relevant context from FAISS vector store
    - Generates response via GPT-4o
    - Falls back to smart rule-based responses if API key not set
    """
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # ── Session management ────────────────────────────────────────────────────
    session_id = req.session_id or str(uuid.uuid4())
    if session_id not in _conversation_store:
        _conversation_store[session_id] = []

    history = _conversation_store[session_id]

    # ── Classify intent ───────────────────────────────────────────────────────
    intent = classify_intent(req.message)
    logger.info(f"Session {session_id[:8]}... | Intent: {intent} | Query: {req.message[:50]}")

    # ── Build contextual query ────────────────────────────────────────────────
    # Include last 2 exchanges for conversation continuity
    context_query = req.message
    if history:
        recent = history[-4:]  # last 2 user + 2 assistant messages
        history_text = " ".join([m["content"] for m in recent])
        context_query = f"{history_text} {req.message}"

    # ── Query RAG engine ──────────────────────────────────────────────────────
    rag = get_rag_engine()
    result = await rag.query(context_query, history)

    # ── Update conversation history ───────────────────────────────────────────
    history.append({"role": "user",      "content": req.message})
    history.append({"role": "assistant", "content": result["response"]})

    # Keep last 20 messages to prevent memory bloat
    if len(history) > 20:
        _conversation_store[session_id] = history[-20:]

    return ChatResponse(
        session_id  = session_id,
        response    = result["response"],
        intent      = intent,
        used_rag    = result["used_rag"],
        model       = result["model"],
        history_len = len(_conversation_store[session_id]),
    )


# ── GET /chat/history/{session_id} ────────────────────────────────────────────
@router.get("/history/{session_id}")
async def get_history(session_id: str):
    """Get conversation history for a session."""
    history = _conversation_store.get(session_id, [])
    return {
        "session_id":  session_id,
        "messages":    history,
        "total":       len(history),
    }


# ── DELETE /chat/history/{session_id} ─────────────────────────────────────────
@router.delete("/history/{session_id}")
async def clear_history(session_id: str):
    """Clear conversation history for a session."""
    if session_id in _conversation_store:
        del _conversation_store[session_id]
    return {"session_id": session_id, "cleared": True}


# ── GET /chat/status ──────────────────────────────────────────────────────────
@router.get("/status")
async def get_status():
    """Check if RAG pipeline is initialized."""
    rag = get_rag_engine()
    return {
        "rag_initialized": rag.is_initialized,
        "model":           "gpt-4o" if rag.is_initialized else "fallback",
        "active_sessions": len(_conversation_store),
        "vector_store":    "FAISS" if rag.vectorstore else "none",
    }