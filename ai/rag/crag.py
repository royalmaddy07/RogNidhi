"""
crag.py — Corrective RAG orchestrator for RogNidhi chat.

Pipeline:
  1. Search FAISS index for top-k most similar chunks (per patient).
  2. Grade retrieved chunks for relevance to the user's question.
  3. Branch on grade:
       RELEVANT   → Build a grounded answer from retrieved context only.
       PARTIAL    → Build an answer using retrieved context + acknowledge gaps.
       IRRELEVANT → Answer from general medical knowledge (no doc context injected).
  4. Generate final response via Groq LLaMA.

This replaces ask_rognidhi() in ai.py.
"""

import os
import logging
from groq import Groq

from .index_store import search_index
from .grader import grade_relevance

logger = logging.getLogger(__name__)
_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ── System persona shared across all branches ──────────────────────────────────
_PERSONA = """You are RogNidhi, a warm and clinically careful health assistant.
Explain medical information in very simple English — like talking to a 12-year-old.
Use short sentences. No markdown. No bold text. No jargon unless you immediately explain it.
NEVER diagnose. Always end serious concerns with: "Please speak with your doctor to confirm."
NEVER say "Don't worry" or "Great news" — stay calm and factual."""


def _build_context_block(retrieved: list[dict]) -> str:
    """Format retrieved chunks into a readable context block for the LLM."""
    parts = []
    seen = set()
    for item in retrieved:
        text = item.get("text", "")
        if text and text not in seen:
            seen.add(text)
            score = item.get("score", 0)
            meta  = f"[{item.get('title', '')} | {item.get('date', '')}]"
            parts.append(f"{meta}\n{text}")
    return "\n\n".join(parts)


def _generate(messages: list[dict]) -> str:
    try:
        resp = _client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.2,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Groq generation error: {e}")
        return "I'm having trouble generating a response right now. Please try again."


# ── Branch: RELEVANT ───────────────────────────────────────────────────────────
def _answer_relevant(question: str, context: str, chat_history: list) -> str:
    system_msg = (
        f"{_PERSONA}\n\n"
        "You have access to this patient's medical records below. "
        "Answer ONLY using information from these records. "
        "If the records don't contain enough detail, say so honestly.\n\n"
        f"PATIENT RECORDS:\n{context}"
    )
    messages = [{"role": "system", "content": system_msg}]
    if chat_history:
        messages.extend(chat_history[-6:])
    messages.append({"role": "user", "content": question})
    return _generate(messages)


# ── Branch: PARTIAL ────────────────────────────────────────────────────────────
def _answer_partial(question: str, context: str, chat_history: list) -> str:
    system_msg = (
        f"{_PERSONA}\n\n"
        "You have partial information from this patient's medical records. "
        "Use the records as a starting point but be transparent about gaps. "
        "Where records are incomplete, draw on general medical knowledge but "
        "clearly say 'Based on general knowledge…' to distinguish it.\n\n"
        f"PATIENT RECORDS (partial match):\n{context}"
    )
    messages = [{"role": "system", "content": system_msg}]
    if chat_history:
        messages.extend(chat_history[-6:])
    messages.append({"role": "user", "content": question})
    return _generate(messages)


# ── Branch: IRRELEVANT ─────────────────────────────────────────────────────────
def _answer_irrelevant(question: str, chat_history: list) -> str:
    system_msg = (
        f"{_PERSONA}\n\n"
        "The patient's uploaded records don't contain information relevant to this question. "
        "Answer from general medical knowledge only. "
        "Begin your response by saying: "
        "'Your medical records don't have specific information about this, "
        "but here is what I know in general:'"
    )
    messages = [{"role": "system", "content": system_msg}]
    if chat_history:
        messages.extend(chat_history[-6:])
    messages.append({"role": "user", "content": question})
    return _generate(messages)


# ── Main Entry Point ───────────────────────────────────────────────────────────
def corrective_rag(
    patient_id: str | int,
    question: str,
    chat_history: list | None = None,
    top_k: int = 5,
) -> str:
    """
    Full Corrective RAG pipeline.

    Args:
        patient_id:   Patient DB ID (used to look up the right FAISS index).
        question:     The user's question string.
        chat_history: List of message dicts [{"role": "user"/"assistant", "content": "..."}].
        top_k:        Number of chunks to retrieve from FAISS.

    Returns:
        Answer string.
    """
    history = chat_history or []

    logger.info(f"CRAG pipeline started for patient {patient_id}.")

    # ── Step 1: Retrieve ──────────────────────────────────────────────────────
    retrieved = search_index(patient_id, question, top_k=top_k)

    # ── Step 2: Grade ─────────────────────────────────────────────────────────
    chunk_texts = [r.get("text", "") for r in retrieved if r.get("text")]
    grade = grade_relevance(question, chunk_texts)
    logger.info(f"CRAG grade: {grade} | retrieved {len(retrieved)} chunks.")

    # ── Step 3: Generate ──────────────────────────────────────────────────────
    context = _build_context_block(retrieved)

    if grade == "RELEVANT":
        return _answer_relevant(question, context, history)
    elif grade == "PARTIAL":
        return _answer_partial(question, context, history)
    else:  # IRRELEVANT
        return _answer_irrelevant(question, history)
