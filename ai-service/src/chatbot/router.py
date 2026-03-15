from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    session_id: str
    response: str
    intent: str

@router.post("/message", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """
    Process a chat message through the AI assistant.
    TODO: Implement full RAG pipeline with LangChain + GPT-4o in Week 8.
    """
    import uuid

    return ChatResponse(
        session_id=req.session_id or str(uuid.uuid4()),
        response=f"Hi! I'm ChainGuard AI. You asked: '{req.message}'. Full AI integration coming in Week 8! 🤖",
        intent="general",
    )
