import os
from pathlib import Path
from types import SimpleNamespace
from typing import Dict, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from google import genai
from google.genai import errors as genai_errors
from pydantic import BaseModel, Field

from security import verify_jwt

# --- Load Backend/.env explicitly (same pattern as main.py) so this module
# resolves GEMINI_API_KEY correctly even if it's ever imported standalone,
# before main.py's own load_dotenv() call has run. override=False so it
# never clobbers a value main.py already loaded. ---
_env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=_env_path, override=False)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash").strip()

MAX_MESSAGE_LENGTH = 4000

# Router intentionally has NO prefix — routes below spell out the exact
# paths the frontend already calls (see frontend/src/components/AiChatBox.jsx
# on origin/main, which POSTs to /api/chat and reads {status, reply}). Using
# an APIRouter(prefix=...) with an empty-string route for the primary path
# would work too, but explicit paths remove any ambiguity about trailing
# slashes / redirects on a cross-origin POST.
chat_router = APIRouter(tags=["chat"])

# Lazy singleton — created on first real use, never at import time. A
# missing/invalid GEMINI_API_KEY must never crash server startup; it should
# only fail the /api/chat request itself, with a clear error message.
_client: Optional[genai.Client] = None

# In-memory chat-session store, keyed by "{user_id}:{module or 'general'}" so
# a student's general tutor chat and their per-module chat (AiChatBox is
# mounted once per context in the frontend) don't share conversation memory.
# NOTE: process-local and non-persistent by design (fits this project's
# scope). Sessions reset on server restart and are not shared across
# multiple uvicorn workers — acceptable for a single-process dev/demo
# deployment, not for a horizontally-scaled production one.
_sessions: Dict[str, object] = {}


def _get_client() -> genai.Client:
    global _client
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "AI chat is not configured on this server: GEMINI_API_KEY "
                "is missing from Backend/.env."
            ),
        )
    if _client is None:
        try:
            _client = genai.Client(api_key=GEMINI_API_KEY)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Failed to initialize Gemini client: {str(e)}",
            )
    return _client


# AiChatBox.jsx renders replies as plain text (whiteSpace: 'pre-wrap', no
# markdown parser) — if Gemini answers with **bold** or #headers, the user
# sees the literal asterisks/hashes. Appended once, to every persona, so
# markdown-suppression logic lives in exactly one place.
PLAIN_TEXT_NOTE = (
    " Respond in plain text only — no markdown (no asterisks for bold/italics, "
    "no #headers, no backtick code fences). Use plain sentences, line breaks, "
    "and simple numbered/dashed lists written as plain characters if needed."
)


def _persona_instruction(role: Optional[str], module: Optional[str]) -> str:
    """Mirrors the tone AiChatBox.jsx already promises per role/module on the
    frontend (see ROLE_CONFIG / moduleConfig in AiChatBox.jsx), so the AI's
    actual behavior matches what the UI tells the user to expect."""
    if module:
        base = (
            f"You are a course materials assistant for the module '{module}' "
            "on the AI Student Assistant platform. Answer questions about "
            "this module's readings, topics, and coursework. Be clear, "
            "encouraging, and concise. If asked about something unrelated "
            "to this module or to studying, politely redirect the "
            "conversation back to it."
        )
        return base + PLAIN_TEXT_NOTE

    persona = (role or "student").strip().lower()

    if persona == "admin":
        base = (
            "You are an AI assistant for a school administrator on the AI "
            "Student Assistant platform. Help with questions about teacher "
            "invites, enrollment numbers, modules, and general "
            "administrative tasks. Be clear and concise. You do not have "
            "direct database access — if the admin needs a live number "
            "(e.g. exact enrollment counts), tell them to check the Admin "
            "dashboard rather than guessing a figure."
        )
        return base + PLAIN_TEXT_NOTE

    if persona == "teacher":
        base = (
            "You are an AI assistant for a teacher on the AI Student "
            "Assistant platform. Help them plan lessons, summarize module "
            "content, and draft messages to students. Be clear and concise."
        )
        return base + PLAIN_TEXT_NOTE

    base = (
        "You are the AI Tutor for a student on the AI Student Assistant "
        "platform. Help the student understand concepts, work through "
        "problems step by step, and study for their modules. Be clear, "
        "encouraging, and concise. If a question is unrelated to academics, "
        "politely steer the conversation back to studying."
    )
    return base + PLAIN_TEXT_NOTE


def _session_key(user_id: str, module: Optional[str]) -> str:
    normalized_module = module.strip().lower() if module else ""
    return f"{user_id}:{normalized_module or 'general'}"


def _get_or_create_session(user_id: str, role: Optional[str], module: Optional[str]):
    key = _session_key(user_id, module)
    session = _sessions.get(key)
    if session is None:
        client = _get_client()
        try:
            session = client.chats.create(
                model=GEMINI_MODEL,
                config={"system_instruction": _persona_instruction(role, module)},
            )
        except genai_errors.APIError as e:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Gemini API error while starting session: {getattr(e, 'message', str(e))}",
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Unexpected error starting chat session: {str(e)}",
            )
        _sessions[key] = session
    return session


class ChatMessage(BaseModel):
    message: str = Field(..., min_length=1, max_length=MAX_MESSAGE_LENGTH)
    role: Optional[str] = None
    module: Optional[str] = None


@chat_router.post("/api/chat")
def chat(
    payload: ChatMessage,
    current_user: SimpleNamespace = Depends(verify_jwt),
):
    text = payload.message.strip()
    if not text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty.",
        )

    session = _get_or_create_session(current_user.id, payload.role, payload.module)

    try:
        response = session.send_message(text)
    except genai_errors.APIError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini API error: {getattr(e, 'message', str(e))}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected chat error: {str(e)}",
        )

    reply_text = (getattr(response, "text", None) or "").strip()
    if not reply_text:
        reply_text = "Sorry, I couldn't generate a response for that. Could you rephrase it?"

    return {
        "status": "Success",
        "reply": reply_text,
    }


@chat_router.post("/api/chat/reset")
def reset_chat(
    payload: Optional[ChatMessage] = None,
    current_user: SimpleNamespace = Depends(verify_jwt),
):
    module = payload.module if payload else None
    _sessions.pop(_session_key(current_user.id, module), None)
    return {
        "status": "Success",
        "message": "Chat conversation reset. Starting a new session.",
    }


@chat_router.get("/api/chat/status")
def chat_status(current_user: SimpleNamespace = Depends(verify_jwt)):
    return {
        "status": "Success",
        "configured": bool(GEMINI_API_KEY),
        "model": GEMINI_MODEL,
    }


# Backwards-compatible alias name in case anything still imports tutor_router
tutor_router = chat_router
