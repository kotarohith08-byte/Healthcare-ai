"""
Healthcare AI Chatbot API Endpoints
"""

import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ChatSession, ChatMessage, User
from ..schemas import ChatMessageCreate, ChatMessageResponse, ChatSessionResponse
from ..services.rag_chatbot import rag_service
from ..services.symptom_engine import extract_symptoms_from_text

router = APIRouter(prefix="/api/chat", tags=["Healthcare AI Chatbot"])

@router.get("/sessions", response_model=List[ChatSessionResponse])
def get_user_chat_sessions(db: Session = Depends(get_db)):
    """List all active conversation sessions."""
    sessions = db.query(ChatSession).order_by(ChatSession.updated_at.desc()).all()
    out = []
    for s in sessions:
        out.append(ChatSessionResponse(
            id=s.id,
            title=s.title,
            created_at=s.created_at,
            updated_at=s.updated_at,
            message_count=len(s.messages)
        ))
    return out

@router.post("/sessions", response_model=ChatSessionResponse)
def create_new_session(title: str = "New Medical Consultation", db: Session = Depends(get_db)):
    """Create a new conversational session."""
    user = db.query(User).first()
    user_id = user.id if user else None
    
    session_id = str(uuid.uuid4())
    new_session = ChatSession(
        id=session_id,
        user_id=user_id,
        title=title
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    # Initial Welcome Assistant Message
    welcome_msg = ChatMessage(
        session_id=session_id,
        role="assistant",
        content=(
            "Hello! I am your **AI Healthcare Assistant**, powered by medical knowledge bases (MedQuAD, NIH, CDC, and WHO clinical literature). "
            "I can help explain symptoms, discuss health conditions in plain language, guide preventive wellness, and navigate medical datasets.\n\n"
            "*How can I assist your health inquiry today?*"
        ),
        sources=[{"title": "Antigravity Healthcare Knowledge Engine", "category": "General", "source": "Clinical Guidelines", "relevance": 100}]
    )
    db.add(welcome_msg)
    db.commit()

    return ChatSessionResponse(
        id=new_session.id,
        title=new_session.title,
        created_at=new_session.created_at,
        updated_at=new_session.updated_at,
        message_count=1
    )

@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageResponse])
def get_session_messages(session_id: str, db: Session = Depends(get_db)):
    """Get all messages in a specific consultation session."""
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Consultation session not found.")
    return session.messages

@router.post("/message", response_model=ChatMessageResponse)
def send_chat_message(msg_in: ChatMessageCreate, db: Session = Depends(get_db)):
    """
    Processes a user question, retrieves grounded medical knowledge (RAG),
    extracts symptoms, simplifies medical jargon, and responds with clinical guardrails.
    """
    session_id = msg_in.session_id
    if not session_id:
        # Create a new session on the fly
        session_id = str(uuid.uuid4())
        short_title = msg_in.message[:40] + ("..." if len(msg_in.message) > 40 else "")
        new_session = ChatSession(id=session_id, title=short_title)
        db.add(new_session)
        db.commit()
    else:
        existing = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if not existing:
            new_session = ChatSession(id=session_id, title=msg_in.message[:40])
            db.add(new_session)
            db.commit()

    # Extract symptoms mentioned in prompt
    extracted_symptoms = extract_symptoms_from_text(msg_in.message)

    # Save User Message
    user_msg = ChatMessage(
        session_id=session_id,
        role="user",
        content=msg_in.message,
        extracted_symptoms=extracted_symptoms
    )
    db.add(user_msg)
    db.commit()

    # Fetch recent context for conversation continuity
    history = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.desc()).limit(6).all()
    history_dicts = [{"role": h.role, "content": h.content} for h in reversed(history)]

    # Generate RAG response
    rag_result = rag_service.generate_response(msg_in.message, chat_history=history_dicts)

    # Save Assistant Response
    assistant_msg = ChatMessage(
        session_id=session_id,
        role="assistant",
        content=rag_result["content"],
        sources=rag_result["sources"],
        extracted_symptoms=extracted_symptoms,
        simplified_terms=rag_result["simplified_terms"],
        is_emergency=rag_result["is_emergency"]
    )
    db.add(assistant_msg)
    
    # Update session timestamp
    session_obj = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if session_obj:
        if session_obj.title == "New Medical Consultation" or not session_obj.title:
            session_obj.title = msg_in.message[:45] + "..."
    db.commit()
    db.refresh(assistant_msg)

    return assistant_msg

@router.delete("/sessions/{session_id}")
def delete_session(session_id: str, db: Session = Depends(get_db)):
    """Deletes a chat session and all messages."""
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    db.delete(session)
    db.commit()
    return {"message": "Session deleted successfully."}
