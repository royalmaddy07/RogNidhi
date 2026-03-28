"""
chunker.py — Converts MedicalRecord dicts into retrievable text chunks.

Each document produces up to 3 chunks:
  1. Document header (title, type, date)
  2. Structured test results (test name, value, unit, status, range)
  3. AI narrative summary

Keeping chunks small (< 512 tokens) improves embedding recall.
"""

import logging

logger = logging.getLogger(__name__)


def _fmt_tests(tests: list[dict]) -> str:
    """
    Flatten a list of test dicts into a readable string for embedding.
    """
    if not tests:
        return ""
    lines = []
    for t in tests:
        name   = t.get("test_name", "Unknown test")
        value  = t.get("value", "N/A")
        unit   = t.get("unit", "")
        status = t.get("status", "")
        ref    = t.get("reference_range", "")
        date   = t.get("date", "")

        line = f"{name}: {value} {unit}".strip()
        if status:
            line += f" [{status}]"
        if ref:
            line += f" (ref: {ref})"
        if date:
            line += f" on {date}"
        lines.append(line)
    return "\n".join(lines)


def chunk_medical_records(records: list[dict]) -> tuple[list[str], list[dict]]:
    """
    Convert structured medical record dicts (from the backend view context)
    into a flat list of text chunks and their metadata.

    Args:
        records: List of dicts, each with keys:
                 title, type, date, ai_analysis, structured_tests

    Returns:
        chunks    — list[str], text chunks ready to embed
        metadatas — list[dict], parallel metadata for each chunk
                    (used to rebuild context from a retrieved chunk)
    """
    chunks: list[str] = []
    metadatas: list[dict] = []

    for record in records:
        title    = record.get("title", "Unnamed Document")
        doc_type = record.get("type", "document")
        date     = record.get("date", "Unknown date")
        summary  = record.get("ai_analysis", "")
        tests    = record.get("structured_tests", [])

        base_meta = {"title": title, "type": doc_type, "date": date}

        # ── Chunk 1: Document header ──────────────────────────────────────
        header = f"Document: {title}\nType: {doc_type}\nDate: {date}"
        chunks.append(header)
        metadatas.append({**base_meta, "chunk_type": "header"})

        # ── Chunk 2: Structured tests ──────────────────────────────────────
        tests_text = _fmt_tests(tests)
        if tests_text:
            chunk = (
                f"Lab results from {title} ({date}):\n"
                f"{tests_text}"
            )
            chunks.append(chunk)
            metadatas.append({**base_meta, "chunk_type": "tests"})

        # ── Chunk 3: AI narrative summary ──────────────────────────────────
        if summary and len(summary.strip()) > 20:
            chunk = (
                f"Clinical summary for {title} ({date}):\n"
                f"{summary.strip()}"
            )
            chunks.append(chunk)
            metadatas.append({**base_meta, "chunk_type": "summary"})

    logger.info(f"Chunked {len(records)} records into {len(chunks)} chunks.")
    return chunks, metadatas
